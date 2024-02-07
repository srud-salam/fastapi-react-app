from pydantic import BaseModel
from items.schemas import Item

class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    items: list[Item] = []

    class Config:
        from_attributes = True
