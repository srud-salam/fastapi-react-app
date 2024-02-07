from typing import Annotated
from starlette import status
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Header, Request, Response
from config.settings import get_settings
from auth.models import Token
from jose import JWTError
from auth.services import (
    authenticate_user,
    get_login_user,
    create_access_token,
    create_refresh_token,
    read_refresh_token,
    verify_token,
)
from utils import oauth2_dependency, db_dependency

config = get_settings()
access_token_expiry = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
refresh_token_expiry = timedelta(minutes=config.REFRESH_TOKEN_EXPIRE_MINUTES)
auth_dependency = Annotated[dict, Depends(get_login_user)]

auth_router = APIRouter(
    prefix="/api/v1/auth", tags=["auth"], responses={404: {"error": "Not Found"}}
)


@auth_router.post("/token", status_code=status.HTTP_200_OK)
async def create_token(
    form_data: oauth2_dependency, db: db_dependency, response: Response
):
    if not form_data.username or not form_data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Username or Password",
        )

    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invlid username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is currently inactive. Please contact the administrator to reactivate it.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail="Your account is unverified. Please follow the instructions for the account verification.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # TODO: I'm keeping this simple for now, but please note that it may need further refinement on refresh token.
    access_token = create_access_token(user.id, user.username, access_token_expiry)
    refresh_token = create_refresh_token(user.id, user.username, refresh_token_expiry)

    response.set_cookie(
        "jwt",
        refresh_token,
        max_age=(refresh_token_expiry * 60 * 1000),
        secure=True,
        httponly=True,
    )

    return Token(
        access_token=access_token,
        expires_in=access_token_expiry.seconds,
    )


@auth_router.post("/refresh", status_code=status.HTTP_200_OK)
async def request_new_refresh_token(token: str = Header()):
    try:
        token = read_refresh_token(token, expiry=refresh_token_expiry)
        if token is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed",
            )

        return token
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Failed to validate token"
        )


@auth_router.get("/refresh", status_code=status.HTTP_200_OK)
async def request_new_access_token(db: db_dependency, request: Request):
    try:
        cookie_refresh_token = request.cookies.get("jwt")
        print("🚀 ~ cookie_refresh_token:", cookie_refresh_token)
        if cookie_refresh_token is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized user",
            )

        decode_user = verify_token(db, token=cookie_refresh_token)
        if decode_user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed",
            )
        if decode_user is False:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden authentication",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = decode_user.get("user_id")
        username = decode_user.get("username")
        access_token = create_access_token(user_id, username, access_token_expiry)

        return Token(
            access_token=access_token,
            expires_in=access_token_expiry.seconds,
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token or expired",
        )


@auth_router.get("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def delete_refresh_token(request: Request, response: Response):
    try:
        cookie_refresh_token = request.cookies.get("jwt")
        if cookie_refresh_token is None:
            raise HTTPException(
                status_code=status.HTTP_204_NO_CONTENT,
                detail="No user session",
            )

        response.delete_cookie(
            "jwt",
            secure=True,
            httponly=True,
        )  # set max_age and expire to 0

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during sign-out.",
        )


@auth_router.post("/me", status_code=status.HTTP_200_OK)
def get_login_user(auth_user: auth_dependency):
    if auth_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
        )
    return auth_user
