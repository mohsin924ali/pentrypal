"""
Authentication service
"""
from typing import Optional
from datetime import timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.security import (
    verify_password, create_access_token, create_refresh_token, verify_token
)
from app.schemas.user import TokenResponse
from app.models.user import User
from app.models.security import BiometricKey
from app.services.user_service import UserService


class AuthService:
    def __init__(self):
        self.user_service = UserService()
    
    async def authenticate_user(
        self, db: Session, email_or_phone: str, password: str
    ) -> Optional[User]:
        """
        Authenticate user with email/phone and password
        """
        user = await self.user_service.get_user_by_email_or_phone(
            db, email_or_phone, email_or_phone
        )
        
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        return user
    
    async def create_tokens(self, user_id: str) -> TokenResponse:
        """
        Create access and refresh tokens for user
        """
        access_token = create_access_token(subject=user_id)
        refresh_token = create_refresh_token(subject=user_id)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=30 * 60  # 30 minutes
        )
    
    async def refresh_tokens(self, db: Session, refresh_token: str) -> TokenResponse:
        """
        Refresh access token using refresh token
        """
        user_id = verify_token(refresh_token, token_type="refresh")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Verify user still exists and is active
        user = await self.user_service.get_user_by_id(db, user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        return await self.create_tokens(user_id)
    
    async def logout_user(self, db: Session, access_token: str) -> bool:
        """
        Logout user (in a real implementation, you might want to blacklist the token)
        """
        # For now, we'll just verify the token is valid
        user_id = verify_token(access_token, token_type="access")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid access token"
            )
        
        # In a production system, you might want to:
        # 1. Add token to a blacklist
        # 2. Store logout event in activity log
        # 3. Clear any cached user sessions
        
        return True
    
    async def get_current_user(self, db: Session, token: str) -> User:
        """
        Get current user from access token
        """
        user_id = verify_token(token, token_type="access")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid access token"
            )
        
        user = await self.user_service.get_user_by_id(db, user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is deactivated"
            )
        
        return user
    
    async def verify_password(self, password: str, password_hash: str) -> bool:
        """
        Verify password against hash
        """
        return verify_password(password, password_hash)
    
    async def authenticate_biometric(
        self, db: Session, user_id: str, signature: str, device_id: str
    ) -> Optional[User]:
        """
        Authenticate user with biometric signature
        """
        # Get user
        user = await self.user_service.get_user_by_id(db, user_id)
        if not user or not user.is_active:
            return None
        
        # Get user's security settings
        security_settings = await self.user_service.get_security_settings(db, user_id)
        if not security_settings or not security_settings.biometric_enabled:
            return None
        
        # Find active biometric key for this device
        biometric_key = db.query(BiometricKey).filter(
            BiometricKey.security_settings_id == security_settings.id,
            BiometricKey.device_id == device_id,
            BiometricKey.is_active == True
        ).first()
        
        if not biometric_key:
            return None
        
        # In a real implementation, you would verify the signature against the public key
        # For now, we'll just check if the signature is not empty (mock verification)
        if not signature or len(signature) < 10:
            return None
        
        # Update last used timestamp
        from sqlalchemy.sql import func
        biometric_key.last_used_at = func.now()
        db.commit()
        
        return user
