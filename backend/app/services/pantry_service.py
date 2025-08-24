"""
Pantry Service - Inventory Management Business Logic
"""
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc, asc
from fastapi import HTTPException, status

from app.models.pantry import PantryItem
from app.models.user import User
from app.models.category import ItemCategory
from app.models.activity import ActivityLog
from app.schemas.pantry import (
    PantryItemCreate, PantryItemUpdate, PantryStatsResponse, 
    PantryItemBulkUpdate, PantryItemConsume
)


class PantryService:
    """Service class for pantry inventory management"""
    
    async def get_user_pantry_items(
        self, 
        db: Session, 
        user_id: str,
        category_id: Optional[str] = None,
        location: Optional[str] = None,
        expiring_soon: Optional[bool] = None,
        low_stock: Optional[bool] = None,
        search: Optional[str] = None,
        sort_by: str = "name",
        sort_order: str = "asc",
        skip: int = 0,
        limit: int = 100
    ) -> List[PantryItem]:
        """Get user's pantry items with filtering and sorting"""
        query = db.query(PantryItem).options(
            joinedload(PantryItem.category),
            joinedload(PantryItem.user)
        ).filter(PantryItem.user_id == user_id)
        
        # Apply filters
        if category_id:
            query = query.filter(PantryItem.category_id == category_id)
        
        if location:
            query = query.filter(PantryItem.location.ilike(f"%{location}%"))
        
        if search:
            query = query.filter(
                or_(
                    PantryItem.name.ilike(f"%{search}%"),
                    PantryItem.barcode.ilike(f"%{search}%")
                )
            )
        
        # Filter by expiring soon (within 3 days)
        if expiring_soon is True:
            three_days_from_now = date.today() + timedelta(days=3)
            query = query.filter(
                and_(
                    PantryItem.expiration_date.isnot(None),
                    PantryItem.expiration_date <= three_days_from_now,
                    PantryItem.expiration_date >= date.today()
                )
            )
        
        # Filter by low stock
        if low_stock is True:
            query = query.filter(PantryItem.quantity <= PantryItem.low_stock_threshold)
        
        # Apply sorting
        if sort_by == "name":
            order_col = PantryItem.name
        elif sort_by == "quantity":
            order_col = PantryItem.quantity
        elif sort_by == "expiration_date":
            order_col = PantryItem.expiration_date
        elif sort_by == "created_at":
            order_col = PantryItem.created_at
        elif sort_by == "updated_at":
            order_col = PantryItem.updated_at
        else:
            order_col = PantryItem.name
        
        if sort_order.lower() == "desc":
            query = query.order_by(desc(order_col))
        else:
            query = query.order_by(asc(order_col))
        
        return query.offset(skip).limit(limit).all()
    
    async def get_pantry_item_by_id(
        self, 
        db: Session, 
        item_id: str, 
        user_id: str
    ) -> Optional[PantryItem]:
        """Get a specific pantry item by ID"""
        return db.query(PantryItem).options(
            joinedload(PantryItem.category),
            joinedload(PantryItem.user)
        ).filter(
            and_(
                PantryItem.id == item_id,
                PantryItem.user_id == user_id
            )
        ).first()
    
    async def create_pantry_item(
        self, 
        db: Session, 
        item_data: PantryItemCreate, 
        user_id: str
    ) -> PantryItem:
        """Create a new pantry item"""
        # Verify user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Validate category if provided
        if item_data.category_id:
            category = db.query(ItemCategory).filter(
                ItemCategory.id == item_data.category_id
            ).first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Category not found"
                )
        
        # Check for duplicate barcode if provided
        if item_data.barcode:
            existing_item = db.query(PantryItem).filter(
                and_(
                    PantryItem.user_id == user_id,
                    PantryItem.barcode == item_data.barcode
                )
            ).first()
            if existing_item:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Item with this barcode already exists in your pantry"
                )
        
        # Create pantry item
        db_item = PantryItem(
            user_id=user_id,
            name=item_data.name,
            category_id=item_data.category_id,
            quantity=item_data.quantity,
            unit=item_data.unit,
            location=item_data.location,
            expiration_date=item_data.expiration_date,
            low_stock_threshold=item_data.low_stock_threshold,
            barcode=item_data.barcode,
            image_url=item_data.image_url
        )
        
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        
        # Log activity
        await self._log_activity(
            db, user_id, "pantry_item", str(db_item.id), "created",
            {"item_name": item_data.name, "quantity": float(item_data.quantity), "unit": item_data.unit}
        )
        
        return db_item
    
    async def update_pantry_item(
        self, 
        db: Session, 
        item_id: str, 
        item_data: PantryItemUpdate, 
        user_id: str
    ) -> Optional[PantryItem]:
        """Update a pantry item"""
        db_item = await self.get_pantry_item_by_id(db, item_id, user_id)
        if not db_item:
            return None
        
        # Validate category if provided
        if item_data.category_id:
            category = db.query(ItemCategory).filter(
                ItemCategory.id == item_data.category_id
            ).first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Category not found"
                )
        
        # Check for duplicate barcode if provided and different from current
        if item_data.barcode and item_data.barcode != db_item.barcode:
            existing_item = db.query(PantryItem).filter(
                and_(
                    PantryItem.user_id == user_id,
                    PantryItem.barcode == item_data.barcode,
                    PantryItem.id != item_id
                )
            ).first()
            if existing_item:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Item with this barcode already exists in your pantry"
                )
        
        # Update fields
        update_data = item_data.dict(exclude_unset=True)
        old_quantity = db_item.quantity
        
        for field, value in update_data.items():
            setattr(db_item, field, value)
        
        db.commit()
        db.refresh(db_item)
        
        # Log activity with changes
        changes = {}
        if "quantity" in update_data and update_data["quantity"] != old_quantity:
            changes["old_quantity"] = float(old_quantity)
            changes["new_quantity"] = float(update_data["quantity"])
        
        await self._log_activity(
            db, user_id, "pantry_item", item_id, "updated",
            {"item_name": db_item.name, "changes": changes}
        )
        
        return db_item
    
    async def delete_pantry_item(
        self, 
        db: Session, 
        item_id: str, 
        user_id: str
    ) -> bool:
        """Delete a pantry item"""
        db_item = await self.get_pantry_item_by_id(db, item_id, user_id)
        if not db_item:
            return False
        
        # Log activity before deletion
        await self._log_activity(
            db, user_id, "pantry_item", item_id, "deleted",
            {"item_name": db_item.name, "quantity": float(db_item.quantity)}
        )
        
        db.delete(db_item)
        db.commit()
        
        return True
    
    async def consume_pantry_item(
        self, 
        db: Session, 
        item_id: str, 
        consume_data: PantryItemConsume, 
        user_id: str
    ) -> Optional[PantryItem]:
        """Consume/use quantity from a pantry item"""
        db_item = await self.get_pantry_item_by_id(db, item_id, user_id)
        if not db_item:
            return None
        
        if consume_data.quantity_used > db_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot consume more than available quantity"
            )
        
        old_quantity = db_item.quantity
        db_item.quantity -= consume_data.quantity_used
        
        # If quantity reaches zero or below, optionally delete the item
        if db_item.quantity <= 0:
            db_item.quantity = Decimal('0')
        
        db.commit()
        db.refresh(db_item)
        
        # Log consumption activity
        await self._log_activity(
            db, user_id, "pantry_item", item_id, "consumed",
            {
                "item_name": db_item.name,
                "quantity_used": float(consume_data.quantity_used),
                "old_quantity": float(old_quantity),
                "new_quantity": float(db_item.quantity),
                "notes": consume_data.notes
            }
        )
        
        return db_item
    
    async def bulk_update_pantry_items(
        self, 
        db: Session, 
        bulk_data: PantryItemBulkUpdate, 
        user_id: str
    ) -> List[PantryItem]:
        """Bulk update multiple pantry items"""
        updated_items = []
        
        for item_id in bulk_data.item_ids:
            db_item = await self.get_pantry_item_by_id(db, item_id, user_id)
            if db_item:
                # Apply updates
                update_data = bulk_data.updates.dict(exclude_unset=True)
                for field, value in update_data.items():
                    if value is not None:
                        setattr(db_item, field, value)
                
                updated_items.append(db_item)
        
        if updated_items:
            db.commit()
            for item in updated_items:
                db.refresh(item)
            
            # Log bulk update activity
            await self._log_activity(
                db, user_id, "pantry_item", "bulk", "bulk_updated",
                {"items_count": len(updated_items), "updates": bulk_data.updates.dict(exclude_unset=True)}
            )
        
        return updated_items
    
    async def get_pantry_stats(
        self, 
        db: Session, 
        user_id: str
    ) -> PantryStatsResponse:
        """Get pantry statistics for the user"""
        # Total items
        total_items = db.query(PantryItem).filter(PantryItem.user_id == user_id).count()
        
        # Items expiring within 3 days
        three_days_from_now = date.today() + timedelta(days=3)
        expiring_soon = db.query(PantryItem).filter(
            and_(
                PantryItem.user_id == user_id,
                PantryItem.expiration_date.isnot(None),
                PantryItem.expiration_date <= three_days_from_now,
                PantryItem.expiration_date >= date.today()
            )
        ).count()
        
        # Expired items
        expired_items = db.query(PantryItem).filter(
            and_(
                PantryItem.user_id == user_id,
                PantryItem.expiration_date.isnot(None),
                PantryItem.expiration_date < date.today()
            )
        ).count()
        
        # Low stock items
        low_stock_items = db.query(PantryItem).filter(
            and_(
                PantryItem.user_id == user_id,
                PantryItem.quantity <= PantryItem.low_stock_threshold
            )
        ).count()
        
        # Categories count
        categories_count = db.query(PantryItem.category_id).filter(
            and_(
                PantryItem.user_id == user_id,
                PantryItem.category_id.isnot(None)
            )
        ).distinct().count()
        
        # Locations count
        locations_count = db.query(PantryItem.location).filter(
            and_(
                PantryItem.user_id == user_id,
                PantryItem.location.isnot(None)
            )
        ).distinct().count()
        
        return PantryStatsResponse(
            total_items=total_items,
            expiring_soon=expiring_soon,
            expired_items=expired_items,
            low_stock_items=low_stock_items,
            categories_count=categories_count,
            locations_count=locations_count
        )
    
    async def get_pantry_locations(
        self, 
        db: Session, 
        user_id: str
    ) -> List[str]:
        """Get all unique locations used by the user"""
        locations = db.query(PantryItem.location).filter(
            and_(
                PantryItem.user_id == user_id,
                PantryItem.location.isnot(None)
            )
        ).distinct().all()
        
        return [location[0] for location in locations if location[0]]
    
    async def search_by_barcode(
        self, 
        db: Session, 
        barcode: str, 
        user_id: str
    ) -> Optional[PantryItem]:
        """Search for pantry item by barcode"""
        return db.query(PantryItem).options(
            joinedload(PantryItem.category)
        ).filter(
            and_(
                PantryItem.user_id == user_id,
                PantryItem.barcode == barcode
            )
        ).first()
    
    async def get_expiring_items(
        self, 
        db: Session, 
        user_id: str,
        days_ahead: int = 7
    ) -> List[PantryItem]:
        """Get items expiring within specified days"""
        target_date = date.today() + timedelta(days=days_ahead)
        
        return db.query(PantryItem).options(
            joinedload(PantryItem.category)
        ).filter(
            and_(
                PantryItem.user_id == user_id,
                PantryItem.expiration_date.isnot(None),
                PantryItem.expiration_date <= target_date,
                PantryItem.expiration_date >= date.today()
            )
        ).order_by(asc(PantryItem.expiration_date)).all()
    
    async def get_low_stock_items(
        self, 
        db: Session, 
        user_id: str
    ) -> List[PantryItem]:
        """Get items with low stock"""
        return db.query(PantryItem).options(
            joinedload(PantryItem.category)
        ).filter(
            and_(
                PantryItem.user_id == user_id,
                PantryItem.quantity <= PantryItem.low_stock_threshold
            )
        ).order_by(asc(PantryItem.quantity)).all()
    
    # Private helper methods
    async def _log_activity(
        self, 
        db: Session, 
        user_id: str, 
        entity_type: str, 
        entity_id: str, 
        action: str, 
        metadata: dict
    ):
        """Log user activity"""
        # Convert any non-serializable values
        serializable_metadata = {}
        for key, value in metadata.items():
            if hasattr(value, '__float__'):  # Decimal, etc.
                serializable_metadata[key] = float(value)
            elif isinstance(value, dict):
                # Handle nested dictionaries
                nested_dict = {}
                for nested_key, nested_value in value.items():
                    if hasattr(nested_value, '__float__'):
                        nested_dict[nested_key] = float(nested_value)
                    else:
                        nested_dict[nested_key] = nested_value
                serializable_metadata[key] = nested_dict
            else:
                serializable_metadata[key] = value
        
        activity = ActivityLog(
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            meta_data=serializable_metadata
        )
        db.add(activity)
        db.commit()
