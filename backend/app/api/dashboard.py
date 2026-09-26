from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.product import Product
from app.models.stock import Stock
from app.models.inventory import Receipt, Delivery, Transfer
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/")
def get_dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # 1. Total Products in Stock (unique products with stock > 0)
    total_products_in_stock = db.query(func.count(func.distinct(Stock.product_id))).filter(Stock.quantity > 0).scalar() or 0
    
    # 2. Low / Out of Stock
    # Join with ReorderRule would be ideal, but for now simple query:
    # Out of stock: quantity = 0
    # Low stock: quantity <= product.reorder_threshold
    # Let's count products that are <= threshold
    low_or_out_of_stock = db.query(func.count(Stock.product_id)).join(Product).filter(Stock.quantity <= Product.reorder_threshold).scalar() or 0
    
    # 3. Pending Receipts
    pending_receipts = db.query(func.count(Receipt.id)).filter(Receipt.status == "DRAFT").scalar() or 0
    
    # 4. Pending Deliveries
    pending_deliveries = db.query(func.count(Delivery.id)).filter(Delivery.status == "DRAFT").scalar() or 0
    
    # 5. Internal Transfers Scheduled
    internal_transfers_scheduled = db.query(func.count(Transfer.id)).filter(Transfer.status == "DRAFT").scalar() or 0
    
    return {
        "total_products_in_stock": total_products_in_stock,
        "low_or_out_of_stock": low_or_out_of_stock,
        "pending_receipts": pending_receipts,
        "pending_deliveries": pending_deliveries,
        "internal_transfers_scheduled": internal_transfers_scheduled
    }
