import io
from pathlib import Path
from typing import Any

import fitz
from PIL import Image
from PIL.ExifTags import TAGS


class MetadataAnalysisError(Exception):
    """Raised when metadata analysis fails."""


class MetadataService:
    """Extracts structural and metadata signals from documents."""

    SUPPORTED_EXTENSIONS = {
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    }

    def analyze(
        self,
        file_content: bytes,
        filename: str,
        mime_type: str,
    ) -> dict[str, Any]:
        if not file_content:
            raise MetadataAnalysisError(
                "The document contains no data."
            )

        extension = Path(filename).suffix.lower()

        if extension not in self.SUPPORTED_EXTENSIONS:
            raise MetadataAnalysisError(
                f"Unsupported document extension: {extension}"
            )

        try:
            if mime_type == "application/pdf":
                return self._analyze_pdf(file_content)

            if mime_type in {
                "image/jpeg",
                "image/png",
                "image/webp",
            }:
                return self._analyze_image(file_content)

            raise MetadataAnalysisError(
                f"Unsupported document MIME type: {mime_type}"
            )

        except MetadataAnalysisError:
            raise

        except Exception as exc:
            raise MetadataAnalysisError(
                f"Metadata analysis failed: {exc}"
            ) from exc

    def _analyze_image(
        self,
        file_content: bytes,
    ) -> dict[str, Any]:
        try:
            image = Image.open(
                io.BytesIO(file_content)
            )

            width, height = image.size

            metadata: dict[str, Any] = {
                "format": image.format,
                "mode": image.mode,
                "width": width,
                "height": height,
                "has_exif": False,
                "exif": {},
            }

            exif_data = image.getexif()

            if exif_data:
                metadata["has_exif"] = True

                readable_exif: dict[str, Any] = {}

                for tag_id, value in exif_data.items():
                    tag_name = TAGS.get(
                        tag_id,
                        str(tag_id),
                    )

                    if isinstance(
                        value,
                        bytes,
                    ):
                        try:
                            value = value.decode(
                                "utf-8",
                                errors="replace",
                            )
                        except Exception:
                            value = str(value)

                    readable_exif[tag_name] = str(
                        value
                    )

                metadata["exif"] = readable_exif

            return {
                "document_type": "image",
                "file_extension": Path(
                    "."
                    + str(image.format).lower()
                    if image.format
                    else ""
                ).suffix,
                "metadata": metadata,
            }

        except Exception as exc:
            raise MetadataAnalysisError(
                f"Image metadata analysis failed: {exc}"
            ) from exc

    def _analyze_pdf(
        self,
        file_content: bytes,
    ) -> dict[str, Any]:
        document = None

        try:
            document = fitz.open(
                stream=file_content,
                filetype="pdf",
            )

            metadata = document.metadata or {}

            return {
                "document_type": "pdf",
                "page_count": document.page_count,
                "metadata": {
                    "format": metadata.get(
                        "format"
                    ),
                    "title": metadata.get(
                        "title"
                    ),
                    "author": metadata.get(
                        "author"
                    ),
                    "subject": metadata.get(
                        "subject"
                    ),
                    "keywords": metadata.get(
                        "keywords"
                    ),
                    "creator": metadata.get(
                        "creator"
                    ),
                    "producer": metadata.get(
                        "producer"
                    ),
                    "creation_date": metadata.get(
                        "creationDate"
                    ),
                    "modification_date": metadata.get(
                        "modDate"
                    ),
                },
            }

        except Exception as exc:
            raise MetadataAnalysisError(
                f"PDF metadata analysis failed: {exc}"
            ) from exc

        finally:
            if document is not None:
                document.close()


metadata_service = MetadataService()