"""
Activity logging related database models
"""
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    entity_type = Column(String(50), nullable=False)  # shopping_list, shopping_item, friend_request, etc.
    entity_id = Column(UUID(as_uuid=True), nullable=True)  # ID of the related entity
    action = Column(String(50), nullable=False)  # created, updated, deleted, completed, etc.
    meta_data = Column(JSONB, default={})  # Additional context data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="activity_logs")
    
    def __repr__(self):
        return f"<ActivityLog(id={self.id}, user_id={self.user_id}, entity_type={self.entity_type}, action={self.action})>"
