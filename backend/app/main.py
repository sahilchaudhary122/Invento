from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.db.session import get_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS configuration
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/")
def read_root():
    return {
        "app": "Invento",
        "name": settings.PROJECT_NAME,
        "description": "Backend API for managing products, warehouses, stock, and inventory operations.",
        "status": "online",
        "docs_url": "/docs",
    }


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "unhealthy"
    try:
        # Check database connection
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception:
        # Suppress database errors to avoid crashing the health check itself
        pass

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
    }
