"""
Social features endpoints - Friend Management System
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.services.social_service import SocialService
from app.schemas.social import (
    FriendRequestCreate, FriendRequestUpdate, FriendRequestResponse, FriendshipResponse
)
from app.schemas.user import UserResponse
from app.models.user import User

router = APIRouter()
social_service = SocialService()


@router.get("/friends", response_model=List[FriendshipResponse])
async def get_user_friends(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all friends for the current user
    
    Returns a list of active friendships with friend details.
    """
    try:
        friendships = await social_service.get_user_friends(
            db, str(current_user.id), skip, limit
        )
        return friendships
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve friends: {str(e)}"
        )


@router.get("/friend-requests/received", response_model=List[FriendRequestResponse])
async def get_received_friend_requests(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get friend requests received by the current user
    
    Returns pending friend requests that need to be accepted or rejected.
    """
    try:
        requests = await social_service.get_friend_requests_received(
            db, str(current_user.id), skip, limit
        )
        return requests
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve friend requests: {str(e)}"
        )


@router.get("/friend-requests/sent", response_model=List[FriendRequestResponse])
async def get_sent_friend_requests(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get friend requests sent by the current user
    
    Returns pending friend requests that are waiting for response.
    """
    try:
        requests = await social_service.get_friend_requests_sent(
            db, str(current_user.id), skip, limit
        )
        return requests
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve sent friend requests: {str(e)}"
        )


@router.get("/users/search", response_model=List[UserResponse])
async def search_users(
    q: str = Query(..., min_length=2, description="Search query (name or email)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search for users to add as friends
    
    - **q**: Search query (minimum 2 characters)
    - Excludes current user, existing friends, and users with pending requests
    """
    try:
        users = await social_service.search_users(
            db, str(current_user.id), q, skip, limit
        )
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search users: {str(e)}"
        )


@router.post("/friend-requests", response_model=FriendRequestResponse, status_code=status.HTTP_201_CREATED)
async def send_friend_request(
    request_data: FriendRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a friend request to another user
    
    - **to_user_id**: ID of the user to send request to
    - **message**: Optional message with the request
    """
    try:
        friend_request = await social_service.send_friend_request(
            db, request_data, str(current_user.id)
        )
        return friend_request
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send friend request: {str(e)}"
        )


@router.put("/friend-requests/{request_id}", response_model=Optional[FriendshipResponse])
async def respond_to_friend_request(
    request_id: str,
    response_data: FriendRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Respond to a friend request (accept or reject)
    
    - **request_id**: ID of the friend request
    - **status**: "accepted" or "rejected"
    
    Returns the created friendship if accepted, null if rejected.
    """
    try:
        friendship = await social_service.respond_to_friend_request(
            db, request_id, response_data, str(current_user.id)
        )
        return friendship
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to respond to friend request: {str(e)}"
        )


@router.delete("/friend-requests/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_friend_request(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel a sent friend request
    
    Only the sender can cancel their own requests.
    """
    try:
        success = await social_service.cancel_friend_request(
            db, request_id, str(current_user.id)
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Friend request not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel friend request: {str(e)}"
        )


@router.delete("/friends/{friendship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_friend(
    friendship_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a friend (unfriend)
    
    Permanently removes the friendship between users.
    """
    try:
        success = await social_service.remove_friend(
            db, friendship_id, str(current_user.id)
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Friendship not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove friend: {str(e)}"
        )


@router.post("/users/{user_id}/block", status_code=status.HTTP_204_NO_CONTENT)
async def block_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Block a user
    
    - Removes existing friendship if any
    - Cancels pending friend requests
    - Prevents future friend requests between users
    """
    try:
        success = await social_service.block_user(
            db, user_id, str(current_user.id)
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to block user: {str(e)}"
        )


@router.delete("/users/{user_id}/block", status_code=status.HTTP_204_NO_CONTENT)
async def unblock_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Unblock a user
    
    Removes the block and allows future interactions.
    """
    try:
        success = await social_service.unblock_user(
            db, user_id, str(current_user.id)
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User is not blocked or not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unblock user: {str(e)}"
        )


@router.get("/blocked-users", response_model=List[FriendshipResponse])
async def get_blocked_users(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get users blocked by the current user
    """
    try:
        blocked_relationships = await social_service.get_blocked_users(
            db, str(current_user.id), skip, limit
        )
        return blocked_relationships
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve blocked users: {str(e)}"
        )


@router.get("/users/{user_id}/relationship-status")
async def get_relationship_status(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the relationship status between current user and another user
    
    Returns one of: "self", "friends", "blocked", "request_sent", "request_received", "none"
    """
    try:
        status_result = await social_service.get_friendship_status(
            db, str(current_user.id), user_id
        )
        return {"status": status_result}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get relationship status: {str(e)}"
        )
