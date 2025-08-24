"""
Category management endpoints
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.category import ItemCategoryResponse
from app.models.category import ItemCategory

router = APIRouter()


@router.get("/", response_model=List[ItemCategoryResponse])
async def get_categories(db: Session = Depends(get_db)):
    """Get all available categories"""
    categories = db.query(ItemCategory).all()
    return categories
