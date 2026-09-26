import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.inventory import Transfer, TransferItem
from app.models.product import Product
from app.schemas.transfer import TransferCreate, TransferResponse
from app.api.deps import get_current_user
from app.services.stock import add_stock, remove_stock

router = APIRouter()

@router.post("/", response_model=TransferResponse)
def create_transfer(transfer_in: TransferCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if transfer_in.source_location_id == transfer_in.destination_location_id:
        raise HTTPException(status_code=400, detail="Source and destination locations must be different")
    
    transfer = Transfer(
        reference=transfer_in.reference,
        source_location_id=transfer_in.source_location_id,
        destination_location_id=transfer_in.destination_location_id,
        created_by_id=current_user.id
    )
    for item in transfer_in.items:
        if not db.query(Product).filter(Product.id == item.product_id).first():
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        transfer.items.append(TransferItem(product_id=item.product_id, quantity=item.quantity))
    db.add(transfer)
    db.commit()
    db.refresh(transfer)
    return transfer

@router.post("/{id}/validate", response_model=TransferResponse)
def validate_transfer(id: uuid.UUID, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    transfer = db.query(Transfer).filter(Transfer.id == id).first()
    if not transfer or transfer.status != "DRAFT":
        raise HTTPException(status_code=409, detail="Transfer not found or already validated/canceled")
        
    try:
        for item in transfer.items:
            remove_stock(db, item.product_id, transfer.source_location_id, item.quantity)
            add_stock(db, item.product_id, transfer.destination_location_id, item.quantity)
        transfer.status = "VALIDATED"
        db.commit()
    except Exception:
        db.rollback()
        raise
    return transfer

@router.post("/{id}/cancel", response_model=TransferResponse)
def cancel_transfer(id: uuid.UUID, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    transfer = db.query(Transfer).filter(Transfer.id == id).first()
    if not transfer or transfer.status != "DRAFT":
        raise HTTPException(status_code=409, detail="Transfer not found or already validated/canceled")
    
    transfer.status = "CANCELED"
    db.commit()
    return transfer
