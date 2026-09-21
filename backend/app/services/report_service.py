from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import UUID

from app.db.operations import (
    create_report,
    get_analysis,
    get_analysis_layers,
)
from app.db.supabase import get_supabase_service


class ReportGenerationError(Exception):
    """Raised when a verification report cannot be generated."""


class ReportService:
    """
    Generate and store structured verification reports.

    The service currently creates a JSON report artifact. The report
    contains the existing analysis result and all stored analysis layers.
    PDF rendering can be added later without changing the database
    report-reference structure.
    """

    REPORT_BUCKET = "analysis-reports"

    def generate(
        self,
        analysis_id: UUID,
        user_id: UUID,
    ) -> dict[str, Any]:
        analysis = get_analysis(
            analysis_id=analysis_id,
            user_id=user_id,
        )

        if analysis is None:
            raise ReportGenerationError(
                "Analysis was not found for the authenticated user."
            )

        layers = get_analysis_layers(
            analysis_id=analysis_id,
        )

        report_data = self._build_report_data(
            analysis=analysis,
            layers=layers,
        )

        file_name = (
            f"verfix-report-{analysis.document_id}-"
            f"{analysis.id}.json"
        )

        storage_path = (
            f"{user_id}/reports/{file_name}"
        )

        file_content = self._serialize_report(
            report_data
        )

        self._upload_report(
            storage_path=storage_path,
            file_content=file_content,
        )

        report = create_report(
            analysis_id=analysis.id,
            user_id=user_id,
            report_type="json",
            storage_bucket=self.REPORT_BUCKET,
            storage_path=storage_path,
            file_name=file_name,
        )

        return {
            "report_id": str(report.id),
            "analysis_id": str(analysis.id),
            "user_id": str(user_id),
            "report_type": report.report_type,
            "storage_bucket": report.storage_bucket,
            "storage_path": report.storage_path,
            "file_name": report.file_name,
            "generated_at": (
                report.generated_at.isoformat()
                if report.generated_at
                else None
            ),
            "summary": {
                "document_id": str(analysis.document_id),
                "status": str(analysis.status),
                "risk_score": analysis.risk_score,
                "risk_level": str(analysis.risk_level),
                "confidence_score": analysis.confidence_score,
                "insufficient_evidence": (
                    analysis.insufficient_evidence
                ),
                "analysis_version": analysis.analysis_version,
                "layer_count": len(layers),
            },
            "status": "completed",
        }

    @staticmethod
    def _build_report_data(
        analysis: Any,
        layers: list[Any],
    ) -> dict[str, Any]:
        generated_at = datetime.now(
            timezone.utc
        ).isoformat()

        return {
            "report": {
                "report_type": "verification_analysis",
                "generated_at": generated_at,
                "analysis_id": str(analysis.id),
                "document_id": str(analysis.document_id),
                "user_id": str(analysis.user_id),
                "analysis_version": analysis.analysis_version,
            },
            "assessment": {
                "status": str(analysis.status),
                "risk_score": analysis.risk_score,
                "risk_level": str(analysis.risk_level),
                "confidence_score": analysis.confidence_score,
                "insufficient_evidence": (
                    analysis.insufficient_evidence
                ),
                "summary": analysis.result_summary,
            },
            "analysis_layers": [
                {
                    "layer_id": str(layer.id),
                    "layer_name": layer.layer_name,
                    "status": layer.status,
                    "score": layer.score,
                    "result": layer.result_json,
                    "error_message": layer.error_message,
                    "created_at": (
                        layer.created_at.isoformat()
                        if layer.created_at
                        else None
                    ),
                }
                for layer in layers
            ],
        }

    @staticmethod
    def _serialize_report(
        report_data: dict[str, Any],
    ) -> bytes:
        import json

        try:
            return json.dumps(
                report_data,
                indent=2,
                ensure_ascii=False,
                default=str,
            ).encode("utf-8")
        except (TypeError, ValueError) as exc:
            raise ReportGenerationError(
                f"Report serialization failed: {exc}"
            ) from exc

    def _upload_report(
        self,
        storage_path: str,
        file_content: bytes,
    ) -> None:
        try:
            supabase = get_supabase_service()

            supabase.storage.from_(
                self.REPORT_BUCKET
            ).upload(
                storage_path,
                file_content,
                {
                    "content-type": "application/json",
                    "upsert": "true",
                },
            )
        except Exception as exc:
            raise ReportGenerationError(
                f"Report upload failed: {exc}"
            ) from exc


report_service = ReportService()