# PentryPal API Documentation

## Overview

PentryPal is a comprehensive REST API with real-time WebSocket support for
collaborative grocery shopping and pantry management. The API provides secure
authentication, collaborative features, and real-time updates for a seamless
user experience.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://api.pentrypal.com`

## API Version

Current API version: `v1` All endpoints are prefixed with `/api/v1`

## Authentication

### JWT Token Authentication

Most endpoints require authentication using JWT tokens. Include the token in the
Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Getting Authentication Tokens

**Login**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email_or_phone": "user@example.com",
  "password": "your_password"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "is_active": true
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 1800
  }
}
```

## API Endpoints

### 🔐 Authentication Endpoints

#### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+1234567890",
  "name": "User Name",
  "password": "SecurePassword123"
}
```

#### Biometric Login

```http
POST /api/v1/auth/biometric
Content-Type: application/json

{
  "user_id": "user-uuid",
  "signature": "biometric_signature",
  "device_id": "device_identifier"
}
```

#### Refresh Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "your_refresh_token"
}
```

### 👤 User Management Endpoints

#### Get Current User

```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

#### Update User Profile

```http
PUT /api/v1/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

#### Change Password

```http
PUT /api/v1/users/me/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "current_password",
  "new_password": "NewSecurePassword123"
}
```

#### Upload Avatar

```http
POST /api/v1/users/me/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

#### Get Security Settings

```http
GET /api/v1/users/me/security
Authorization: Bearer <token>
```

#### Enable Biometric Authentication

```http
POST /api/v1/users/me/biometric/enable
Authorization: Bearer <token>
Content-Type: application/json

{
  "public_key": "biometric_public_key",
  "device_id": "device_identifier"
}
```

### 🛒 Shopping List Endpoints

#### Get User Shopping Lists

```http
GET /api/v1/shopping-lists/
Authorization: Bearer <token>
Query Parameters:
  - status: active|completed|archived
  - skip: 0
  - limit: 100
```

#### Create Shopping List

```http
POST /api/v1/shopping-lists/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Weekly Groceries",
  "description": "Groceries for this week",
  "budget_amount": 150.00,
  "budget_currency": "USD"
}
```

#### Update Shopping List

```http
PUT /api/v1/shopping-lists/{list_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated List Name",
  "status": "completed"
}
```

#### Add Item to List

```http
POST /api/v1/shopping-lists/{list_id}/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Milk",
  "quantity": 2,
  "unit": "bottles",
  "category_id": "category-uuid",
  "notes": "Organic if available"
}
```

#### Update Shopping Item

```http
PUT /api/v1/shopping-lists/{list_id}/items/{item_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "completed": true,
  "actual_price": 4.99,
  "assigned_to": "user-uuid"
}
```

#### Add Collaborator

```http
POST /api/v1/shopping-lists/{list_id}/collaborators
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": "collaborator-uuid",
  "role": "editor",
  "permissions": {
    "can_edit_items": true,
    "can_add_items": true,
    "can_delete_items": false
  }
}
```

### 🏠 Pantry Management Endpoints

#### Get Pantry Items

```http
GET /api/v1/pantry/
Authorization: Bearer <token>
Query Parameters:
  - category_id: filter by category
  - location: filter by storage location
  - expiring_soon: true|false
  - low_stock: true|false
  - search: search term
  - sort_by: name|quantity|expiration_date
  - sort_order: asc|desc
```

#### Add Pantry Item

```http
POST /api/v1/pantry/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Whole Milk",
  "quantity": 2,
  "unit": "bottles",
  "location": "Refrigerator",
  "expiration_date": "2024-01-15",
  "low_stock_threshold": 1,
  "barcode": "123456789012"
}
```

#### Consume Pantry Item

```http
POST /api/v1/pantry/{item_id}/consume
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity_used": 1,
  "notes": "Used for breakfast cereal"
}
```

#### Get Pantry Statistics

```http
GET /api/v1/pantry/stats/overview
Authorization: Bearer <token>
```

**Response:**

```json
{
  "total_items": 25,
  "expiring_soon": 3,
  "expired_items": 1,
  "low_stock_items": 5,
  "categories_count": 8,
  "locations_count": 3
}
```

#### Get Expiring Items

```http
GET /api/v1/pantry/alerts/expiring?days_ahead=7
Authorization: Bearer <token>
```

#### Search by Barcode

```http
GET /api/v1/pantry/barcode/{barcode}
Authorization: Bearer <token>
```

### 👥 Social Features Endpoints

#### Get Friends

```http
GET /api/v1/social/friends
Authorization: Bearer <token>
```

#### Send Friend Request

```http
POST /api/v1/social/friend-requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "to_user_id": "friend-uuid",
  "message": "Let's be friends!"
}
```

#### Respond to Friend Request

```http
PUT /api/v1/social/friend-requests/{request_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted"
}
```

#### Search Users

```http
GET /api/v1/social/users/search?query=john&limit=10
Authorization: Bearer <token>
```

#### Get Relationship Status

```http
GET /api/v1/social/users/{user_id}/relationship-status
Authorization: Bearer <token>
```

#### Block User

```http
POST /api/v1/social/users/{user_id}/block
Authorization: Bearer <token>
```

### 📱 Real-time WebSocket Endpoints

#### WebSocket Connection

```javascript
const ws = new WebSocket('ws://localhost:8000/api/v1/realtime/ws/<jwt_token>');

ws.onopen = function (event) {
  console.log('Connected to WebSocket');
};

ws.onmessage = function (event) {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

#### WebSocket Message Types

**Join Shopping List Room**

```json
{
  "type": "join_list_room",
  "list_id": "list-uuid"
}
```

**Typing Indicator**

```json
{
  "type": "typing_indicator",
  "list_id": "list-uuid",
  "is_typing": true
}
```

**Get Online Status**

```json
{
  "type": "get_online_status",
  "friend_ids": ["friend1-uuid", "friend2-uuid"]
}
```

**Ping/Heartbeat**

```json
{
  "type": "ping",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### WebSocket Events Received

**List Update**

```json
{
  "type": "list_update",
  "list_id": "list-uuid",
  "data": {
    "id": "list-uuid",
    "name": "Updated List Name",
    "action": "updated"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Item Update**

```json
{
  "type": "item_update",
  "list_id": "list-uuid",
  "data": {
    "id": "item-uuid",
    "name": "Milk",
    "completed": true,
    "action": "updated"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Friend Request Notification**

```json
{
  "type": "notification",
  "data": {
    "type": "friend_request",
    "from_user_id": "sender-uuid",
    "message": "New friend request received"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### WebSocket Management Endpoints

**Get Connection Statistics**

```http
GET /api/v1/realtime/ws/stats
```

**Send Notification to User**

```http
POST /api/v1/realtime/ws/notify/{user_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "custom_notification",
  "title": "Important Update",
  "message": "Your list has been updated"
}
```

**Broadcast Message (Admin)**

```http
POST /api/v1/realtime/ws/broadcast
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "system_announcement",
  "title": "Maintenance Notice",
  "message": "System maintenance in 30 minutes"
}
```

## Error Handling

### Standard Error Response Format

```json
{
  "detail": "Error message description",
  "error_code": "SPECIFIC_ERROR_CODE",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

### Common Error Codes

- `INVALID_CREDENTIALS` - Login failed
- `TOKEN_EXPIRED` - JWT token expired
- `INSUFFICIENT_PERMISSIONS` - Access denied
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Default**: 60 requests per minute per user
- **WebSocket**: No rate limiting on messages
- **File uploads**: 10 uploads per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

## Data Models

### User Model

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "phone": "+1234567890",
  "name": "User Name",
  "avatar_url": "https://example.com/avatar.jpg",
  "is_active": true,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

### Shopping List Model

```json
{
  "id": "uuid",
  "name": "Weekly Groceries",
  "description": "Groceries for this week",
  "owner_id": "uuid",
  "status": "active",
  "budget_amount": 150.00,
  "budget_currency": "USD",
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z",
  "items": [...],
  "collaborators": [...]
}
```

### Shopping Item Model

```json
{
  "id": "uuid",
  "list_id": "uuid",
  "name": "Milk",
  "quantity": 2,
  "unit": "bottles",
  "completed": false,
  "estimated_price": 4.99,
  "actual_price": null,
  "assigned_to": "uuid",
  "notes": "Organic if available",
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

### Pantry Item Model

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Whole Milk",
  "quantity": 2,
  "unit": "bottles",
  "location": "Refrigerator",
  "expiration_date": "2024-01-15",
  "low_stock_threshold": 1,
  "barcode": "123456789012",
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

## SDK Examples

### JavaScript/TypeScript Example

```typescript
class PentryPalAPI {
  private baseURL = 'http://localhost:8000/api/v1';
  private token: string | null = null;
  private ws: WebSocket | null = null;

  async login(emailOrPhone: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_or_phone: emailOrPhone, password }),
    });

    const data = await response.json();
    this.token = data.tokens.access_token;
    return data;
  }

  async getShoppingLists() {
    const response = await fetch(`${this.baseURL}/shopping-lists/`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.json();
  }

  connectWebSocket() {
    this.ws = new WebSocket(
      `ws://localhost:8000/api/v1/realtime/ws/${this.token}`
    );

    this.ws.onmessage = event => {
      const message = JSON.parse(event.data);
      this.handleWebSocketMessage(message);
    };
  }

  private handleWebSocketMessage(message: any) {
    switch (message.type) {
      case 'list_update':
        console.log('List updated:', message.data);
        break;
      case 'item_update':
        console.log('Item updated:', message.data);
        break;
      case 'notification':
        console.log('Notification:', message.data);
        break;
    }
  }
}
```

### Python Example

```python
import requests
import websocket
import json

class PentryPalAPI:
    def __init__(self, base_url="http://localhost:8000/api/v1"):
        self.base_url = base_url
        self.token = None

    def login(self, email_or_phone, password):
        response = requests.post(f"{self.base_url}/auth/login", json={
            "email_or_phone": email_or_phone,
            "password": password
        })
        data = response.json()
        self.token = data["tokens"]["access_token"]
        return data

    def get_shopping_lists(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{self.base_url}/shopping-lists/", headers=headers)
        return response.json()

    def connect_websocket(self):
        ws_url = f"ws://localhost:8000/api/v1/realtime/ws/{self.token}"
        ws = websocket.WebSocket()
        ws.connect(ws_url)
        return ws
```

## Testing

### Using curl

**Login and get token:**

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email_or_phone": "user@example.com", "password": "password"}'
```

**Get shopping lists:**

```bash
curl -X GET "http://localhost:8000/api/v1/shopping-lists/" \
  -H "Authorization: Bearer <your_token>"
```

**Create shopping list:**

```bash
curl -X POST "http://localhost:8000/api/v1/shopping-lists/" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test List", "description": "Test description"}'
```

### WebSocket Testing with wscat

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c "ws://localhost:8000/api/v1/realtime/ws/<your_token>"

# Send messages
{"type": "ping", "timestamp": "2024-01-01T12:00:00Z"}
{"type": "join_list_room", "list_id": "your-list-id"}
```

## Support

For API support and questions:

- **Email**: support@pentrypal.com
- **Documentation**: Available at `/api/v1/docs` (Swagger UI)
- **Alternative Docs**: Available at `/api/v1/redoc` (ReDoc)

## Changelog

### Version 1.0.0

- Initial API release
- JWT authentication
- Shopping list management
- Pantry management
- Social features
- Real-time WebSocket support
- Biometric authentication
- Comprehensive documentation
