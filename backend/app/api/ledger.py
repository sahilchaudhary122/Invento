import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.inventory import StockLedger
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/")
def get_ledger(
    db: Session = Depends(get_db),
    product_id: Optional[uuid.UUID] = None,
    operation_type: Optional[str] = None,
    current_user=Depends(get_current_user)
):
    query = db.query(StockLedger)
    if product_id:
        query = query.filter(StockLedger.product_id == product_id)
    if operation_type:
        query = query.filter(StockLedger.operation_type == operation_type)
        
    return query.order_by(StockLedger.timestamp.desc()).all()
