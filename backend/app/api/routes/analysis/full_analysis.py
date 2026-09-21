from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.security import get_current_user
from app.db.operations import (
    create_analysis,
    update_analysis_result,
)
from app.db.supabase import get_supabase_service
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
from app.services.risk_service import risk_service


router = APIRouter(
    prefix="/analysis",
    tags=["Document Analysis"],
)


class FullAnalysisResponse(BaseModel):
    analysis_id: str
    document_id: str
    original_filename: str
    mime_type: str

    ocr: dict[str, Any]
    metadata: dict[str, Any]
    computer_vision: dict[str, Any]

    anomalies: list[dict[str, Any]]
    anomaly_count: int

    risk_score: float
    risk_level: str
    risk_factors: list[dict[str, Any]]
    overall_confidence: float

    analysis_status: str = "completed"


@router.post(
    "/documents/{document_id}/full-analysis",
    response_model=FullAnalysisResponse,
    status_code=status.HTTP_200_OK,
)
def run_full_document_analysis(
    document_id: str,
    current_user=Depends(get_current_user),
) -> FullAnalysisResponse:
    analysis_id = None

    try:
        user_id = UUID(str(current_user.id))
        document_uuid = UUID(document_id)

        response = (
            get_supabase_service()
            .table("documents")
            .select(
                "id,user_id,original_file_name,original_filename,"
                "storage_path,mime_type,file_type"
            )
            .eq("id", document_id)
            .eq("user_id", str(user_id))
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
                    "Full analysis currently supports "
                    "image documents only."
                ),
            )

        # --------------------------------------------------------
        # CREATE ANALYSIS RECORD
        # --------------------------------------------------------

        analysis = create_analysis(
            document_id=document_uuid,
            user_id=user_id,
            analysis_version="1.0.0",
        )

        analysis_id = analysis.id

        # --------------------------------------------------------
        # DOWNLOAD DOCUMENT
        # --------------------------------------------------------

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

        # --------------------------------------------------------
        # 1. OCR
        # --------------------------------------------------------

        ocr_result = ocr_service.extract_text(
            file_content=file_bytes,
            mime_type=mime_type,
        )

        # --------------------------------------------------------
        # 2. METADATA
        # --------------------------------------------------------

        metadata_result = metadata_service.analyze(
            file_content=file_bytes,
            filename=filename,
            mime_type=mime_type,
        )

        # --------------------------------------------------------
        # 3. COMPUTER VISION
        # --------------------------------------------------------

        cv_result = cv_analysis_service.analyze(
            file_content=file_bytes,
        )

        # --------------------------------------------------------
        # 4. ANOMALY DETECTION
        # --------------------------------------------------------

        anomalies = anomaly_detection_service.detect(
            ocr_result=ocr_result,
            metadata_result=metadata_result,
            cv_result=cv_result,
        )

        # --------------------------------------------------------
        # 5. RISK SCORING
        # --------------------------------------------------------

        risk_result = risk_service.calculate_risk(
            anomalies
        )

        risk_score = risk_result["risk_score"]
        risk_level = risk_result["risk_level"]
        risk_factors = risk_result["risk_factors"]
        overall_confidence = risk_result["overall_confidence"]

        result_summary = (
            f"Full document analysis completed with "
            f"{len(anomalies)} detected anomalies. "
            f"Risk score: {risk_score}. "
            f"Risk level: {risk_level}."
        )

        # --------------------------------------------------------
        # UPDATE ANALYSIS RECORD
        # --------------------------------------------------------

        updated_analysis = update_analysis_result(
            analysis_id=analysis_id,
            status="completed",
            risk_score=risk_score,
            risk_level=risk_level,
            result_summary=result_summary,
            confidence_score=overall_confidence,
            insufficient_evidence=False,
        )

        if updated_analysis is None:
            raise RuntimeError(
                "Analysis result could not be persisted."
            )

        return FullAnalysisResponse(
            analysis_id=str(analysis_id),
            document_id=str(document["id"]),
            original_filename=filename,
            mime_type=mime_type,
            ocr=ocr_result,
            metadata=metadata_result,
            computer_vision=cv_result,
            anomalies=anomalies,
            anomaly_count=len(anomalies),
            risk_score=risk_score,
            risk_level=risk_level,
            risk_factors=risk_factors,
            overall_confidence=overall_confidence,
            analysis_status="completed",
        )

    except HTTPException:
        if analysis_id is not None:
            update_analysis_result(
                analysis_id=analysis_id,
                status="failed",
                result_summary="Full document analysis failed.",
            )
        raise

    except (
        OCRProcessingError,
        MetadataAnalysisError,
        CVAnalysisError,
        AnomalyDetectionError,
    ) as exc:
        if analysis_id is not None:
            update_analysis_result(
                analysis_id=analysis_id,
                status="failed",
                result_summary=(
                    "Full document analysis failed "
                    "during an analysis processing step."
                ),
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document analysis could not be completed.",
        ) from exc

    except ValueError as exc:
        if analysis_id is not None:
            update_analysis_result(
                analysis_id=analysis_id,
                status="failed",
                result_summary="Full document analysis failed.",
            )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID or document ID is invalid.",
        ) from exc

    except Exception as exc:
        if analysis_id is not None:
            update_analysis_result(
                analysis_id=analysis_id,
                status="failed",
                result_summary="Full document analysis failed.",
            )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Full document analysis failed.",
        ) from exc