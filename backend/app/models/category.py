"""
Category related database models
"""
import uuid
from sqlalchemy import Boolean, Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class ItemCategory(Base):
    __tablename__ = "item_categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    color = Column(String(7), nullable=False)  # Hex color code
    icon = Column(String(50), nullable=True)  # Icon identifier or emoji
    is_system = Column(Boolean, default=False, nullable=False)  # System vs user-created categories
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    shopping_items = relationship("ShoppingItem", back_populates="category")
    pantry_items = relationship("PantryItem", back_populates="category")
    
    def __repr__(self):
        return f"<ItemCategory(id={self.id}, name={self.name}, color={self.color})>"
