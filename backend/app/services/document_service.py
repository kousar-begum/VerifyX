import os
import uuid
from pathlib import Path
from typing import Any

from fastapi import UploadFile

from app.core.config import settings
from app.db.supabase import get_supabase_service


class DocumentUploadError(Exception):
    """Raised when document upload or validation fails."""


class DocumentService:
    """Business logic for secure document uploads."""

    def __init__(self) -> None:
        self.client = get_supabase_service()

    def _validate_file(
        self,
        file: UploadFile,
        file_size: int,
    ) -> None:
        if not file.filename:
            raise DocumentUploadError(
                "A filename is required."
            )

        extension = Path(file.filename).suffix.lower()

        if extension not in settings.ALLOWED_DOCUMENT_EXTENSIONS:
            allowed = ", ".join(
                settings.ALLOWED_DOCUMENT_EXTENSIONS
            )
            raise DocumentUploadError(
                "Unsupported document extension. "
                f"Allowed extensions: {allowed}"
            )

        content_type = (
            file.content_type or ""
        ).lower()

        if content_type not in settings.ALLOWED_DOCUMENT_MIME_TYPES:
            allowed = ", ".join(
                settings.ALLOWED_DOCUMENT_MIME_TYPES
            )
            raise DocumentUploadError(
                "Unsupported document MIME type. "
                f"Allowed types: {allowed}"
            )

        max_size = (
            settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        )

        if file_size <= 0:
            raise DocumentUploadError(
                "The uploaded document is empty."
            )

        if file_size > max_size:
            raise DocumentUploadError(
                "Document exceeds the maximum allowed size "
                f"of {settings.MAX_UPLOAD_SIZE_MB} MB."
            )

    async def upload_document(
        self,
        file: UploadFile,
        user: Any,
    ) -> dict[str, Any]:
        if user is None or not getattr(user, "id", None):
            raise DocumentUploadError(
                "Authenticated user information is required."
            )

        try:
            user_id = str(
                uuid.UUID(str(user.id))
            )
        except (ValueError, AttributeError, TypeError) as exc:
            raise DocumentUploadError(
                "Authenticated user information is invalid."
            ) from exc

        max_size = (
            settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        )

        try:
            file_content = await file.read(
                max_size + 1
            )
        except Exception as exc:
            raise DocumentUploadError(
                "The uploaded document could not be read."
            ) from exc

        file_size = len(file_content)

        try:
            self._validate_file(
                file=file,
                file_size=file_size,
            )

            original_filename = os.path.basename(
                file.filename or ""
            )

            extension = Path(
                original_filename
            ).suffix.lower()

            content_type = (
                file.content_type or ""
            ).lower()

            unique_filename = (
                f"{uuid.uuid4()}{extension}"
            )

            storage_path = (
                f"{user_id}/{unique_filename}"
            )

            bucket_name = settings.DOCUMENTS_BUCKET

            try:
                self.client.storage.from_(
                    bucket_name
                ).upload(
                    storage_path,
                    file_content,
                    {
                        "content-type": content_type,
                        "cache-control": "3600",
                        "upsert": False,
                    },
                )
            except Exception as exc:
                raise DocumentUploadError(
                    "Document storage upload failed."
                ) from exc

            document_id = str(uuid.uuid4())

            document_record = {
                "id": document_id,
                "user_id": user_id,
                "file_name": original_filename,
                "original_file_name": original_filename,
                "original_filename": original_filename,
                "storage_path": storage_path,
                "mime_type": content_type,
                "file_extension": extension,
                "file_size": file_size,
                "file_type": content_type,
                "status": "uploaded",
            }

            try:
                response = (
                    self.client
                    .table("documents")
                    .insert(document_record)
                    .execute()
                )

                if not response.data:
                    raise DocumentUploadError(
                        "Document database record could "
                        "not be created."
                    )

                return response.data[0]

            except DocumentUploadError:
                self._remove_storage_file(
                    bucket_name=bucket_name,
                    storage_path=storage_path,
                )
                raise

            except Exception as exc:
                self._remove_storage_file(
                    bucket_name=bucket_name,
                    storage_path=storage_path,
                )

                raise DocumentUploadError(
                    "Document database record creation "
                    "failed."
                ) from exc

        finally:
            await file.close()

    def _remove_storage_file(
        self,
        bucket_name: str,
        storage_path: str,
    ) -> None:
        """
        Best-effort cleanup for an uploaded storage object
        when the corresponding database record cannot be
        created.
        """

        try:
            self.client.storage.from_(
                bucket_name
            ).remove(
                [storage_path]
            )
        except Exception:
            pass


document_service = DocumentService()