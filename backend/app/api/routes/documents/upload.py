from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)

from app.core.security import get_current_user
from app.schemas.document import DocumentUploadResponse
from app.services.document_service import (
    DocumentUploadError,
    document_service,
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
) -> DocumentUploadResponse:
    """
    Upload a document for the authenticated user.

    The authenticated user's identity comes from the
    Supabase access token, not from the request body.
    """

    try:
        document = await document_service.upload_document(
            file=file,
            user=current_user,
        )

        return DocumentUploadResponse(
            id=str(document["id"]),
            original_filename=document["original_filename"],
            file_type=document["file_type"],
            file_size=int(document["file_size"]),
            status=document["status"],
            storage_path=document["storage_path"],
        )

    except DocumentUploadError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document upload failed.",
        ) from exc