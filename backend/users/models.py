from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from config.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)

    items = relationship("Item", back_populates="owner")
