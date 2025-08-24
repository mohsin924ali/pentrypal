#!/usr/bin/env python3
"""
WebSocket Test Client for PentryPal Real-time Features
"""
import asyncio
import json
import websockets
import requests
from datetime import datetime


async def test_websocket_connection():
    """Test WebSocket connection and real-time features"""
    
    # First, get an authentication token
    print("🔐 Getting authentication token...")
    
    login_response = requests.post("http://localhost:8000/api/v1/auth/login", json={
        "email_or_phone": "test@example.com",
        "password": "NewTestPassword456"  # Updated password from our tests
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    token_data = login_response.json()
    access_token = token_data["tokens"]["access_token"]
    user_id = token_data["user"]["id"]
    
    print(f"✅ Authenticated as user: {user_id}")
    
    # Connect to WebSocket
    websocket_url = f"ws://localhost:8000/api/v1/realtime/ws/{access_token}"
    
    try:
        print(f"🔌 Connecting to WebSocket: {websocket_url}")
        
        async with websockets.connect(websocket_url) as websocket:
            print("✅ WebSocket connected successfully!")
            
            # Listen for initial connection message
            try:
                initial_message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print(f"📨 Received initial message: {initial_message}")
            except asyncio.TimeoutError:
                print("⏰ No initial message received (timeout)")
            
            # Test different message types
            test_messages = [
                {
                    "type": "ping",
                    "timestamp": datetime.utcnow().isoformat()
                },
                {
                    "type": "get_online_status",
                    "friend_ids": [user_id]
                },
                {
                    "type": "join_list_room",
                    "list_id": "test-list-123"
                }
            ]
            
            for i, message in enumerate(test_messages, 1):
                print(f"\n📤 Test {i}: Sending message: {message['type']}")
                await websocket.send(json.dumps(message))
                
                # Wait for response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=3.0)
                    print(f"📨 Response: {response}")
                except asyncio.TimeoutError:
                    print("⏰ No response received (timeout)")
                
                await asyncio.sleep(1)  # Small delay between tests
            
            # Test typing indicator
            print(f"\n📤 Test 4: Sending typing indicator")
            typing_message = {
                "type": "typing_indicator",
                "list_id": "test-list-123",
                "is_typing": True
            }
            await websocket.send(json.dumps(typing_message))
            
            # Wait a bit for any responses
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                print(f"📨 Response: {response}")
            except asyncio.TimeoutError:
                print("⏰ No response received for typing indicator")
            
            print("\n✅ WebSocket tests completed successfully!")
            
    except websockets.exceptions.ConnectionClosed as e:
        print(f"❌ WebSocket connection closed: {e}")
    except websockets.exceptions.InvalidStatusCode as e:
        print(f"❌ WebSocket connection failed with status: {e}")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")


async def test_websocket_stats():
    """Test WebSocket statistics endpoint"""
    print("\n📊 Testing WebSocket stats...")
    
    response = requests.get("http://localhost:8000/api/v1/realtime/ws/stats")
    if response.status_code == 200:
        stats = response.json()
        print(f"✅ WebSocket Stats: {stats}")
    else:
        print(f"❌ Failed to get stats: {response.text}")


if __name__ == "__main__":
    print("🚀 Starting WebSocket tests for PentryPal...")
    
    # Run the tests
    asyncio.run(test_websocket_connection())
    asyncio.run(test_websocket_stats())
    
    print("\n🎉 All tests completed!")
