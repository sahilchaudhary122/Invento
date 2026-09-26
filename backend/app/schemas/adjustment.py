from pydantic import BaseModel, ConfigDict
from typing import List
import uuid

class AdjustmentItemCreate(BaseModel):
    product_id: uuid.UUID
    physical_quantity: int

class AdjustmentCreate(BaseModel):
    reference: str
    location_id: uuid.UUID
    reason: str
    items: List[AdjustmentItemCreate]

class AdjustmentResponse(BaseModel):
    id: uuid.UUID
    reference: str
    location_id: uuid.UUID
    status: str
    reason: str
    
    model_config = ConfigDict(from_attributes=True)
