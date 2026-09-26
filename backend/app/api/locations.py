import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.location import Warehouse, Location
from app.schemas.warehouse import LocationUpdate, LocationResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[LocationResponse])
def get_locations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return db.query(Location).all()

@router.get("/{location_id}", response_model=LocationResponse)
def get_location(
    location_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location

@router.put("/{location_id}", response_model=LocationResponse)
def update_location(
    location_id: uuid.UUID,
    location_in: LocationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    if location_in.warehouse_id and location_in.warehouse_id != location.warehouse_id:
        target_warehouse = (
            db.query(Warehouse)
            .filter(Warehouse.id == location_in.warehouse_id)
            .first()
        )
        if not target_warehouse:
            raise HTTPException(status_code=404, detail="Warehouse not found")

    for field, value in location_in.model_dump(exclude_unset=True).items():
        setattr(location, field, value)

    db.commit()
    db.refresh(location)
    return location

@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(
    location_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    db.delete(location)
    db.commit()
    return None
