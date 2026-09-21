from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserSignupRequest(BaseModel):
    """
    Request model for creating a new user account.
    """

    email: EmailStr
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="User password with at least 8 characters.",
    )


class UserLoginRequest(BaseModel):
    """
    Request model for signing in an existing user.
    """

    email: EmailStr
    password: str = Field(
        ...,
        min_length=1,
        max_length=128,
    )


class UserResponse(BaseModel):
    """
    Public user information returned by the authentication API.
    """

    id: str
    email: EmailStr
    email_confirmed: bool


class AuthTokenResponse(BaseModel):
    """
    Authentication response containing Supabase session tokens.
    """

    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: Optional[int] = None
    user: UserResponse


class LogoutResponse(BaseModel):
    """
    Response returned after logout.
    """

    message: str