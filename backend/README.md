# PentryPal Backend API

A comprehensive REST API with real-time WebSocket support for collaborative
grocery shopping and pantry management.

## 🚀 Features

- **🔐 JWT Authentication** - Secure user authentication with email/phone
  support
- **🛒 Shopping Lists** - Collaborative shopping list management with real-time
  updates
- **🏠 Pantry Management** - Complete inventory tracking with expiration
  monitoring
- **👥 Social Features** - Friend management, requests, and collaboration
- **📱 Real-time Updates** - WebSocket support for live collaboration
- **🔒 Security** - Biometric authentication, secure sessions, and privacy
  controls
- **📊 Analytics** - Comprehensive activity logging and statistics
- **🔍 Search & Filter** - Advanced search and filtering capabilities
- **📱 Mobile Ready** - Optimized for mobile app integration

## 🏗️ Architecture

### Technology Stack

- **FastAPI** - Modern, fast web framework for building APIs
- **PostgreSQL** - Robust relational database
- **Redis** - In-memory data store for WebSocket and caching
- **SQLAlchemy** - Python SQL toolkit and ORM
- **Alembic** - Database migration tool
- **Pydantic** - Data validation using Python type annotations
- **WebSockets** - Real-time bidirectional communication
- **Docker** - Containerization for easy deployment

### Database Schema

```
Users ──┬── UserPreferences
        ├── SecuritySettings ──── BiometricKeys
        ├── ShoppingLists ──┬── ShoppingItems
        │                   └── ListCollaborators
        ├── PantryItems
        ├── Friendships
        ├── FriendRequests
        └── ActivityLogs

ItemCategories ──── ShoppingItems
                └── PantryItems
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)
- PostgreSQL 15+ (if running locally)
- Redis 7+ (if running locally)

### Using Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd pentrypal-next/backend
   ```

2. **Environment Setup**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the services**

   ```bash
   docker-compose up -d
   ```

4. **Initialize the database**

   ```bash
   docker-compose exec api python init_db.py
   ```

5. **Access the API**
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/api/v1/docs
   - Alternative Docs: http://localhost:8000/api/v1/redoc

### Local Development Setup

1. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables**

   ```bash
   export DATABASE_URL="postgresql://user:password@localhost:5432/pentrypal_db"
   export REDIS_URL="redis://localhost:6379/0"
   export JWT_SECRET_KEY="your-secret-key"
   ```

3. **Run database migrations**

   ```bash
   alembic upgrade head
   ```

4. **Start the development server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

### Comprehensive Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API
documentation with examples.

### Postman Collection

Import the
[PentryPal_API.postman_collection.json](./PentryPal_API.postman_collection.json)
file into Postman for easy API testing.

## 🔧 Configuration

### Environment Variables

| Variable                          | Description                  | Default                     |
| --------------------------------- | ---------------------------- | --------------------------- |
| `DATABASE_URL`                    | PostgreSQL connection string | `postgresql://...`          |
| `REDIS_URL`                       | Redis connection string      | `redis://localhost:6379/0`  |
| `JWT_SECRET_KEY`                  | JWT signing secret           | `your-secret-key`           |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Access token expiry          | `30`                        |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS`   | Refresh token expiry         | `7`                         |
| `DEBUG`                           | Enable debug mode            | `False`                     |
| `BACKEND_CORS_ORIGINS`            | Allowed CORS origins         | `["http://localhost:3000"]` |
| `RATE_LIMIT_PER_MINUTE`           | API rate limit               | `60`                        |
| `MAX_FILE_SIZE_MB`                | Max upload file size         | `10`                        |

### Docker Configuration

The application runs in Docker containers:

- **API Container**: FastAPI application
- **PostgreSQL Container**: Database
- **Redis Container**: Cache and WebSocket support

## 🔌 WebSocket Integration

### Connection

Connect to WebSocket using JWT token:

```javascript
const ws = new WebSocket('ws://localhost:8000/api/v1/realtime/ws/<jwt_token>');
```

### Message Types

**Client to Server:**

- `join_list_room` - Join shopping list collaboration
- `leave_list_room` - Leave shopping list room
- `typing_indicator` - Show typing status
- `get_online_status` - Check friends online status
- `ping` - Connection heartbeat

**Server to Client:**

- `list_update` - Shopping list changes
- `item_update` - Shopping item changes
- `notification` - Real-time notifications
- `friend_request` - Friend request notifications
- `online_status_update` - Friend status changes

### Example Usage

```javascript
// Connect to WebSocket
const ws = new WebSocket(
  'ws://localhost:8000/api/v1/realtime/ws/' + accessToken
);

// Join a shopping list room
ws.send(
  JSON.stringify({
    type: 'join_list_room',
    list_id: 'your-list-id',
  })
);

// Listen for updates
ws.onmessage = function (event) {
  const message = JSON.parse(event.data);
  switch (message.type) {
    case 'list_update':
      console.log('List updated:', message.data);
      break;
    case 'item_update':
      console.log('Item updated:', message.data);
      break;
  }
};
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py
```

### Manual Testing

Use the provided Postman collection or curl commands:

```bash
# Login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email_or_phone": "test@example.com", "password": "password"}'

# Get shopping lists
curl -X GET "http://localhost:8000/api/v1/shopping-lists/" \
  -H "Authorization: Bearer <your_token>"
```

## 📊 Database Management

### Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Database Initialization

```bash
# Initialize database with sample data
python init_db.py
```

## 🔒 Security

### Authentication

- JWT tokens with configurable expiry
- Secure password hashing with bcrypt
- Biometric authentication support
- Session management with Redis

### Authorization

- Role-based access control for shopping lists
- Permission-based collaboration
- User isolation and data privacy
- Rate limiting and request validation

### Data Protection

- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy
- CORS configuration
- Secure headers and middleware

## 📈 Monitoring and Logging

### Health Checks

- **Health endpoint**: `GET /health`
- **Database connectivity**: Automatic health checks
- **Redis connectivity**: Connection monitoring

### Logging

- Structured logging with configurable levels
- Request/response logging
- Error tracking and reporting
- Activity logging for audit trails

### Metrics

- API response times
- Database query performance
- WebSocket connection statistics
- User activity metrics

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**

   ```bash
   # Set production environment variables
   export DEBUG=False
   export DATABASE_URL="postgresql://prod_user:prod_pass@db_host:5432/pentrypal_prod"
   export JWT_SECRET_KEY="secure-production-key"
   ```

2. **Database Setup**

   ```bash
   # Run migrations
   alembic upgrade head
   ```

3. **Start Services**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Scaling

- **Horizontal Scaling**: Multiple API instances with load balancer
- **Database Scaling**: Read replicas and connection pooling
- **Redis Scaling**: Redis Cluster for WebSocket scaling
- **CDN Integration**: Static file serving and caching

## 🛠️ Development

### Code Structure

```
app/
├── api/                 # API routes and endpoints
│   └── v1/
│       └── endpoints/   # Individual endpoint modules
├── core/               # Core functionality
│   ├── config.py       # Configuration settings
│   ├── security.py     # Authentication utilities
│   └── websocket.py    # WebSocket connection manager
├── db/                 # Database configuration
├── models/             # SQLAlchemy models
├── schemas/            # Pydantic schemas
├── services/           # Business logic layer
└── main.py            # FastAPI application entry point
```

### Code Quality

- **Type Hints**: Full type annotation coverage
- **Linting**: flake8, black, isort
- **Testing**: pytest with coverage reporting
- **Documentation**: Comprehensive docstrings

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run quality checks
5. Submit a pull request

## 📝 API Endpoints Summary

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/biometric` - Biometric login
- `POST /auth/refresh` - Token refresh

### User Management

- `GET /users/me` - Get current user
- `PUT /users/me` - Update user profile
- `PUT /users/me/password` - Change password
- `POST /users/me/avatar` - Upload avatar
- `GET /users/me/security` - Get security settings

### Shopping Lists

- `GET /shopping-lists/` - Get user's lists
- `POST /shopping-lists/` - Create new list
- `PUT /shopping-lists/{id}` - Update list
- `POST /shopping-lists/{id}/items` - Add item
- `PUT /shopping-lists/{id}/items/{item_id}` - Update item
- `POST /shopping-lists/{id}/collaborators` - Add collaborator

### Pantry Management

- `GET /pantry/` - Get pantry items
- `POST /pantry/` - Add pantry item
- `GET /pantry/stats/overview` - Get statistics
- `GET /pantry/alerts/expiring` - Get expiring items
- `GET /pantry/barcode/{barcode}` - Search by barcode

### Social Features

- `GET /social/friends` - Get friends list
- `POST /social/friend-requests` - Send friend request
- `GET /social/users/search` - Search users
- `PUT /social/friend-requests/{id}` - Respond to request

### Real-time Features

- `WS /realtime/ws/{token}` - WebSocket connection
- `GET /realtime/ws/stats` - Connection statistics
- `POST /realtime/ws/notify/{user_id}` - Send notification

## 🤝 Support

- **Documentation**: Available at `/api/v1/docs`
- **Issues**: GitHub Issues
- **Email**: support@pentrypal.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 🙏 Acknowledgments

- FastAPI for the excellent web framework
- SQLAlchemy for robust ORM capabilities
- PostgreSQL for reliable data storage
- Redis for real-time features
- Docker for containerization
