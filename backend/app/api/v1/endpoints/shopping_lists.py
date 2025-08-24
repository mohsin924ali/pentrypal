"""
Shopping list management endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.services.shopping_list_service import ShoppingListService
from app.schemas.shopping_list import (
    ShoppingListCreate, ShoppingListUpdate, ShoppingListResponse,
    ShoppingItemCreate, ShoppingItemUpdate, ShoppingItemResponse,
    ListCollaboratorCreate, ListCollaboratorResponse
)
from app.models.user import User

router = APIRouter()
shopping_list_service = ShoppingListService()


@router.get("/", response_model=List[ShoppingListResponse])
async def get_user_shopping_lists(
    status: Optional[str] = Query(None, description="Filter by status: active, completed, archived"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all shopping lists for the current user (owned + collaborated)
    
    - **status**: Filter by list status (optional)
    - **skip**: Number of records to skip for pagination
    - **limit**: Maximum number of records to return
    """
    try:
        lists = await shopping_list_service.get_user_lists(
            db, str(current_user.id), status, skip, limit
        )
        return lists
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve shopping lists: {str(e)}"
        )


@router.post("/", response_model=ShoppingListResponse, status_code=status.HTTP_201_CREATED)
async def create_shopping_list(
    list_data: ShoppingListCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new shopping list
    
    - **name**: List name (required)
    - **description**: List description (optional)
    - **budget_amount**: Budget amount (optional)
    - **budget_currency**: Budget currency (optional)
    - **meta_data**: Additional metadata (optional)
    """
    try:
        shopping_list = await shopping_list_service.create_list(
            db, list_data, str(current_user.id)
        )
        return shopping_list
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create shopping list: {str(e)}"
        )


@router.get("/{list_id}", response_model=ShoppingListResponse)
async def get_shopping_list(
    list_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific shopping list by ID
    
    Returns the shopping list with all items and collaborators if the user has access.
    """
    try:
        shopping_list = await shopping_list_service.get_list_by_id(
            db, list_id, str(current_user.id)
        )
        if not shopping_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shopping list not found"
            )
        return shopping_list
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve shopping list: {str(e)}"
        )


@router.put("/{list_id}", response_model=ShoppingListResponse)
async def update_shopping_list(
    list_id: str,
    list_data: ShoppingListUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a shopping list
    
    Only the owner or users with edit permissions can update the list.
    """
    try:
        shopping_list = await shopping_list_service.update_list(
            db, list_id, list_data, str(current_user.id)
        )
        if not shopping_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shopping list not found"
            )
        return shopping_list
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update shopping list: {str(e)}"
        )


@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shopping_list(
    list_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a shopping list
    
    Only the list owner can delete the list.
    """
    try:
        success = await shopping_list_service.delete_list(
            db, list_id, str(current_user.id)
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shopping list not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete shopping list: {str(e)}"
        )


# Shopping List Items Endpoints

@router.post("/{list_id}/items", response_model=ShoppingItemResponse, status_code=status.HTTP_201_CREATED)
async def add_item_to_list(
    list_id: str,
    item_data: ShoppingItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add an item to a shopping list
    
    - **name**: Item name (required)
    - **quantity**: Item quantity (required)
    - **unit**: Unit of measurement (required)
    - **category_id**: Category ID (optional)
    - **assigned_to**: User ID to assign item to (optional)
    - **estimated_price**: Estimated price (optional)
    - **notes**: Additional notes (optional)
    - **barcode**: Item barcode (optional)
    """
    try:
        item = await shopping_list_service.add_item(
            db, list_id, item_data, str(current_user.id)
        )
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add item to shopping list: {str(e)}"
        )


@router.put("/{list_id}/items/{item_id}", response_model=ShoppingItemResponse)
async def update_list_item(
    list_id: str,
    item_id: str,
    item_data: ShoppingItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a shopping list item
    
    Users with edit permissions can update items.
    """
    try:
        item = await shopping_list_service.update_item(
            db, list_id, item_id, item_data, str(current_user.id)
        )
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update item: {str(e)}"
        )


@router.delete("/{list_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_list_item(
    list_id: str,
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a shopping list item
    
    Users with delete permissions can remove items.
    """
    try:
        success = await shopping_list_service.delete_item(
            db, list_id, item_id, str(current_user.id)
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete item: {str(e)}"
        )


# Collaborator Management Endpoints

@router.post("/{list_id}/collaborators", response_model=ListCollaboratorResponse, status_code=status.HTTP_201_CREATED)
async def add_collaborator_to_list(
    list_id: str,
    collaborator_data: ListCollaboratorCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a collaborator to a shopping list
    
    Only the list owner can add collaborators.
    
    - **user_id**: ID of the user to add as collaborator
    - **role**: Role (owner, editor, viewer)
    - **permissions**: Custom permissions (optional)
    """
    try:
        collaborator = await shopping_list_service.add_collaborator(
            db, list_id, collaborator_data, str(current_user.id)
        )
        return collaborator
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add collaborator: {str(e)}"
        )


@router.delete("/{list_id}/collaborators/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_collaborator_from_list(
    list_id: str,
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a collaborator from a shopping list
    
    Only the list owner can remove collaborators.
    """
    try:
        success = await shopping_list_service.remove_collaborator(
            db, list_id, user_id, str(current_user.id)
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collaborator not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove collaborator: {str(e)}"
        )
