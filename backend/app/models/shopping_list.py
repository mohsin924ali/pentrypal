"""
Shopping list related database models
"""
import uuid
from decimal import Decimal
from sqlalchemy import Boolean, Column, String, DateTime, Text, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class ShoppingList(Base):
    __tablename__ = "shopping_lists"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="active", nullable=False)  # active, completed, archived
    budget_amount = Column(Numeric(10, 2), nullable=True)
    budget_currency = Column(String(3), default="USD", nullable=True)
    meta_data = Column(JSONB, default={})  # For storing additional data like tags, recurring patterns, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="owned_lists")
    items = relationship("ShoppingItem", back_populates="shopping_list", cascade="all, delete-orphan")
    collaborators = relationship("ListCollaborator", back_populates="shopping_list", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ShoppingList(id={self.id}, name={self.name}, owner_id={self.owner_id})>"


class ShoppingItem(Base):
    __tablename__ = "shopping_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    list_id = Column(UUID(as_uuid=True), ForeignKey("shopping_lists.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(Numeric(10, 3), nullable=False, default=1)
    unit = Column(String(50), nullable=False, default="pcs")
    category_id = Column(UUID(as_uuid=True), ForeignKey("item_categories.id"), nullable=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    estimated_price = Column(Numeric(10, 2), nullable=True)
    actual_price = Column(Numeric(10, 2), nullable=True)
    notes = Column(Text, nullable=True)
    barcode = Column(String(50), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    shopping_list = relationship("ShoppingList", back_populates="items")
    category = relationship("ItemCategory", back_populates="shopping_items")
    assigned_user = relationship("User", back_populates="assigned_items")
    
    def __repr__(self):
        return f"<ShoppingItem(id={self.id}, name={self.name}, list_id={self.list_id})>"


class ListCollaborator(Base):
    __tablename__ = "list_collaborators"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    list_id = Column(UUID(as_uuid=True), ForeignKey("shopping_lists.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role = Column(String(20), default="editor", nullable=False)  # owner, editor, viewer
    permissions = Column(JSONB, default={
        "can_edit_items": True,
        "can_add_items": True,
        "can_delete_items": False,
        "can_assign_items": True,
        "can_invite_others": False,
        "can_edit_list": False
    })
    invited_at = Column(DateTime(timezone=True), server_default=func.now())
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    shopping_list = relationship("ShoppingList", back_populates="collaborators")
    user = relationship("User", back_populates="collaborations")
    
    def __repr__(self):
        return f"<ListCollaborator(list_id={self.list_id}, user_id={self.user_id}, role={self.role})>"
