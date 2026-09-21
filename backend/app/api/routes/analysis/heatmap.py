from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.db.supabase import get_supabase_service
from app.schemas.tamper_heatmap import (
    TamperHeatmapResponse,
)
from app.services.anomaly_detection_service import (
    AnomalyDetectionError,
    anomaly_detection_service,
)
from app.services.cv_analysis_service import (
    CVAnalysisError,
    cv_analysis_service,
)
from app.services.metadata_service import (
    MetadataAnalysisError,
    metadata_service,
)
from app.services.ocr_service import (
    OCRProcessingError,
    ocr_service,
)
from app.services.tamper_heatmap_service import (
    TamperHeatmapError,
    tamper_heatmap_service,
)


router = APIRouter(
    prefix="/analysis",
    tags=["Tamper Heatmap"],
)


@router.post(
    "/documents/{document_id}/heatmap",
    response_model=TamperHeatmapResponse,
    status_code=status.HTTP_200_OK,
)
def generate_tamper_heatmap(
    document_id: str,
    current_user=Depends(get_current_user),
) -> TamperHeatmapResponse:
    try:
        user_id = str(current_user.id)

        response = (
            get_supabase_service()
            .table("documents")
            .select(
                "id,user_id,original_file_name,"
                "original_filename,storage_path,"
                "mime_type,file_type"
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

        filename = (
            document.get("original_file_name")
            or document.get("original_filename")
            or "document"
        )

        if not mime_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Tamper heatmap currently supports "
                    "image documents only."
                ),
            )

        file_bytes = (
            get_supabase_service()
            .storage
            .from_("documents")
            .download(
                document["storage_path"]
            )
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

        anomalies = (
            anomaly_detection_service.detect(
                ocr_result=ocr_result,
                metadata_result=metadata_result,
                cv_result=cv_result,
            )
        )

        heatmap_result = (
            tamper_heatmap_service.generate(
                cv_result=cv_result,
                anomalies=anomalies,
            )
        )

        return TamperHeatmapResponse(
            document_id=str(
                document["id"]
            ),
            original_filename=filename,
            mime_type=mime_type,
            width=heatmap_result["width"],
            height=heatmap_result["height"],
            region_count=heatmap_result[
                "region_count"
            ],
            regions=heatmap_result[
                "regions"
            ],
            heatmap_status=heatmap_result[
                "heatmap_status"
            ],
        )

    except HTTPException:
        raise

    except (
        OCRProcessingError,
        MetadataAnalysisError,
        CVAnalysisError,
        AnomalyDetectionError,
        TamperHeatmapError,
    ) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                f"Tamper heatmap generation failed: "
                f"{exc}"
            ),
        ) from exc