from pydantic import BaseModel, ConfigDict
from typing import List
import uuid

class TransferItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int

class TransferCreate(BaseModel):
    reference: str
    source_location_id: uuid.UUID
    destination_location_id: uuid.UUID
    items: List[TransferItemCreate]

class TransferResponse(BaseModel):
    id: uuid.UUID
    reference: str
    source_location_id: uuid.UUID
    destination_location_id: uuid.UUID
    status: str
    
    model_config = ConfigDict(from_attributes=True)
