"""
User related Pydantic schemas
"""
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, validator, field_validator
import re


class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    name: str = Field(..., min_length=2, max_length=255)
    avatar_url: Optional[str] = None
    
    @validator('phone')
    def validate_phone(cls, v):
        if v is None:
            return v
        # Basic phone number validation (can be enhanced based on requirements)
        phone_pattern = re.compile(r'^\+?1?\d{9,15}$')
        if not phone_pattern.match(v.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')):
            raise ValueError('Invalid phone number format')
        return v
    
    @validator('email')
    def validate_email_or_phone(cls, v, values):
        # Ensure at least one of email or phone is provided
        if not v and not values.get('phone'):
            raise ValueError('Either email or phone must be provided')
        return v


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    name: str
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True


class UserPreferencesUpdate(BaseModel):
    theme: Optional[str] = Field(None, pattern='^(light|dark|system)$')
    language: Optional[str] = Field(None, min_length=2, max_length=10)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    notification_settings: Optional[Dict[str, Any]] = None
    privacy_settings: Optional[Dict[str, Any]] = None


class UserPreferencesResponse(BaseModel):
    id: str
    user_id: str
    theme: str
    language: str
    currency: str
    notification_settings: Dict[str, Any]
    privacy_settings: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    @field_validator('id', 'user_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True


# Authentication schemas
class LoginRequest(BaseModel):
    email_or_phone: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class RegisterRequest(UserCreate):
    pass


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class LoginResponse(BaseModel):
    user: UserResponse
    tokens: TokenResponse


class RegisterResponse(BaseModel):
    user: UserResponse
    tokens: TokenResponse
    message: str = "Registration successful"


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v


class AccountDeactivationRequest(BaseModel):
    password: str = Field(..., min_length=1)
    reason: Optional[str] = Field(None, max_length=500)


class BiometricAuthRequest(BaseModel):
    public_key: str = Field(..., min_length=1)
    device_id: str = Field(..., min_length=1)


class BiometricLoginRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    signature: str = Field(..., min_length=1)
    device_id: str = Field(..., min_length=1)


class SecuritySettingsResponse(BaseModel):
    id: str
    user_id: str
    biometric_enabled: bool
    login_alerts: bool
    session_timeout: int
    max_sessions: int
    created_at: datetime
    updated_at: datetime
    
    @field_validator('id', 'user_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True


class SecuritySettingsUpdate(BaseModel):
    login_alerts: Optional[bool] = None
    session_timeout: Optional[int] = Field(None, ge=300, le=86400)  # 5 minutes to 24 hours
    max_sessions: Optional[int] = Field(None, ge=1, le=10)
