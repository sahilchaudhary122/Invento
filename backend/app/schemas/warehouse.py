from pydantic import BaseModel, ConfigDict
from typing import Optional
import uuid

# ─── Warehouse Schemas ────────────────────────────────────────────────────────

class WarehouseBase(BaseModel):
    name: str
    code: str
    address: Optional[str] = None
    is_active: bool = True

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None

class WarehouseResponse(WarehouseBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

# ─── Location Schemas ─────────────────────────────────────────────────────────

class LocationBase(BaseModel):
    name: str
    code: str
    is_active: bool = True

class LocationCreate(LocationBase):
    pass

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    is_active: Optional[bool] = None
    warehouse_id: Optional[uuid.UUID] = None

class LocationResponse(LocationBase):
    id: uuid.UUID
    warehouse_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
