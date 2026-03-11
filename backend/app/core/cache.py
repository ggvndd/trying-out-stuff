import redis.asyncio as redis
from app.core.config import get_settings
from typing import Optional, Type, TypeVar
from pydantic import BaseModel
import structlog

logger = structlog.get_logger()
settings = get_settings()
T = TypeVar("T", bound=BaseModel)

class CacheService:
    client: redis.Redis = None

    @classmethod
    def start(cls):
        # Using connection pool for enterprise throughput
        pool = redis.ConnectionPool.from_url(
            settings.REDIS_URL, 
            encoding="utf-8", 
            decode_responses=True,
            max_connections=100
        )
        cls.client = redis.Redis(connection_pool=pool)
        logger.info("Redis cache pool initialized")

    @classmethod
    async def stop(cls):
        if cls.client:
            try:
                await cls.client.close()
            except AttributeError:
                pass # Older versions of redis-py use close() instead of aclose()
            logger.info("Redis cache closed")

    @classmethod
    async def get_model(cls, key: str, model: Type[T]) -> Optional[T]:
        """Fetch JSON from Redis and parse into a Pydantic Model directly, saving overhead."""
        if not cls.client: return None
        try:
            data = await cls.client.get(key)
            if data:
                return model.model_validate_json(data)
        except Exception as e:
            logger.error("Cache Read Error", error=str(e), key=key)
        return None

    @classmethod
    async def set_model(cls, key: str, value: BaseModel, ttl: int = 300):
        """Serialize Pydantic Model to raw JSON and save to Redis"""
        if not cls.client: return
        try:
            await cls.client.set(key, value.model_dump_json(exclude_none=True), ex=ttl)
        except Exception as e:
            logger.error("Cache Write Error", error=str(e), key=key)
            
    @classmethod
    async def delete(cls, key: str):
        if cls.client:
            await cls.client.delete(key)

cache = CacheService()
