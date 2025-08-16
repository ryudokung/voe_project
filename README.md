# VOE (Voice of Employee) Web Application

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)

## Overview

VOE (Voice of Employee) is a comprehensive web application designed to collect, manage, and track employee ideas and feedback within an organization. This Phase 1 implementation focuses on core functionality without AI features, providing a solid foundation for employee idea management, voting, and workflow tracking.

### Key Features

- **💡 Idea Management**: Create, edit, and categorize employee ideas
- **🗳️ Voting System**: Vote and comment on ideas with transparent tracking
- **📊 Dashboard & Analytics**: Real-time KPI tracking and idea-to-action metrics
- **🔄 Workflow Management**: Status tracking from submission to implementation
- **👥 Role-based Access Control**: Employee, Moderator, Executive, and Admin roles
- **🔒 Security**: JWT authentication, audit logging, and data protection
- **📱 Responsive Design**: Mobile-friendly interface with Thai/English support
- **📁 File Attachments**: Support for documents and images

## Architecture

This application follows a full-stack architecture with:

- **Frontend**: React.js with responsive design
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT-based with local authentication (SSO-ready)
- **Security**: Helmet.js, rate limiting, CSRF protection

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone and setup the project:**
   ```bash
   git clone <repository-url>
   cd voe
   npm install
   ```

2. **Install client dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Database setup:**
   ```bash
   # Create PostgreSQL database
   createdb voe_db
   
   # Copy environment configuration
   cp .env.example .env
   ```

4. **Configure environment variables:**
   ```bash
   # Edit .env file with your database credentials
   nano .env
   ```

5. **Start the application:**
   ```bash
   # Development mode (both client and server)
   npm run dev:full
   
   # Or run separately
   npm run server  # Backend on port 5000
   npm run client  # Frontend on port 3000
   ```

### Initial Setup

1. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Health check: http://localhost:5000/api/health

2. **Create admin account:**
   The first user registered will need to be manually promoted to admin role via database.

## User Roles & Permissions

### Employee
- Create and edit own ideas
- Vote on others' ideas (1 vote per idea)
- Comment on ideas
- View public and department-visible ideas

### Moderator (VoE Squad)
- All Employee permissions
- Categorize and merge duplicate ideas
- Change idea status and assign owners
- Set due dates and close ideas
- Access moderation dashboard

### Executive
- Read-only access to all ideas
- View comprehensive dashboards
- Vote and comment (cannot change status)
- Export reports

### Admin (IT)
- Manage users, roles, and categories
- System configuration
- Access audit logs
- Manage announcements and policies

## Idea Workflow

```
Submitted → Under Review → Shortlisted → In Pilot → Implemented
                ↓
            Closed (Won't Do)
```

### Status Definitions

- **Submitted**: New ideas awaiting review
- **Under Review**: Being evaluated by moderators
- **Shortlisted**: Selected for potential implementation
- **In Pilot**: Currently being tested/implemented
- **Implemented**: Successfully completed
- **Closed**: Not proceeding (with reason)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Ideas
- `GET /api/ideas` - List ideas (with filtering)
- `POST /api/ideas` - Create new idea
- `GET /api/ideas/:id` - Get idea details
- `PUT /api/ideas/:id` - Update idea
- `POST /api/ideas/:id/vote` - Vote on idea

### Dashboard
- `GET /api/dashboard/overview` - Dashboard statistics
- `GET /api/dashboard/departments` - Department stats

## Development

### Project Structure
```
voe/
├── client/                 # React frontend
├── server/
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Authentication, audit, etc.
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   └── utils/         # Utility functions
│   └── uploads/           # File attachments
├── .env                   # Environment variables
└── package.json
```

### Development Commands

```bash
# Start development server
npm run dev:full

# Backend only
npm run server

# Frontend only
npm run client

# Build for production
npm run build

# Start production server
npm start
```

### Database Management

The application uses Sequelize ORM with PostgreSQL. In development mode, the database schema is automatically synchronized.

**Manual database operations:**
```javascript
// In Node.js console
const { sequelize } = require('./server/src/models');

// Force sync (recreate tables)
await sequelize.sync({ force: true });

// Safe sync (add missing tables/columns)
await sequelize.sync({ alter: true });
```

## Security Features

- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control
- **Rate Limiting**: API request throttling
- **Input Validation**: Server-side validation
- **Audit Logging**: Track all significant actions
- **File Upload Security**: Type and size restrictions
- **CSRF Protection**: Cross-site request forgery prevention
- **Content Security Policy**: XSS attack mitigation

## Performance & Monitoring

### Key Performance Indicators (KPIs)

- **Engagement Rate**: % of employees participating
- **Idea Activation Rate**: % of ideas reaching pilot/implementation
- **Idea-to-Action Time**: Average time from submission to action
- **Employee Sentiment**: Satisfaction scores

### Monitoring

- Structured logging with Morgan
- Error tracking capabilities
- Response time monitoring
- Database query optimization

## Deployment

### Environment Variables

Key environment variables to configure:

```bash
# Database
DB_HOST=localhost
DB_NAME=voe_db
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Email (for notifications)
EMAIL_HOST=smtp.your-company.com
EMAIL_USER=voe@your-company.com
EMAIL_PASS=your-email-password
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure JWT secret
- [ ] Set up SSL/HTTPS
- [ ] Configure email service
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up reverse proxy (nginx)
- [ ] Configure rate limiting
- [ ] Set up file upload storage

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Verify PostgreSQL is running
   - Check database credentials in .env
   - Ensure database exists

2. **Port conflicts**
   - Backend default: 5000
   - Frontend default: 3000
   - Modify PORT in .env if needed

3. **Module not found errors**
   - Run `npm install` in both root and client directories
   - Clear node_modules and reinstall if issues persist

### Logs

- Application logs: Console output in development
- Database queries: Enabled in development mode
- Audit logs: Stored in database `audit_logs` table

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

### Code Style

- Use ESLint configuration
- Follow REST API conventions
- Write descriptive commit messages
- Add JSDoc comments for functions

## Phase 2 Planning

Future enhancements planned:

- **AI Integration**: Automated idea categorization and sentiment analysis
- **SSO Integration**: Azure AD/OIDC authentication
- **Advanced Analytics**: Machine learning insights
- **Mobile App**: Native mobile applications
- **Integration APIs**: Connect with other enterprise systems

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section

---

**Made with ❤️ by the VOE Development Team**
