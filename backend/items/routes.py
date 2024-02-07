from typing import Annotated
from fastapi import APIRouter, Depends
from auth.services import get_login_user
from items.schemas import Item, ItemCreate
from items.services import (
    get_items,
    create_user_item,
    get_items_by_user_id,
    get_items_total_cost,
)
from utils import db_dependency

item_router = APIRouter(
    prefix="/api/v1/items", tags=["items"], responses={404: {"error": "Not Found"}}
)

auth_dependency = Annotated[dict, Depends(get_login_user)]


@item_router.get("", response_model=list[Item])
def read_all_items(
    auth_user: auth_dependency, db: db_dependency, skip: int = 0, limit: int = 100
):
    items = get_items(db, skip, limit)
    return items


@item_router.get("/me", response_model=list[Item])
def read_items_for_login_user(
    auth_user: auth_dependency, db: db_dependency, skip: int = 0, limit: int = 100
):
    user_id = auth_user.get("user_id")
    items = get_items_by_user_id(db, user_id, skip, limit)
    return items


@item_router.post("/me", response_model=Item)
def create_item_for_login_user(
    auth_user: auth_dependency, item: ItemCreate, db: db_dependency
):
    user_id = auth_user.get("user_id")
    return create_user_item(db, item, user_id)


@item_router.get("/total/me")
def read_items_total_for_login_user(auth_user: auth_dependency, db: db_dependency):
    user_id = auth_user.get("user_id")
    return get_items_total_cost(db, user_id)


@item_router.post("/{user_id}", response_model=Item)
def create_item_for_user(
    auth_user: auth_dependency, user_id: int, item: ItemCreate, db: db_dependency
):
    return create_user_item(db, item, user_id)
