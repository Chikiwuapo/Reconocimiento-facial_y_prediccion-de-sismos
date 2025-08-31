from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    username: str
    dni: str
    email: str


class UserCreate(UserBase):
    pass


class UserOut(BaseModel):
    id: int
    username: str
    dni: str
    email: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    sub: Optional[str] = None  # subject (email or dni)
