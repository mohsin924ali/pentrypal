"""
Shopping List Service - Business Logic Layer
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from fastapi import HTTPException, status

from app.models.shopping_list import ShoppingList, ShoppingItem, ListCollaborator
from app.models.user import User
from app.models.category import ItemCategory
from app.models.activity import ActivityLog
from app.schemas.shopping_list import (
    ShoppingListCreate, ShoppingListUpdate, ShoppingItemCreate, 
    ShoppingItemUpdate, ListCollaboratorCreate
)


class ShoppingListService:
    """Service class for shopping list operations"""
    
    async def get_user_lists(
        self, 
        db: Session, 
        user_id: str, 
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[ShoppingList]:
        """Get all shopping lists for a user (owned + collaborated)"""
        query = db.query(ShoppingList).options(
            joinedload(ShoppingList.items).joinedload(ShoppingItem.category),
            joinedload(ShoppingList.items).joinedload(ShoppingItem.assigned_user),
            joinedload(ShoppingList.collaborators).joinedload(ListCollaborator.user),
            joinedload(ShoppingList.owner)
        ).filter(
            or_(
                ShoppingList.owner_id == user_id,
                ShoppingList.collaborators.any(ListCollaborator.user_id == user_id)
            )
        )
        
        if status:
            query = query.filter(ShoppingList.status == status)
        
        return query.offset(skip).limit(limit).all()
    
    async def get_list_by_id(
        self, 
        db: Session, 
        list_id: str, 
        user_id: str
    ) -> Optional[ShoppingList]:
        """Get a specific shopping list by ID"""
        shopping_list = db.query(ShoppingList).options(
            joinedload(ShoppingList.items).joinedload(ShoppingItem.category),
            joinedload(ShoppingList.items).joinedload(ShoppingItem.assigned_user),
            joinedload(ShoppingList.collaborators).joinedload(ListCollaborator.user),
            joinedload(ShoppingList.owner)
        ).filter(ShoppingList.id == list_id).first()
        
        if not shopping_list:
            return None
        
        # Check if user has access to this list
        if not await self._user_has_access(shopping_list, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this shopping list"
            )
        
        return shopping_list
    
    async def create_list(
        self, 
        db: Session, 
        list_data: ShoppingListCreate, 
        owner_id: str
    ) -> ShoppingList:
        """Create a new shopping list"""
        # Verify owner exists
        owner = db.query(User).filter(User.id == owner_id).first()
        if not owner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Owner not found"
            )
        
        # Create shopping list
        db_list = ShoppingList(
            name=list_data.name,
            description=list_data.description,
            owner_id=owner_id,
            budget_amount=list_data.budget_amount,
            budget_currency=list_data.budget_currency,
            meta_data=list_data.meta_data or {},
            status="active"
        )
        
        db.add(db_list)
        db.commit()
        db.refresh(db_list)
        
        # Log activity
        await self._log_activity(
            db, owner_id, "shopping_list", str(db_list.id), "created",
            {"list_name": list_data.name}
        )
        
        return db_list
    
    async def update_list(
        self, 
        db: Session, 
        list_id: str, 
        list_data: ShoppingListUpdate, 
        user_id: str
    ) -> Optional[ShoppingList]:
        """Update a shopping list"""
        db_list = await self.get_list_by_id(db, list_id, user_id)
        if not db_list:
            return None
        
        # Check if user can edit this list
        if not await self._user_can_edit_list(db_list, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to edit this list"
            )
        
        # Update fields
        update_data = list_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_list, field, value)
        
        db.commit()
        db.refresh(db_list)
        
        # Log activity
        # Convert Decimal values to float for JSON serialization
        serializable_changes = {}
        for key, value in update_data.items():
            if hasattr(value, '__float__'):  # Decimal, etc.
                serializable_changes[key] = float(value)
            else:
                serializable_changes[key] = value
        
        await self._log_activity(
            db, user_id, "shopping_list", list_id, "updated",
            {"changes": serializable_changes}
        )
        
        return db_list
    
    async def delete_list(
        self, 
        db: Session, 
        list_id: str, 
        user_id: str
    ) -> bool:
        """Delete a shopping list (only owner can delete)"""
        db_list = await self.get_list_by_id(db, list_id, user_id)
        if not db_list:
            return False
        
        # Only owner can delete
        if db_list.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the list owner can delete the list"
            )
        
        # Log activity before deletion
        await self._log_activity(
            db, user_id, "shopping_list", list_id, "deleted",
            {"list_name": db_list.name}
        )
        
        db.delete(db_list)
        db.commit()
        
        return True
    
    async def add_item(
        self, 
        db: Session, 
        list_id: str, 
        item_data: ShoppingItemCreate, 
        user_id: str
    ) -> ShoppingItem:
        """Add an item to a shopping list"""
        db_list = await self.get_list_by_id(db, list_id, user_id)
        if not db_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shopping list not found"
            )
        
        # Check if user can add items
        if not await self._user_can_add_items(db_list, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to add items to this list"
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
        
        # Validate assigned user if provided
        if item_data.assigned_to:
            if not await self._user_has_access(db_list, item_data.assigned_to):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot assign item to user who doesn't have access to this list"
                )
        
        # Create item
        db_item = ShoppingItem(
            list_id=list_id,
            name=item_data.name,
            description=item_data.description,
            quantity=item_data.quantity,
            unit=item_data.unit,
            category_id=item_data.category_id,
            assigned_to=item_data.assigned_to,
            estimated_price=item_data.estimated_price,
            notes=item_data.notes,
            barcode=item_data.barcode,
            completed=False
        )
        
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        
        # Log activity
        await self._log_activity(
            db, user_id, "shopping_item", str(db_item.id), "created",
            {"item_name": item_data.name, "list_id": list_id}
        )
        
        return db_item
    
    async def update_item(
        self, 
        db: Session, 
        list_id: str, 
        item_id: str, 
        item_data: ShoppingItemUpdate, 
        user_id: str
    ) -> Optional[ShoppingItem]:
        """Update a shopping list item"""
        db_list = await self.get_list_by_id(db, list_id, user_id)
        if not db_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shopping list not found"
            )
        
        db_item = db.query(ShoppingItem).filter(
            and_(ShoppingItem.id == item_id, ShoppingItem.list_id == list_id)
        ).first()
        
        if not db_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
        
        # Check permissions
        if not await self._user_can_edit_items(db_list, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to edit items in this list"
            )
        
        # Update fields
        update_data = item_data.dict(exclude_unset=True)
        
        # Handle completion
        if "completed" in update_data:
            if update_data["completed"] and not db_item.completed:
                from sqlalchemy import func
                update_data["completed_at"] = func.now()
            elif not update_data["completed"] and db_item.completed:
                update_data["completed_at"] = None
        
        for field, value in update_data.items():
            setattr(db_item, field, value)
        
        db.commit()
        db.refresh(db_item)
        
        # Log activity
        action = "completed" if update_data.get("completed") else "updated"
        
        # Convert Decimal values to float for JSON serialization
        # Exclude non-serializable fields like func.now()
        serializable_changes = {}
        for key, value in update_data.items():
            # Skip completed_at as it contains func.now() which is not JSON serializable
            if key == "completed_at":
                continue
            elif hasattr(value, '__float__'):  # Decimal, etc.
                serializable_changes[key] = float(value)
            else:
                serializable_changes[key] = value
        
        await self._log_activity(
            db, user_id, "shopping_item", item_id, action,
            {"item_name": db_item.name, "list_id": list_id, "changes": serializable_changes}
        )
        
        return db_item
    
    async def delete_item(
        self, 
        db: Session, 
        list_id: str, 
        item_id: str, 
        user_id: str
    ) -> bool:
        """Delete a shopping list item"""
        db_list = await self.get_list_by_id(db, list_id, user_id)
        if not db_list:
            return False
        
        db_item = db.query(ShoppingItem).filter(
            and_(ShoppingItem.id == item_id, ShoppingItem.list_id == list_id)
        ).first()
        
        if not db_item:
            return False
        
        # Check permissions
        if not await self._user_can_delete_items(db_list, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete items from this list"
            )
        
        # Log activity before deletion
        await self._log_activity(
            db, user_id, "shopping_item", item_id, "deleted",
            {"item_name": db_item.name, "list_id": list_id}
        )
        
        db.delete(db_item)
        db.commit()
        
        return True
    
    async def add_collaborator(
        self, 
        db: Session, 
        list_id: str, 
        collaborator_data: ListCollaboratorCreate, 
        user_id: str
    ) -> ListCollaborator:
        """Add a collaborator to a shopping list"""
        db_list = await self.get_list_by_id(db, list_id, user_id)
        if not db_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shopping list not found"
            )
        
        # Only owner can add collaborators
        if str(db_list.owner_id) != str(user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the list owner can add collaborators"
            )
        
        # Check if user exists
        collaborator_user = db.query(User).filter(
            User.id == collaborator_data.user_id
        ).first()
        if not collaborator_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if user is already a collaborator
        existing = db.query(ListCollaborator).filter(
            and_(
                ListCollaborator.list_id == list_id,
                ListCollaborator.user_id == collaborator_data.user_id
            )
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a collaborator on this list"
            )
        
        # Create collaborator
        db_collaborator = ListCollaborator(
            list_id=list_id,
            user_id=collaborator_data.user_id,
            role=collaborator_data.role,
            permissions=collaborator_data.permissions or self._get_default_permissions(collaborator_data.role)
        )
        
        db.add(db_collaborator)
        db.commit()
        db.refresh(db_collaborator)
        
        # Log activity
        await self._log_activity(
            db, user_id, "list_collaborator", str(db_collaborator.id), "added",
            {"collaborator_name": collaborator_user.name, "list_id": list_id, "role": collaborator_data.role}
        )
        
        # Send notification to the new collaborator
        await self._notify_collaborator_added(db, db_list, collaborator_user, user_id)
        
        # Send real-time update to all collaborators
        await self._notify_list_update(db_list, "collaborator_added")
        
        return db_collaborator
    
    async def remove_collaborator(
        self, 
        db: Session, 
        list_id: str, 
        collaborator_user_id: str, 
        user_id: str
    ) -> bool:
        """Remove a collaborator from a shopping list"""
        db_list = await self.get_list_by_id(db, list_id, user_id)
        if not db_list:
            return False
        
        # Only owner can remove collaborators
        if str(db_list.owner_id) != str(user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the list owner can remove collaborators"
            )
        
        db_collaborator = db.query(ListCollaborator).filter(
            and_(
                ListCollaborator.list_id == list_id,
                ListCollaborator.user_id == collaborator_user_id
            )
        ).first()
        
        if not db_collaborator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collaborator not found"
            )
        
        # Log activity before deletion
        collaborator_user = db.query(User).filter(User.id == collaborator_user_id).first()
        await self._log_activity(
            db, user_id, "list_collaborator", str(db_collaborator.id), "removed",
            {"collaborator_name": collaborator_user.name if collaborator_user else "Unknown", "list_id": list_id}
        )
        
        db.delete(db_collaborator)
        db.commit()
        
        return True
    
    # Private helper methods
    async def _user_has_access(self, shopping_list: ShoppingList, user_id: str) -> bool:
        """Check if user has access to the shopping list"""
        if str(shopping_list.owner_id) == str(user_id):
            return True
        
        return any(str(c.user_id) == str(user_id) for c in shopping_list.collaborators)
    
    async def _user_can_edit_list(self, shopping_list: ShoppingList, user_id: str) -> bool:
        """Check if user can edit the shopping list"""
        if str(shopping_list.owner_id) == str(user_id):
            return True
        
        collaborator = next((c for c in shopping_list.collaborators if str(c.user_id) == str(user_id)), None)
        return collaborator and collaborator.permissions.get("can_edit_list", False)
    
    async def _user_can_add_items(self, shopping_list: ShoppingList, user_id: str) -> bool:
        """Check if user can add items to the shopping list"""
        if str(shopping_list.owner_id) == str(user_id):
            return True
        
        collaborator = next((c for c in shopping_list.collaborators if str(c.user_id) == str(user_id)), None)
        return collaborator and collaborator.permissions.get("can_add_items", True)
    
    async def _user_can_edit_items(self, shopping_list: ShoppingList, user_id: str) -> bool:
        """Check if user can edit items in the shopping list"""
        if str(shopping_list.owner_id) == str(user_id):
            return True
        
        collaborator = next((c for c in shopping_list.collaborators if str(c.user_id) == str(user_id)), None)
        return collaborator and collaborator.permissions.get("can_edit_items", True)
    
    async def _user_can_delete_items(self, shopping_list: ShoppingList, user_id: str) -> bool:
        """Check if user can delete items from the shopping list"""
        if str(shopping_list.owner_id) == str(user_id):
            return True
        
        collaborator = next((c for c in shopping_list.collaborators if str(c.user_id) == str(user_id)), None)
        return collaborator and collaborator.permissions.get("can_delete_items", False)
    
    def _get_default_permissions(self, role: str) -> dict:
        """Get default permissions for a role"""
        if role == "owner":
            return {
                "can_edit_items": True,
                "can_add_items": True,
                "can_delete_items": True,
                "can_assign_items": True,
                "can_invite_others": True,
                "can_edit_list": True
            }
        elif role == "editor":
            return {
                "can_edit_items": True,
                "can_add_items": True,
                "can_delete_items": False,
                "can_assign_items": True,
                "can_invite_others": False,
                "can_edit_list": False
            }
        else:  # viewer
            return {
                "can_edit_items": False,
                "can_add_items": False,
                "can_delete_items": False,
                "can_assign_items": False,
                "can_invite_others": False,
                "can_edit_list": False
            }
    
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
        activity = ActivityLog(
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            meta_data=metadata
        )
        db.add(activity)
        db.commit()
    
    async def _notify_list_update(self, shopping_list: ShoppingList, action: str):
        """Send real-time notification for list updates"""
        try:
            # Import here to avoid circular imports
            from app.api.v1.endpoints.websocket import notify_list_update
            
            list_data = {
                "id": str(shopping_list.id),
                "name": shopping_list.name,
                "status": shopping_list.status,
                "action": action,
                "owner_id": str(shopping_list.owner_id),
                "collaborators": [
                    {
                        "user_id": str(collab.user_id),
                        "role": collab.role,
                        "permissions": collab.permissions
                    }
                    for collab in shopping_list.collaborators
                ]
            }
            
            await notify_list_update(list_data, str(shopping_list.id))
        except Exception as e:
            # Don't fail the main operation if WebSocket notification fails
            print(f"Failed to send list update notification: {e}")
    
    async def _notify_item_update(self, shopping_item: ShoppingItem, action: str):
        """Send real-time notification for item updates"""
        try:
            # Import here to avoid circular imports
            from app.api.v1.endpoints.websocket import notify_item_update
            
            item_data = {
                "id": str(shopping_item.id),
                "name": shopping_item.name,
                "quantity": float(shopping_item.quantity) if shopping_item.quantity else None,
                "unit": shopping_item.unit,
                "completed": shopping_item.completed,
                "assigned_to": str(shopping_item.assigned_to) if shopping_item.assigned_to else None,
                "action": action,
                "list_id": str(shopping_item.list_id)
            }
            
            await notify_item_update(item_data, str(shopping_item.list_id))
        except Exception as e:
            # Don't fail the main operation if WebSocket notification fails
            print(f"Failed to send item update notification: {e}")
    
    async def _notify_collaborator_added(self, db: Session, shopping_list: ShoppingList, collaborator_user: "User", inviter_id: str):
        """Send notification to newly added collaborator"""
        try:
            # Import here to avoid circular imports
            from app.core.websocket import connection_manager
            from app.models.user import User
            
            # Get inviter name
            inviter = db.query(User).filter(User.id == inviter_id).first()
            inviter_name = inviter.name if inviter else "Someone"
            
            # Create notification data
            notification_data = {
                "type": "list_shared",
                "title": "List Shared With You",
                "message": f"{inviter_name} shared \"{shopping_list.name}\" with you",
                "list_id": str(shopping_list.id),
                "list_name": shopping_list.name,
                "inviter_name": inviter_name,
                "inviter_id": str(inviter_id)
            }
            
            # Send notification to the collaborator
            await connection_manager.send_notification(notification_data, str(collaborator_user.id))
            
        except Exception as e:
            # Don't fail the main operation if notification fails
            print(f"Failed to send collaborator notification: {e}")
