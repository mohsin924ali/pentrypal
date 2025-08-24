"""
FastAPI main application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.websocket import connection_manager
import os

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="""
    ## PentryPal API - Collaborative Grocery & Pantry Management

    A comprehensive REST API with real-time WebSocket support for collaborative grocery shopping and pantry management.

    ### Key Features
    * 🔐 **JWT Authentication** - Secure user authentication with email/phone support
    * 🛒 **Shopping Lists** - Collaborative shopping list management with real-time updates
    * 🏠 **Pantry Management** - Complete inventory tracking with expiration monitoring
    * 👥 **Social Features** - Friend management, requests, and collaboration
    * 📱 **Real-time Updates** - WebSocket support for live collaboration
    * 🔒 **Security** - Biometric authentication, secure sessions, and privacy controls

    ### Authentication
    Most endpoints require authentication. Include the JWT token in the Authorization header:
    ```
    Authorization: Bearer <your_jwt_token>
    ```

    ### WebSocket Connection
    Connect to real-time updates using:
    ```
    ws://localhost:8000/api/v1/realtime/ws/<your_jwt_token>
    ```

    ### Rate Limiting
    API requests are rate-limited to prevent abuse. Current limit: 60 requests per minute.
    """,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    contact={
        "name": "PentryPal API Support",
        "email": "support@pentrypal.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    servers=[
        {
            "url": "http://localhost:8000",
            "description": "Development server"
        },
        {
            "url": "https://api.pentrypal.com",
            "description": "Production server"
        }
    ]
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for security
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.DEBUG else ["localhost", "127.0.0.1"]
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount static files for uploads (avatars, etc.)
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
    
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    await connection_manager.initialize_redis()
    print("🚀 PentryPal API started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    await connection_manager.cleanup()
    print("👋 PentryPal API shutdown complete")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to PentryPal API",
        "version": settings.PROJECT_VERSION,
        "docs": f"{settings.API_V1_STR}/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "pentrypal-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
