from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.db.operations import (
    create_verification_request,
    get_analysis,
    get_document,
)
from app.schemas.verification import (
    VerificationRequestCreate,
    VerificationRequestResponse,
)


router = APIRouter(
    prefix="/verification",
    tags=["Verification"],
)


@router.post(
    "/requests",
    response_model=VerificationRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_verification(
    request: VerificationRequestCreate,
    current_user=Depends(get_current_user),
) -> VerificationRequestResponse:
    """
    Create a verification request for a document
    owned by the authenticated user.
    """

    try:
        user_id = UUID(str(current_user.id))

        try:
            document_id = UUID(request.document_id)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid document ID.",
            ) from exc

        document = get_document(
            document_id=document_id,
            user_id=user_id,
        )

        if document is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found.",
            )

        analysis_id = None

        if request.analysis_id is not None:
            try:
                analysis_id = UUID(request.analysis_id)
            except ValueError as exc:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid analysis ID.",
                ) from exc

            analysis = get_analysis(
                analysis_id=analysis_id,
                user_id=user_id,
            )

            if analysis is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Analysis not found.",
                )

            if analysis.document_id != document_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "The analysis does not belong to "
                        "the specified document."
                    ),
                )

        verification = create_verification_request(
            document_id=document_id,
            user_id=user_id,
            analysis_id=analysis_id,
            verification_method=request.verification_method,
            notes=request.notes,
        )

        return VerificationRequestResponse(
            request_id=str(verification.id),
            document_id=str(verification.document_id),
            analysis_id=(
                str(verification.analysis_id)
                if verification.analysis_id
                else None
            ),
            user_id=str(verification.user_id),
            verification_method=verification.verification_method,
            notes=verification.notes,
            status=str(verification.status),
            created_at=(
                verification.created_at.isoformat()
                if verification.created_at
                else None
            ),
            updated_at=(
                verification.updated_at.isoformat()
                if verification.updated_at
                else None
            ),
        )

    except HTTPException:
        raise

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is invalid.",
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Verification request could not be created.",
        ) from exc