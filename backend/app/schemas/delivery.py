from pydantic import BaseModel, ConfigDict
from typing import List
import uuid

class DeliveryItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int

class DeliveryCreate(BaseModel):
    reference: str
    source_location_id: uuid.UUID
    items: List[DeliveryItemCreate]

class DeliveryResponse(BaseModel):
    id: uuid.UUID
    reference: str
    source_location_id: uuid.UUID
    status: str
    
    model_config = ConfigDict(from_attributes=True)
