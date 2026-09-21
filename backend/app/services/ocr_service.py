from typing import Any

import cv2
import numpy as np
import pytesseract


TESSERACT_EXE = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

pytesseract.pytesseract.tesseract_cmd = TESSERACT_EXE


class OCRProcessingError(Exception):
    """Raised when OCR processing fails."""


class OCRService:
    """Extracts text and basic text-region information from documents."""

    def extract_text(
        self,
        file_content: bytes,
        mime_type: str,
    ) -> dict[str, Any]:
        if not file_content:
            raise OCRProcessingError(
                "The document contains no data."
            )

        try:
            image = self._decode_image(file_content)

            gray_image = cv2.cvtColor(
                image,
                cv2.COLOR_BGR2GRAY,
            )

            processed_image = cv2.threshold(
                gray_image,
                0,
                255,
                cv2.THRESH_BINARY + cv2.THRESH_OTSU,
            )[1]

            text = pytesseract.image_to_string(
                processed_image,
                config="--psm 6",
            )

            data = pytesseract.image_to_data(
                processed_image,
                config="--psm 6",
                output_type=pytesseract.Output.DICT,
            )

            text_regions = self._extract_text_regions(data)

            return {
                "text": text.strip(),
                "text_regions": text_regions,
                "character_count": len(text.strip()),
                "word_count": len(text.split()),
            }

        except OCRProcessingError:
            raise

        except Exception as exc:
            raise OCRProcessingError(
                f"OCR processing failed: {exc}"
            ) from exc

    def _decode_image(
        self,
        file_content: bytes,
    ) -> np.ndarray:
        image_array = np.frombuffer(
            file_content,
            dtype=np.uint8,
        )

        image = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR,
        )

        if image is None:
            raise OCRProcessingError(
                "The document could not be decoded as an image."
            )

        return image

    def _extract_text_regions(
        self,
        data: dict[str, list[Any]],
    ) -> list[dict[str, Any]]:
        regions: list[dict[str, Any]] = []

        total_items = len(
            data.get("text", [])
        )

        for index in range(total_items):
            text = str(
                data["text"][index]
            ).strip()

            if not text:
                continue

            try:
                confidence = float(
                    data["conf"][index]
                )
            except (ValueError, TypeError):
                confidence = -1.0

            regions.append(
                {
                    "text": text,
                    "confidence": confidence,
                    "left": int(
                        data["left"][index]
                    ),
                    "top": int(
                        data["top"][index]
                    ),
                    "width": int(
                        data["width"][index]
                    ),
                    "height": int(
                        data["height"][index]
                    ),
                }
            )

        return regions


ocr_service = OCRService()