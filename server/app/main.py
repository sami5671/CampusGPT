import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, faculty, offices, templates, classes, announcements, dashboard

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing FastAPI CampusGPT application...")
    await connect_to_mongo()
    yield
    logger.info("Shutting down FastAPI CampusGPT application...")
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

origins = settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(faculty.router)
app.include_router(offices.router)
app.include_router(templates.router)
app.include_router(classes.router)
app.include_router(announcements.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {
        "status": True,
        "message": "CampusGPT REST API is running successfully!",
        "version": settings.VERSION
    }

@app.get("/health")
def health_check():
    return {
        "status": True,
        "message": "Service healthy"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
