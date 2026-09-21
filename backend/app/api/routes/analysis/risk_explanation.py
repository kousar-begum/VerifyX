from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.db.supabase import get_supabase_service
from app.schemas.risk_explanation import RiskExplanationResponse
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
from app.services.risk_explanation_service import (
    RiskExplanationError,
    risk_explanation_service,
)
from app.services.risk_service import (
    RiskScoringError,
    risk_service,
)


router = APIRouter(
    prefix="/analysis",
    tags=["Explain My Risk"],
)


@router.post(
    "/documents/{document_id}/explain-risk",
    response_model=RiskExplanationResponse,
    status_code=status.HTTP_200_OK,
)
def explain_document_risk(
    document_id: str,
    current_user=Depends(get_current_user),
) -> RiskExplanationResponse:
    try:
        user_id = str(current_user.id)

        response = (
            get_supabase_service()
            .table("documents")
            .select(
                "id,user_id,original_file_name,"
                "original_filename,storage_path,mime_type,file_type"
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

        anomaly_dicts = [
            anomaly.model_dump()
            if hasattr(anomaly, "model_dump")
            else anomaly
            for anomaly in anomalies
        ]

        risk_result = risk_service.calculate_risk(
            anomaly_dicts,
        )

        explanation = risk_explanation_service.explain(
            document_id=str(document["id"]),
            original_filename=filename,
            mime_type=mime_type,
            risk_result=risk_result,
            anomalies=anomaly_dicts,
        )

        return RiskExplanationResponse(**explanation)

    except HTTPException:
        raise

    except (
        OCRProcessingError,
        MetadataAnalysisError,
        CVAnalysisError,
        AnomalyDetectionError,
        RiskScoringError,
        RiskExplanationError,
    ) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Risk explanation generation failed: {exc}",
        ) from exc