import json
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Invento — Smart Inventory & Warehouse Management System"
    API_V1_STR: str = "/api/v1"

    # Database Configuration (Defaults to SQLite for fallback if no .env is found)
    DATABASE_URL: str = "sqlite:///./invento.db"

    # Security Configuration
    SECRET_KEY: str = "default-secret-key-change-it-in-production-123456"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS Configuration (Must be a JSON array or comma-separated string)
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return []
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
