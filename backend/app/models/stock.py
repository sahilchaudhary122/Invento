import uuid
from datetime import datetime
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Stock(Base):
    __table_args__ = (UniqueConstraint('product_id', 'location_id', name='_product_location_uc'),)
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("product.id"))
    location_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("location.id"))
    quantity: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    product: Mapped["Product"] = relationship()
    location: Mapped["Location"] = relationship()

class ReorderRule(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("product.id"))
    location_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("location.id"))
    minimum_quantity: Mapped[int] = mapped_column(default=0)
    reorder_quantity: Mapped[int] = mapped_column(default=0)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    product: Mapped["Product"] = relationship()
    location: Mapped["Location"] = relationship()
