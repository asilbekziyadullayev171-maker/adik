from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import List

class LoginRequest(BaseModel):
    phone: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class UserResponse(BaseModel):
    id: UUID
    phone: str
    first_name: str
    last_name: str
    roles: List[str]
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
