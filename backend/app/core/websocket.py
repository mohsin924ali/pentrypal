"""
WebSocket Connection Manager for Real-time Features
"""
import json
import asyncio
from typing import Dict, List, Set, Optional, Any
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect
import redis.asyncio as redis
from app.core.config import settings


class ConnectionManager:
    """
    Manages WebSocket connections for real-time collaboration
    """
    
    def __init__(self):
        # Active connections: user_id -> list of websockets
        self.active_connections: Dict[str, List[WebSocket]] = {}
        
        # Room subscriptions: room_id -> set of user_ids
        self.room_subscriptions: Dict[str, Set[str]] = {}
        
        # User rooms: user_id -> set of room_ids
        self.user_rooms: Dict[str, Set[str]] = {}
        
        # Redis connection for pub/sub
        self.redis: Optional[redis.Redis] = None
        
        # Background tasks
        self._tasks: Set[asyncio.Task] = set()
    
    async def initialize_redis(self):
        """Initialize Redis connection for pub/sub"""
        try:
            self.redis = redis.from_url(settings.REDIS_URL)
            await self.redis.ping()
            print("✅ Redis connection established for WebSocket manager")
        except Exception as e:
            print(f"❌ Failed to connect to Redis: {e}")
            self.redis = None
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        
        # Send connection confirmation
        await self.send_personal_message({
            "type": "connection_established",
            "message": "Connected to real-time updates",
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id
        }, user_id)
        
        print(f"✅ User {user_id} connected. Total connections: {self.get_total_connections()}")
    
    async def disconnect(self, websocket: WebSocket, user_id: str):
        """Handle WebSocket disconnection"""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            
            # Clean up empty connection lists
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                
                # Remove user from all rooms
                if user_id in self.user_rooms:
                    for room_id in self.user_rooms[user_id].copy():
                        await self.leave_room(user_id, room_id)
                    del self.user_rooms[user_id]
        
        print(f"❌ User {user_id} disconnected. Total connections: {self.get_total_connections()}")
    
    async def join_room(self, user_id: str, room_id: str):
        """Join a user to a room for group notifications"""
        if room_id not in self.room_subscriptions:
            self.room_subscriptions[room_id] = set()
        
        if user_id not in self.user_rooms:
            self.user_rooms[user_id] = set()
        
        self.room_subscriptions[room_id].add(user_id)
        self.user_rooms[user_id].add(room_id)
        
        # Notify user they joined the room
        await self.send_personal_message({
            "type": "room_joined",
            "room_id": room_id,
            "message": f"Joined room {room_id}",
            "timestamp": datetime.utcnow().isoformat()
        }, user_id)
        
        # Notify other room members
        await self.broadcast_to_room({
            "type": "user_joined_room",
            "room_id": room_id,
            "user_id": user_id,
            "message": f"User {user_id} joined the room",
            "timestamp": datetime.utcnow().isoformat()
        }, room_id, exclude_user=user_id)
        
        print(f"👥 User {user_id} joined room {room_id}")
    
    async def leave_room(self, user_id: str, room_id: str):
        """Remove a user from a room"""
        if room_id in self.room_subscriptions:
            self.room_subscriptions[room_id].discard(user_id)
            
            # Clean up empty rooms
            if not self.room_subscriptions[room_id]:
                del self.room_subscriptions[room_id]
        
        if user_id in self.user_rooms:
            self.user_rooms[user_id].discard(room_id)
        
        # Notify other room members
        await self.broadcast_to_room({
            "type": "user_left_room",
            "room_id": room_id,
            "user_id": user_id,
            "message": f"User {user_id} left the room",
            "timestamp": datetime.utcnow().isoformat()
        }, room_id, exclude_user=user_id)
        
        print(f"👋 User {user_id} left room {room_id}")
    
    async def send_personal_message(self, message: Dict[str, Any], user_id: str):
        """Send a message to a specific user"""
        if user_id in self.active_connections:
            message_str = json.dumps(message)
            
            # Send to all user's connections
            disconnected_connections = []
            for websocket in self.active_connections[user_id]:
                try:
                    await websocket.send_text(message_str)
                except Exception as e:
                    print(f"❌ Failed to send message to {user_id}: {e}")
                    disconnected_connections.append(websocket)
            
            # Clean up disconnected connections
            for websocket in disconnected_connections:
                await self.disconnect(websocket, user_id)
    
    async def broadcast_to_room(self, message: Dict[str, Any], room_id: str, exclude_user: Optional[str] = None):
        """Broadcast a message to all users in a room"""
        print(f"🔔 DEBUG: broadcast_to_room called - room: {room_id}, users_in_room: {self.room_subscriptions.get(room_id, [])}")
        
        if room_id not in self.room_subscriptions:
            print(f"❌ DEBUG: Room {room_id} not found in rooms: {list(self.room_subscriptions.keys())}")
            return
        
        message_str = json.dumps(message)
        
        for user_id in self.room_subscriptions[room_id]:
            if exclude_user and user_id == exclude_user:
                continue
            
            print(f"🔔 DEBUG: Trying to send to user {user_id}, connection exists: {user_id in self.active_connections}")
            if user_id in self.active_connections:
                disconnected_connections = []
                for websocket in self.active_connections[user_id]:
                    try:
                        await websocket.send_text(message_str)
                        print(f"✅ DEBUG: Message sent successfully to {user_id}")
                    except Exception as e:
                        print(f"❌ Failed to broadcast to {user_id} in room {room_id}: {e}")
                        disconnected_connections.append(websocket)
                
                # Clean up disconnected connections
                for websocket in disconnected_connections:
                    await self.disconnect(websocket, user_id)
    
    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Broadcast a message to all connected users"""
        message_str = json.dumps(message)
        
        for user_id, connections in self.active_connections.items():
            disconnected_connections = []
            for websocket in connections:
                try:
                    await websocket.send_text(message_str)
                except Exception as e:
                    print(f"❌ Failed to broadcast to {user_id}: {e}")
                    disconnected_connections.append(websocket)
            
            # Clean up disconnected connections
            for websocket in disconnected_connections:
                await self.disconnect(websocket, user_id)
    
    def get_total_connections(self) -> int:
        """Get total number of active connections"""
        return sum(len(connections) for connections in self.active_connections.values())
    
    def get_room_users(self, room_id: str) -> List[str]:
        """Get list of users in a room"""
        return list(self.room_subscriptions.get(room_id, set()))
    
    def get_user_rooms(self, user_id: str) -> List[str]:
        """Get list of rooms a user is in"""
        return list(self.user_rooms.get(user_id, set()))
    
    def is_user_online(self, user_id: str) -> bool:
        """Check if a user is currently online"""
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0
    
    async def send_notification(self, notification: Dict[str, Any], user_id: str):
        """Send a notification to a specific user"""
        notification_message = {
            "type": "notification",
            "data": notification,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(notification_message, user_id)
    
    async def send_list_update(self, list_data: Dict[str, Any], list_id: str):
        """Send shopping list update to all collaborators"""
        room_id = f"list_{list_id}"
        update_message = {
            "type": "list_update",
            "list_id": list_id,
            "data": list_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_room(update_message, room_id)
    
    async def send_item_update(self, item_data: Dict[str, Any], list_id: str):
        """Send shopping item update to all collaborators"""
        room_id = f"list_{list_id}"
        update_message = {
            "type": "item_update",
            "list_id": list_id,
            "data": item_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        print(f"🔔 DEBUG: send_item_update called - room: {room_id}, data: {item_data}")
        await self.broadcast_to_room(update_message, room_id)
    
    async def send_friend_request_notification(self, request_data: Dict[str, Any], user_id: str):
        """Send friend request notification"""
        notification = {
            "type": "friend_request",
            "data": request_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_notification(notification, user_id)
    
    async def send_friend_status_update(self, friend_data: Dict[str, Any], user_id: str):
        """Send friend status update"""
        update_message = {
            "type": "friend_status_update",
            "data": friend_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(update_message, user_id)
    
    async def cleanup(self):
        """Cleanup resources"""
        # Cancel all background tasks
        for task in self._tasks:
            task.cancel()
        
        # Close Redis connection
        if self.redis:
            await self.redis.close()


# Global connection manager instance
connection_manager = ConnectionManager()
