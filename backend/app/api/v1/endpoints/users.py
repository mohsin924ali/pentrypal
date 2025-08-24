"""
User management endpoints
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user import (
    UserResponse, UserUpdate, UserPreferencesUpdate, UserPreferencesResponse,
    PasswordChangeRequest, AccountDeactivationRequest, BiometricAuthRequest,
    SecuritySettingsResponse, SecuritySettingsUpdate
)
from app.services.user_service import UserService
from app.services.auth_service import AuthService
from app.api.dependencies import get_current_user

router = APIRouter()
user_service = UserService()
auth_service = AuthService()


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user = Depends(get_current_user)
):
    """Get current user information"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user information"""
    updated_user = await user_service.update_user(db, current_user.id, user_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_user


@router.get("/me/preferences", response_model=UserPreferencesResponse)
async def get_user_preferences(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user preferences"""
    if not current_user.preferences:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User preferences not found"
        )
    return current_user.preferences


@router.put("/me/preferences", response_model=UserPreferencesResponse)
async def update_user_preferences(
    preferences_data: UserPreferencesUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user preferences"""
    updated_preferences = await user_service.update_user_preferences(
        db, current_user.id, preferences_data
    )
    if not updated_preferences:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User preferences not found"
        )
    return updated_preferences


@router.put("/me/password", response_model=dict)
async def change_password(
    password_data: PasswordChangeRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    try:
        success = await user_service.change_password(
            db, str(current_user.id), password_data.current_password, password_data.new_password
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        return {"message": "Password changed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to change password: {str(e)}"
        )


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload user avatar image"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )
        
        # Validate file size (5MB max)
        if file.size and file.size > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size must be less than 5MB"
            )
        
        avatar_url = await user_service.upload_avatar(db, str(current_user.id), file)
        
        # Return updated user
        updated_user = await user_service.get_user_by_id(db, str(current_user.id))
        return updated_user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload avatar: {str(e)}"
        )


@router.delete("/me/avatar", response_model=UserResponse)
async def remove_avatar(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove user avatar"""
    try:
        updated_user = await user_service.remove_avatar(db, str(current_user.id))
        return updated_user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove avatar: {str(e)}"
        )


@router.post("/me/deactivate", response_model=dict)
async def deactivate_account(
    deactivation_data: AccountDeactivationRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deactivate user account"""
    try:
        # Verify password
        is_valid = await auth_service.verify_password(
            deactivation_data.password, current_user.password_hash
        )
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid password"
            )
        
        success = await user_service.deactivate_account(
            db, str(current_user.id), deactivation_data.reason
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to deactivate account"
            )
        
        return {"message": "Account deactivated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deactivate account: {str(e)}"
        )


@router.delete("/me", response_model=dict)
async def delete_account(
    password: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Permanently delete user account"""
    try:
        # Verify password
        is_valid = await auth_service.verify_password(password, current_user.password_hash)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid password"
            )
        
        success = await user_service.delete_account(db, str(current_user.id))
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to delete account"
            )
        
        return {"message": "Account deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {str(e)}"
        )


@router.get("/me/security", response_model=SecuritySettingsResponse)
async def get_security_settings(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user security settings"""
    try:
        security_settings = await user_service.get_security_settings(db, str(current_user.id))
        return security_settings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security settings: {str(e)}"
        )


@router.put("/me/security", response_model=SecuritySettingsResponse)
async def update_security_settings(
    security_data: SecuritySettingsUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user security settings"""
    try:
        updated_settings = await user_service.update_security_settings(
            db, str(current_user.id), security_data
        )
        return updated_settings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update security settings: {str(e)}"
        )


# Biometric Authentication Endpoints

@router.post("/me/biometric/enable", response_model=dict)
async def enable_biometric_auth(
    biometric_data: BiometricAuthRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enable biometric authentication for user"""
    try:
        success = await user_service.enable_biometric_auth(
            db, str(current_user.id), biometric_data.public_key, biometric_data.device_id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to enable biometric authentication"
            )
        
        return {"message": "Biometric authentication enabled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enable biometric auth: {str(e)}"
        )


@router.delete("/me/biometric", response_model=dict)
async def disable_biometric_auth(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disable biometric authentication for user"""
    try:
        success = await user_service.disable_biometric_auth(db, str(current_user.id))
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Biometric authentication is not enabled"
            )
        
        return {"message": "Biometric authentication disabled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to disable biometric auth: {str(e)}"
        )
