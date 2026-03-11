from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Orionex Optimized FastAPI"
    API_V1_STR: str = "/api/v1"
    
    # DB
    MONGO_URL: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "orionex_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Rate Limiting Feature Flag
    RATE_LIMIT_ENABLED: bool = True

    class Config:
        env_file = ".env"

# Caching the settings avoids re-reading from .env file or os.environ continuously, boosting perf.
@lru_cache()
def get_settings() -> Settings:
    return Settings()
