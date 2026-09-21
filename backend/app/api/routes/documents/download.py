from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import settings
from app.core.security import get_current_user
from app.db.operations import get_document
from app.db.supabase import get_supabase_service
from app.schemas.document import DocumentDownloadResponse


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.get(
    "/{document_id}/download",
    response_model=DocumentDownloadResponse,
    status_code=status.HTTP_200_OK,
)
def get_document_download_url(
    document_id: str,
    current_user=Depends(get_current_user),
) -> DocumentDownloadResponse:
    """
    Generate a temporary signed URL for an authenticated user's document.

    The document is first verified against the authenticated user's ID.
    The private Supabase storage path is never returned to the client.
    """

    if not document_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document ID cannot be empty.",
        )

    try:
        try:
            user_id = UUID(str(current_user.id))
        except (ValueError, AttributeError, TypeError) as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authenticated user ID is invalid.",
            ) from exc

        try:
            document_uuid = UUID(document_id)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid document ID.",
            ) from exc

        document = get_document(
            document_id=document_uuid,
            user_id=user_id,
        )

        if document is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found.",
            )

        storage_path = document.storage_path

        if not storage_path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document storage path is missing.",
            )

        expected_prefix = f"{user_id}/"

        if not storage_path.startswith(expected_prefix):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Document storage access is not permitted.",
            )

        try:
            signed_url_response = (
                get_supabase_service()
                .storage
                .from_(settings.DOCUMENTS_BUCKET)
                .create_signed_url(
                    storage_path,
                    settings.SIGNED_URL_EXPIRY_SECONDS,
                )
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Document download link could not be generated.",
            ) from exc

        if not signed_url_response:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Document download link could not be generated.",
            )

        if isinstance(signed_url_response, dict):
            signed_url = (
                signed_url_response.get("signedURL")
                or signed_url_response.get("signedUrl")
                or signed_url_response.get("signed_url")
            )
        else:
            signed_url = getattr(
                signed_url_response,
                "signedURL",
                None,
            ) or getattr(
                signed_url_response,
                "signedUrl",
                None,
            )

        if not signed_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Document download link could not be generated.",
            )

        return DocumentDownloadResponse(
            document_id=str(document.id),
            download_url=str(signed_url),
            expires_in=settings.SIGNED_URL_EXPIRY_SECONDS,
        )

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document download failed.",
        ) from exc