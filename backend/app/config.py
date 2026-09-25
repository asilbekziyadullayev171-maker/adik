from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "QishloqMed AI"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"
    
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/qishloqmed"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    JWT_SECRET_KEY: str = "supersecretkey" # Change in production
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    CORS_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

@lru_cache
def get_settings() -> Settings:
    return Settings()
