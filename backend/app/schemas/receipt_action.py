from pydantic import BaseModel
import uuid

class ReceiptValidate(BaseModel):
    location_id: uuid.UUID
