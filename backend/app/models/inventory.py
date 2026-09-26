import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Receipt(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    reference: Mapped[str] = mapped_column(String(50), nullable=False)
    supplier_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("supplier.id"))
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")
    created_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    items: Mapped[List["ReceiptItem"]] = relationship(back_populates="receipt")

class ReceiptItem(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    receipt_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("receipt.id"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("product.id"))
    quantity: Mapped[int] = mapped_column(default=0)
    unit_cost: Mapped[float] = mapped_column(default=0.0)
    
    receipt: Mapped["Receipt"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship()

class Delivery(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    reference: Mapped[str] = mapped_column(String(50), nullable=False)
    source_location_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("location.id"))
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")
    created_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    items: Mapped[List["DeliveryItem"]] = relationship(back_populates="delivery")

class DeliveryItem(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    delivery_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("delivery.id"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("product.id"))
    quantity: Mapped[int] = mapped_column(default=0)
    
    delivery: Mapped["Delivery"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship()

class Transfer(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    reference: Mapped[str] = mapped_column(String(50), nullable=False)
    source_location_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("location.id"))
    destination_location_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("location.id"))
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")
    created_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    items: Mapped[List["TransferItem"]] = relationship(back_populates="transfer")

class TransferItem(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    transfer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transfer.id"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("product.id"))
    quantity: Mapped[int] = mapped_column(default=0)
    
    transfer: Mapped["Transfer"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship()

class Adjustment(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    reference: Mapped[str] = mapped_column(String(50), nullable=False)
    location_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("location.id"))
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")
    reason: Mapped[str] = mapped_column(String(255))
    created_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    items: Mapped[List["AdjustmentItem"]] = relationship(back_populates="adjustment")

class AdjustmentItem(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    adjustment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("adjustment.id"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("product.id"))
    system_quantity: Mapped[int] = mapped_column(default=0)
    physical_quantity: Mapped[int] = mapped_column(default=0)
    difference: Mapped[int] = mapped_column(default=0)
    
    adjustment: Mapped["Adjustment"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship()

class StockLedger(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    timestamp: Mapped[datetime] = mapped_column(server_default=func.now())
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("product.id"))
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("user.id"))
    operation_type: Mapped[str] = mapped_column(String(20), nullable=False)
    reference: Mapped[str] = mapped_column(String(50))
    source_location_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("location.id"))
    destination_location_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("location.id"))
    quantity: Mapped[int] = mapped_column(default=0)
    previous_stock: Mapped[int] = mapped_column(default=0)
    new_stock: Mapped[int] = mapped_column(default=0)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
