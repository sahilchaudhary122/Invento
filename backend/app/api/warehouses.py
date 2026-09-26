import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.location import Warehouse, Location
from app.schemas.warehouse import (
    WarehouseCreate,
    WarehouseUpdate,
    WarehouseResponse,
    LocationCreate,
    LocationResponse,
)
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[WarehouseResponse])
def get_warehouses(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return db.query(Warehouse).all()

@router.post("/", response_model=WarehouseResponse)
def create_warehouse(
    warehouse_in: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if db.query(Warehouse).filter(Warehouse.code == warehouse_in.code).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Warehouse with this code already exists",
        )
    warehouse = Warehouse(**warehouse_in.model_dump())
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return warehouse

@router.get("/{warehouse_id}", response_model=WarehouseResponse)
def get_warehouse(
    warehouse_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse

@router.put("/{warehouse_id}", response_model=WarehouseResponse)
def update_warehouse(
    warehouse_id: uuid.UUID,
    warehouse_in: WarehouseUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    if warehouse_in.code and warehouse_in.code != warehouse.code:
        if db.query(Warehouse).filter(Warehouse.code == warehouse_in.code).first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Warehouse code already exists",
            )

    for field, value in warehouse_in.model_dump(exclude_unset=True).items():
        setattr(warehouse, field, value)

    db.commit()
    db.refresh(warehouse)
    return warehouse

@router.delete("/{warehouse_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_warehouse(
    warehouse_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    db.delete(warehouse)
    db.commit()
    return None

@router.get("/{warehouse_id}/locations", response_model=List[LocationResponse])
def get_warehouse_locations(
    warehouse_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return db.query(Location).filter(Location.warehouse_id == warehouse_id).all()

@router.post("/{warehouse_id}/locations", response_model=LocationResponse)
def create_warehouse_location(
    warehouse_id: uuid.UUID,
    location_in: LocationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    location = Location(
        warehouse_id=warehouse_id,
        **location_in.model_dump(),
    )
    db.add(location)
    db.commit()
    db.refresh(location)
    return location
