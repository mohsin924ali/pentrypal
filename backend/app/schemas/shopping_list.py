"""
Shopping list related Pydantic schemas
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, field_validator

from app.schemas.user import UserResponse


class ShoppingListBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    budget_amount: Optional[Decimal] = Field(None, ge=0)
    budget_currency: Optional[str] = Field(None, min_length=3, max_length=3)
    meta_data: Optional[Dict[str, Any]] = {}


class ShoppingListCreate(ShoppingListBase):
    pass


class ShoppingListUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern='^(active|completed|archived)$')
    budget_amount: Optional[Decimal] = Field(None, ge=0)
    budget_currency: Optional[str] = Field(None, min_length=3, max_length=3)
    meta_data: Optional[Dict[str, Any]] = None


class ShoppingItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    quantity: Decimal = Field(..., gt=0)
    unit: str = Field(..., min_length=1, max_length=50)
    category_id: Optional[str] = None
    assigned_to: Optional[str] = None
    estimated_price: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None
    barcode: Optional[str] = None


class ShoppingItemCreate(ShoppingItemBase):
    pass


class ShoppingItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    quantity: Optional[Decimal] = Field(None, gt=0)
    unit: Optional[str] = Field(None, min_length=1, max_length=50)
    category_id: Optional[str] = None
    assigned_to: Optional[str] = None
    completed: Optional[bool] = None
    estimated_price: Optional[Decimal] = Field(None, ge=0)
    actual_price: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None
    barcode: Optional[str] = None


class ShoppingItemResponse(ShoppingItemBase):
    id: str
    list_id: str
    completed: bool
    actual_price: Optional[Decimal]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    @field_validator('id', 'list_id', 'category_id', 'assigned_to', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True


class ListCollaboratorBase(BaseModel):
    user_id: str
    role: str = Field(..., pattern='^(owner|editor|viewer)$')
    permissions: Optional[Dict[str, Any]] = {}


class ListCollaboratorCreate(ListCollaboratorBase):
    pass


class ListCollaboratorResponse(ListCollaboratorBase):
    id: str
    list_id: str
    invited_at: datetime
    accepted_at: Optional[datetime]
    user: Optional['UserResponse'] = None  # Include user data
    
    @field_validator('id', 'list_id', 'user_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True


class ShoppingListResponse(ShoppingListBase):
    id: str
    owner_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    items: List[ShoppingItemResponse] = []
    collaborators: List[ListCollaboratorResponse] = []
    owner: Optional[UserResponse] = None  # Include owner data
    
    @field_validator('id', 'owner_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True
