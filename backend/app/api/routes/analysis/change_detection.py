from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.db.operations import get_document
from app.db.supabase import get_supabase_service
from app.schemas.change_detection import ChangeDetectionResponse
from app.services.change_detection_service import (
    ChangeDetectionError,
    change_detection_service,
)
from app.services.cv_analysis_service import cv_analysis_service
from app.services.metadata_service import metadata_service
from app.services.ocr_service import ocr_service


router = APIRouter(
    prefix="/analysis/documents",
    tags=["Change Detection"],
)


def _download_document(document):
    """
    Download a document from private Supabase storage.
    """

    if not document.storage_path:
        raise HTTPException(
            status_code=400,
            detail="Document storage path is missing.",
        )

    supabase = get_supabase_service()

    file_content = (
        supabase.storage
        .from_("documents")
        .download(document.storage_path)
    )

    if not file_content:
        raise HTTPException(
            status_code=404,
            detail="Document file could not be downloaded.",
        )

    return file_content


def _build_document_data(
    document,
    file_content: bytes,
) -> dict:
    """
    Build the analysis input required by
    the existing comparison service.
    """

    ocr_result = ocr_service.extract_text(
        file_content=file_content,
        mime_type=document.mime_type,
    )

    metadata_result = metadata_service.analyze(
        file_content=file_content,
        filename=document.original_file_name,
        mime_type=document.mime_type,
    )

    cv_result = cv_analysis_service.analyze(
        file_content=file_content,
    )

    return {
        "id": str(document.id),
        "original_filename": document.original_file_name,
        "mime_type": document.mime_type,
        "ocr": ocr_result,
        "metadata": metadata_result,
        "cv": cv_result,
    }


@router.post(
    "/{document_a_id}/change-detection/{document_b_id}",
    response_model=ChangeDetectionResponse,
)
def detect_document_changes(
    document_a_id: UUID,
    document_b_id: UUID,
    current_user: Any = Depends(get_current_user),
):
    """
    Detect and persist changes between two uploaded documents.

    Both documents must belong to the authenticated user.
    """

    if document_a_id == document_b_id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Document A and Document B must be different "
                "documents."
            ),
        )

    try:
        user_id = UUID(
            str(current_user.id)
        )

        # Retrieve Document A only if it belongs to
        # the authenticated user.
        document_a = get_document(
            document_a_id,
            user_id=user_id,
        )

        if not document_a:
            raise HTTPException(
                status_code=404,
                detail="Document A was not found.",
            )

        # Retrieve Document B only if it belongs to
        # the authenticated user.
        document_b = get_document(
            document_b_id,
            user_id=user_id,
        )

        if not document_b:
            raise HTTPException(
                status_code=404,
                detail="Document B was not found.",
            )

        # Ownership has already been verified before
        # either private document is downloaded.
        file_content_a = _download_document(
            document_a
        )

        file_content_b = _download_document(
            document_b
        )

        document_data_a = _build_document_data(
            document=document_a,
            file_content=file_content_a,
        )

        document_data_b = _build_document_data(
            document=document_b,
            file_content=file_content_b,
        )

        result = change_detection_service.detect(
            document_a=document_data_a,
            document_b=document_data_b,
            user_id=user_id,
            persist=True,
        )

        return ChangeDetectionResponse(
            **{
                key: value
                for key, value in result.items()
                if key in ChangeDetectionResponse.model_fields
            }
        )

    except HTTPException:
        raise

    except ChangeDetectionError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=401,
            detail="Authenticated user ID is invalid.",
        ) from exc

    except Exception as exc:
        # Do not expose internal database, storage,
        # filesystem, or service errors to API clients.
        raise HTTPException(
            status_code=500,
            detail="Change detection failed.",
        ) from exc