from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from users.schemas import UserCreate, User
from users.services import (
    create_user_account,
    get_users,
    get_user_by_username,
    get_user_by_id,
    try_activate_user,
    try_verify_user,
)
from auth.services import get_login_user
from utils import db_dependency

user_router = APIRouter(
    prefix="/api/v1/users", tags=["users"], responses={404: {"error": "Not Found"}}
)

auth_dependency = Annotated[dict, Depends(get_login_user)]


@user_router.post("", status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: db_dependency):
    print("🚀 ~ user:", user)
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="user already registered"
        )
    return create_user_account(db, user)


@user_router.get("", response_model=list[User])
def read_users(
    db: db_dependency, auth_user: auth_dependency, skip: int = 0, limit: int = 100
):
    print("🚀 ~ auth_user:", auth_user)
    users = get_users(db, skip=skip, limit=limit)
    return users


@user_router.get("/{user_id}", response_model=User)
def read_user(user_id: int, auth_user: auth_dependency, db: db_dependency):
    print("🚀 ~ auth_user:", auth_user)
    db_user = get_user_by_id(db, user_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return db_user


@user_router.post("/activate/{user_id}", status_code=status.HTTP_200_OK)
async def activate_user(user_id: int, auth_user: auth_dependency, db: db_dependency):
    print("🚀 ~ auth_user:", auth_user)
    try:
        return try_activate_user(db, user_id)
    except Exception as ex:
        print(ex)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to activate user",
        )


@user_router.post("/verify/{user_id}", status_code=status.HTTP_200_OK)
async def verify_user(user_id: int, auth_user: auth_dependency, db: db_dependency):
    try:
        return try_verify_user(db, user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify user",
        )
