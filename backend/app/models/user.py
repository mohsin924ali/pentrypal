"""
User related database models
"""
import uuid
from sqlalchemy import Boolean, Column, String, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(15), nullable=False)  # Phone number without country code
    country_code = Column(String(4), nullable=False)  # ISO country code (e.g., 'US', 'PK')
    name = Column(String(255), nullable=False)
    avatar_url = Column(Text, nullable=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Table constraints
    __table_args__ = (
        UniqueConstraint('phone', 'country_code', name='unique_phone_per_country'),
    )
    
    # Relationships
    preferences = relationship("UserPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    security_settings = relationship("SecuritySettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    owned_lists = relationship("ShoppingList", back_populates="owner", cascade="all, delete-orphan")
    collaborations = relationship("ListCollaborator", back_populates="user", cascade="all, delete-orphan")
    assigned_items = relationship("ShoppingItem", back_populates="assigned_user")
    pantry_items = relationship("PantryItem", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")
    
    # Friend relationships
    initiated_friendships = relationship(
        "Friendship", 
        foreign_keys="Friendship.initiated_by",
        back_populates="initiator",
        cascade="all, delete-orphan"
    )
    friendships_as_user1 = relationship(
        "Friendship",
        foreign_keys="Friendship.user1_id", 
        back_populates="user1",
        cascade="all, delete-orphan"
    )
    friendships_as_user2 = relationship(
        "Friendship",
        foreign_keys="Friendship.user2_id",
        back_populates="user2",
        cascade="all, delete-orphan"
    )
    
    # Friend request relationships
    sent_friend_requests = relationship(
        "FriendRequest",
        foreign_keys="FriendRequest.from_user_id",
        back_populates="from_user",
        cascade="all, delete-orphan"
    )
    received_friend_requests = relationship(
        "FriendRequest", 
        foreign_keys="FriendRequest.to_user_id",
        back_populates="to_user",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"


class UserPreferences(Base):
    __tablename__ = "user_preferences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    theme = Column(String(20), default="system", nullable=False)  # light, dark, system
    language = Column(String(10), default="en", nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    notification_settings = Column(JSONB, default={
        "push_enabled": True,
        "email_enabled": True,
        "list_updates": True,
        "reminders": True,
        "social_updates": True
    })
    privacy_settings = Column(JSONB, default={
        "profile_visibility": "friends",  # public, friends, private
        "show_online_status": True,
        "allow_friend_requests": True,
        "show_shared_lists": True
    })
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="preferences")
    
    def __repr__(self):
        return f"<UserPreferences(user_id={self.user_id}, theme={self.theme})>"
