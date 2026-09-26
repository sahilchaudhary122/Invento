import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.product import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.post("/", response_model=CategoryResponse)
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if db.query(Category).filter(Category.name == category_in.name).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category already exists")
    category = Category(**category_in.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.get("/{id}", response_model=CategoryResponse)
def get_category(id: uuid.UUID, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.put("/{id}", response_model=CategoryResponse)
def update_category(id: uuid.UUID, category_in: CategoryUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if name is being updated and conflicts
    if category_in.name and category_in.name != category.name:
        if db.query(Category).filter(Category.name == category_in.name).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category already exists")
    
    for field, value in category_in.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(id: uuid.UUID, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return None
