"""WebSocket connection manager"""
from fastapi import WebSocket
from typing import Dict, Set, Any
import logging
import json

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections for real-time game updates"""
    
    def __init__(self):
        # user_id -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}
        # room_id -> Set[user_id]
        self.rooms: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept new WebSocket connection"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, user_id: str):
        """Remove WebSocket connection"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected. Total connections: {len(self.active_connections)}")
        
        # Remove from all rooms
        for room_id in list(self.rooms.keys()):
            if user_id in self.rooms[room_id]:
                self.rooms[room_id].remove(user_id)
                if not self.rooms[room_id]:
                    del self.rooms[room_id]
    
    async def send_personal_message(self, message: Dict[str, Any], user_id: str):
        """Send message to specific user"""
        websocket = self.active_connections.get(user_id)
        if websocket:
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Failed to send message to {user_id}: {e}")
                self.disconnect(user_id)
    
    async def broadcast(self, message: Dict[str, Any], room: str = None):
        """Broadcast message to all users or specific room"""
        if room:
            # Send to room members
            user_ids = self.rooms.get(room, set())
            for user_id in user_ids:
                await self.send_personal_message(message, user_id)
        else:
            # Send to all connected users
            for user_id in list(self.active_connections.keys()):
                await self.send_personal_message(message, user_id)
    
    def join_room(self, user_id: str, room_id: str):
        """Add user to room"""
        if room_id not in self.rooms:
            self.rooms[room_id] = set()
        self.rooms[room_id].add(user_id)
        logger.info(f"User {user_id} joined room {room_id}")
    
    def leave_room(self, user_id: str, room_id: str):
        """Remove user from room"""
        if room_id in self.rooms and user_id in self.rooms[room_id]:
            self.rooms[room_id].remove(user_id)
            if not self.rooms[room_id]:
                del self.rooms[room_id]
            logger.info(f"User {user_id} left room {room_id}")

manager = ConnectionManager()
