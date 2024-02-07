from fastapi import HTTPException
from starlette import status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from config.settings import get_settings
from users.services import get_user_by_username
from utils import bcrypt_context, oauth2_bearer_dependency
from jose import jwt, JWTError

config = get_settings()
secret = config.JWT_SECRET
algorithm = config.JWT_ALGORITHM


def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user


def create_access_token(user_id: int, username: str, expires_delta: timedelta):
    expires = datetime.utcnow() + expires_delta
    payload = {
        "id": user_id,
        "sub": username,
        "name": username,
        "exp": expires,
        "iat": expires,
        "scope": "read:item write:item",
    }
    return jwt.encode(payload, secret, algorithm)


def create_refresh_token(user_id: int, username: str, expires_delta: timedelta):
    expires = datetime.utcnow() + expires_delta
    payload = {
        "id": user_id,
        "sub": username,
        "client_id": "appid=" + username,
        "exp": expires,
        "iat": expires,
    }
    return jwt.encode(payload, secret, algorithm)


def read_refresh_token(token: str, expiry: timedelta):
    payload = jwt.decode(token, secret, algorithms=[algorithm])
    user_id: int = payload.get("id")
    username: str = payload.get("sub")

    if username is None or user_id is None:
        return None

    return create_refresh_token(user_id, username, expiry)


def verify_token(db: Session, token: str):
    payload = jwt.decode(token, secret, algorithms=[algorithm])
    user_id: int = payload.get("id")
    username: str = payload.get("sub")

    if username is None or user_id is None:
        return None

    user = get_user_by_username(db, username)
    if not user:
        return False

    return {"user_id": user_id, "username": username}


def get_login_user(token: oauth2_bearer_dependency):
    try:
        payload = jwt.decode(token, secret, algorithms=[algorithm])
        user_id: int = payload.get("id")
        username: str = payload.get("sub")

        if username is None or user_id is None:
            return None

        return {"user_id": user_id, "username": username}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Failed to validate user."
        )
