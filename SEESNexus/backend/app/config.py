import os
import json
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@localhost/sees_nexus")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))
    
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")
    
    BREVO_API_KEY: str = os.getenv("BREVO_API_KEY", "")
    BREVO_SENDER_EMAIL: str = os.getenv("BREVO_SENDER_EMAIL", "noreply@seesnexus.com")
    BREVO_SENDER_NAME: str = os.getenv("BREVO_SENDER_NAME", "SEES Nexus")
    
    _cors_origins_env = os.getenv("CORS_ORIGINS", "").strip()
    _frontend_url = os.getenv("FRONTEND_URL", "").strip()
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in (
            _cors_origins_env.split(",")
            if _cors_origins_env
            else [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                _frontend_url or "*",
            ]
        )
        if origin.strip()
    ]

    class Config:
        env_file = ".env"

settings = Settings()
