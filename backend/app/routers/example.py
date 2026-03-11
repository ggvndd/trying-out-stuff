from fastapi import APIRouter, Depends, Request, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorDatabase
import structlog

# Conditional import for Redis endpoint caching
try:
    from fastapi_cache.decorator import cache
    HAS_CACHE = True
except ImportError:
    HAS_CACHE = False

from app.core.database import get_database
from app.core.limiter import limiter
from app.models.example_model import ExampleResponse, ExampleDataResponse
from app.services.example_svc import get_example_data

router = APIRouter()
logger = structlog.get_logger()

# 1. Background Task Example
async def analytics_background_worker(user_agent: str):
    await logger.ainfo("Running background analytics", user_agent=user_agent)
    # E.g., Push to Kafka or send a heavy HTTP request to Datadog without blocking the user
    pass

@router.get("/health", response_model=ExampleResponse)
@limiter.limit("5/minute")
async def health_check(request: Request, background_tasks: BackgroundTasks):
    """
    Rate limited Health Check endpoint showing structured logging and background tasks.
    """
    await logger.ainfo("Health check hit")
    
    # Offload work to background task
    background_tasks.add_task(analytics_background_worker, request.headers.get("user-agent", "unknown"))
    
    return ExampleResponse(message="System is healthy and highly optimized.")


# 2. Redis Caching Example
# Only cache if fastapi-cache2 is successfully hooked up
def cache_if_available(*args, **kwargs):
    if HAS_CACHE:
        return cache(*args, **kwargs)
    return lambda f: f

@router.get("/heavy-data", response_model=ExampleDataResponse)
@cache_if_available(expire=60) # Cache identical full responses in Redis for 60 seconds
async def fetch_heavy_data(db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Endpoint demonstrating explicit dependency injection (DB proxying to service) 
    and fast Endpoint caching. Bypasses the application loop if cached!
    """
    # Service call isolates the router from the database driver context
    items = await get_example_data(db)
    
    # In caching mode, next request won't even execute this line
    return ExampleDataResponse(items=items)
