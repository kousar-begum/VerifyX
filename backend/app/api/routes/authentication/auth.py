from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.schemas.auth import (
    AuthTokenResponse,
    LogoutResponse,
    UserLoginRequest,
    UserResponse,
    UserSignupRequest,
)
from app.services.auth_service import (
    AuthenticationError,
    auth_service,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


def _build_user_response(user) -> UserResponse:
    """
    Convert a Supabase user object into the public API response.
    """

    email_confirmed = bool(
        getattr(user, "email_confirmed_at", None)
    )

    return UserResponse(
        id=str(user.id),
        email=user.email,
        email_confirmed=email_confirmed,
    )


@router.post(
    "/signup",
    response_model=AuthTokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(request: UserSignupRequest) -> AuthTokenResponse:
    """
    Register a new user through Supabase Auth.
    """

    try:
        response = auth_service.signup(
            email=request.email,
            password=request.password,
        )

        user = response.user
        session = response.session

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User registration could not be completed.",
            )

        access_token = (
            session.access_token
            if session is not None
            else ""
        )

        refresh_token = (
            session.refresh_token
            if session is not None
            else None
        )

        expires_in = (
            session.expires_in
            if session is not None
            else None
        )

        return AuthTokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=expires_in,
            user=_build_user_response(user),
        )

    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.post(
    "/login",
    response_model=AuthTokenResponse,
    status_code=status.HTTP_200_OK,
)
def login(request: UserLoginRequest) -> AuthTokenResponse:
    """
    Authenticate an existing user through Supabase Auth.
    """

    try:
        response = auth_service.login(
            email=request.email,
            password=request.password,
        )

        user = response.user
        session = response.session

        if user is None or session is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        return AuthTokenResponse(
            access_token=session.access_token,
            refresh_token=session.refresh_token,
            expires_in=session.expires_in,
            user=_build_user_response(user),
        )

    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed.",
        ) from exc


@router.post(
    "/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
)
def logout(
    current_user=Depends(get_current_user),
) -> LogoutResponse:
    """
    Sign out the current Supabase authentication session.
    """

    try:
        auth_service.logout()

        return LogoutResponse(
            message="Logout successful."
        )

    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logout failed.",
        ) from exc