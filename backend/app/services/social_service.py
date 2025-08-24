"""
Social Service - Friend Management Business Logic
"""
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from fastapi import HTTPException, status

from app.models.social import Friendship, FriendRequest
from app.models.user import User
from app.models.activity import ActivityLog
from app.schemas.social import FriendRequestCreate, FriendRequestUpdate


class SocialService:
    """Service class for social features and friend management"""
    
    async def get_user_friends(
        self, 
        db: Session, 
        user_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Friendship]:
        """Get all friends for a user"""
        friendships = db.query(Friendship).options(
            joinedload(Friendship.user1),
            joinedload(Friendship.user2),
            joinedload(Friendship.initiator)
        ).filter(
            and_(
                or_(
                    Friendship.user1_id == user_id,
                    Friendship.user2_id == user_id
                ),
                Friendship.status == "active"
            )
        ).offset(skip).limit(limit).all()
        
        return friendships
    
    async def get_friend_requests_received(
        self, 
        db: Session, 
        user_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[FriendRequest]:
        """Get friend requests received by user"""
        requests = db.query(FriendRequest).options(
            joinedload(FriendRequest.from_user),
            joinedload(FriendRequest.to_user)
        ).filter(
            and_(
                FriendRequest.to_user_id == user_id,
                FriendRequest.status == "pending"
            )
        ).offset(skip).limit(limit).all()
        
        return requests
    
    async def get_friend_requests_sent(
        self, 
        db: Session, 
        user_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[FriendRequest]:
        """Get friend requests sent by user"""
        requests = db.query(FriendRequest).options(
            joinedload(FriendRequest.from_user),
            joinedload(FriendRequest.to_user)
        ).filter(
            and_(
                FriendRequest.from_user_id == user_id,
                FriendRequest.status == "pending"
            )
        ).offset(skip).limit(limit).all()
        
        return requests
    
    async def search_users(
        self, 
        db: Session, 
        current_user_id: str,
        query: str,
        skip: int = 0,
        limit: int = 20
    ) -> List[User]:
        """Search for users by name or email (excluding current user and existing friends)"""
        if not query or len(query.strip()) < 2:
            return []
        
        # Get existing friend IDs to exclude from search
        existing_friends = await self.get_user_friends(db, current_user_id, 0, 1000)
        friend_ids = set()
        for friendship in existing_friends:
            if str(friendship.user1_id) == str(current_user_id):
                friend_ids.add(str(friendship.user2_id))
            else:
                friend_ids.add(str(friendship.user1_id))
        
        # Get pending friend request IDs to exclude
        sent_requests = await self.get_friend_requests_sent(db, current_user_id, 0, 1000)
        received_requests = await self.get_friend_requests_received(db, current_user_id, 0, 1000)
        
        pending_ids = set()
        for req in sent_requests:
            pending_ids.add(str(req.to_user_id))
        for req in received_requests:
            pending_ids.add(str(req.from_user_id))
        
        # Exclude current user, friends, and pending requests
        exclude_ids = friend_ids.union(pending_ids)
        exclude_ids.add(str(current_user_id))
        
        # Search users
        search_query = db.query(User).filter(
            and_(
                User.is_active == True,
                or_(
                    User.name.ilike(f"%{query}%"),
                    User.email.ilike(f"%{query}%")
                )
            )
        )
        
        if exclude_ids:
            search_query = search_query.filter(~User.id.in_(exclude_ids))
        
        users = search_query.offset(skip).limit(limit).all()
        return users
    
    async def send_friend_request(
        self, 
        db: Session, 
        request_data: FriendRequestCreate, 
        from_user_id: str
    ) -> FriendRequest:
        """Send a friend request"""
        # Validate that users exist
        from_user = db.query(User).filter(User.id == from_user_id).first()
        to_user = db.query(User).filter(User.id == request_data.to_user_id).first()
        
        if not from_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sender not found"
            )
        
        if not to_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipient not found"
            )
        
        if str(from_user_id) == str(request_data.to_user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot send friend request to yourself"
            )
        
        # Check if users are already friends
        existing_friendship = db.query(Friendship).filter(
            and_(
                or_(
                    and_(Friendship.user1_id == from_user_id, Friendship.user2_id == request_data.to_user_id),
                    and_(Friendship.user1_id == request_data.to_user_id, Friendship.user2_id == from_user_id)
                ),
                Friendship.status == "active"
            )
        ).first()
        
        if existing_friendship:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Users are already friends"
            )
        
        # Check if there's already a pending request
        existing_request = db.query(FriendRequest).filter(
            and_(
                or_(
                    and_(FriendRequest.from_user_id == from_user_id, FriendRequest.to_user_id == request_data.to_user_id),
                    and_(FriendRequest.from_user_id == request_data.to_user_id, FriendRequest.to_user_id == from_user_id)
                ),
                FriendRequest.status == "pending"
            )
        ).first()
        
        if existing_request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Friend request already exists between these users"
            )
        
        # Create friend request
        friend_request = FriendRequest(
            from_user_id=from_user_id,
            to_user_id=request_data.to_user_id,
            message=request_data.message,
            status="pending"
        )
        
        db.add(friend_request)
        db.commit()
        db.refresh(friend_request)
        
        # Log activity
        await self._log_activity(
            db, from_user_id, "friend_request", str(friend_request.id), "sent",
            {"to_user_name": to_user.name, "to_user_id": str(request_data.to_user_id)}
        )
        
        return friend_request
    
    async def respond_to_friend_request(
        self, 
        db: Session, 
        request_id: str, 
        response_data: FriendRequestUpdate, 
        user_id: str
    ) -> Optional[Friendship]:
        """Respond to a friend request (accept or reject)"""
        friend_request = db.query(FriendRequest).options(
            joinedload(FriendRequest.from_user),
            joinedload(FriendRequest.to_user)
        ).filter(FriendRequest.id == request_id).first()
        
        if not friend_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Friend request not found"
            )
        
        # Only the recipient can respond
        if str(friend_request.to_user_id) != str(user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only respond to friend requests sent to you"
            )
        
        if friend_request.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Friend request has already been responded to"
            )
        
        # Update request status
        friend_request.status = response_data.status
        friend_request.responded_at = func.now()
        
        friendship = None
        
        if response_data.status == "accepted":
            # Create friendship
            friendship = Friendship(
                user1_id=friend_request.from_user_id,
                user2_id=friend_request.to_user_id,
                status="active",
                initiated_by=friend_request.from_user_id
            )
            
            db.add(friendship)
            db.commit()  # Commit to get the friendship ID
            db.refresh(friendship)
            
            # Log activity for both users
            await self._log_activity(
                db, user_id, "friendship", str(friendship.id), "accepted",
                {"friend_name": friend_request.from_user.name, "friend_id": str(friend_request.from_user_id)}
            )
            
            await self._log_activity(
                db, str(friend_request.from_user_id), "friendship", str(friendship.id), "created",
                {"friend_name": friend_request.to_user.name, "friend_id": str(user_id)}
            )
        else:
            # Log rejection
            await self._log_activity(
                db, user_id, "friend_request", request_id, "rejected",
                {"from_user_name": friend_request.from_user.name, "from_user_id": str(friend_request.from_user_id)}
            )
            db.commit()  # Only commit for rejection case
        
        return friendship
    
    async def cancel_friend_request(
        self, 
        db: Session, 
        request_id: str, 
        user_id: str
    ) -> bool:
        """Cancel a sent friend request"""
        friend_request = db.query(FriendRequest).filter(FriendRequest.id == request_id).first()
        
        if not friend_request:
            return False
        
        # Only the sender can cancel
        if str(friend_request.from_user_id) != str(user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only cancel friend requests you sent"
            )
        
        if friend_request.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only cancel pending friend requests"
            )
        
        # Update status to cancelled
        friend_request.status = "cancelled"
        friend_request.responded_at = func.now()
        
        db.commit()
        
        # Log activity
        await self._log_activity(
            db, user_id, "friend_request", request_id, "cancelled",
            {"to_user_id": str(friend_request.to_user_id)}
        )
        
        return True
    
    async def remove_friend(
        self, 
        db: Session, 
        friendship_id: str, 
        user_id: str
    ) -> bool:
        """Remove a friend (unfriend)"""
        friendship = db.query(Friendship).options(
            joinedload(Friendship.user1),
            joinedload(Friendship.user2)
        ).filter(Friendship.id == friendship_id).first()
        
        if not friendship:
            return False
        
        # Check if user is part of this friendship
        if str(friendship.user1_id) != str(user_id) and str(friendship.user2_id) != str(user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only remove your own friendships"
            )
        
        if friendship.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Friendship is not active"
            )
        
        # Get the other user's info for logging
        other_user = friendship.user2 if str(friendship.user1_id) == str(user_id) else friendship.user1
        
        # Log activity before deletion
        await self._log_activity(
            db, user_id, "friendship", friendship_id, "removed",
            {"friend_name": other_user.name, "friend_id": str(other_user.id)}
        )
        
        # Delete the friendship
        db.delete(friendship)
        db.commit()
        
        return True
    
    async def block_user(
        self, 
        db: Session, 
        user_to_block_id: str, 
        user_id: str
    ) -> bool:
        """Block a user (removes friendship if exists and prevents future requests)"""
        if str(user_to_block_id) == str(user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot block yourself"
            )
        
        # Check if user exists
        user_to_block = db.query(User).filter(User.id == user_to_block_id).first()
        if not user_to_block:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Remove existing friendship if any
        existing_friendship = db.query(Friendship).filter(
            and_(
                or_(
                    and_(Friendship.user1_id == user_id, Friendship.user2_id == user_to_block_id),
                    and_(Friendship.user1_id == user_to_block_id, Friendship.user2_id == user_id)
                ),
                Friendship.status == "active"
            )
        ).first()
        
        if existing_friendship:
            db.delete(existing_friendship)
        
        # Cancel any pending friend requests between users
        pending_requests = db.query(FriendRequest).filter(
            and_(
                or_(
                    and_(FriendRequest.from_user_id == user_id, FriendRequest.to_user_id == user_to_block_id),
                    and_(FriendRequest.from_user_id == user_to_block_id, FriendRequest.to_user_id == user_id)
                ),
                FriendRequest.status == "pending"
            )
        ).all()
        
        for request in pending_requests:
            request.status = "cancelled"
            request.responded_at = func.now()
        
        # Create blocked relationship (we'll store this as a friendship with "blocked" status)
        blocked_relationship = Friendship(
            user1_id=user_id,  # The user who blocked
            user2_id=user_to_block_id,  # The user being blocked
            status="blocked",
            initiated_by=user_id
        )
        
        db.add(blocked_relationship)
        db.commit()
        
        # Log activity
        await self._log_activity(
            db, user_id, "user", user_to_block_id, "blocked",
            {"blocked_user_name": user_to_block.name, "blocked_user_id": str(user_to_block_id)}
        )
        
        return True
    
    async def unblock_user(
        self, 
        db: Session, 
        user_to_unblock_id: str, 
        user_id: str
    ) -> bool:
        """Unblock a user"""
        blocked_relationship = db.query(Friendship).filter(
            and_(
                Friendship.user1_id == user_id,
                Friendship.user2_id == user_to_unblock_id,
                Friendship.status == "blocked"
            )
        ).first()
        
        if not blocked_relationship:
            return False
        
        # Remove the blocked relationship
        db.delete(blocked_relationship)
        db.commit()
        
        # Log activity
        await self._log_activity(
            db, user_id, "user", user_to_unblock_id, "unblocked",
            {"unblocked_user_id": str(user_to_unblock_id)}
        )
        
        return True
    
    async def get_blocked_users(
        self, 
        db: Session, 
        user_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Friendship]:
        """Get users blocked by the current user"""
        blocked_relationships = db.query(Friendship).options(
            joinedload(Friendship.user2)
        ).filter(
            and_(
                Friendship.user1_id == user_id,
                Friendship.status == "blocked"
            )
        ).offset(skip).limit(limit).all()
        
        return blocked_relationships
    
    async def is_blocked(
        self, 
        db: Session, 
        user1_id: str, 
        user2_id: str
    ) -> bool:
        """Check if user1 has blocked user2 or vice versa"""
        blocked_relationship = db.query(Friendship).filter(
            and_(
                or_(
                    and_(Friendship.user1_id == user1_id, Friendship.user2_id == user2_id),
                    and_(Friendship.user1_id == user2_id, Friendship.user2_id == user1_id)
                ),
                Friendship.status == "blocked"
            )
        ).first()
        
        return blocked_relationship is not None
    
    async def get_friendship_status(
        self, 
        db: Session, 
        user1_id: str, 
        user2_id: str
    ) -> str:
        """Get the relationship status between two users"""
        if str(user1_id) == str(user2_id):
            return "self"
        
        # Check for blocked relationship
        if await self.is_blocked(db, user1_id, user2_id):
            return "blocked"
        
        # Check for active friendship
        friendship = db.query(Friendship).filter(
            and_(
                or_(
                    and_(Friendship.user1_id == user1_id, Friendship.user2_id == user2_id),
                    and_(Friendship.user1_id == user2_id, Friendship.user2_id == user1_id)
                ),
                Friendship.status == "active"
            )
        ).first()
        
        if friendship:
            return "friends"
        
        # Check for pending friend request
        pending_request = db.query(FriendRequest).filter(
            and_(
                or_(
                    and_(FriendRequest.from_user_id == user1_id, FriendRequest.to_user_id == user2_id),
                    and_(FriendRequest.from_user_id == user2_id, FriendRequest.to_user_id == user1_id)
                ),
                FriendRequest.status == "pending"
            )
        ).first()
        
        if pending_request:
            if str(pending_request.from_user_id) == str(user1_id):
                return "request_sent"
            else:
                return "request_received"
        
        return "none"
    
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
    
    async def _notify_friend_request(self, friend_request: FriendRequest, action: str):
        """Send real-time notification for friend request updates"""
        try:
            # Import here to avoid circular imports
            from app.api.v1.endpoints.websocket import notify_friend_request
            
            request_data = {
                "id": str(friend_request.id),
                "from_user_id": str(friend_request.from_user_id),
                "to_user_id": str(friend_request.to_user_id),
                "status": friend_request.status,
                "action": action,
                "message": friend_request.message,
                "created_at": friend_request.created_at.isoformat() if friend_request.created_at else None
            }
            
            # Notify the recipient
            await notify_friend_request(request_data, str(friend_request.to_user_id))
            
            # Also notify the sender for status updates
            if action in ["accepted", "declined"]:
                await notify_friend_request(request_data, str(friend_request.from_user_id))
                
        except Exception as e:
            # Don't fail the main operation if WebSocket notification fails
            print(f"Failed to send friend request notification: {e}")
    
    async def _notify_friend_status_update(self, user_id: str, friend_data: dict):
        """Send real-time notification for friend status updates"""
        try:
            # Import here to avoid circular imports
            from app.api.v1.endpoints.websocket import notify_friend_status_update
            
            await notify_friend_status_update(friend_data, user_id)
        except Exception as e:
            # Don't fail the main operation if WebSocket notification fails
            print(f"Failed to send friend status update: {e}")
