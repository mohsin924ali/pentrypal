"""
Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user import (
    LoginRequest, RegisterRequest, LoginResponse, RegisterResponse, TokenResponse,
    BiometricLoginRequest
)
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter()
security = HTTPBearer()

# Initialize services
auth_service = AuthService()
user_service = UserService()


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new user with email and phone
    """
    try:
        # Check if user already exists
        existing_user = await user_service.get_user_by_email_or_phone(
            db, user_data.email, user_data.phone
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email or phone already exists"
            )
        
        # Create new user
        user = await user_service.create_user(db, user_data)
        
        # Generate tokens
        tokens = await auth_service.create_tokens(user.id)
        
        return RegisterResponse(
            user=user,
            tokens=tokens,
            message="Registration successful"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        # Log the error for debugging
        print(f"❌ Registration error: {str(e)}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    User login with email or phone number
    
    Authenticate a user using their email address or phone number along with their password.
    Returns user information and JWT tokens for subsequent API calls.
    
    **Example Request:**
    ```json
    {
        "email_or_phone": "user@example.com",
        "password": "SecurePassword123"
    }
    ```
    
    **Example Response:**
    ```json
    {
        "user": {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "email": "user@example.com",
            "name": "John Doe",
            "is_active": true
        },
        "tokens": {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "bearer",
            "expires_in": 1800
        }
    }
    ```
    """
    try:
        # Authenticate user
        user = await auth_service.authenticate_user(
            db, login_data.email_or_phone, login_data.password
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        # Generate tokens
        tokens = await auth_service.create_tokens(user.id)
        
        return LoginResponse(
            user=user,
            tokens=tokens
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    try:
        tokens = await auth_service.refresh_tokens(db, refresh_token)
        return tokens
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )


@router.post("/biometric", response_model=LoginResponse)
async def biometric_login(
    biometric_data: BiometricLoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login with biometric authentication
    """
    try:
        # Verify biometric signature
        user = await auth_service.authenticate_biometric(
            db, biometric_data.user_id, biometric_data.signature, biometric_data.device_id
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Biometric authentication failed"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        # Generate tokens
        tokens = await auth_service.create_tokens(user.id)
        
        return LoginResponse(
            user=user,
            tokens=tokens
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Biometric login failed: {str(e)}"
        )


@router.post("/logout")
async def logout(
    token: str = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Logout user (invalidate tokens)
    """
    try:
        await auth_service.logout_user(db, token.credentials)
        return {"message": "Successfully logged out"}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )
