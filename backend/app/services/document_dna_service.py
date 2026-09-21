from __future__ import annotations

import hashlib
import json
from typing import Any


class DocumentDNAError(Exception):
    """Raised when document DNA generation fails."""


class DocumentDNAService:
    """
    Generates a deterministic fingerprint of a document.

    Document DNA is built from OCR, metadata, computer-vision,
    and document characteristics. It is intended for comparison
    and change detection, not as proof of authenticity.
    """

    def generate(
        self,
        file_content: bytes,
        mime_type: str,
        ocr_result: dict[str, Any] | None = None,
        metadata_result: dict[str, Any] | None = None,
        cv_result: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        if not file_content:
            raise DocumentDNAError(
                "Document content cannot be empty."
            )

        if not mime_type:
            raise DocumentDNAError(
                "MIME type is required."
            )

        ocr_result = ocr_result or {}
        metadata_result = metadata_result or {}
        cv_result = cv_result or {}

        ocr_features = self._extract_ocr_features(
            ocr_result
        )

        metadata_features = self._extract_metadata_features(
            metadata_result
        )

        cv_features = self._extract_cv_features(
            cv_result
        )

        document_features = {
            "mime_type": mime_type,
            "file_size": len(file_content),
            "file_sha256": hashlib.sha256(
                file_content
            ).hexdigest(),
        }

        fingerprint_data = {
            "document": document_features,
            "ocr": ocr_features,
            "metadata": metadata_features,
            "computer_vision": cv_features,
        }

        fingerprint = self._create_fingerprint(
            fingerprint_data
        )

        return {
            "fingerprint": fingerprint,
            "document_features": document_features,
            "ocr_features": ocr_features,
            "metadata_features": metadata_features,
            "computer_vision_features": cv_features,
        }

    def _extract_ocr_features(
        self,
        ocr_result: dict[str, Any],
    ) -> dict[str, Any]:
        text = str(
            ocr_result.get("text") or ""
        )

        regions = ocr_result.get(
            "regions"
        ) or []

        word_count = len(
            text.split()
        )

        character_count = len(text)

        line_count = (
            len(text.splitlines())
            if text
            else 0
        )

        confidence_values: list[float] = []

        for region in regions:
            if not isinstance(region, dict):
                continue

            confidence = region.get(
                "confidence"
            )

            if confidence is None:
                continue

            try:
                confidence_values.append(
                    float(confidence)
                )
            except (
                ValueError,
                TypeError,
            ):
                continue

        average_confidence = (
            round(
                sum(confidence_values)
                / len(confidence_values),
                4,
            )
            if confidence_values
            else 0.0
        )

        return {
            "character_count": character_count,
            "word_count": word_count,
            "line_count": line_count,
            "region_count": len(regions),
            "average_confidence": (
                average_confidence
            ),
        }

    def _extract_metadata_features(
        self,
        metadata_result: dict[str, Any],
    ) -> dict[str, Any]:
        metadata = (
            metadata_result.get(
                "metadata"
            )
            or {}
        )

        return {
            "document_type": metadata_result.get(
                "document_type"
            ),
            "format": metadata.get(
                "format"
            ),
            "mode": metadata.get(
                "mode"
            ),
            "width": metadata.get(
                "width"
            ),
            "height": metadata.get(
                "height"
            ),
            "has_exif": bool(
                metadata.get(
                    "has_exif",
                    False,
                )
            ),
            "page_count": metadata_result.get(
                "page_count"
            ),
        }

    def _extract_cv_features(
        self,
        cv_result: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "width": cv_result.get(
                "width"
            ),
            "height": cv_result.get(
                "height"
            ),
            "channels": cv_result.get(
                "channels"
            ),
            "brightness": self._round_value(
                cv_result.get(
                    "brightness"
                )
            ),
            "contrast": self._round_value(
                cv_result.get(
                    "contrast"
                )
            ),
            "blur_score": self._round_value(
                cv_result.get(
                    "blur_score"
                )
            ),
            "edge_density": self._round_value(
                cv_result.get(
                    "edge_density"
                )
            ),
            "noise_score": self._round_value(
                cv_result.get(
                    "noise_score"
                )
            ),
        }

    def _round_value(
        self,
        value: Any,
    ) -> float | None:
        if value is None:
            return None

        try:
            return round(
                float(value),
                6,
            )
        except (
            ValueError,
            TypeError,
        ):
            return None

    def _create_fingerprint(
        self,
        fingerprint_data: dict[str, Any],
    ) -> str:
        try:
            serialized = json.dumps(
                fingerprint_data,
                sort_keys=True,
                separators=(
                    ",",
                    ":",
                ),
                default=str,
            )
        except (
            TypeError,
            ValueError,
        ) as exc:
            raise DocumentDNAError(
                "Unable to serialize document DNA."
            ) from exc

        return hashlib.sha256(
            serialized.encode("utf-8")
        ).hexdigest()


document_dna_service = DocumentDNAService()