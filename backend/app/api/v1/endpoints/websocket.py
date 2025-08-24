"""
WebSocket endpoints for real-time collaboration
"""
import json
from typing import Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.websocket import connection_manager
from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.services.auth_service import AuthService
from app.services.shopping_list_service import ShoppingListService
from app.services.social_service import SocialService

router = APIRouter()
auth_service = AuthService()
shopping_list_service = ShoppingListService()
social_service = SocialService()


async def get_user_from_token(token: str, db: Session) -> str:
    """Extract user ID from WebSocket token"""
    try:
        user = await auth_service.get_current_user(db, token)
        return str(user.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )


@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    """
    Main WebSocket endpoint for real-time updates
    
    Authentication is done via token in the URL path
    """
    from app.db.database import SessionLocal
    
    db = SessionLocal()
    
    try:
        # Authenticate user
        user_id = await get_user_from_token(token, db)
        
        # Connect user
        await connection_manager.connect(websocket, user_id)
        
        try:
            while True:
                # Receive message from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                await handle_websocket_message(message, user_id, db)
                
        except WebSocketDisconnect:
            await connection_manager.disconnect(websocket, user_id)
            
    except HTTPException:
        # Authentication failed
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
    finally:
        db.close()


async def handle_websocket_message(message: Dict[str, Any], user_id: str, db: Session):
    """Handle incoming WebSocket messages"""
    message_type = message.get("type")
    
    if message_type == "join_list_room":
        # Join a shopping list room for real-time updates
        list_id = message.get("list_id")
        if list_id:
            # Verify user has access to the list
            shopping_list = await shopping_list_service.get_shopping_list_by_id(db, list_id, user_id)
            if shopping_list:
                room_id = f"list_{list_id}"
                await connection_manager.join_room(user_id, room_id)
            else:
                await connection_manager.send_personal_message({
                    "type": "error",
                    "message": "Access denied to shopping list",
                    "list_id": list_id
                }, user_id)
    
    elif message_type == "leave_list_room":
        # Leave a shopping list room
        list_id = message.get("list_id")
        if list_id:
            room_id = f"list_{list_id}"
            await connection_manager.leave_room(user_id, room_id)
    
    elif message_type == "ping":
        # Heartbeat/ping message
        await connection_manager.send_personal_message({
            "type": "pong",
            "timestamp": message.get("timestamp")
        }, user_id)
    
    elif message_type == "get_online_status":
        # Get online status of friends
        friend_ids = message.get("friend_ids", [])
        online_status = {}
        
        for friend_id in friend_ids:
            online_status[friend_id] = connection_manager.is_user_online(friend_id)
        
        await connection_manager.send_personal_message({
            "type": "online_status_update",
            "data": online_status
        }, user_id)
    
    elif message_type == "typing_indicator":
        # Handle typing indicators for collaborative editing
        list_id = message.get("list_id")
        is_typing = message.get("is_typing", False)
        
        if list_id:
            room_id = f"list_{list_id}"
            await connection_manager.broadcast_to_room({
                "type": "typing_indicator",
                "list_id": list_id,
                "user_id": user_id,
                "is_typing": is_typing
            }, room_id, exclude_user=user_id)
    
    else:
        # Unknown message type
        await connection_manager.send_personal_message({
            "type": "error",
            "message": f"Unknown message type: {message_type}"
        }, user_id)


@router.get("/ws/stats")
async def get_websocket_stats():
    """Get WebSocket connection statistics"""
    return {
        "total_connections": connection_manager.get_total_connections(),
        "active_users": len(connection_manager.active_connections),
        "active_rooms": len(connection_manager.room_subscriptions),
        "timestamp": "2024-01-01T00:00:00Z"  # You might want to use actual timestamp
    }


@router.post("/ws/broadcast")
async def broadcast_message(
    message: Dict[str, Any],
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Broadcast a message to all connected users (admin only)
    This endpoint could be restricted to admin users
    """
    await connection_manager.broadcast_to_all({
        "type": "admin_broadcast",
        "data": message,
        "from_user": str(current_user.id)
    })
    
    return {"message": "Broadcast sent successfully"}


@router.post("/ws/notify/{user_id}")
async def send_notification_to_user(
    user_id: str,
    notification: Dict[str, Any],
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a notification to a specific user
    """
    await connection_manager.send_notification(notification, user_id)
    
    return {"message": f"Notification sent to user {user_id}"}


# Integration functions for other services to use

async def notify_list_update(list_data: Dict[str, Any], list_id: str):
    """Notify all list collaborators of an update"""
    await connection_manager.send_list_update(list_data, list_id)


async def notify_item_update(item_data: Dict[str, Any], list_id: str):
    """Notify all list collaborators of an item update"""
    await connection_manager.send_item_update(item_data, list_id)


async def notify_friend_request(request_data: Dict[str, Any], user_id: str):
    """Notify user of a new friend request"""
    await connection_manager.send_friend_request_notification(request_data, user_id)


async def notify_friend_status_update(friend_data: Dict[str, Any], user_id: str):
    """Notify user of friend status changes"""
    await connection_manager.send_friend_status_update(friend_data, user_id)


async def get_user_online_status(user_id: str) -> bool:
    """Check if a user is currently online"""
    return connection_manager.is_user_online(user_id)
