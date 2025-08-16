# VOE Technical Documentation

## System Architecture

### Overview
The VOE (Voice of Employee) application follows a modern three-tier architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 18.x
- **State Management**: React Hooks (useState, useContext, useReducer)
- **HTTP Client**: Fetch API with custom hooks
- **Styling**: CSS Modules / Styled Components (to be implemented)
- **UI Components**: Custom component library
- **Internationalization**: React-i18next (for Thai/English support)
- **Build Tool**: Create React App (Webpack under the hood)

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **ORM**: Sequelize 6.x
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: express-validator
- **Security**: Helmet.js, CORS, Rate limiting
- **File Upload**: Multer
- **Email**: Nodemailer
- **Logging**: Morgan + Custom structured logging

#### Database
- **Primary DB**: PostgreSQL 15+
- **ORM**: Sequelize with migrations
- **Connection Pooling**: Built-in Sequelize pool
- **Backup**: pg_dump (automated daily backups recommended)

#### Development & Deployment
- **Process Manager**: PM2 (production)
- **Development**: Nodemon + Concurrently
- **Environment**: dotenv for configuration
- **Version Control**: Git
- **CI/CD**: GitHub Actions / Azure DevOps (future)

## Database Schema

### Entity Relationship Diagram

```
Users ──┐
        │
        ├── Departments
        │
        ├── Ideas ──┬── IdeaCategories
        │           │
        │           ├── IdeaVotes
        │           │
        │           ├── IdeaComments ──┐
        │           │                  │
        │           │                  └── (self-reference for replies)
        │           │
        │           ├── IdeaStatusHistory
        │           │
        │           ├── IdeaOwners
        │           │
        │           └── Attachments
        │
        ├── Notifications
        │
        └── AuditLogs
```

### Table Specifications

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    employee_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    role user_role_enum DEFAULT 'employee',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE user_role_enum AS ENUM ('employee', 'moderator', 'executive', 'admin');
```

#### Ideas Table
```sql
CREATE TABLE ideas (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES idea_categories(id),
    creator_id INTEGER NOT NULL REFERENCES users(id),
    status idea_status_enum DEFAULT 'submitted',
    visibility idea_visibility_enum DEFAULT 'public',
    attachment_count INTEGER DEFAULT 0,
    vote_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    expected_benefit TEXT,
    implementation_notes TEXT,
    due_date TIMESTAMP,
    closed_reason TEXT,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE idea_status_enum AS ENUM (
    'submitted', 'under_review', 'shortlisted', 
    'in_pilot', 'implemented', 'closed'
);

CREATE TYPE idea_visibility_enum AS ENUM ('public', 'department', 'private');
```

### Indexes and Performance

```sql
-- Performance indexes
CREATE INDEX idx_ideas_creator_id ON ideas(creator_id);
CREATE INDEX idx_ideas_category_id ON ideas(category_id);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_created_at ON ideas(created_at);
CREATE INDEX idx_idea_votes_idea_user ON idea_votes(idea_id, user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

## API Architecture

### RESTful Design Principles

The API follows REST conventions with consistent URL patterns:

```
/api/{resource}              # Collection operations
/api/{resource}/{id}         # Individual resource operations
/api/{resource}/{id}/{sub}   # Sub-resource operations
```

### Authentication & Authorization

#### JWT Token Flow
```
1. User login with email/password
2. Server validates credentials
3. Server generates JWT with user info
4. Client stores JWT (localStorage/sessionStorage)
5. Client includes JWT in Authorization header
6. Server validates JWT on each request
7. Server extracts user info from token
```

#### Token Structure
```json
{
  "userId": 123,
  "role": "employee",
  "iat": 1234567890,
  "exp": 1234567890
}
```

#### Authorization Middleware
```javascript
// Role-based access control
const requireRole = (roles) => (req, res, next) => {
    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
            success: false,
            message: 'Insufficient permissions'
        });
    }
    next();
};
```

### Error Handling

#### Standardized Error Response
```json
{
    "success": false,
    "message": "Human-readable error message",
    "errors": [
        {
            "field": "email",
            "message": "Valid email is required"
        }
    ],
    "code": "VALIDATION_ERROR",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Error Categories
1. **Validation Errors** (400): Input validation failures
2. **Authentication Errors** (401): Invalid/missing tokens
3. **Authorization Errors** (403): Insufficient permissions
4. **Not Found Errors** (404): Resource doesn't exist
5. **Conflict Errors** (409): Duplicate resources
6. **Server Errors** (500): Unexpected server issues

### Request/Response Patterns

#### Successful Response Format
```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": {
        // Response payload
    },
    "metadata": {
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 50,
            "pages": 5
        }
    }
}
```

## Security Implementation

### Authentication Security

#### Password Hashing
```javascript
const bcrypt = require('bcryptjs');

// Hash password before storing
const hashPassword = async (password) => {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, rounds);
};

// Validate password
const validatePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};
```

#### JWT Security
- **Secret Key**: Strong, randomly generated key stored in environment
- **Expiration**: Configurable token lifetime (default: 7 days)
- **Refresh**: Implement refresh token mechanism (future enhancement)

### Input Validation

```javascript
const { body, validationResult } = require('express-validator');

const validateCreateIdea = [
    body('title')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
    body('description')
        .trim()
        .isLength({ min: 20, max: 5000 })
        .withMessage('Description must be between 20 and 5000 characters'),
    body('category_id')
        .isInt({ min: 1 })
        .withMessage('Valid category ID is required')
];
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    }
});
```

### CORS Configuration

```javascript
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
```

## Data Flow & State Management

### Frontend State Flow

```
User Action → API Call → Update Local State → Re-render UI
     ↓
   Loading State → Success/Error → Update UI
```

#### Custom Hooks Pattern
```javascript
// useIdeas hook
const useIdeas = (filters = {}) => {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchIdeas = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/ideas', { params: filters });
            setIdeas(response.data.ideas);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchIdeas();
    }, [fetchIdeas]);

    return { ideas, loading, error, refetch: fetchIdeas };
};
```

### Backend Request Flow

```
1. Request → Middleware (Auth, Validation, Rate Limit)
2. Controller → Business Logic
3. Model → Database Query
4. Response → Audit Log → Client
```

## Performance Optimization

### Database Optimization

#### Query Optimization
```javascript
// Use includes to prevent N+1 queries
const ideas = await Idea.findAll({
    include: [
        { model: User, as: 'creator', attributes: ['name', 'employee_no'] },
        { model: IdeaCategory, as: 'category' }
    ],
    limit: 20,
    offset: page * 20
});

// Use eager loading for related data
const idea = await Idea.findByPk(id, {
    include: [
        'creator',
        'category', 
        'votes',
        { model: IdeaComment, as: 'comments', include: ['user'] }
    ]
});
```

#### Indexing Strategy
```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_ideas_status_created_at ON ideas(status, created_at);
CREATE INDEX idx_ideas_creator_category ON ideas(creator_id, category_id);
CREATE INDEX idx_vote_idea_user ON idea_votes(idea_id, user_id);
```

### Caching Strategy (Future Implementation)

1. **Redis Cache**: Session storage and frequent queries
2. **Application Cache**: Static data (categories, departments)
3. **HTTP Cache**: Client-side caching headers
4. **Database Cache**: Query result caching

### Frontend Optimization

#### Code Splitting
```javascript
// Lazy loading for routes
const Dashboard = lazy(() => import('./components/Dashboard'));
const IdeaBoard = lazy(() => import('./components/IdeaBoard'));

// Route-based code splitting
<Suspense fallback={<LoadingSpinner />}>
    <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ideas" element={<IdeaBoard />} />
    </Routes>
</Suspense>
```

#### Memoization
```javascript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
    return ideas.filter(idea => idea.status === 'shortlisted')
                .sort((a, b) => b.vote_count - a.vote_count);
}, [ideas]);

// Memoize callback functions
const handleVote = useCallback((ideaId, voteType) => {
    // Vote handling logic
}, []);
```

## Monitoring & Logging

### Structured Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});
```

### Audit Trail

```javascript
// Audit log entry example
{
    "id": 12345,
    "actor_id": 123,
    "action": "create",
    "entity": "idea",
    "entity_id": 456,
    "detail": {
        "title": "New Innovation Idea",
        "category_id": 2,
        "ip_address": "192.168.1.100"
    },
    "created_at": "2024-01-15T10:30:00Z"
}
```

### Health Monitoring

```javascript
// Health check endpoint
app.get('/api/health', async (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            database: await checkDatabase(),
            email: await checkEmailService(),
            storage: await checkFileStorage()
        }
    };
    
    const isHealthy = Object.values(health.services)
                           .every(service => service.status === 'ok');
    
    res.status(isHealthy ? 200 : 503).json(health);
});
```

## Testing Strategy

### Unit Testing
```javascript
// Jest + Supertest for API testing
describe('Ideas API', () => {
    test('POST /api/ideas creates new idea', async () => {
        const response = await request(app)
            .post('/api/ideas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Test Idea',
                description: 'This is a test idea description',
                category_id: 1
            });
            
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.idea.title).toBe('Test Idea');
    });
});
```

### Integration Testing
```javascript
// Database integration tests
describe('Idea Model', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true });
        // Seed test data
    });

    test('should create idea with auto-generated code', async () => {
        const idea = await Idea.create({
            title: 'Test Idea',
            description: 'Test description',
            creator_id: 1,
            category_id: 1
        });

        expect(idea.code).toMatch(/^VOE-\d{6}-[A-Z0-9]{3}$/);
    });
});
```

## Deployment Architecture

### Production Setup

```bash
# PM2 ecosystem configuration
module.exports = {
    apps: [{
        name: 'voe-api',
        script: './server/src/app.js',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'production',
            PORT: 5000
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log'
    }]
};
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install && cd client && npm install

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name voe.company.com;

    # API routes
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static files
    location / {
        root /app/client/build;
        try_files $uri $uri/ /index.html;
    }
}
```

## Future Technical Enhancements

### Phase 2 Technical Features

1. **Microservices Architecture**: Break down monolith into services
2. **Event-Driven Architecture**: Implement event sourcing
3. **Real-time Updates**: WebSocket connections for live updates
4. **Advanced Caching**: Redis implementation
5. **Search Engine**: Elasticsearch for full-text search
6. **Message Queue**: Bull/Bee-Queue for background jobs
7. **Container Orchestration**: Kubernetes deployment
8. **Monitoring**: Prometheus + Grafana
9. **AI/ML Pipeline**: TensorFlow.js for idea analysis
10. **Mobile API**: GraphQL endpoint for mobile apps

### Scalability Considerations

1. **Database Sharding**: Horizontal partitioning by department
2. **Read Replicas**: Separate read/write database instances
3. **CDN Integration**: CloudFront for static assets
4. **Load Balancing**: Multiple application instances
5. **Session Storage**: External session store (Redis)
6. **File Storage**: S3/Azure Blob for attachments
7. **API Gateway**: Rate limiting and request routing
8. **Monitoring**: APM tools for performance tracking

---

This technical documentation provides the foundation for understanding, maintaining, and extending the VOE application architecture.
