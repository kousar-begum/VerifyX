from __future__ import annotations

from difflib import SequenceMatcher
from typing import Any


class DocumentComparisonError(Exception):
    """Raised when document comparison cannot be completed."""


class DocumentComparisonService:
    """
    Compares two analyzed documents using OCR,
    metadata, and computer-vision features.

    This service identifies similarity and differences.
    It does not independently declare a document
    authentic or tampered.
    """

    def compare(
        self,
        document_a: dict[str, Any],
        document_b: dict[str, Any],
    ) -> dict[str, Any]:

        if not isinstance(document_a, dict):
            raise DocumentComparisonError(
                "Document A data must be a dictionary."
            )

        if not isinstance(document_b, dict):
            raise DocumentComparisonError(
                "Document B data must be a dictionary."
            )

        text_result = self._compare_text(
            document_a.get("ocr", {}),
            document_b.get("ocr", {}),
        )

        metadata_result = self._compare_metadata(
            document_a.get("metadata", {}),
            document_b.get("metadata", {}),
        )

        image_result = self._compare_image_features(
            document_a.get("cv", {}),
            document_b.get("cv", {}),
        )

        differences = []

        differences.extend(
            text_result["differences"]
        )

        differences.extend(
            metadata_result["differences"]
        )

        differences.extend(
            image_result["differences"]
        )

        overall_similarity = (
            self._calculate_overall_similarity(
                text_result["similarity"],
                metadata_result["similarity"],
                image_result["similarity"],
            )
        )

        summary = self._build_summary(
            overall_similarity,
            differences,
        )

        return {
            "document_a_id": str(
                document_a.get("id", "")
            ),
            "document_b_id": str(
                document_b.get("id", "")
            ),
            "document_a_filename": str(
                document_a.get(
                    "original_filename",
                    "",
                )
            ),
            "document_b_filename": str(
                document_b.get(
                    "original_filename",
                    "",
                )
            ),
            "document_a_mime_type": str(
                document_a.get(
                    "mime_type",
                    "",
                )
            ),
            "document_b_mime_type": str(
                document_b.get(
                    "mime_type",
                    "",
                )
            ),
            "overall_similarity": round(
                overall_similarity,
                4,
            ),
            "comparison_status": "completed",
            "differences_count": len(
                differences
            ),
            "differences": differences,
            "summary": summary,
            "metadata_comparison": {
                key: value
                for key, value in metadata_result.items()
                if key != "differences"
            },
            "text_comparison": {
                key: value
                for key, value in text_result.items()
                if key != "differences"
            },
            "image_comparison": {
                key: value
                for key, value in image_result.items()
                if key != "differences"
            },
        }

    def _compare_text(
        self,
        ocr_a: dict[str, Any],
        ocr_b: dict[str, Any],
    ) -> dict[str, Any]:

        text_a = self._extract_text(ocr_a)
        text_b = self._extract_text(ocr_b)

        similarity = SequenceMatcher(
            None,
            text_a.lower(),
            text_b.lower(),
        ).ratio()

        words_a = text_a.split()
        words_b = text_b.split()

        added_words, removed_words = (
            self._word_changes(
                words_a,
                words_b,
            )
        )

        differences = []

        if similarity < 0.95:
            severity = (
                "high"
                if similarity < 0.70
                else "medium"
            )

            differences.append(
                {
                    "difference_type": (
                        "TEXT_CONTENT_CHANGE"
                    ),
                    "name": "Text Content Difference",
                    "category": "Text Comparison",
                    "severity": severity,
                    "description": (
                        "The OCR text differs between "
                        "the two documents."
                    ),
                    "document_a_value": text_a[:1000],
                    "document_b_value": text_b[:1000],
                    "similarity": round(
                        similarity,
                        4,
                    ),
                    "recommended_action": (
                        "Review the added, removed, or "
                        "changed text against the trusted "
                        "document."
                    ),
                }
            )

        return {
            "similarity": similarity,
            "text_length_a": len(text_a),
            "text_length_b": len(text_b),
            "word_count_a": len(words_a),
            "word_count_b": len(words_b),
            "added_words": added_words[:100],
            "removed_words": removed_words[:100],
            "differences": differences,
        }

    def _compare_metadata(
        self,
        metadata_a: dict[str, Any],
        metadata_b: dict[str, Any],
    ) -> dict[str, Any]:

        differences = []

        compared_values = 0
        matching_values = 0

        keys = set(metadata_a.keys()) | set(
            metadata_b.keys()
        )

        ignored_keys = {
            "differences",
            "error",
        }

        for key in sorted(keys):
            if key in ignored_keys:
                continue

            value_a = metadata_a.get(key)
            value_b = metadata_b.get(key)

            compared_values += 1

            if self._values_equal(
                value_a,
                value_b,
            ):
                matching_values += 1
                continue

            differences.append(
                {
                    "difference_type": (
                        "METADATA_CHANGE"
                    ),
                    "name": (
                        f"Metadata Difference: {key}"
                    ),
                    "category": "Metadata Comparison",
                    "severity": "low",
                    "description": (
                        f"The metadata field '{key}' "
                        "differs between the documents."
                    ),
                    "document_a_value": value_a,
                    "document_b_value": value_b,
                    "similarity": 0.0,
                    "recommended_action": (
                        "Review the metadata difference "
                        "and verify whether it is expected."
                    ),
                }
            )

        similarity = (
            matching_values / compared_values
            if compared_values
            else 1.0
        )

        return {
            "similarity": similarity,
            "compared_fields": compared_values,
            "matching_fields": matching_values,
            "different_fields": len(
                differences
            ),
            "differences": differences,
        }

    def _compare_image_features(
        self,
        cv_a: dict[str, Any],
        cv_b: dict[str, Any],
    ) -> dict[str, Any]:

        differences = []

        feature_names = [
            "width",
            "height",
            "brightness",
            "contrast",
            "blur_score",
            "edge_density",
            "noise_score",
        ]

        similarities = []

        for feature in feature_names:
            value_a = self._to_float(
                cv_a.get(feature)
            )

            value_b = self._to_float(
                cv_b.get(feature)
            )

            if value_a is None or value_b is None:
                continue

            similarity = self._numeric_similarity(
                value_a,
                value_b,
            )

            similarities.append(similarity)

            if similarity < 0.90:
                severity = (
                    "high"
                    if similarity < 0.60
                    else "medium"
                )

                differences.append(
                    {
                        "difference_type": (
                            "IMAGE_FEATURE_CHANGE"
                        ),
                        "name": (
                            "Image Feature Difference: "
                            f"{feature}"
                        ),
                        "category": "Image Comparison",
                        "severity": severity,
                        "description": (
                            f"The image feature '{feature}' "
                            "differs between the documents."
                        ),
                        "document_a_value": value_a,
                        "document_b_value": value_b,
                        "similarity": round(
                            similarity,
                            4,
                        ),
                        "recommended_action": (
                            "Review the visual difference "
                            "and confirm whether it is caused "
                            "by normal scanning, compression, "
                            "resizing, or document modification."
                        ),
                    }
                )

        overall_similarity = (
            sum(similarities) / len(similarities)
            if similarities
            else 1.0
        )

        return {
            "similarity": overall_similarity,
            "compared_features": len(
                similarities
            ),
            "differences": differences,
        }

    def _extract_text(
        self,
        ocr_data: dict[str, Any],
    ) -> str:

        if not isinstance(
            ocr_data,
            dict,
        ):
            return ""

        text = ocr_data.get("text")

        if isinstance(text, str):
            return text.strip()

        return ""

    def _word_changes(
        self,
        words_a: list[str],
        words_b: list[str],
    ) -> tuple[list[str], list[str]]:

        matcher = SequenceMatcher(
            None,
            words_a,
            words_b,
        )

        added = []
        removed = []

        for (
            tag,
            start_a,
            end_a,
            start_b,
            end_b,
        ) in matcher.get_opcodes():

            if tag == "insert":
                added.extend(
                    words_b[start_b:end_b]
                )

            elif tag == "delete":
                removed.extend(
                    words_a[start_a:end_a]
                )

            elif tag == "replace":
                removed.extend(
                    words_a[start_a:end_a]
                )

                added.extend(
                    words_b[start_b:end_b]
                )

        return added, removed

    def _values_equal(
        self,
        value_a: Any,
        value_b: Any,
    ) -> bool:

        if (
            isinstance(value_a, float)
            and isinstance(value_b, float)
        ):
            return abs(
                value_a - value_b
            ) < 0.0001

        return value_a == value_b

    def _to_float(
        self,
        value: Any,
    ) -> float | None:

        if value is None:
            return None

        try:
            return float(value)

        except (
            TypeError,
            ValueError,
        ):
            return None

    def _numeric_similarity(
        self,
        value_a: float,
        value_b: float,
    ) -> float:

        denominator = max(
            abs(value_a),
            abs(value_b),
            1.0,
        )

        difference = abs(
            value_a - value_b
        )

        return max(
            0.0,
            min(
                1.0,
                1.0 - (
                    difference / denominator
                ),
            ),
        )

    def _calculate_overall_similarity(
        self,
        text_similarity: float,
        metadata_similarity: float,
        image_similarity: float,
    ) -> float:

        return (
            (text_similarity * 0.50)
            + (metadata_similarity * 0.20)
            + (image_similarity * 0.30)
        )

    def _build_summary(
        self,
        similarity: float,
        differences: list[dict[str, Any]],
    ) -> str:

        percentage = round(
            similarity * 100,
            2,
        )

        if not differences:
            return (
                "The two documents are highly similar, "
                f"with an overall similarity of "
                f"{percentage}%."
            )

        return (
            "The comparison identified "
            f"{len(differences)} difference(s) "
            "between the documents. Overall similarity "
            f"is {percentage}%. Differences should be "
            "reviewed together with the underlying evidence."
        )


document_comparison_service = (
    DocumentComparisonService()
)