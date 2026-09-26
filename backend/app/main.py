from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.db.session import get_db
from app.api import auth, categories, products, receipts, deliveries, transfers, adjustments, ledger, dashboard, warehouses, locations
from app.api.errors import add_exception_handlers

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

add_exception_handlers(app)

# CORS configuration
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(categories.router, prefix=f"{settings.API_V1_STR}/categories", tags=["categories"])
app.include_router(products.router, prefix=f"{settings.API_V1_STR}/products", tags=["products"])
app.include_router(receipts.router, prefix=f"{settings.API_V1_STR}/receipts", tags=["receipts"])
app.include_router(deliveries.router, prefix=f"{settings.API_V1_STR}/deliveries", tags=["deliveries"])
app.include_router(transfers.router, prefix=f"{settings.API_V1_STR}/transfers", tags=["transfers"])
app.include_router(adjustments.router, prefix=f"{settings.API_V1_STR}/adjustments", tags=["adjustments"])
app.include_router(ledger.router, prefix=f"{settings.API_V1_STR}/ledger", tags=["ledger"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["dashboard"])
app.include_router(warehouses.router, prefix=f"{settings.API_V1_STR}/warehouses", tags=["warehouses"])
app.include_router(locations.router, prefix=f"{settings.API_V1_STR}/locations", tags=["locations"])

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
