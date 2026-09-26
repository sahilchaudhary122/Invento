import uuid
from sqlalchemy.orm import Session
from app.models.stock import Stock
from app.models.product import Product
from app.models.location import Location
from app.services.exceptions import (
    InsufficientStockError,
    InvalidQuantityError,
    ProductNotFoundError,
    LocationNotFoundError,
)

def _get_or_create_stock(db: Session, product_id: uuid.UUID, location_id: uuid.UUID) -> Stock:
    stock = db.query(Stock).filter(
        Stock.product_id == product_id,
        Stock.location_id == location_id
    ).with_for_update().first()
    
    if not stock:
        # Validate existence
        if not db.query(Product).filter(Product.id == product_id).first():
            raise ProductNotFoundError(f"Product {product_id} not found")
        if not db.query(Location).filter(Location.id == location_id).first():
            raise LocationNotFoundError(f"Location {location_id} not found")
        
        stock = Stock(product_id=product_id, location_id=location_id, quantity=0)
        db.add(stock)
        db.flush()
    return stock

def add_stock(db: Session, product_id: uuid.UUID, location_id: uuid.UUID, quantity: int):
    if quantity <= 0:
        raise InvalidQuantityError("Quantity must be greater than zero")
    
    stock = _get_or_create_stock(db, product_id, location_id)
    stock.quantity += quantity
    db.flush()

def remove_stock(db: Session, product_id: uuid.UUID, location_id: uuid.UUID, quantity: int):
    if quantity <= 0:
        raise InvalidQuantityError("Quantity must be greater than zero")
    
    stock = _get_or_create_stock(db, product_id, location_id)
    if stock.quantity < quantity:
        raise InsufficientStockError("Insufficient stock")
    
    stock.quantity -= quantity
    db.flush()

def set_stock(db: Session, product_id: uuid.UUID, location_id: uuid.UUID, physical_count: int):
    if physical_count < 0:
        raise InvalidQuantityError("Physical count cannot be negative")
    
    stock = _get_or_create_stock(db, product_id, location_id)
    stock.quantity = physical_count
    db.flush()

def transfer_stock_core(
    db: Session,
    product_id: uuid.UUID,
    source_location_id: uuid.UUID,
    destination_location_id: uuid.UUID,
    quantity: int
):
    if quantity <= 0:
        raise InvalidQuantityError("Quantity must be greater than zero")
    
    if source_location_id == destination_location_id:
        raise InvalidQuantityError("Source and destination locations must be different")

    try:
        # Remove from source
        remove_stock(db, product_id, source_location_id, quantity)
        # Add to destination
        add_stock(db, product_id, destination_location_id, quantity)
        db.commit()
    except Exception:
        db.rollback()
        raise
