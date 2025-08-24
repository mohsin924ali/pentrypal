"""
Pantry management related Pydantic schemas
"""
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, field_validator


class PantryItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category_id: Optional[str] = None
    quantity: Decimal = Field(..., ge=0)
    unit: str = Field(..., min_length=1, max_length=50)
    location: Optional[str] = Field(None, max_length=100)
    expiration_date: Optional[date] = None
    low_stock_threshold: Decimal = Field(default=1, ge=0)
    barcode: Optional[str] = Field(None, max_length=50)
    image_url: Optional[str] = None


class PantryItemCreate(PantryItemBase):
    pass


class PantryItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category_id: Optional[str] = None
    quantity: Optional[Decimal] = Field(None, ge=0)
    unit: Optional[str] = Field(None, min_length=1, max_length=50)
    location: Optional[str] = Field(None, max_length=100)
    expiration_date: Optional[date] = None
    low_stock_threshold: Optional[Decimal] = Field(None, ge=0)
    barcode: Optional[str] = Field(None, max_length=50)
    image_url: Optional[str] = None


class PantryItemResponse(PantryItemBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    @field_validator('id', 'user_id', 'category_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True


class PantryStatsResponse(BaseModel):
    total_items: int
    expiring_soon: int  # Items expiring within 3 days
    expired_items: int
    low_stock_items: int
    categories_count: int
    locations_count: int


class PantryItemBulkUpdate(BaseModel):
    item_ids: list[str] = Field(..., min_items=1)
    updates: PantryItemUpdate


class PantryItemConsume(BaseModel):
    quantity_used: Decimal = Field(..., gt=0)
    notes: Optional[str] = Field(None, max_length=500)