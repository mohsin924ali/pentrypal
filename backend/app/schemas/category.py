"""
Category related Pydantic schemas
"""
from datetime import datetime
from pydantic import BaseModel, Field


class ItemCategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(..., pattern='^#[0-9A-Fa-f]{6}$')  # Hex color validation
    icon: str = Field(None, max_length=50)


class ItemCategoryCreate(ItemCategoryBase):
    pass


class ItemCategoryResponse(ItemCategoryBase):
    id: str
    is_system: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
