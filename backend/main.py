import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware  # NEW: Compression
from fastapi.responses import ORJSONResponse # Optimization: High perf JSON
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
import structlog
from structlog.contextvars import clear_contextvars, bind_contextvars

import uvicorn
import uvloop

from app.core.config import get_settings
from app.core.database import db_manager
from app.core.cache import cache
from app.core.http_client import http_client
from app.core.limiter import limiter
from app.core.logger import setup_logging

# Load Settings
settings = get_settings()

# Initialize Asynchronous Structured Logging
setup_logging()
logger = structlog.get_logger()

# Global Optimization: Use `uvloop` for a significantly faster event loop
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup Phase ---
    await logger.ainfo("Starting up application lifecycle")
    
    # 1. Start MongoDB connection pool
    db_manager.connect()
    
    # 2. Start global HTTPx Client
    http_client.start()
    
    # 3. Start Redis Cache connection pool
    cache.start()
    
    # 4. Initialize `fastapi-cache2` using Redis
    try:
        from fastapi_cache import FastAPICache
        from fastapi_cache.backends.redis import RedisBackend
        
        # `cache.client` is initialized in cache.start()
        if cache.client:
            FastAPICache.init(RedisBackend(cache.client), prefix="fastapi-cache")
            await logger.ainfo("fastapi-cache2 initialized")
    except ImportError:
        pass
    
    # 5. Connect and ensure db indexes (Fire and forget, concurrently)
    main_db = db_manager.get_main_db()
    
    await asyncio.gather(
        # Put your unique/expiry DB indexes here e.g.,
        # main_db["users"].create_index("email", unique=True),
        logger.ainfo("Database indexes ensured")
    )
    
    yield
    
    # --- Shutdown Phase ---
    await logger.ainfo("Shutting down application lifecycle")
    await http_client.stop()
    await cache.stop()
    db_manager.close()

app = FastAPI(
    title=settings.APP_NAME, 
    lifespan=lifespan,
    default_response_class=ORJSONResponse, # Global Optimization: All responses render using fastest JSON serializer
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# Attach rate limiter to app and register global exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Structured Logging Middleware
class StructlogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Clear previous request context
        clear_contextvars()
        # Bind request correlation data
        bind_contextvars(
            request_id=request.headers.get("X-Request-ID", "N/A"),
            client_host=request.client.host if request.client else "unknown",
            path=request.url.path,
        )
        # Proceed with request
        response = await call_next(request)
        return response

app.add_middleware(StructlogMiddleware)

# Optimize network bandwidth -> Compress responses > 1000 bytes
app.add_middleware(GZipMiddleware, minimum_size=1000)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# CORS
CORS_ALLOW_ORIGIN_REGEX = (
    r"^https://([a-zA-Z0-9-]+\.)*orionex\.id$"
    r"|^http://localhost(:\d+)?$"
    r"|^http://127\.0\.0\.1(:\d+)?$"
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=CORS_ALLOW_ORIGIN_REGEX,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Example Router Import
from app.routers import example
from app.routers import accounts

app.include_router(example.router, prefix=f"{settings.API_V1_STR}", tags=["Example Endpoints"])
app.include_router(accounts.router, prefix=f"{settings.API_V1_STR}/accounts", tags=["Chart of Accounts"])
