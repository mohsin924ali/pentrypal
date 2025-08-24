"""
Social features related Pydantic schemas
"""
from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, field_validator

# Import UserResponse for friend request responses
from app.schemas.user import UserResponse


class FriendRequestBase(BaseModel):
    to_user_id: str
    message: Optional[str] = Field(None, max_length=500)


class FriendRequestCreate(FriendRequestBase):
    pass


class FriendRequestUpdate(BaseModel):
    status: str = Field(..., pattern='^(accepted|rejected|cancelled)$')


class FriendRequestResponse(BaseModel):
    id: str
    from_user_id: str
    to_user_id: str
    status: str
    message: Optional[str]
    created_at: datetime
    responded_at: Optional[datetime]
    from_user: Optional[UserResponse] = None
    to_user: Optional[UserResponse] = None
    
    @field_validator('id', 'from_user_id', 'to_user_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True


class FriendshipResponse(BaseModel):
    id: str
    user1_id: str
    user2_id: str
    status: str
    initiated_by: str
    created_at: datetime
    updated_at: datetime
    user1: Optional[UserResponse] = None
    user2: Optional[UserResponse] = None
    
    @field_validator('id', 'user1_id', 'user2_id', 'initiated_by', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True
