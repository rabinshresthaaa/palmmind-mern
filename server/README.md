# Real-Time Chat Application - Backend

A production-style REST API and real-time chat backend built with Node.js, Express, MongoDB, Mongoose, JWT Authentication, Role-Based Authorization, and Socket.IO.

This project was developed as part of the MERN Stack internship assignment.

---

## Features

### Authentication

- User registration
- User login
- JWT-based authentication
- Password hashing using bcrypt
- Protected API routes
- Authentication middleware

### Authorization

- Role-based authorization
- User role
- Admin role
- Admin-only routes
- Users can update their own profiles
- Admins can manage users

### User Management

- Create users
- Get all users
- Get user by ID
- Get current authenticated user
- Update users
- Delete users

### Real-Time Chat

- Socket.IO integration
- Authenticated socket connections
- User join events
- User leave events
- Real-time message sending
- Real-time message receiving
- Multiple connected users

### Chat History

- Messages stored in MongoDB
- Sender information populated using Mongoose
- Retrieve complete chat history

### Statistics

- Total users
- Total chat messages
- Admin-only statistics endpoint

### Security

- Helmet
- CORS
- Rate limiting
- Request body size limits
- JWT authentication
- Password hashing
- Input validation
- Centralized error handling
- Environment variables

---

# Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| Socket.IO | Real-time communication |
| JWT | Authentication |
| bcrypt | Password hashing |
| Joi | Request validation |
| Helmet | HTTP security headers |
| express-rate-limit | Rate limiting |
| CORS | Cross-origin requests |
| dotenv | Environment configuration |

---

# Project Structure

```text
server/
│
├── src/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── message.controller.js
│   │   └── stats.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── authorize.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Message.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── message.routes.js
│   │   ├── stats.routes.js
│   │   └── index.js
│   │
│   ├── socket/
│   │   └── index.js
│   │
│   ├── validators/
│   │   ├── auth.validator.js
│   │   └── message.validator.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md