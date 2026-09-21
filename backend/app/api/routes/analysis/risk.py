from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.db.operations import get_document
from app.services.risk_service import risk_service


router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"],
)


class RiskScoringRequest(BaseModel):
    """
    Request body for risk scoring.
    """

    anomalies: list[dict[str, Any]] = Field(
        default_factory=list,
        description="List of detected document anomalies.",
    )


class RiskScoringResponse(BaseModel):
    """
    Response returned by the risk scoring endpoint.
    """

    risk_score: float
    risk_level: str
    risk_factors: list[dict[str, Any]]
    overall_confidence: float
    anomaly_count: int


@router.post(
    "/documents/{document_id}/risk",
    response_model=RiskScoringResponse,
    status_code=status.HTTP_200_OK,
)
async def calculate_document_risk(
    document_id: str,
    request: RiskScoringRequest,
    current_user=Depends(get_current_user),
) -> RiskScoringResponse:
    """
    Calculate document risk from detected anomalies.

    The document must belong to the authenticated user.

    The risk score is NOT a probability of fraud
    or authenticity.
    """

    if not document_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document ID cannot be empty.",
        )

    try:
        user_id = UUID(str(current_user.id))

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

        result = risk_service.calculate_risk(
            request.anomalies
        )

        return RiskScoringResponse(
            risk_score=result["risk_score"],
            risk_level=result["risk_level"],
            risk_factors=result["risk_factors"],
            overall_confidence=result["overall_confidence"],
            anomaly_count=result["anomaly_count"],
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
            detail="Risk scoring failed.",
        ) from exc