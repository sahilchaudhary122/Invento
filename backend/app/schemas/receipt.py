from pydantic import BaseModel, ConfigDict
from typing import List
import uuid

class ReceiptItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int

class ReceiptCreate(BaseModel):
    reference: str
    supplier_id: uuid.UUID
    items: List[ReceiptItemCreate]

class ReceiptResponse(BaseModel):
    id: uuid.UUID
    reference: str
    supplier_id: uuid.UUID
    status: str
    
    model_config = ConfigDict(from_attributes=True)
