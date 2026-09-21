from __future__ import annotations

from typing import Any


class TamperHeatmapError(Exception):
    """Raised when tamper heatmap generation fails."""


class TamperHeatmapService:
    """
    Generates suspicious-region data from computer-vision signals.

    This is an indicator system, not proof of document tampering.
    """

    def generate(
        self,
        cv_result: dict[str, Any],
        anomalies: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        if not isinstance(cv_result, dict):
            raise TamperHeatmapError(
                "Computer vision result must be a dictionary."
            )

        anomalies = anomalies or []

        width = self._to_int(
            cv_result.get("width")
        )
        height = self._to_int(
            cv_result.get("height")
        )

        if width <= 0 or height <= 0:
            raise TamperHeatmapError(
                "Valid document dimensions are required."
            )

        brightness = self._to_float(
            cv_result.get("brightness")
        )
        contrast = self._to_float(
            cv_result.get("contrast")
        )
        blur_score = self._to_float(
            cv_result.get("blur_score")
        )
        edge_density = self._to_float(
            cv_result.get("edge_density")
        )
        noise_score = self._to_float(
            cv_result.get("noise_score")
        )

        regions: list[dict[str, Any]] = []

        self._add_noise_region(
            regions,
            width,
            height,
            noise_score,
        )

        self._add_edge_region(
            regions,
            width,
            height,
            edge_density,
        )

        self._add_brightness_region(
            regions,
            width,
            height,
            brightness,
        )

        self._add_contrast_region(
            regions,
            width,
            height,
            contrast,
        )

        self._add_blur_region(
            regions,
            width,
            height,
            blur_score,
        )

        self._add_anomaly_regions(
            regions,
            anomalies,
            width,
            height,
        )

        regions = self._deduplicate_regions(
            regions
        )

        regions.sort(
            key=lambda item: item["score"],
            reverse=True,
        )

        return {
            "width": width,
            "height": height,
            "region_count": len(regions),
            "regions": regions,
            "heatmap_status": "completed",
        }

    def _add_noise_region(
        self,
        regions: list[dict[str, Any]],
        width: int,
        height: int,
        noise_score: float | None,
    ) -> None:
        if noise_score is None:
            return

        if noise_score <= 8:
            return

        score = min(
            1.0,
            0.50 + (
                (noise_score - 8) / 20
            ),
        )

        regions.append(
            self._create_region(
                width=width,
                height=height,
                score=score,
                severity=self._severity(score),
                reason="High local image noise",
                indicator="high_image_noise",
            )
        )

    def _add_edge_region(
        self,
        regions: list[dict[str, Any]],
        width: int,
        height: int,
        edge_density: float | None,
    ) -> None:
        if edge_density is None:
            return

        if edge_density <= 0.08:
            return

        score = min(
            1.0,
            0.45 + (
                edge_density * 2
            ),
        )

        regions.append(
            self._create_region(
                width=width,
                height=height,
                score=score,
                severity=self._severity(score),
                reason="High edge density",
                indicator="high_edge_density",
            )
        )

    def _add_brightness_region(
        self,
        regions: list[dict[str, Any]],
        width: int,
        height: int,
        brightness: float | None,
    ) -> None:
        if brightness is None:
            return

        if 20 <= brightness <= 235:
            return

        distance = (
            20 - brightness
            if brightness < 20
            else brightness - 235
        )

        score = min(
            1.0,
            0.40 + (
                distance / 100
            ),
        )

        regions.append(
            self._create_region(
                width=width,
                height=height,
                score=score,
                severity=self._severity(score),
                reason="Extreme image brightness",
                indicator="extreme_brightness",
            )
        )

    def _add_contrast_region(
        self,
        regions: list[dict[str, Any]],
        width: int,
        height: int,
        contrast: float | None,
    ) -> None:
        if contrast is None:
            return

        if 10 <= contrast <= 80:
            return

        distance = (
            10 - contrast
            if contrast < 10
            else contrast - 80
        )

        score = min(
            1.0,
            0.40 + (
                distance / 100
            ),
        )

        regions.append(
            self._create_region(
                width=width,
                height=height,
                score=score,
                severity=self._severity(score),
                reason="Extreme image contrast",
                indicator="extreme_contrast",
            )
        )

    def _add_blur_region(
        self,
        regions: list[dict[str, Any]],
        width: int,
        height: int,
        blur_score: float | None,
    ) -> None:
        if blur_score is None:
            return

        if blur_score >= 100:
            return

        score = min(
            1.0,
            0.40 + (
                (100 - blur_score) / 100
            ),
        )

        regions.append(
            self._create_region(
                width=width,
                height=height,
                score=score,
                severity=self._severity(score),
                reason="Low image sharpness",
                indicator="low_image_sharpness",
            )
        )

    def _add_anomaly_regions(
        self,
        regions: list[dict[str, Any]],
        anomalies: list[dict[str, Any]],
        width: int,
        height: int,
    ) -> None:
        for anomaly in anomalies:
            if not isinstance(anomaly, dict):
                continue

            anomaly_type = str(
                anomaly.get(
                    "anomaly_type",
                    "",
                )
            ).strip()

            if not anomaly_type:
                continue

            severity = str(
                anomaly.get(
                    "severity",
                    "low",
                )
            ).strip().lower()

            score_map = {
                "low": 0.35,
                "medium": 0.60,
                "high": 0.80,
                "critical": 1.00,
            }

            score = score_map.get(
                severity,
                0.35,
            )

            reason = (
                anomaly.get(
                    "description"
                )
                or anomaly.get(
                    "name"
                )
                or "Detected anomaly"
            )

            regions.append(
                self._create_region(
                    width=width,
                    height=height,
                    score=score,
                    severity=severity,
                    reason=str(reason),
                    indicator=anomaly_type,
                )
            )

    def _create_region(
        self,
        width: int,
        height: int,
        score: float,
        severity: str,
        reason: str,
        indicator: str,
    ) -> dict[str, Any]:
        region_width = max(
            1,
            int(width * 0.5),
        )

        region_height = max(
            1,
            int(height * 0.5),
        )

        x = max(
            0,
            int(
                (width - region_width)
                / 2
            ),
        )

        y = max(
            0,
            int(
                (height - region_height)
                / 2
            ),
        )

        return {
            "x": x,
            "y": y,
            "width": region_width,
            "height": region_height,
            "score": round(
                max(
                    0.0,
                    min(1.0, score),
                ),
                4,
            ),
            "severity": severity,
            "reason": reason,
            "indicator": indicator,
        }

    def _deduplicate_regions(
        self,
        regions: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        unique: dict[
            tuple[str, int, int, int, int],
            dict[str, Any],
        ] = {}

        for region in regions:
            key = (
                str(region["indicator"]),
                int(region["x"]),
                int(region["y"]),
                int(region["width"]),
                int(region["height"]),
            )

            existing = unique.get(key)

            if existing is None:
                unique[key] = region
                continue

            if region["score"] > existing["score"]:
                unique[key] = region

        return list(
            unique.values()
        )

    def _severity(
        self,
        score: float,
    ) -> str:
        if score >= 0.75:
            return "high"

        if score >= 0.50:
            return "medium"

        return "low"

    def _to_float(
        self,
        value: Any,
    ) -> float | None:
        if value is None:
            return None

        try:
            return float(value)
        except (
            ValueError,
            TypeError,
        ):
            return None

    def _to_int(
        self,
        value: Any,
    ) -> int:
        if value is None:
            return 0

        try:
            return int(value)
        except (
            ValueError,
            TypeError,
        ):
            return 0


tamper_heatmap_service = TamperHeatmapService()