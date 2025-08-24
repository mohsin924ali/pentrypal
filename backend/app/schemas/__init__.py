"""
Pydantic schemas for API request/response validation
"""
from .user import (
    UserCreate, UserUpdate, UserResponse, UserPreferencesUpdate, UserPreferencesResponse,
    LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, TokenResponse
)
from .shopping_list import (
    ShoppingListCreate, ShoppingListUpdate, ShoppingListResponse,
    ShoppingItemCreate, ShoppingItemUpdate, ShoppingItemResponse,
    ListCollaboratorCreate, ListCollaboratorResponse
)
from .category import ItemCategoryCreate, ItemCategoryResponse
from .social import (
    FriendRequestCreate, FriendRequestResponse, FriendshipResponse,
    FriendRequestUpdate
)
from .pantry import PantryItemCreate, PantryItemUpdate, PantryItemResponse
from .activity import ActivityLogResponse

__all__ = [
    # User schemas
    "UserCreate", "UserUpdate", "UserResponse", "UserPreferencesUpdate", "UserPreferencesResponse",
    "LoginRequest", "LoginResponse", "RegisterRequest", "RegisterResponse", "TokenResponse",
    
    # Shopping list schemas
    "ShoppingListCreate", "ShoppingListUpdate", "ShoppingListResponse",
    "ShoppingItemCreate", "ShoppingItemUpdate", "ShoppingItemResponse",
    "ListCollaboratorCreate", "ListCollaboratorResponse",
    
    # Category schemas
    "ItemCategoryCreate", "ItemCategoryResponse",
    
    # Social schemas
    "FriendRequestCreate", "FriendRequestResponse", "FriendshipResponse", "FriendRequestUpdate",
    
    # Pantry schemas
    "PantryItemCreate", "PantryItemUpdate", "PantryItemResponse",
    
    # Activity schemas
    "ActivityLogResponse"
]
