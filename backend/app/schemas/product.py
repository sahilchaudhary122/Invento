from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid

class ProductBase(BaseModel):
    name: str
    sku: str
    category_id: uuid.UUID
    unit_of_measure: str = "unit"
    reorder_threshold: int = 0
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    unit_of_measure: Optional[str] = None
    reorder_threshold: Optional[int] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
