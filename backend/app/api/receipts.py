import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.inventory import Receipt, ReceiptItem
from app.models.product import Product
from app.models.location import Location
from app.schemas.receipt import ReceiptCreate, ReceiptResponse
from app.schemas.receipt_action import ReceiptValidate
from app.api.deps import get_current_user
from app.services.stock import add_stock

router = APIRouter()

@router.post("/", response_model=ReceiptResponse)
def create_receipt(receipt_in: ReceiptCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    receipt = Receipt(
        reference=receipt_in.reference,
        supplier_id=receipt_in.supplier_id,
        created_by_id=current_user.id
    )
    for item in receipt_in.items:
        if not db.query(Product).filter(Product.id == item.product_id).first():
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        receipt.items.append(ReceiptItem(product_id=item.product_id, quantity=item.quantity))
    db.add(receipt)
    db.commit()
    db.refresh(receipt)
    return receipt

@router.post("/{id}/validate", response_model=ReceiptResponse)
def validate_receipt(id: uuid.UUID, action_in: ReceiptValidate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    receipt = db.query(Receipt).filter(Receipt.id == id).first()
    if not receipt or receipt.status != "DRAFT":
        raise HTTPException(status_code=409, detail="Receipt not found or already validated/canceled")
    
    location = db.query(Location).filter(Location.id == action_in.location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
        
    try:
        for item in receipt.items:
            add_stock(db, item.product_id, action_in.location_id, item.quantity)
        receipt.status = "VALIDATED"
        db.commit()
    except Exception:
        db.rollback()
        raise
    return receipt

@router.post("/{id}/cancel", response_model=ReceiptResponse)
def cancel_receipt(id: uuid.UUID, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    receipt = db.query(Receipt).filter(Receipt.id == id).first()
    if not receipt or receipt.status != "DRAFT":
        raise HTTPException(status_code=409, detail="Receipt not found or already validated/canceled")
    
    receipt.status = "CANCELED"
    db.commit()
    return receipt
