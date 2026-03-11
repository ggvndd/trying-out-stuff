import structlog
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.example_model import DataItem

logger = structlog.get_logger()

async def get_example_data(db: AsyncIOMotorDatabase) -> list[DataItem]:
    """
    Business Logic function decoupled from HTTP Request/Response.
    Accepts DB dependency explicitly.
    """
    await logger.ainfo("Fetching data from DB logic layer")
    
    # DB Optimization: Projection. 
    # Notice the second argument to `find()`. We exclude `_id` so we avoid parsing 
    # BSON ObjectIds where they aren't strictly needed for the output.
    cursor = db["example_collection"].find({}, {"_id": 0})
    
    items = []
    # async for handles chunking implicitly over the network
    async for doc in cursor:
        items.append(DataItem(**doc))
    
    return items
