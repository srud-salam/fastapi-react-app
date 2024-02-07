from sqlalchemy import func
from sqlalchemy.orm import Session
from items.models import Item
from items.schemas import ItemCreate


def get_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Item).offset(skip).limit(limit).all()


def get_items_by_user_id(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(Item).filter(Item.owner_id == user_id).offset(skip).limit(limit).all()
    )


def get_items_total_cost(db: Session, user_id: int):
    return db.query(func.sum(Item.price)).filter(Item.owner_id == user_id).scalar()


def create_user_item(db: Session, item: ItemCreate, user_id: int):
    db_item = Item(**item.model_dump(), owner_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
