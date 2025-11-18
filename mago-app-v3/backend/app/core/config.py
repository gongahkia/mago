"""Core configuration for Mago V3"""
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = "Mago V3"
    VERSION: str = "3.0.0"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    
    # Database
    DATABASE_URL: str = "postgresql://mago:mago123@localhost:5432/mago_v3"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Authentication
    JWT_SECRET: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # LLM
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:3b-instruct-q4_K_M"
    ENABLE_LLM_CACHE: bool = True
    LLM_CACHE_TTL: int = 3600  # 1 hour
    
    # Game
    AUTO_SAVE_INTERVAL: int = 30  # seconds
    MAX_INVENTORY_SIZE: int = 20
    DUNGEON_WIDTH: int = 80
    DUNGEON_HEIGHT: int = 40
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
