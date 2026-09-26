import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.inventory import Adjustment, AdjustmentItem, StockLedger
from app.models.product import Product
from app.models.stock import Stock
from app.schemas.adjustment import AdjustmentCreate, AdjustmentResponse
from app.api.deps import get_current_user
from app.services.stock import set_stock

router = APIRouter()

@router.post("/", response_model=AdjustmentResponse)
def create_adjustment(adjustment_in: AdjustmentCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    adjustment = Adjustment(
        reference=adjustment_in.reference,
        location_id=adjustment_in.location_id,
        reason=adjustment_in.reason,
        created_by_id=current_user.id
    )
    for item in adjustment_in.items:
        if not db.query(Product).filter(Product.id == item.product_id).first():
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        # Get system quantity
        stock = db.query(Stock).filter_by(product_id=item.product_id, location_id=adjustment_in.location_id).first()
        system_quantity = stock.quantity if stock else 0

        adjustment.items.append(AdjustmentItem(
            product_id=item.product_id,
            system_quantity=system_quantity,
            physical_quantity=item.physical_quantity,
            difference=item.physical_quantity - system_quantity
        ))

    db.add(adjustment)
    db.commit()
    db.refresh(adjustment)
    return adjustment

@router.post("/{id}/validate", response_model=AdjustmentResponse)
def validate_adjustment(id: uuid.UUID, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    adjustment = db.query(Adjustment).filter(Adjustment.id == id).first()
    if not adjustment or adjustment.status != "DRAFT":
        raise HTTPException(status_code=409, detail="Adjustment not found or already validated/canceled")

    try:
        for item in adjustment.items:
            # Get current stock
            old_stock = db.query(Stock).filter_by(product_id=item.product_id, location_id=adjustment.location_id).first()
            previous_stock = old_stock.quantity if old_stock else 0

            set_stock(db, item.product_id, adjustment.location_id, item.physical_quantity)

            ledger = StockLedger(
                product_id=item.product_id,
                user_id=current_user.id,
                operation_type="ADJUSTMENT",
                reference=adjustment.reference,
                source_location_id=adjustment.location_id,
                quantity=item.difference,
                previous_stock=previous_stock,
                new_stock=item.physical_quantity,
                status="VALIDATED"
            )
            db.add(ledger)

        adjustment.status = "VALIDATED"
        db.commit()
    except Exception:
        db.rollback()
        raise
    return adjustment

@router.post("/{id}/cancel", response_model=AdjustmentResponse)
def cancel_adjustment(id: uuid.UUID, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    adjustment = db.query(Adjustment).filter(Adjustment.id == id).first()
    if not adjustment or adjustment.status != "DRAFT":
        raise HTTPException(status_code=409, detail="Adjustment not found or already validated/canceled")

    adjustment.status = "CANCELED"
    db.commit()
    return adjustment
