"""
API v1 router configuration
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, shopping_lists, categories, social, pantry, activity, websocket

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(shopping_lists.router, prefix="/shopping-lists", tags=["shopping-lists"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(social.router, prefix="/social", tags=["social"])
api_router.include_router(pantry.router, prefix="/pantry", tags=["pantry"])
api_router.include_router(activity.router, prefix="/activity", tags=["activity"])
api_router.include_router(websocket.router, prefix="/realtime", tags=["websocket"])
