from pydantic import BaseModel


class ItemBase(BaseModel):
    title: str
    price: float = 0


class ItemCreate(ItemBase):
    pass


class Item(ItemBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True