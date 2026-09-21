from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.security import get_current_user
from app.db.supabase import get_supabase_service
from app.schemas.anomaly import AnomalyItem
from app.services.anomaly_detection_service import (
    AnomalyDetectionError,
    anomaly_detection_service,
)
from app.services.cv_analysis_service import (
    cv_analysis_service,
)
from app.services.metadata_service import (
    metadata_service,
)
from app.services.ocr_service import (
    ocr_service,
)


router = APIRouter(
    prefix="/analysis",
    tags=["Document Analysis"],
)


class AnomalyDetectionResponse(BaseModel):
    document_id: str
    original_filename: str
    mime_type: str
    anomalies: list[AnomalyItem]
    anomaly_count: int
    anomaly_status: str = "completed"


@router.post(
    "/documents/{document_id}/anomalies",
    response_model=AnomalyDetectionResponse,
    status_code=status.HTTP_200_OK,
)
def detect_document_anomalies(
    document_id: str,
    current_user=Depends(get_current_user),
) -> AnomalyDetectionResponse:
    try:
        user_id = str(current_user.id)

        response = (
            get_supabase_service()
            .table("documents")
            .select(
                "id,user_id,original_file_name,original_filename,"
                "storage_path,mime_type,file_type"
            )
            .eq("id", document_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        document = response.data

        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found.",
            )

        mime_type = (
            document.get("mime_type")
            or document.get("file_type")
            or ""
        )

        if not mime_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Anomaly detection currently supports "
                    "image documents only."
                ),
            )

        storage_path = document.get("storage_path")

        if not storage_path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document storage path is missing.",
            )

        file_bytes = (
            get_supabase_service()
            .storage
            .from_("documents")
            .download(storage_path)
        )

        if not file_bytes:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document file could not be downloaded.",
            )

        filename = (
            document.get("original_file_name")
            or document.get("original_filename")
            or "document"
        )

        ocr_result = ocr_service.extract_text(
            file_content=file_bytes,
            mime_type=mime_type,
        )

        metadata_result = metadata_service.analyze(
            file_content=file_bytes,
            filename=filename,
            mime_type=mime_type,
        )

        cv_result = cv_analysis_service.analyze(
            file_content=file_bytes,
        )

        anomalies = anomaly_detection_service.detect(
            ocr_result=ocr_result,
            metadata_result=metadata_result,
            cv_result=cv_result,
        )

        return AnomalyDetectionResponse(
            document_id=str(document["id"]),
            original_filename=filename,
            mime_type=mime_type,
            anomalies=anomalies,
            anomaly_count=len(anomalies),
            anomaly_status="completed",
        )

    except HTTPException:
        raise

    except AnomalyDetectionError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Anomaly detection could not be completed.",
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Anomaly detection failed.",
        ) from exc