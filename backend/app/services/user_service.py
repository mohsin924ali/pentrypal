"""
User service
"""
import os
import uuid
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import UploadFile
from app.core.security import get_password_hash, verify_password
from app.models.user import User, UserPreferences
from app.models.security import SecuritySettings, BiometricKey
from app.schemas.user import UserCreate, UserUpdate, UserPreferencesUpdate, SecuritySettingsUpdate


class UserService:
    async def get_user_by_id(self, db: Session, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    async def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    async def get_user_by_phone(self, db: Session, phone: str) -> Optional[User]:
        """Get user by phone"""
        return db.query(User).filter(User.phone == phone).first()
    
    async def get_user_by_email_or_phone(
        self, db: Session, email: Optional[str], phone: Optional[str]
    ) -> Optional[User]:
        """Get user by email or phone"""
        conditions = []
        if email:
            conditions.append(User.email == email)
        if phone:
            conditions.append(User.phone == phone)
        
        if not conditions:
            return None
            
        return db.query(User).filter(or_(*conditions)).first()
    
    async def create_user(self, db: Session, user_data: UserCreate) -> User:
        """Create a new user"""
        # Hash password
        password_hash = get_password_hash(user_data.password)
        
        # Create user
        db_user = User(
            email=user_data.email,
            phone=user_data.phone,
            name=user_data.name,
            avatar_url=user_data.avatar_url,
            password_hash=password_hash,
            is_active=True
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create default user preferences
        preferences = UserPreferences(
            user_id=db_user.id,
            theme="system",
            language="en",
            currency="USD",
            notification_settings={
                "push_enabled": True,
                "email_enabled": True,
                "list_updates": True,
                "reminders": True,
                "social_updates": True
            },
            privacy_settings={
                "profile_visibility": "friends",
                "show_online_status": True,
                "allow_friend_requests": True,
                "show_shared_lists": True
            }
        )
        
        db.add(preferences)
        
        # Create default security settings
        security_settings = SecuritySettings(
            user_id=db_user.id,
            biometric_enabled=False,
            login_alerts=True,
            session_timeout=1800,  # 30 minutes
            max_sessions=5
        )
        
        db.add(security_settings)
        db.commit()
        db.refresh(preferences)
        
        return db_user
    
    async def update_user(
        self, db: Session, user_id: str, user_data: UserUpdate
    ) -> Optional[User]:
        """Update user information"""
        db_user = await self.get_user_by_id(db, user_id)
        
        if not db_user:
            return None
        
        update_data = user_data.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db.commit()
        db.refresh(db_user)
        
        return db_user
    
    async def update_user_preferences(
        self, db: Session, user_id: str, preferences_data: UserPreferencesUpdate
    ) -> Optional[UserPreferences]:
        """Update user preferences"""
        db_preferences = db.query(UserPreferences).filter(
            UserPreferences.user_id == user_id
        ).first()
        
        if not db_preferences:
            return None
        
        update_data = preferences_data.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            if field in ["notification_settings", "privacy_settings"] and value:
                # Merge with existing settings
                current_settings = getattr(db_preferences, field) or {}
                current_settings.update(value)
                setattr(db_preferences, field, current_settings)
            else:
                setattr(db_preferences, field, value)
        
        db.commit()
        db.refresh(db_preferences)
        
        return db_preferences
    
    async def deactivate_user(self, db: Session, user_id: str) -> bool:
        """Deactivate user account"""
        db_user = await self.get_user_by_id(db, user_id)
        
        if not db_user:
            return False
        
        db_user.is_active = False
        db.commit()
        
        return True
    
    async def activate_user(self, db: Session, user_id: str) -> bool:
        """Activate user account"""
        db_user = await self.get_user_by_id(db, user_id)
        
        if not db_user:
            return False
        
        db_user.is_active = True
        db.commit()
        
        return True
    
    async def change_password(
        self, db: Session, user_id: str, current_password: str, new_password: str
    ) -> bool:
        """Change user password"""
        db_user = await self.get_user_by_id(db, user_id)
        
        if not db_user:
            return False
        
        # Verify current password
        if not verify_password(current_password, db_user.password_hash):
            return False
        
        # Update password
        db_user.password_hash = get_password_hash(new_password)
        db.commit()
        
        return True
    
    async def upload_avatar(
        self, db: Session, user_id: str, file: UploadFile
    ) -> Optional[str]:
        """Upload user avatar and return the URL"""
        db_user = await self.get_user_by_id(db, user_id)
        
        if not db_user:
            return None
        
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads/avatars"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if file.filename else 'jpg'
        filename = f"{user_id}_{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(upload_dir, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Update user avatar URL (full URL for frontend)
        avatar_url = f"http://localhost:8000/uploads/avatars/{filename}"
        db_user.avatar_url = avatar_url
        db.commit()
        
        return avatar_url
    
    async def remove_avatar(self, db: Session, user_id: str) -> Optional[User]:
        """Remove user avatar"""
        db_user = await self.get_user_by_id(db, user_id)
        
        if not db_user:
            return None
        
        # Remove file if it exists
        if db_user.avatar_url and db_user.avatar_url.startswith('/uploads/'):
            file_path = db_user.avatar_url[1:]  # Remove leading slash
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Update user
        db_user.avatar_url = None
        db.commit()
        db.refresh(db_user)
        
        return db_user
    
    async def deactivate_account(
        self, db: Session, user_id: str, reason: Optional[str] = None
    ) -> bool:
        """Deactivate user account with reason"""
        db_user = await self.get_user_by_id(db, user_id)
        
        if not db_user:
            return False
        
        db_user.is_active = False
        # You could store the reason in a separate table or metadata if needed
        db.commit()
        
        return True
    
    async def delete_account(self, db: Session, user_id: str) -> bool:
        """Permanently delete user account"""
        db_user = await self.get_user_by_id(db, user_id)
        
        if not db_user:
            return False
        
        # Remove avatar file if it exists
        if db_user.avatar_url and db_user.avatar_url.startswith('/uploads/'):
            file_path = db_user.avatar_url[1:]  # Remove leading slash
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Delete user (cascading will handle related records)
        db.delete(db_user)
        db.commit()
        
        return True
    
    async def get_security_settings(
        self, db: Session, user_id: str
    ) -> Optional[SecuritySettings]:
        """Get user security settings, create if not exists"""
        security_settings = db.query(SecuritySettings).filter(
            SecuritySettings.user_id == user_id
        ).first()
        
        # Create default security settings if they don't exist
        if not security_settings:
            security_settings = SecuritySettings(
                user_id=user_id,
                biometric_enabled=False,
                login_alerts=True,
                session_timeout=1800,  # 30 minutes
                max_sessions=5
            )
            db.add(security_settings)
            db.commit()
            db.refresh(security_settings)
        
        return security_settings
    
    async def update_security_settings(
        self, db: Session, user_id: str, settings_data: SecuritySettingsUpdate
    ) -> Optional[SecuritySettings]:
        """Update user security settings"""
        db_settings = await self.get_security_settings(db, user_id)
        
        if not db_settings:
            return None
        
        update_data = settings_data.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_settings, field, value)
        
        db.commit()
        db.refresh(db_settings)
        
        return db_settings
    
    async def enable_biometric_auth(
        self, db: Session, user_id: str, public_key: str, device_id: str
    ) -> bool:
        """Enable biometric authentication for user"""
        db_settings = await self.get_security_settings(db, user_id)
        
        if not db_settings:
            return False
        
        # Check if biometric key already exists for this device
        existing_key = db.query(BiometricKey).filter(
            BiometricKey.security_settings_id == db_settings.id,
            BiometricKey.device_id == device_id
        ).first()
        
        if existing_key:
            # Update existing key
            existing_key.public_key = public_key
            existing_key.is_active = True
        else:
            # Create new biometric key
            biometric_key = BiometricKey(
                security_settings_id=db_settings.id,
                device_id=device_id,
                public_key=public_key,
                key_type="biometric",
                is_active=True
            )
            db.add(biometric_key)
        
        # Enable biometric authentication
        db_settings.biometric_enabled = True
        db.commit()
        
        return True
    
    async def disable_biometric_auth(self, db: Session, user_id: str) -> bool:
        """Disable biometric authentication for user"""
        db_settings = await self.get_security_settings(db, user_id)
        
        if not db_settings:
            return False
        
        # Deactivate all biometric keys
        db.query(BiometricKey).filter(
            BiometricKey.security_settings_id == db_settings.id
        ).update({"is_active": False})
        
        # Disable biometric authentication
        db_settings.biometric_enabled = False
        db.commit()
        
        return True
