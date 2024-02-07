from sqlalchemy.orm import Session
from users.models import User
from users.schemas import UserCreate
from utils import bcrypt_context


def create_user_account(db: Session, user: UserCreate):
    create_user_model = User(
        username=user.username,
        hashed_password=bcrypt_context.hash(user.password),
    )
    db.add(create_user_model)
    db.commit()
    db.refresh(create_user_model)
    return create_user_model


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def try_activate_user(db: Session, user_id: int):
    user = get_user_by_id(db, user_id)

    if not user:
        return False

    user.is_active = True
    db.commit()
    db.refresh(user)
    return user.is_active


def try_verify_user(db: Session, user_id: int):
    user = get_user_by_id(db, user_id)

    if not user:
        return False

    user.is_verified = True
    db.commit()
    db.refresh(user)
    return user.is_verified
