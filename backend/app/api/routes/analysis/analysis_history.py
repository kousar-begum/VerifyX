from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.core.security import get_current_user
from app.db.operations import list_analyses
from app.schemas.analysis_history import (
    AnalysisHistoryItem,
    AnalysisHistoryResponse,
)


router = APIRouter(
    prefix="/analysis",
    tags=["Analysis History"],
)


@router.get(
    "/history",
    response_model=AnalysisHistoryResponse,
    status_code=status.HTTP_200_OK,
)
def get_analysis_history(
    limit: int = Query(
        default=50,
        ge=1,
        le=100,
    ),
    offset: int = Query(
        default=0,
        ge=0,
    ),
    current_user=Depends(get_current_user),
) -> AnalysisHistoryResponse:
    """
    Return analysis history for the authenticated user.
    """

    user_id = UUID(str(current_user.id))

    analyses = list_analyses(
        user_id=user_id,
        limit=limit,
        offset=offset,
    )

    items = [
        AnalysisHistoryItem(
            analysis_id=str(analysis.id),
            document_id=str(analysis.document_id),
            status=str(analysis.status),
            risk_score=analysis.risk_score,
            risk_level=str(analysis.risk_level),
            result_summary=analysis.result_summary,
            confidence_score=analysis.confidence_score,
            insufficient_evidence=analysis.insufficient_evidence,
            analysis_version=analysis.analysis_version,
            started_at=(
                analysis.started_at.isoformat()
                if analysis.started_at
                else None
            ),
            completed_at=(
                analysis.completed_at.isoformat()
                if analysis.completed_at
                else None
            ),
            created_at=(
                analysis.created_at.isoformat()
                if analysis.created_at
                else None
            ),
        )
        for analysis in analyses
    ]

    return AnalysisHistoryResponse(
        analyses=items,
        total=len(items),
    )