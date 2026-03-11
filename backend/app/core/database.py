from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings
import structlog

logger = structlog.get_logger()
settings = get_settings()

class DatabaseManager:
    def __init__(self):
        self.client_main: AsyncIOMotorClient = None

    def connect(self):
        # minPoolSize: Keeps connections open to avoid tcp handshake overhead per query.
        # maxPoolSize: Caps connections to prevent overwhelming the MongoDB server under load.
        self.client_main = AsyncIOMotorClient(
            settings.MONGO_URL,
            minPoolSize=20,
            maxPoolSize=200,
            uuidRepresentation="standard"
        )
        logger.info("Connected to Main DB Pool", db=settings.MONGO_DB_NAME)

    def close(self):
        if self.client_main:
            self.client_main.close()
        logger.info("Database connections closed.")

    def get_main_db(self):
        if not self.client_main:
            raise Exception("Database client not initialized")
        return self.client_main[settings.MONGO_DB_NAME]

db_manager = DatabaseManager()

# Dependency override
async def get_database():
    return db_manager.get_main_db()
