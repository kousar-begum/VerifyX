from typing import Any
from uuid import UUID

from app.db.operations import (
    create_comparison,
    create_comparison_change,
    create_comparison_dna,
)
from app.services.document_comparison_service import (
    DocumentComparisonError,
    document_comparison_service,
)


class ChangeDetectionError(Exception):
    """Raised when change detection cannot be completed."""


class ChangeDetectionService:
    """
    Detect and categorize differences between two documents.

    This service reuses the existing document comparison engine
    and optionally persists comparison results and detected
    changes in the database.
    """

    def detect(
        self,
        document_a: dict[str, Any],
        document_b: dict[str, Any],
        user_id: UUID | None = None,
        persist: bool = False,
    ) -> dict[str, Any]:
        if not isinstance(document_a, dict):
            raise ChangeDetectionError(
                "Document A data must be a dictionary."
            )

        if not isinstance(document_b, dict):
            raise ChangeDetectionError(
                "Document B data must be a dictionary."
            )

        try:
            comparison_result = (
                document_comparison_service.compare(
                    document_a=document_a,
                    document_b=document_b,
                )
            )

        except DocumentComparisonError as exc:
            raise ChangeDetectionError(
                str(exc)
            ) from exc

        differences = comparison_result.get(
            "differences",
            [],
        )

        changes = []

        for difference in differences:
            if not isinstance(difference, dict):
                continue

            change = self._convert_difference(
                difference
            )

            changes.append(change)

        text_changes = [
            change
            for change in changes
            if change["category"] == "Text"
        ]

        metadata_changes = [
            change
            for change in changes
            if change["category"] == "Metadata"
        ]

        visual_changes = [
            change
            for change in changes
            if change["category"] == "Visual"
        ]

        overall_similarity = round(
            float(
                comparison_result.get(
                    "overall_similarity",
                    0.0,
                )
            ),
            4,
        )

        comparison_id = None

        if persist:
            if user_id is None:
                raise ChangeDetectionError(
                    "user_id is required when persistence is enabled."
                )

            document_a_id = self._require_uuid(
                document_a.get("id"),
                "Document A ID",
            )

            document_b_id = self._require_uuid(
                document_b.get("id"),
                "Document B ID",
            )

            comparison = create_comparison(
                user_id=user_id,
                document_a_id=document_a_id,
                document_b_id=document_b_id,
            )

            comparison_id = comparison.id

            self._persist_changes(
                comparison_id=comparison_id,
                changes=changes,
            )

            self._persist_dna(
                comparison_id=comparison_id,
                comparison_result=comparison_result,
                overall_similarity=overall_similarity,
                changes=changes,
            )

        return {
            "comparison_id": (
                str(comparison_id)
                if comparison_id
                else None
            ),
            "document_a_id": str(
                comparison_result.get(
                    "document_a_id",
                    document_a.get("id", ""),
                )
            ),
            "document_b_id": str(
                comparison_result.get(
                    "document_b_id",
                    document_b.get("id", ""),
                )
            ),
            "overall_similarity": overall_similarity,
            "changes_detected": len(changes),
            "changes": changes,
            "text_changes": text_changes,
            "metadata_changes": metadata_changes,
            "visual_changes": visual_changes,
            "summary": comparison_result.get(
                "summary",
                "No comparison summary was generated.",
            ),
            "status": "completed",
            "persisted": persist,
        }

    @staticmethod
    def _require_uuid(
        value: Any,
        field_name: str,
    ) -> UUID:
        if value is None:
            raise ChangeDetectionError(
                f"{field_name} is required."
            )

        try:
            return UUID(str(value))
        except (TypeError, ValueError) as exc:
            raise ChangeDetectionError(
                f"{field_name} must be a valid UUID."
            ) from exc

    def _persist_changes(
        self,
        comparison_id: UUID,
        changes: list[dict[str, Any]],
    ) -> None:
        for change in changes:
            create_comparison_change(
                comparison_id=comparison_id,
                change_type=change["change_type"],
                description=change["description"],
                severity=change["severity"],
                field_name=change["name"],
                old_value=self._stringify_value(
                    change.get("document_a_value")
                ),
                new_value=self._stringify_value(
                    change.get("document_b_value")
                ),
            )

    @staticmethod
    def _persist_dna(
        comparison_id: UUID,
        comparison_result: dict[str, Any],
        overall_similarity: float,
        changes: list[dict[str, Any]],
    ) -> None:
        text_similarity = (
            comparison_result
            .get("text_comparison", {})
            .get("similarity")
        )

        metadata_similarity = (
            comparison_result
            .get("metadata_comparison", {})
            .get("similarity")
        )

        visual_similarity = (
            comparison_result
            .get("image_comparison", {})
            .get("similarity")
        )

        differences_json = {
            "changes": changes,
            "summary": comparison_result.get(
                "summary",
                "",
            ),
        }

        create_comparison_dna(
            comparison_id=comparison_id,
            text_similarity=ChangeDetectionService._safe_float(
                text_similarity
            ),
            visual_similarity=ChangeDetectionService._safe_float(
                visual_similarity
            ),
            structure_similarity=None,
            metadata_similarity=ChangeDetectionService._safe_float(
                metadata_similarity
            ),
            overall_similarity=overall_similarity,
            differences_json=differences_json,
        )

    @staticmethod
    def _safe_float(
        value: Any,
    ) -> float | None:
        if value is None:
            return None

        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _stringify_value(
        value: Any,
    ) -> str | None:
        if value is None:
            return None

        if isinstance(
            value,
            (dict, list),
        ):
            return str(value)

        return str(value)

    def _convert_difference(
        self,
        difference: dict[str, Any],
    ) -> dict[str, Any]:
        category = self._detect_category(
            difference
        )

        change_type = str(
            difference.get(
                "change_type",
                "DOCUMENT_CHANGE",
            )
        )

        severity = str(
            difference.get(
                "severity",
                "low",
            )
        )

        description = str(
            difference.get(
                "description",
                "A difference was detected between the documents.",
            )
        )

        old_value = difference.get(
            "old_value"
        )

        new_value = difference.get(
            "new_value"
        )

        similarity = self._extract_similarity(
            difference
        )

        return {
            "change_type": change_type,
            "name": self._build_change_name(
                change_type
            ),
            "category": category,
            "severity": severity,
            "description": description,
            "document_a_value": old_value,
            "document_b_value": new_value,
            "similarity": similarity,
            "recommended_action": self._recommended_action(
                severity
            ),
        }

    @staticmethod
    def _detect_category(
        difference: dict[str, Any],
    ) -> str:
        category = str(
            difference.get(
                "category",
                "",
            )
        ).lower()

        if "text" in category:
            return "Text"

        if "metadata" in category:
            return "Metadata"

        if (
            "image" in category
            or "visual" in category
        ):
            return "Visual"

        change_type = str(
            difference.get(
                "change_type",
                "",
            )
        ).lower()

        if "text" in change_type:
            return "Text"

        if "metadata" in change_type:
            return "Metadata"

        if (
            "image" in change_type
            or "visual" in change_type
        ):
            return "Visual"

        return "Other"

    @staticmethod
    def _build_change_name(
        change_type: str,
    ) -> str:
        name = change_type.replace(
            "_",
            " ",
        ).strip()

        if not name:
            return "Document Change"

        return name.title()

    @staticmethod
    def _extract_similarity(
        difference: dict[str, Any],
    ) -> float | None:
        value = difference.get(
            "similarity"
        )

        if value is None:
            return None

        try:
            similarity = float(value)
        except (
            TypeError,
            ValueError,
        ):
            return None

        return max(
            0.0,
            min(
                1.0,
                similarity,
            ),
        )

    @staticmethod
    def _recommended_action(
        severity: str,
    ) -> str:
        normalized = severity.lower()

        if normalized == "high":
            return (
                "Review this change carefully "
                "because it has high severity."
            )

        if normalized == "medium":
            return (
                "Review this change and verify "
                "the affected document content."
            )

        return (
            "Review the change if it affects "
            "document consistency."
        )


change_detection_service = (
    ChangeDetectionService()
)