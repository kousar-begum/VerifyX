from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import get_current_user
from app.db.operations import get_reports
from app.schemas.report import (
    ReportGenerationResponse,
    ReportListResponse,
    ReportResponse,
    ReportSummary,
)
from app.services.report_service import (
    ReportGenerationError,
    report_service,
)


router = APIRouter(
    prefix="/analysis/reports",
    tags=["Reports"],
)


@router.post(
    "/{analysis_id}",
    response_model=ReportGenerationResponse,
)
def generate_report(
    analysis_id: UUID,
    current_user: Any = Depends(get_current_user),
):
    try:
        user_id = UUID(str(current_user.id))

        result = report_service.generate(
            analysis_id=analysis_id,
            user_id=user_id,
        )

        report = ReportResponse(
            report_id=result["report_id"],
            analysis_id=result["analysis_id"],
            user_id=result["user_id"],
            report_type=result["report_type"],
            storage_bucket=result["storage_bucket"],
            storage_path=result["storage_path"],
            file_name=result["file_name"],
            generated_at=result["generated_at"],
        )

        return ReportGenerationResponse(
            report=report,
            summary=result.get("summary", {}),
            status=result.get("status", "completed"),
        )

    except ReportGenerationError:
        raise HTTPException(
            status_code=400,
            detail="Report generation could not be completed.",
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=401,
            detail="Authenticated user ID is invalid.",
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Report generation failed.",
        ) from exc


@router.get(
    "",
    response_model=ReportListResponse,
)
def list_user_reports(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: Any = Depends(get_current_user),
):
    try:
        user_id = UUID(str(current_user.id))

        reports = get_reports(
            user_id=user_id,
            limit=limit,
            offset=offset,
        )

        report_items = [
            ReportSummary(
                report_id=str(report.id),
                analysis_id=str(report.analysis_id),
                report_type=report.report_type,
                file_name=report.file_name,
                generated_at=(
                    report.generated_at.isoformat()
                    if report.generated_at
                    else None
                ),
            )
            for report in reports
        ]

        return ReportListResponse(
            reports=report_items,
            total=len(report_items),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=401,
            detail="Authenticated user ID is invalid.",
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Could not retrieve reports.",
        ) from exc