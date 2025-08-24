"""
Pantry management related database models
"""
import uuid
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Numeric, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class PantryItem(Base):
    __tablename__ = "pantry_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("item_categories.id"), nullable=True)
    quantity = Column(Numeric(10, 3), nullable=False, default=1)
    unit = Column(String(50), nullable=False, default="pcs")
    location = Column(String(100), nullable=True)  # Refrigerator, Pantry, Freezer, etc.
    expiration_date = Column(Date, nullable=True)
    low_stock_threshold = Column(Numeric(10, 3), nullable=False, default=1)
    barcode = Column(String(50), nullable=True)
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="pantry_items")
    category = relationship("ItemCategory", back_populates="pantry_items")
    
    def __repr__(self):
        return f"<PantryItem(id={self.id}, name={self.name}, user_id={self.user_id})>"
