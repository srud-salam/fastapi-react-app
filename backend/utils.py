from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from config.database import get_db
from typing import Annotated

db_dependency = Annotated[Session, Depends(get_db)]
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")
oauth2_dependency = Annotated[OAuth2PasswordRequestForm, Depends()]
oauth2_bearer_dependency = Annotated[str, Depends(oauth2_bearer)]
