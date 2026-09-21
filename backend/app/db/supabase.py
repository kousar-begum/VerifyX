"""
VerfiX Supabase Database and Storage Connection Layer.

This module provides:
- A standard Supabase client for normal application operations.
- A service-role client for trusted server-side operations.
- Configuration validation.
- Helper functions for accessing Supabase consistently.

IMPORTANT:
The service-role key must NEVER be exposed to the frontend.
It bypasses Supabase Row Level Security and is therefore restricted
to trusted backend operations.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Optional

from supabase import Client, create_client

from app.core.config import Settings, get_settings


class SupabaseConnectionError(RuntimeError):
    """Raised when the Supabase configuration or connection is invalid."""


class SupabaseManager:
    """
    Manages Supabase clients used by the VerfiX backend.

    Two clients are maintained:

    1. Public client:
       Uses SUPABASE_ANON_KEY.
       Intended for operations that respect the authenticated user's
       Supabase permissions and Row Level Security.

    2. Service client:
       Uses SUPABASE_SERVICE_ROLE_KEY.
       Intended only for trusted backend operations that require
       elevated privileges.
    """

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

        self._public_client: Optional[Client] = None
        self._service_client: Optional[Client] = None

    # ------------------------------------------------------------------
    # Configuration validation
    # ------------------------------------------------------------------

    def _validate_supabase_url(self) -> None:
        """Validate that the Supabase project URL is configured."""

        url = self.settings.SUPABASE_URL.strip()

        if not url:
            raise SupabaseConnectionError(
                "SUPABASE_URL is not configured. "
                "Add your Supabase project URL to the .env file."
            )

        if not (
            url.startswith("https://")
            or url.startswith("http://")
        ):
            raise SupabaseConnectionError(
                "SUPABASE_URL must be a valid HTTP or HTTPS URL."
            )

    def _validate_public_key(self) -> None:
        """Validate that the anonymous Supabase key is configured."""

        if not self.settings.SUPABASE_ANON_KEY.strip():
            raise SupabaseConnectionError(
                "SUPABASE_ANON_KEY is not configured."
            )

    def _validate_service_key(self) -> None:
        """Validate that the service-role key is configured."""

        if not self.settings.SUPABASE_SERVICE_ROLE_KEY.strip():
            raise SupabaseConnectionError(
                "SUPABASE_SERVICE_ROLE_KEY is not configured."
            )

    # ------------------------------------------------------------------
    # Public Supabase client
    # ------------------------------------------------------------------

    def get_public_client(self) -> Client:
        """
        Return the standard Supabase client.

        This client uses the anonymous key and should be preferred
        whenever the operation can safely work under normal Supabase
        authentication and Row Level Security rules.
        """

        if self._public_client is None:
            self._validate_supabase_url()
            self._validate_public_key()

            try:
                self._public_client = create_client(
                    self.settings.SUPABASE_URL,
                    self.settings.SUPABASE_ANON_KEY,
                )
            except Exception as exc:
                raise SupabaseConnectionError(
                    f"Unable to create the Supabase public client: {exc}"
                ) from exc

        return self._public_client

    # ------------------------------------------------------------------
    # Service-role Supabase client
    # ------------------------------------------------------------------

    def get_service_client(self) -> Client:
        """
        Return the privileged Supabase service-role client.

        WARNING:
        The service-role client bypasses Row Level Security.

        It must only be used by trusted backend code and must never be
        returned to or exposed through an API response.
        """

        if self._service_client is None:
            self._validate_supabase_url()
            self._validate_service_key()

            try:
                self._service_client = create_client(
                    self.settings.SUPABASE_URL,
                    self.settings.SUPABASE_SERVICE_ROLE_KEY,
                )
            except Exception as exc:
                raise SupabaseConnectionError(
                    f"Unable to create the Supabase service client: {exc}"
                ) from exc

        return self._service_client

    # ------------------------------------------------------------------
    # Connection validation
    # ------------------------------------------------------------------

    def validate_configuration(self) -> dict[str, bool]:
        """
        Check whether the required Supabase configuration values exist.

        This does not perform a database query. It only validates the
        local configuration and therefore can safely be used during
        application startup diagnostics.
        """

        url_configured = bool(
            self.settings.SUPABASE_URL.strip()
        )

        public_key_configured = bool(
            self.settings.SUPABASE_ANON_KEY.strip()
        )

        service_key_configured = bool(
            self.settings.SUPABASE_SERVICE_ROLE_KEY.strip()
        )

        return {
            "supabase_url_configured": url_configured,
            "supabase_anon_key_configured": public_key_configured,
            "supabase_service_role_key_configured": service_key_configured,
            "configuration_complete": (
                url_configured
                and public_key_configured
                and service_key_configured
            ),
        }

    # ------------------------------------------------------------------
    # Storage bucket names
    # ------------------------------------------------------------------

    def get_storage_bucket_names(self) -> dict[str, str]:
        """
        Return the configured private Supabase Storage buckets.
        """

        return {
            "documents": self.settings.DOCUMENTS_BUCKET,
            "reports": self.settings.REPORTS_BUCKET,
            "artifacts": self.settings.ARTIFACTS_BUCKET,
            "processed_documents": (
                self.settings.PROCESSED_DOCUMENTS_BUCKET
            ),
        }


# ----------------------------------------------------------------------
# Singleton manager
# ----------------------------------------------------------------------

@lru_cache
def get_supabase_manager() -> SupabaseManager:
    """
    Return the application's cached Supabase manager.
    """

    return SupabaseManager(get_settings())


# ----------------------------------------------------------------------
# Convenience accessors
# ----------------------------------------------------------------------

def get_supabase() -> Client:
    """
    Return the standard Supabase client.

    Use this for operations that should follow normal Supabase
    authentication and Row Level Security.
    """

    return get_supabase_manager().get_public_client()


def get_supabase_service() -> Client:
    """
    Return the privileged service-role Supabase client.

    Use this only for trusted backend operations.

    Never expose this client or its credentials to the frontend.
    """

    return get_supabase_manager().get_service_client()


def get_supabase_configuration_status() -> dict[str, bool]:
    """
    Return the current Supabase configuration status.
    """

    return get_supabase_manager().validate_configuration()


def get_storage_buckets() -> dict[str, str]:
    """
    Return configured Supabase Storage bucket names.
    """

    return get_supabase_manager().get_storage_bucket_names()