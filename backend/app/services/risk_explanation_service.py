from __future__ import annotations

from typing import Any


class RiskExplanationError(Exception):
    """Raised when risk explanation generation fails."""


class RiskExplanationService:
    """Converts anomaly and risk results into human-readable explanations."""

    ANOMALY_EXPLANATIONS: dict[str, dict[str, str]] = {
        "MISSING_EXIF": {
            "name": "Missing EXIF Metadata",
            "category": "Metadata Anomaly",
            "explanation": (
                "The image does not contain EXIF metadata. "
                "This can happen when metadata is removed during editing, "
                "conversion, compression, or file transfer. "
                "It is an informational signal and does not independently "
                "prove document tampering."
            ),
            "recommended_action": (
                "Compare the document with the original source or "
                "verify it using another trusted document copy."
            ),
        },
        "LOW_OCR_CONFIDENCE": {
            "name": "Low OCR Confidence",
            "category": "Text Analysis Anomaly",
            "explanation": (
                "The text recognition system has relatively low confidence "
                "in some detected text. This may be caused by poor image "
                "quality, unusual fonts, blur, distortion, or altered text."
            ),
            "recommended_action": (
                "Review the affected text manually and compare it with "
                "the original document."
            ),
        },
        "HIGH_IMAGE_NOISE": {
            "name": "High Image Noise",
            "category": "Image Quality Anomaly",
            "explanation": (
                "The image contains a relatively high level of pixel "
                "variation. This may result from scanning, compression, "
                "camera capture, or image manipulation."
            ),
            "recommended_action": (
                "Compare the image quality with the original document "
                "and inspect suspicious areas manually."
            ),
        },
        "LOW_IMAGE_SHARPNESS": {
            "name": "Low Image Sharpness",
            "category": "Image Quality Anomaly",
            "explanation": (
                "The document image has relatively low sharpness. "
                "Blur can reduce analysis accuracy and may also make "
                "text or visual modifications harder to identify."
            ),
            "recommended_action": (
                "Use a higher-quality scan or image and compare it "
                "with the current document."
            ),
        },
        "HIGH_EDGE_DENSITY": {
            "name": "High Edge Density",
            "category": "Image Structure Anomaly",
            "explanation": (
                "The image contains a relatively high concentration of "
                "edges. This can be caused by dense text, graphics, "
                "scanning artifacts, or image modifications."
            ),
            "recommended_action": (
                "Inspect areas containing unusual edges and compare "
                "them with the original document."
            ),
        },
        "EXTREME_BRIGHTNESS": {
            "name": "Extreme Brightness",
            "category": "Image Quality Anomaly",
            "explanation": (
                "The document image has unusually high or low brightness. "
                "Extreme brightness can affect text recognition and visual "
                "analysis."
            ),
            "recommended_action": (
                "Review the original image under normal lighting or "
                "use a better-quality scan."
            ),
        },
        "EXTREME_CONTRAST": {
            "name": "Extreme Contrast",
            "category": "Image Quality Anomaly",
            "explanation": (
                "The document image has unusually high or low contrast. "
                "This may be caused by scanning, image processing, "
                "compression, or other transformations."
            ),
            "recommended_action": (
                "Compare the document with the original and inspect "
                "areas affected by unusual contrast."
            ),
        },
        "METADATA_SOFTWARE_INDICATOR": {
            "name": "Metadata Software Indicator",
            "category": "Metadata Anomaly",
            "explanation": (
                "The document metadata contains a software or processing "
                "indicator. This can occur when a file has been created, "
                "converted, or processed using document or image software."
            ),
            "recommended_action": (
                "Verify the document's source and compare its metadata "
                "with a trusted original."
            ),
        },
    }

    def explain(
        self,
        document_id: str,
        original_filename: str,
        mime_type: str,
        risk_result: dict[str, Any],
        anomalies: list[dict[str, Any]],
    ) -> dict[str, Any]:
        if not document_id:
            raise RiskExplanationError("Document ID is required.")

        if not original_filename:
            raise RiskExplanationError("Original filename is required.")

        if not mime_type:
            raise RiskExplanationError("MIME type is required.")

        if not isinstance(risk_result, dict):
            raise RiskExplanationError("Risk result must be a dictionary.")

        if not isinstance(anomalies, list):
            raise RiskExplanationError("Anomalies must be a list.")

        risk_score = self._normalize_score(
            risk_result.get("risk_score", 0)
        )

        risk_level = str(
            risk_result.get("risk_level", "uncertain")
        ).strip().lower()

        explanations = []

        for anomaly in anomalies:
            if not isinstance(anomaly, dict):
                continue

            explanation = self._build_anomaly_explanation(anomaly)

            if explanation:
                explanations.append(explanation)

        overall_explanation = self._build_overall_explanation(
            risk_score=risk_score,
            risk_level=risk_level,
            anomaly_count=len(anomalies),
        )

        recommended_next_step = self._build_next_step(
            risk_score=risk_score,
            risk_level=risk_level,
            anomaly_count=len(anomalies),
        )

        return {
            "document_id": document_id,
            "original_filename": original_filename,
            "mime_type": mime_type,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "overall_explanation": overall_explanation,
            "explanations": explanations,
            "total_anomalies": len(anomalies),
            "recommended_next_step": recommended_next_step,
        }

    def _build_anomaly_explanation(
        self,
        anomaly: dict[str, Any],
    ) -> dict[str, Any] | None:
        anomaly_type = str(
            anomaly.get("anomaly_type", "")
        ).strip().upper()

        if not anomaly_type:
            return None

        definition = self.ANOMALY_EXPLANATIONS.get(
            anomaly_type,
            {},
        )

        name = definition.get(
            "name",
            str(
                anomaly.get(
                    "name",
                    anomaly_type.replace("_", " ").title(),
                )
            ),
        )

        category = definition.get(
            "category",
            str(
                anomaly.get(
                    "category",
                    "Document Anomaly",
                )
            ),
        )

        explanation_text = definition.get(
            "explanation",
            str(
                anomaly.get(
                    "description",
                    "An anomaly was detected in the document.",
                )
            ),
        )

        recommended_action = definition.get(
            "recommended_action",
            str(
                anomaly.get(
                    "recommended_action",
                    "Review the document against a trusted original.",
                )
            ),
        )

        severity = str(
            anomaly.get("severity", "low")
        ).strip().lower()

        evidence = anomaly.get("evidence")

        if not isinstance(evidence, dict):
            evidence = {}

        risk_impact = self._build_risk_impact(
            severity=severity,
            anomaly_type=anomaly_type,
        )

        return {
            "anomaly_type": anomaly_type,
            "name": name,
            "category": category,
            "severity": severity,
            "explanation": explanation_text,
            "evidence": evidence,
            "risk_impact": risk_impact,
            "recommended_action": recommended_action,
        }

    def _build_risk_impact(
        self,
        severity: str,
        anomaly_type: str,
    ) -> str:
        if severity == "critical":
            return (
                f"{anomaly_type} is classified as a critical indicator "
                "and can substantially increase document risk."
            )

        if severity == "high":
            return (
                f"{anomaly_type} is classified as a high-severity "
                "indicator and can significantly increase document risk."
            )

        if severity == "medium":
            return (
                f"{anomaly_type} is classified as a medium-severity "
                "indicator and contributes moderately to document risk."
            )

        return (
            f"{anomaly_type} is classified as a low-severity indicator. "
            "It should be considered together with other evidence rather "
            "than treated as proof of tampering."
        )

    def _build_overall_explanation(
        self,
        risk_score: float,
        risk_level: str,
        anomaly_count: int,
    ) -> str:
        if anomaly_count == 0:
            return (
                "No anomalies were detected by the current analysis "
                "pipeline. This does not guarantee authenticity because "
                "automated analysis cannot establish document authenticity "
                "with certainty."
            )

        if risk_level == "uncertain":
            return (
                f"The analysis detected {anomaly_count} anomaly or anomalies, "
                f"but the available evidence is not strong enough to assign "
                f"a reliable risk level. The current risk score is "
                f"{risk_score:.2f}. Manual verification is recommended."
            )

        return (
            f"The analysis detected {anomaly_count} anomaly or anomalies. "
            f"The calculated risk score is {risk_score:.2f}, with a "
            f"{risk_level} risk level. The result should be interpreted "
            "together with the detected evidence rather than as definitive "
            "proof of document tampering."
        )

    def _build_next_step(
        self,
        risk_score: float,
        risk_level: str,
        anomaly_count: int,
    ) -> str:
        if anomaly_count == 0:
            return (
                "No immediate anomaly-specific action is required. "
                "For important documents, retain the original source "
                "copy for independent verification."
            )

        if risk_level in {"high", "critical"}:
            return (
                "Perform manual verification against the original source "
                "document and investigate the detected anomalies before "
                "relying on the document."
            )

        if risk_level == "medium":
            return (
                "Review the detected anomalies and compare the document "
                "with a trusted original before relying on it."
            )

        return (
            "Review the detected indicators and compare the document "
            "with a trusted original if authenticity is important."
        )

    def _normalize_score(self, value: Any) -> float:
        try:
            score = float(value)
        except (TypeError, ValueError):
            score = 0.0

        return round(
            max(0.0, min(100.0, score)),
            2,
        )


risk_explanation_service = RiskExplanationService()