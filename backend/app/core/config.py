from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central application configuration for the VerfiX backend.

    Values are loaded from environment variables or a .env file.
    Secrets must never be hard-coded in the source code.
    """

    # ------------------------------------------------------------------
    # Application
    # ------------------------------------------------------------------

    APP_NAME: str = "VerfiX"
    APP_DESCRIPTION: str = (
        "AI Document Tampering & Identity Risk Analyzer Backend"
    )
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # ------------------------------------------------------------------
    # API
    # ------------------------------------------------------------------

    API_PREFIX: str = "/api"
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------

    CORS_ORIGINS: List[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:5173",
        ]
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        """
        Allows CORS origins to be supplied either as:
        - a JSON/list value
        - a comma-separated environment variable
        """

        if isinstance(value, str):
            value = value.strip()

            if not value:
                return []

            return [
                origin.strip()
                for origin in value.split(",")
                if origin.strip()
            ]

        return value

    # ------------------------------------------------------------------
    # Supabase
    # ------------------------------------------------------------------

    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # ------------------------------------------------------------------
    # Supabase Storage
    # ------------------------------------------------------------------

    DOCUMENTS_BUCKET: str = "documents"
    REPORTS_BUCKET: str = "analysis-reports"
    ARTIFACTS_BUCKET: str = "analysis-artifacts"
    PROCESSED_DOCUMENTS_BUCKET: str = "processed-documents"

    SIGNED_URL_EXPIRY_SECONDS: int = 3600

    # ------------------------------------------------------------------
    # Database
    # ------------------------------------------------------------------

    DATABASE_URL: str = ""

    # ------------------------------------------------------------------
    # Authentication
    # ------------------------------------------------------------------

    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ------------------------------------------------------------------
    # File Upload
    # ------------------------------------------------------------------

    MAX_UPLOAD_SIZE_MB: int = 20

    ALLOWED_DOCUMENT_EXTENSIONS: List[str] = Field(
        default_factory=lambda: [
            ".pdf",
            ".png",
            ".jpg",
            ".jpeg",
            ".webp",
        ]
    )

    ALLOWED_DOCUMENT_MIME_TYPES: List[str] = Field(
        default_factory=lambda: [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/webp",
        ]
    )

    @field_validator(
        "ALLOWED_DOCUMENT_EXTENSIONS",
        "ALLOWED_DOCUMENT_MIME_TYPES",
        mode="before",
    )
    @classmethod
    def parse_list_values(cls, value):
        """
        Supports comma-separated environment variables.
        """

        if isinstance(value, str):
            value = value.strip()

            if not value:
                return []

            return [
                item.strip()
                for item in value.split(",")
                if item.strip()
            ]

        return value

    # ------------------------------------------------------------------
    # Analysis
    # ------------------------------------------------------------------

    RISK_SCORE_MIN: int = 0
    RISK_SCORE_MAX: int = 100

    LOW_RISK_MAX: int = 29
    MEDIUM_RISK_MAX: int = 59
    HIGH_RISK_MIN: int = 60

    # ------------------------------------------------------------------
    # OCR
    # ------------------------------------------------------------------

    OCR_LANGUAGE: str = "eng"
    OCR_TIMEOUT_SECONDS: int = 60

    # ------------------------------------------------------------------
    # Processing
    # ------------------------------------------------------------------

    PROCESSING_TIMEOUT_SECONDS: int = 300

    # ------------------------------------------------------------------
    # Reports
    # ------------------------------------------------------------------

    REPORT_TITLE: str = "VerfiX Document Risk Analysis Report"

    # ------------------------------------------------------------------
    # Logging
    # ------------------------------------------------------------------

    LOG_LEVEL: str = "INFO"

    # ------------------------------------------------------------------
    # Security
    # ------------------------------------------------------------------

    ENABLE_RATE_LIMITING: bool = True
    ENABLE_AUDIT_LOGGING: bool = True

    # ------------------------------------------------------------------
    # Pydantic Settings Configuration
    # ------------------------------------------------------------------

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """
    Returns a cached application settings instance.

    Using a cached instance prevents repeatedly reading and parsing
    environment variables during the application's lifetime.
    """

    return Settings()


settings = get_settings()