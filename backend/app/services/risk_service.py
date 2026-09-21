from __future__ import annotations

from typing import Any


class RiskScoringError(Exception):
    """Raised when risk scoring cannot be completed."""


class RiskService:
    """
    Centralized risk scoring engine.

    Converts detected anomaly signals into a document risk score.

    The risk score is a rule-based indicator of detected risk signals.
    It is NOT a probability of fraud, forgery, or authenticity.
    """

    CATEGORY_WEIGHTS: dict[str, float] = {
        "text": 20.0,
        "layout": 15.0,
        "image": 20.0,
        "metadata": 10.0,
        "manipulation": 25.0,
        "structure": 15.0,
        "partial_tampering": 25.0,
    }

    SEVERITY_MULTIPLIERS: dict[str, float] = {
        "low": 0.25,
        "medium": 0.50,
        "high": 0.75,
        "critical": 1.00,
    }

    ANOMALY_TYPE_MAP: dict[str, str] = {
        # Text-related anomalies
        "text_rendering": "text",
        "font_inconsistency": "text",
        "spacing_inconsistency": "text",
        "low_ocr_confidence": "text",

        # Layout-related anomalies
        "alignment_inconsistency": "layout",
        "layout_anomaly": "layout",

        # Image-related anomalies
        "image_anomaly": "image",
        "high_image_noise": "image",
        "low_image_sharpness": "image",
        "high_edge_density": "image",
        "extreme_brightness": "image",
        "extreme_contrast": "image",

        # Metadata-related anomalies
        "metadata_anomaly": "metadata",
        "missing_exif": "metadata",
        "metadata_software_indicator": "metadata",

        # Manipulation-related anomalies
        "manipulation_artifact": "manipulation",
        "added_element": "manipulation",
        "modified_element": "manipulation",

        # Structural anomalies
        "structural_deviation": "structure",
        "field_relationship": "structure",
        "missing_element": "structure",

        # Partial tampering
        "partial_tampering": "partial_tampering",
    }

    def calculate_risk(
        self,
        anomalies: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """
        Calculate an overall risk score from detected anomalies.
        """

        if anomalies is None:
            raise RiskScoringError(
                "Anomaly data cannot be None."
            )

        if not isinstance(anomalies, list):
            raise RiskScoringError(
                "Anomaly data must be a list."
            )

        category_results: dict[str, dict[str, Any]] = {}

        for anomaly in anomalies:
            if not isinstance(anomaly, dict):
                continue

            anomaly_type = anomaly.get("anomaly_type")

            category = self._map_anomaly_to_category(
                anomaly_type
            )

            if category is None:
                continue

            severity = str(
                anomaly.get("severity", "low")
            ).strip().lower()

            if severity not in self.SEVERITY_MULTIPLIERS:
                severity = "low"

            confidence = self._normalize_confidence(
                anomaly.get("confidence")
            )

            multiplier = self.SEVERITY_MULTIPLIERS[
                severity
            ]

            contribution = (
                self.CATEGORY_WEIGHTS[category]
                * multiplier
                * confidence
            )

            if category not in category_results:
                category_results[category] = {
                    "factor_name": self._display_name(
                        category
                    ),
                    "contribution_score": 0.0,
                    "confidence_values": [],
                    "anomaly_count": 0,
                    "anomaly_types": [],
                    "descriptions": [],
                }

            result = category_results[category]

            result["contribution_score"] += contribution

            result["confidence_values"].append(
                confidence
            )

            result["anomaly_count"] += 1

            result["anomaly_types"].append(
                str(anomaly_type)
            )

            description = anomaly.get("description")

            if description:
                result["descriptions"].append(
                    str(description)
                )

        risk_factors = self._build_risk_factors(
            category_results
        )

        risk_score = self._calculate_overall_score(
            risk_factors
        )

        overall_confidence = (
            self._calculate_overall_confidence(
                anomalies
            )
        )

        risk_level = self._determine_risk_level(
            risk_score=risk_score,
            anomaly_count=len(anomalies),
            confidence=overall_confidence,
        )

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "overall_confidence": overall_confidence,
            "anomaly_count": len(anomalies),
        }

    def _map_anomaly_to_category(
        self,
        anomaly_type: Any,
    ) -> str | None:
        """
        Map anomaly types to broader risk categories.
        """

        if not anomaly_type:
            return None

        normalized_type = (
            str(anomaly_type)
            .strip()
            .lower()
        )

        return self.ANOMALY_TYPE_MAP.get(
            normalized_type
        )

    def _normalize_confidence(
        self,
        confidence: Any,
    ) -> float:
        """
        Normalize confidence to the range 0.0-1.0.

        Supports:
            0.85
        and:
            85
        """

        if confidence is None:
            return 0.5

        try:
            value = float(confidence)
        except (ValueError, TypeError):
            return 0.5

        if value > 1.0:
            value = value / 100.0

        return max(
            0.0,
            min(1.0, value),
        )

    def _build_risk_factors(
        self,
        category_results: dict[str, dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """
        Convert category results into frontend-friendly
        risk factor objects.
        """

        factors: list[dict[str, Any]] = []

        for category, result in category_results.items():
            contribution = min(
                self.CATEGORY_WEIGHTS[category],
                result["contribution_score"],
            )

            confidence_values = result[
                "confidence_values"
            ]

            if confidence_values:
                average_confidence = (
                    sum(confidence_values)
                    / len(confidence_values)
                )
            else:
                average_confidence = 0.0

            description = self._build_factor_description(
                result
            )

            factors.append(
                {
                    "name": result["factor_name"],
                    "category": category,
                    "contribution_score": round(
                        contribution,
                        2,
                    ),
                    "confidence": round(
                        average_confidence,
                        4,
                    ),
                    "anomaly_count": result[
                        "anomaly_count"
                    ],
                    "anomaly_types": result[
                        "anomaly_types"
                    ],
                    "description": description,
                }
            )

        factors.sort(
            key=lambda item: item[
                "contribution_score"
            ],
            reverse=True,
        )

        return factors

    def _calculate_overall_score(
        self,
        risk_factors: list[dict[str, Any]],
    ) -> float:
        """
        Calculate the final risk score from 0 to 100.
        """

        total = sum(
            float(
                factor["contribution_score"]
            )
            for factor in risk_factors
        )

        return round(
            max(
                0.0,
                min(100.0, total),
            ),
            2,
        )

    def _calculate_overall_confidence(
        self,
        anomalies: list[dict[str, Any]],
    ) -> float:
        """
        Calculate average anomaly confidence.

        This represents confidence in the detected signals,
        not confidence that the document is fraudulent.
        """

        if not anomalies:
            return 0.0

        confidence_values: list[float] = []

        for anomaly in anomalies:
            if not isinstance(anomaly, dict):
                continue

            confidence_values.append(
                self._normalize_confidence(
                    anomaly.get("confidence")
                )
            )

        if not confidence_values:
            return 0.0

        return round(
            sum(confidence_values)
            / len(confidence_values),
            4,
        )

    def _determine_risk_level(
        self,
        risk_score: float,
        anomaly_count: int,
        confidence: float,
    ) -> str:
        """
        Determine the final risk level.
        """

        if anomaly_count == 0:
            return "uncertain"

        if confidence < 0.30:
            return "uncertain"

        if risk_score < 30:
            return "low"

        if risk_score < 60:
            return "medium"

        return "high"

    def _display_name(
        self,
        category: str,
    ) -> str:
        names = {
            "text": "Text Anomaly",
            "layout": "Layout Anomaly",
            "image": "Image Anomaly",
            "metadata": "Metadata Anomaly",
            "manipulation": "Manipulation Indicators",
            "structure": "Structural Anomaly",
            "partial_tampering": (
                "Partial Tampering Indicators"
            ),
        }

        return names.get(
            category,
            category.replace(
                "_",
                " ",
            ).title(),
        )

    def _build_factor_description(
        self,
        result: dict[str, Any],
    ) -> str:
        count = result["anomaly_count"]

        anomaly_types = ", ".join(
            result["anomaly_types"]
        )

        if count == 1:
            return (
                f"One anomaly ({anomaly_types}) "
                f"contributed to the "
                f"{result['factor_name'].lower()} "
                f"risk factor."
            )

        return (
            f"{count} anomalies ({anomaly_types}) "
            f"contributed to the "
            f"{result['factor_name'].lower()} "
            f"risk factor."
        )


risk_service = RiskService()