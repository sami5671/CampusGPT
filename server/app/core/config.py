import os
from dotenv import load_dotenv

# Load .env file from server root directory
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(base_dir, ".env")
load_dotenv(env_path)

class Settings:
    PROJECT_NAME: str = "CampusGPT API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = ""
    
    MONGODB_URL: str = os.getenv(
        "MONGODB_URL", 
        "mongodb+srv://lostAndFound:ZVZgnqNwv6jvtys5@cluster0.xocdxwz.mongodb.net/campus_ai?retryWrites=true&w=majority"
    )
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "campus_ai")
    
    JWT_SECRET: str = os.getenv(
        "JWT_SECRET", 
        "kafonqofn46576897010yoncsknfl$%^*1313b13hhooh1fjif1onf1nkl1fojk1f"
    )
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    CORS_ORIGINS: list[str] = [
        origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,https://campus-gpt-one.vercel.app").split(",") if origin.strip()
    ]

settings = Settings()
