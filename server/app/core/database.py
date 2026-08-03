import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_to_mongo():
    try:
        logger.info("Connecting to MongoDB...")
        db_instance.client = AsyncIOMotorClient(settings.MONGODB_URL)
        db_instance.db = db_instance.client[settings.DATABASE_NAME]
        logger.info(f"Successfully connected to database: {settings.DATABASE_NAME}")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    if db_instance.client:
        logger.info("Closing MongoDB connection...")
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

def get_database():
    return db_instance.db
