from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.db.operations import get_document
from app.db.supabase import get_supabase_service
from app.schemas.document_comparison import (
    DocumentComparisonResponse,
)
from app.services.document_comparison_service import (
    document_comparison_service,
)
from app.services.ocr_service import ocr_service
from app.services.metadata_service import metadata_service
from app.services.cv_analysis_service import (
    cv_analysis_service,
)


router = APIRouter(
    prefix="/analysis/documents",
    tags=["Document Comparison"],
)


@router.post(
    "/{document_a_id}/compare/{document_b_id}",
    response_model=DocumentComparisonResponse,
)
def compare_documents(
    document_a_id: UUID,
    document_b_id: UUID,
    current_user: Any = Depends(get_current_user),
):
    """
    Compare two documents using OCR,
    metadata, and computer-vision analysis.

    Both documents must belong to the authenticated user.
    """

    if document_a_id == document_b_id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Document A and Document B "
                "must be different."
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
        file_a = _download_document(
            document_a
        )

        file_b = _download_document(
            document_b
        )

        analysis_a = _analyze_document(
            document_a,
            file_a,
        )

        analysis_b = _analyze_document(
            document_b,
            file_b,
        )

        result = document_comparison_service.compare(
            analysis_a,
            analysis_b,
        )

        return result

    except HTTPException:
        raise

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
            detail="Document comparison failed.",
        ) from exc


def _download_document(
    document,
) -> bytes:
    """
    Download a document from the private
    Supabase storage bucket.
    """

    storage_path = document.storage_path

    if not storage_path:
        raise HTTPException(
            status_code=400,
            detail="Document storage path is missing.",
        )

    supabase = get_supabase_service()

    response = (
        supabase.storage
        .from_("documents")
        .download(storage_path)
    )

    if not response:
        raise HTTPException(
            status_code=404,
            detail=(
                "Document file could not be downloaded."
            ),
        )

    return response


def _analyze_document(
    document,
    file_content: bytes,
) -> dict:
    """
    Run OCR, metadata, and computer-vision
    analysis for a document.
    """

    filename = document.original_file_name

    mime_type = document.mime_type

    ocr_result = ocr_service.extract_text(
        file_content=file_content,
        mime_type=mime_type,
    )

    metadata_result = metadata_service.analyze(
        file_content=file_content,
        filename=filename,
        mime_type=mime_type,
    )

    cv_result = cv_analysis_service.analyze(
        file_content=file_content,
    )

    return {
        "id": str(document.id),
        "original_filename": filename,
        "mime_type": mime_type,
        "ocr": ocr_result,
        "metadata": metadata_result,
        "cv": cv_result,
    }