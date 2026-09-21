from typing import Any


class AnomalyDetectionError(Exception):
    """Raised when anomaly detection fails."""


class AnomalyDetectionService:
    """Detects document anomalies from OCR, metadata, and CV evidence."""

    def detect(
        self,
        ocr_result: dict[str, Any],
        metadata_result: dict[str, Any],
        cv_result: dict[str, Any],
    ) -> list[dict[str, Any]]:
        try:
            anomalies: list[dict[str, Any]] = []

            self._check_exif(metadata_result, anomalies)
            self._check_ocr_confidence(ocr_result, anomalies)
            self._check_image_noise(cv_result, anomalies)
            self._check_blur(cv_result, anomalies)
            self._check_edge_density(cv_result, anomalies)
            self._check_brightness(cv_result, anomalies)
            self._check_contrast(cv_result, anomalies)
            self._check_metadata_software(
                metadata_result,
                anomalies,
            )

            return anomalies

        except Exception as exc:
            raise AnomalyDetectionError(
                f"Anomaly detection failed: {exc}"
            ) from exc

    def _add_anomaly(
        self,
        anomalies: list[dict[str, Any]],
        anomaly_type: str,
        name: str,
        category: str,
        severity: str,
        description: str,
        evidence: dict[str, Any],
        features: list[str],
        recommended_action: str,
    ) -> None:
        anomalies.append(
            {
                "anomaly_type": anomaly_type,
                "name": name,
                "category": category,
                "severity": severity,
                "description": description,
                "evidence": evidence,
                "features": features,
                "recommended_action": recommended_action,
            }
        )

    def _check_exif(
        self,
        metadata_result: dict[str, Any],
        anomalies: list[dict[str, Any]],
    ) -> None:
        metadata = metadata_result.get(
            "metadata",
            {},
        )

        if (
            metadata_result.get("document_type") == "image"
            and metadata.get("has_exif") is False
        ):
            self._add_anomaly(
                anomalies=anomalies,
                anomaly_type="MISSING_EXIF",
                name="Missing EXIF Metadata",
                category="Metadata Anomaly",
                severity="low",
                description=(
                    "The image does not contain EXIF metadata. "
                    "This is an informational signal and does not "
                    "by itself indicate document tampering."
                ),
                evidence={
                    "has_exif": False,
                },
                features=[
                    "EXIF metadata is absent",
                    "Image metadata cannot provide camera information",
                ],
                recommended_action=(
                    "Review the original source file or obtain "
                    "the original document if authenticity needs "
                    "to be verified."
                ),
            )

    def _check_ocr_confidence(
        self,
        ocr_result: dict[str, Any],
        anomalies: list[dict[str, Any]],
    ) -> None:
        regions = ocr_result.get(
            "text_regions",
            [],
        )

        confidences = [
            float(region["confidence"])
            for region in regions
            if float(region.get("confidence", -1)) >= 0
        ]

        if not confidences:
            return

        average_confidence = (
            sum(confidences) / len(confidences)
        )

        low_confidence_regions = [
            confidence
            for confidence in confidences
            if confidence < 60
        ]

        if average_confidence < 60:
            self._add_anomaly(
                anomalies=anomalies,
                anomaly_type="LOW_OCR_CONFIDENCE",
                name="Low OCR Confidence",
                category="Text Analysis Anomaly",
                severity="medium",
                description=(
                    "The OCR engine reported relatively low "
                    "confidence across detected text regions."
                ),
                evidence={
                    "average_confidence": round(
                        average_confidence,
                        2,
                    ),
                    "low_confidence_region_count": len(
                        low_confidence_regions
                    ),
                },
                features=[
                    "Low average OCR confidence",
                    "Multiple uncertain text regions",
                ],
                recommended_action=(
                    "Review the document image manually and "
                    "compare uncertain text with the original source."
                ),
            )

    def _check_image_noise(
        self,
        cv_result: dict[str, Any],
        anomalies: list[dict[str, Any]],
    ) -> None:
        noise_score = cv_result.get(
            "noise_score"
        )

        if noise_score is None:
            return

        if noise_score > 8:
            self._add_anomaly(
                anomalies=anomalies,
                anomaly_type="HIGH_IMAGE_NOISE",
                name="High Image Noise",
                category="Image Quality Anomaly",
                severity="medium",
                description=(
                    "The image contains a relatively high "
                    "level of local pixel variation."
                ),
                evidence={
                    "noise_score": noise_score,
                    "threshold": 8,
                },
                features=[
                    "Elevated pixel-level variation",
                    "Potential image processing or quality issue",
                ],
                recommended_action=(
                    "Review the affected regions at full resolution "
                    "and compare them with the original document."
                ),
            )

    def _check_blur(
        self,
        cv_result: dict[str, Any],
        anomalies: list[dict[str, Any]],
    ) -> None:
        blur_score = cv_result.get(
            "blur_score"
        )

        if blur_score is None:
            return

        if blur_score < 80:
            self._add_anomaly(
                anomalies=anomalies,
                anomaly_type="LOW_IMAGE_SHARPNESS",
                name="Low Image Sharpness",
                category="Image Quality Anomaly",
                severity="medium",
                description=(
                    "The image has relatively low edge "
                    "variation and may contain blur or focus issues."
                ),
                evidence={
                    "blur_score": blur_score,
                    "threshold": 80,
                },
                features=[
                    "Low sharpness measurement",
                    "Potential blur or focus problem",
                ],
                recommended_action=(
                    "Use a higher-resolution original document "
                    "for further verification."
                ),
            )

    def _check_edge_density(
        self,
        cv_result: dict[str, Any],
        anomalies: list[dict[str, Any]],
    ) -> None:
        edge_density = cv_result.get(
            "edge_density"
        )

        if edge_density is None:
            return

        if edge_density > 0.20:
            self._add_anomaly(
                anomalies=anomalies,
                anomaly_type="HIGH_EDGE_DENSITY",
                name="Unusually High Edge Density",
                category="Image Structure Anomaly",
                severity="low",
                description=(
                    "The image contains a high proportion "
                    "of detected edges."
                ),
                evidence={
                    "edge_density": edge_density,
                    "threshold": 0.20,
                },
                features=[
                    "High edge concentration",
                    "Strong local image boundaries",
                ],
                recommended_action=(
                    "Inspect areas with dense edges for unusual "
                    "text, borders, or image modifications."
                ),
            )

    def _check_brightness(
        self,
        cv_result: dict[str, Any],
        anomalies: list[dict[str, Any]],
    ) -> None:
        brightness = cv_result.get(
            "brightness"
        )

        if brightness is None:
            return

        if brightness < 40 or brightness > 245:
            self._add_anomaly(
                anomalies=anomalies,
                anomaly_type="EXTREME_BRIGHTNESS",
                name="Extreme Image Brightness",
                category="Image Quality Anomaly",
                severity="low",
                description=(
                    "The image brightness is outside the "
                    "normal analysis range."
                ),
                evidence={
                    "brightness": brightness,
                    "normal_range": [40, 245],
                },
                features=[
                    "Unusually dark or bright image",
                    "Potential capture or processing issue",
                ],
                recommended_action=(
                    "Review the document under normal lighting "
                    "or use the original digital file."
                ),
            )

    def _check_contrast(
        self,
        cv_result: dict[str, Any],
        anomalies: list[dict[str, Any]],
    ) -> None:
        contrast = cv_result.get(
            "contrast"
        )

        if contrast is None:
            return

        if contrast < 10 or contrast > 100:
            self._add_anomaly(
                anomalies=anomalies,
                anomaly_type="EXTREME_CONTRAST",
                name="Unusual Image Contrast",
                category="Image Quality Anomaly",
                severity="low",
                description=(
                    "The image contrast is outside the "
                    "normal analysis range."
                ),
                evidence={
                    "contrast": contrast,
                    "normal_range": [10, 100],
                },
                features=[
                    "Unusual contrast level",
                    "Potential image processing or capture issue",
                ],
                recommended_action=(
                    "Compare the image with the original document "
                    "and inspect areas with strong contrast changes."
                ),
            )

    def _check_metadata_software(
        self,
        metadata_result: dict[str, Any],
        anomalies: list[dict[str, Any]],
    ) -> None:
        metadata = metadata_result.get(
            "metadata",
            {},
        )

        creator = str(
            metadata.get("creator") or ""
        ).strip()

        producer = str(
            metadata.get("producer") or ""
        ).strip()

        if creator or producer:
            self._add_anomaly(
                anomalies=anomalies,
                anomaly_type="METADATA_SOFTWARE_INDICATOR",
                name="Document Software Metadata",
                category="Metadata Anomaly",
                severity="low",
                description=(
                    "The document contains creator or producer "
                    "metadata that may identify software used to "
                    "create or process the document."
                ),
                evidence={
                    "creator": creator or None,
                    "producer": producer or None,
                },
                features=[
                    "Creator metadata present"
                    if creator
                    else "Creator metadata absent",
                    "Producer metadata present"
                    if producer
                    else "Producer metadata absent",
                ],
                recommended_action=(
                    "Review the identified software metadata and "
                    "compare it with the expected document creation process."
                ),
            )


anomaly_detection_service = AnomalyDetectionService()