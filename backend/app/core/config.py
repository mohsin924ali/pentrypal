"""
Application configuration settings
"""
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator
import os


class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "PentryPal API"
    PROJECT_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database Configuration
    DATABASE_URL: Optional[str] = None
    DATABASE_HOST: str = "localhost"
    DATABASE_PORT: int = 5432
    DATABASE_NAME: str = "pentrypal_db"
    DATABASE_USER: str = "postgres"
    DATABASE_PASSWORD: str = "password"
    
    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: dict) -> str:
        if isinstance(v, str):
            return v
        return f"postgresql://{values.get('DATABASE_USER')}:{values.get('DATABASE_PASSWORD')}@{values.get('DATABASE_HOST')}:{values.get('DATABASE_PORT')}/{values.get('DATABASE_NAME')}"
    
    # JWT Configuration
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
        "exp://192.168.1.100:8081",
        "https://pantrypalbe-production.up.railway.app",
        "*"  # Allow all origins for mobile app
    ]
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # File Upload Configuration
    MAX_FILE_SIZE_MB: int = 10
    UPLOAD_DIR: str = "uploads/"
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # WebSocket Configuration
    WEBSOCKET_HEARTBEAT_INTERVAL: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()
