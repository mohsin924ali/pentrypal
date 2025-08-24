"""
Security and biometric authentication related database models
"""
import uuid
from sqlalchemy import Boolean, Column, String, DateTime, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class SecuritySettings(Base):
    __tablename__ = "security_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    biometric_enabled = Column(Boolean, default=False, nullable=False)
    login_alerts = Column(Boolean, default=True, nullable=False)
    session_timeout = Column(Integer, default=1800, nullable=False)  # 30 minutes in seconds
    max_sessions = Column(Integer, default=5, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="security_settings")
    biometric_keys = relationship("BiometricKey", back_populates="security_settings", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<SecuritySettings(user_id={self.user_id}, biometric_enabled={self.biometric_enabled})>"


class BiometricKey(Base):
    __tablename__ = "biometric_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    security_settings_id = Column(UUID(as_uuid=True), ForeignKey("security_settings.id"), nullable=False)
    device_id = Column(String(255), nullable=False)
    public_key = Column(Text, nullable=False)  # Store the biometric public key
    key_type = Column(String(50), default="biometric", nullable=False)  # biometric, fingerprint, face, etc.
    is_active = Column(Boolean, default=True, nullable=False)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    security_settings = relationship("SecuritySettings", back_populates="biometric_keys")
    
    def __repr__(self):
        return f"<BiometricKey(id={self.id}, device_id={self.device_id}, key_type={self.key_type})>"
