"""
Pantry management endpoints - Inventory Management System
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.services.pantry_service import PantryService
from app.schemas.pantry import (
    PantryItemCreate, PantryItemUpdate, PantryItemResponse,
    PantryStatsResponse, PantryItemBulkUpdate, PantryItemConsume
)
from app.models.user import User

router = APIRouter()
pantry_service = PantryService()


@router.get("/", response_model=List[PantryItemResponse])
async def get_pantry_items(
    category_id: Optional[str] = Query(None, description="Filter by category ID"),
    location: Optional[str] = Query(None, description="Filter by location"),
    expiring_soon: Optional[bool] = Query(None, description="Filter items expiring within 3 days"),
    low_stock: Optional[bool] = Query(None, description="Filter items with low stock"),
    search: Optional[str] = Query(None, description="Search by name or barcode"),
    sort_by: str = Query("name", description="Sort by: name, quantity, expiration_date, created_at, updated_at"),
    sort_order: str = Query("asc", description="Sort order: asc or desc"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's pantry items with filtering and sorting
    
    - **category_id**: Filter by specific category
    - **location**: Filter by storage location (Refrigerator, Pantry, Freezer, etc.)
    - **expiring_soon**: Show only items expiring within 3 days
    - **low_stock**: Show only items with quantity at or below threshold
    - **search**: Search by item name or barcode
    - **sort_by**: Sort field (name, quantity, expiration_date, created_at, updated_at)
    - **sort_order**: Sort direction (asc, desc)
    """
    try:
        items = await pantry_service.get_user_pantry_items(
            db, str(current_user.id), category_id, location, expiring_soon,
            low_stock, search, sort_by, sort_order, skip, limit
        )
        return items
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve pantry items: {str(e)}"
        )


@router.post("/", response_model=PantryItemResponse, status_code=status.HTTP_201_CREATED)
async def create_pantry_item(
    item_data: PantryItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new pantry item
    
    - **name**: Item name (required)
    - **category_id**: Category ID (optional)
    - **quantity**: Item quantity (required)
    - **unit**: Unit of measurement (required)
    - **location**: Storage location (optional)
    - **expiration_date**: Expiration date (optional)
    - **low_stock_threshold**: Low stock alert threshold (default: 1)
    - **barcode**: Item barcode (optional)
    - **image_url**: Item image URL (optional)
    """
    try:
        item = await pantry_service.create_pantry_item(
            db, item_data, str(current_user.id)
        )
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create pantry item: {str(e)}"
        )


@router.get("/{item_id}", response_model=PantryItemResponse)
async def get_pantry_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific pantry item by ID
    """
    try:
        item = await pantry_service.get_pantry_item_by_id(
            db, item_id, str(current_user.id)
        )
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pantry item not found"
            )
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve pantry item: {str(e)}"
        )


@router.put("/{item_id}", response_model=PantryItemResponse)
async def update_pantry_item(
    item_id: str,
    item_data: PantryItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a pantry item
    """
    try:
        item = await pantry_service.update_pantry_item(
            db, item_id, item_data, str(current_user.id)
        )
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pantry item not found"
            )
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update pantry item: {str(e)}"
        )


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pantry_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a pantry item
    """
    try:
        success = await pantry_service.delete_pantry_item(
            db, item_id, str(current_user.id)
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pantry item not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete pantry item: {str(e)}"
        )


@router.post("/{item_id}/consume", response_model=PantryItemResponse)
async def consume_pantry_item(
    item_id: str,
    consume_data: PantryItemConsume,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Consume/use quantity from a pantry item
    
    - **quantity_used**: Amount to consume (required)
    - **notes**: Optional notes about consumption
    """
    try:
        item = await pantry_service.consume_pantry_item(
            db, item_id, consume_data, str(current_user.id)
        )
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pantry item not found"
            )
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to consume pantry item: {str(e)}"
        )


@router.put("/bulk-update", response_model=List[PantryItemResponse])
async def bulk_update_pantry_items(
    bulk_data: PantryItemBulkUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Bulk update multiple pantry items
    
    - **item_ids**: List of item IDs to update
    - **updates**: Updates to apply to all items
    """
    try:
        items = await pantry_service.bulk_update_pantry_items(
            db, bulk_data, str(current_user.id)
        )
        return items
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bulk update pantry items: {str(e)}"
        )


@router.get("/stats/overview", response_model=PantryStatsResponse)
async def get_pantry_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get pantry statistics overview
    
    Returns counts for total items, expiring items, expired items, low stock items, etc.
    """
    try:
        stats = await pantry_service.get_pantry_stats(db, str(current_user.id))
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve pantry stats: {str(e)}"
        )


@router.get("/locations/list", response_model=List[str])
async def get_pantry_locations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all unique storage locations used by the user
    """
    try:
        locations = await pantry_service.get_pantry_locations(db, str(current_user.id))
        return locations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve pantry locations: {str(e)}"
        )


@router.get("/barcode/{barcode}", response_model=Optional[PantryItemResponse])
async def search_by_barcode(
    barcode: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search for pantry item by barcode
    """
    try:
        item = await pantry_service.search_by_barcode(db, barcode, str(current_user.id))
        return item
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search by barcode: {str(e)}"
        )


@router.get("/alerts/expiring", response_model=List[PantryItemResponse])
async def get_expiring_items(
    days_ahead: int = Query(7, ge=1, le=30, description="Days ahead to check for expiring items"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get items expiring within specified days
    
    - **days_ahead**: Number of days to look ahead (1-30, default: 7)
    """
    try:
        items = await pantry_service.get_expiring_items(
            db, str(current_user.id), days_ahead
        )
        return items
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve expiring items: {str(e)}"
        )


@router.get("/alerts/low-stock", response_model=List[PantryItemResponse])
async def get_low_stock_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get items with low stock (quantity at or below threshold)
    """
    try:
        items = await pantry_service.get_low_stock_items(db, str(current_user.id))
        return items
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve low stock items: {str(e)}"
        )
