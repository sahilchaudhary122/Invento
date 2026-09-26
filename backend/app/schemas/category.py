from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
