import cv2
import numpy as np


class CVAnalysisError(Exception):
    """Raised when computer-vision analysis fails."""


class CVAnalysisService:
    """Extracts image-level computer-vision signals."""

    def analyze(
        self,
        file_content: bytes,
    ) -> dict:
        if not file_content:
            raise CVAnalysisError(
                "The document contains no image data."
            )

        try:
            image_array = np.frombuffer(
                file_content,
                dtype=np.uint8,
            )

            image = cv2.imdecode(
                image_array,
                cv2.IMREAD_COLOR,
            )

            if image is None:
                raise CVAnalysisError(
                    "The document could not be decoded as an image."
                )

            height, width = image.shape[:2]

            gray = cv2.cvtColor(
                image,
                cv2.COLOR_BGR2GRAY,
            )

            brightness = float(
                np.mean(gray)
            )

            contrast = float(
                np.std(gray)
            )

            blur_score = float(
                cv2.Laplacian(
                    gray,
                    cv2.CV_64F,
                ).var()
            )

            edges = cv2.Canny(
                gray,
                threshold1=100,
                threshold2=200,
            )

            edge_density = float(
                np.count_nonzero(edges)
                / edges.size
            )

            noise_score = self._calculate_noise(
                gray
            )

            return {
                "width": width,
                "height": height,
                "channels": int(image.shape[2]),
                "brightness": round(
                    brightness,
                    4,
                ),
                "contrast": round(
                    contrast,
                    4,
                ),
                "blur_score": round(
                    blur_score,
                    4,
                ),
                "edge_density": round(
                    edge_density,
                    6,
                ),
                "noise_score": round(
                    noise_score,
                    4,
                ),
            }

        except CVAnalysisError:
            raise

        except Exception as exc:
            raise CVAnalysisError(
                f"Computer-vision analysis failed: {exc}"
            ) from exc

    def _calculate_noise(
        self,
        gray: np.ndarray,
    ) -> float:
        blurred = cv2.GaussianBlur(
            gray,
            (3, 3),
            0,
        )

        difference = cv2.absdiff(
            gray,
            blurred,
        )

        return float(
            np.mean(difference)
        )


cv_analysis_service = CVAnalysisService()