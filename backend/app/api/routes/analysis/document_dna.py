from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.db.operations import (
    create_document_dna,
    get_document,
)
from app.db.supabase import get_supabase_service
from app.schemas.document_dna import DocumentDNAResponse
from app.services.cv_analysis_service import (
    cv_analysis_service,
)
from app.services.document_dna_service import (
    document_dna_service,
)
from app.services.metadata_service import (
    metadata_service,
)
from app.services.ocr_service import (
    ocr_service,
)


router = APIRouter(
    prefix="/analysis/documents",
    tags=["Document DNA"],
)


@router.post(
    "/{document_id}/dna",
    response_model=DocumentDNAResponse,
)
def generate_document_dna(
    document_id: UUID,
    current_user: Any = Depends(get_current_user),
):
    """
    Generate and persist deterministic Document DNA
    for an uploaded document.

    The document must belong to the authenticated user.
    """

    try:
        user_id = UUID(
            str(current_user.id)
        )

        # Retrieve the document only if it belongs to
        # the authenticated user.
        document = get_document(
            document_id,
            user_id=user_id,
        )

        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document was not found.",
            )

        storage_path = document.storage_path

        if not storage_path:
            raise HTTPException(
                status_code=400,
                detail="Document storage path is missing.",
            )

        supabase = get_supabase_service()

        file_content = (
            supabase.storage
            .from_("documents")
            .download(storage_path)
        )

        if not file_content:
            raise HTTPException(
                status_code=404,
                detail="Document file could not be downloaded.",
            )

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

        dna_result = document_dna_service.generate(
            file_content=file_content,
            mime_type=document.mime_type,
            ocr_result=ocr_result,
            metadata_result=metadata_result,
            cv_result=cv_result,
        )

        document_features = dna_result.get(
            "document_features",
            {},
        )

        ocr_features = dna_result.get(
            "ocr_features",
            {},
        )

        metadata_features = dna_result.get(
            "metadata_features",
            {},
        )

        computer_vision_features = dna_result.get(
            "computer_vision_features",
            {},
        )

        fingerprint = dna_result.get(
            "fingerprint"
        )

        if not fingerprint:
            raise HTTPException(
                status_code=500,
                detail="Document DNA fingerprint was not generated.",
            )

        stored_dna = create_document_dna(
            document_id=document.id,
            analysis_id=None,
            text_hash=None,
            visual_hash=None,
            structure_hash=None,
            metadata_hash=None,
            dna_vector=None,
            fingerprint_json={
                "fingerprint": fingerprint,
                "document_features": document_features,
                "ocr_features": ocr_features,
                "metadata_features": metadata_features,
                "computer_vision_features": (
                    computer_vision_features
                ),
            },
        )

        return DocumentDNAResponse(
            document_id=str(
                document.id
            ),
            analysis_id=(
                str(stored_dna.analysis_id)
                if stored_dna.analysis_id
                else None
            ),
            fingerprint=fingerprint,
            document_features=document_features,
            ocr_features=ocr_features,
            metadata_features=metadata_features,
            computer_vision_features=(
                computer_vision_features
            ),
            stored=True,
            created_at=(
                stored_dna.created_at.isoformat()
                if stored_dna.created_at
                else None
            ),
        )

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
            detail="Document DNA generation failed.",
        ) from exc