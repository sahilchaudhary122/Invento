from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from app.services.exceptions import (
    InsufficientStockError,
    InvalidQuantityError,
    ProductNotFoundError,
    LocationNotFoundError,
)

def add_exception_handlers(app: FastAPI):
    @app.exception_handler(InsufficientStockError)
    async def insufficient_stock_handler(request: Request, exc: InsufficientStockError):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": str(exc)})

    @app.exception_handler(InvalidQuantityError)
    async def invalid_quantity_handler(request: Request, exc: InvalidQuantityError):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": str(exc)})

    @app.exception_handler(ProductNotFoundError)
    async def product_not_found_handler(request: Request, exc: ProductNotFoundError):
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": str(exc)})

    @app.exception_handler(LocationNotFoundError)
    async def location_not_found_handler(request: Request, exc: LocationNotFoundError):
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": str(exc)})
