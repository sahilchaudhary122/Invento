import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.inventory import Delivery, DeliveryItem, StockLedger
from app.models.product import Product
from app.models.stock import Stock
from app.schemas.delivery import DeliveryCreate, DeliveryResponse
from app.api.deps import get_current_user
from app.services.stock import remove_stock

router = APIRouter()

@router.post("/", response_model=DeliveryResponse)
def create_delivery(delivery_in: DeliveryCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    delivery = Delivery(
        reference=delivery_in.reference,
        source_location_id=delivery_in.source_location_id,
        created_by_id=current_user.id
    )
    for item in delivery_in.items:
        if not db.query(Product).filter(Product.id == item.product_id).first():
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        delivery.items.append(DeliveryItem(product_id=item.product_id, quantity=item.quantity))
    db.add(delivery)
    db.commit()
    db.refresh(delivery)
    return delivery

@router.post("/{id}/validate", response_model=DeliveryResponse)
def validate_delivery(id: uuid.UUID, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    delivery = db.query(Delivery).filter(Delivery.id == id).first()
    if not delivery or delivery.status != "DRAFT":
        raise HTTPException(status_code=409, detail="Delivery not found or already validated/canceled")

    try:
        for item in delivery.items:
            old_stock = db.query(Stock).filter_by(product_id=item.product_id, location_id=delivery.source_location_id).first()
            previous_stock = old_stock.quantity if old_stock else 0

            remove_stock(db, item.product_id, delivery.source_location_id, item.quantity)

            ledger = StockLedger(
                product_id=item.product_id,
                user_id=current_user.id,
                operation_type="DELIVERY",
                reference=delivery.reference,
                source_location_id=delivery.source_location_id,
                quantity=item.quantity,
                previous_stock=previous_stock,
                new_stock=previous_stock - item.quantity,
                status="VALIDATED"
            )
            db.add(ledger)

        delivery.status = "VALIDATED"
        db.commit()
    except Exception:
        db.rollback()
        raise
    return delivery

@router.post("/{id}/cancel", response_model=DeliveryResponse)
def cancel_delivery(id: uuid.UUID, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    delivery = db.query(Delivery).filter(Delivery.id == id).first()
    if not delivery or delivery.status != "DRAFT":
        raise HTTPException(status_code=409, detail="Delivery not found or already validated/canceled")

    delivery.status = "CANCELED"
    db.commit()
    return delivery
