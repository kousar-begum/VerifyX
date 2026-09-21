import io
from pathlib import Path
from typing import Any

import fitz
from PIL import Image


class DocumentPreprocessingError(Exception):
    """Raised when document preprocessing fails."""


class DocumentPreprocessingService:
    """Prepares PDF and image documents for downstream analysis."""

    SUPPORTED_IMAGE_TYPES = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    SUPPORTED_EXTENSIONS = {
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    }

    def validate_document(
        self,
        file_content: bytes,
        filename: str,
        mime_type: str,
    ) -> dict[str, Any]:
        if not file_content:
            raise DocumentPreprocessingError(
                "The document contains no data."
            )

        extension = Path(filename).suffix.lower()

        if extension not in self.SUPPORTED_EXTENSIONS:
            raise DocumentPreprocessingError(
                f"Unsupported document extension: {extension}"
            )

        if mime_type == "application/pdf":
            return self._validate_pdf(file_content)

        if mime_type in self.SUPPORTED_IMAGE_TYPES:
            return self._validate_image(file_content)

        raise DocumentPreprocessingError(
            f"Unsupported document MIME type: {mime_type}"
        )

    def _validate_pdf(self, file_content: bytes) -> dict[str, Any]:
        try:
            document = fitz.open(
                stream=file_content,
                filetype="pdf",
            )

            page_count = document.page_count

            if page_count == 0:
                document.close()
                raise DocumentPreprocessingError(
                    "The PDF contains no pages."
                )

            metadata = document.metadata or {}

            document.close()

            return {
                "document_type": "pdf",
                "page_count": page_count,
                "width": None,
                "height": None,
                "metadata": metadata,
            }

        except DocumentPreprocessingError:
            raise

        except Exception as exc:
            raise DocumentPreprocessingError(
                f"Invalid or unreadable PDF document: {exc}"
            ) from exc

    def _validate_image(self, file_content: bytes) -> dict[str, Any]:
        try:
            image = Image.open(io.BytesIO(file_content))

            width, height = image.size
            image_format = image.format

            if width <= 0 or height <= 0:
                raise DocumentPreprocessingError(
                    "The image has invalid dimensions."
                )

            return {
                "document_type": "image",
                "page_count": 1,
                "width": width,
                "height": height,
                "metadata": {
                    "image_format": image_format,
                    "mode": image.mode,
                },
            }

        except DocumentPreprocessingError:
            raise

        except Exception as exc:
            raise DocumentPreprocessingError(
                f"Invalid or unreadable image document: {exc}"
            ) from exc


document_preprocessing_service = DocumentPreprocessingService()