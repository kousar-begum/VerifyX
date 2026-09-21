from typing import Any

from app.db.supabase import get_supabase


class AuthenticationError(Exception):
    """
    Raised when a Supabase authentication operation fails.
    """

    pass


class AuthService:
    """
    Service layer for Supabase Authentication.

    This class handles:
    - User registration
    - User login
    - User logout

    Authentication is handled by Supabase Auth.
    Passwords are never stored by the VerfiX application.
    """

    def __init__(self) -> None:
        self.client = get_supabase()

    def signup(self, email: str, password: str) -> Any:
        """
        Register a new user with Supabase Auth.
        """

        try:
            response = self.client.auth.sign_up(
                {
                    "email": email,
                    "password": password,
                }
            )

            return response

        except Exception as exc:
            raise AuthenticationError(
                f"User registration failed: {exc}"
            ) from exc

    def login(self, email: str, password: str) -> Any:
        """
        Authenticate an existing user with email and password.
        """

        try:
            response = self.client.auth.sign_in_with_password(
                {
                    "email": email,
                    "password": password,
                }
            )

            return response

        except Exception as exc:
            raise AuthenticationError(
                f"User login failed: {exc}"
            ) from exc

    def logout(self) -> None:
        """
        Sign out the current Supabase authentication session.
        """

        try:
            self.client.auth.sign_out()

        except Exception as exc:
            raise AuthenticationError(
                f"User logout failed: {exc}"
            ) from exc


auth_service = AuthService()