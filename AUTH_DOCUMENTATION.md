# Authentication & User Management System Documentation

## Overview
This document outlines the comprehensive authentication and user management system for the Waste Management App. The system provides secure user registration, authentication, and role-based access control.

## Features Implemented

### ✅ Authentication Features
- **User Registration** - Secure signup with validation
- **User Login** - JWT-based authentication
- **Password Management** - Change password functionality
- **Token-based Security** - JWT tokens with 7-day expiration
- **Profile Management** - Users can view and update their profiles

### ✅ User Management Features
- **Role-based Access Control** - Three roles: `user`, `manager`, `admin`
- **User Activation/Deactivation** - Admins can enable/disable accounts
- **Super Admin Creation** - Initial admin setup system
- **Admin User Creation** - Admins can create other users/managers/admins
- **User Profile Updates** - Protected profile editing
- **Account Deletion** - Secure account removal

### ✅ Security Features
- **Password Hashing** - Bcrypt with salt rounds
- **Input Validation** - Email format, password strength, etc.
- **Authorization Middleware** - Token verification
- **Role Permission Checks** - Endpoint access control
- **Account Protection** - Prevent deletion of last admin

## API Endpoints

### Authentication Endpoints

#### 1. User Registration
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "phone": "+1234567890" // optional
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 2. User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### 3. Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### 4. Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Admin Endpoints

#### 5. Create Super Admin (First Time Setup)
```http
POST /api/auth/create-super-admin
Content-Type: application/json

{
  "name": "Super Admin",
  "email": "admin@wasteapp.com",
  "password": "SuperSecure123!",
  "phone": "+1234567890",
  "secretKey": "super-secret-admin-key-2024"
}
```

#### 6. Create Users/Managers/Admins (Admin Only)
```http
POST /api/auth/admin-signup
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Manager Smith",
  "email": "manager@wasteapp.com",
  "password": "SecurePass123!",
  "phone": "+1234567891",
  "role": "manager" // user, manager, or admin
}
```

#### 7. Get All Users (Admin Only)
```http
GET /api/auth/users?page=1&limit=10&role=user&isActive=true
Authorization: Bearer <admin-token>
```

#### 8. Update User Role (Admin Only)
```http
PUT /api/auth/users/:id/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "manager"
}
```

#### 9. Activate/Deactivate User (Admin Only)
```http
PUT /api/auth/users/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isActive": false
}
```

### User Profile Endpoints

#### 10. Get User Profile
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### 11. Update User Profile
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+1234567892"
}
```

#### 12. Delete User Account
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

## Role-Based Access Control

### User Roles

1. **User (`user`)**
   - Can register and login
   - Can view and update own profile
   - Can change own password
   - Can delete own account
   - Access to waste logging features

2. **Manager (`manager`)**
   - All user permissions
   - Can view other users (limited)
   - Can manage waste categories and items
   - Can respond to inquiries

3. **Admin (`admin`)**
   - All manager permissions
   - Can create other users/managers/admins
   - Can activate/deactivate any user
   - Can update user roles
   - Can view all users with pagination
   - Can delete any user account
   - Full system management access

### Permission Matrix

| Action | User | Manager | Admin |
|--------|------|---------|-------|
| Register | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ |
| Update own profile | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| Delete own account | ✅ | ✅ | ✅* |
| Create other users | ❌ | ❌ | ✅ |
| View all users | ❌ | ❌ | ✅ |
| Update user roles | ❌ | ❌ | ✅ |
| Activate/deactivate users | ❌ | ❌ | ✅ |
| Delete other accounts | ❌ | ❌ | ✅ |

*Admin cannot delete their own account if they're the last admin

## Validation Rules

### Registration Validation
- **Name**: Required, cannot be empty or whitespace only
- **Email**: Required, valid email format, unique in system
- **Password**: Required, minimum 6 characters, maximum 100 characters
- **Phone**: Optional, valid phone number format if provided

### Login Validation
- **Email**: Required, valid email format
- **Password**: Required

### Profile Update Validation
- **Name**: Cannot be empty if provided
- **Email**: Valid format if provided, unique in system
- **Phone**: Valid format if provided

## Security Measures

1. **Password Security**
   - Bcrypt hashing with salt rounds (10)
   - Minimum length requirements
   - No password storage in plain text

2. **JWT Security**
   - Signed with secret key
   - 7-day expiration
   - Includes user ID, email, name, and role

3. **Input Sanitization**
   - Email normalization (lowercase)
   - Name trimming
   - Phone number validation

4. **Access Control**
   - Middleware authentication for protected routes
   - Role-based permission checks
   - Token verification on each request

5. **Account Protection**
   - Prevent deletion of last admin account
   - Account deactivation instead of deletion option
   - Secure admin creation process

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Name, email, and password are required"
}
```

#### 401 Unauthorized
```json
{
  "error": "Invalid email or password"
}
```

#### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

#### 404 Not Found
```json
{
  "error": "User not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wasteapp

# JWT Secret (REQUIRED for production)
JWT_SECRET=your-super-secure-jwt-secret-key

# Super Admin Secret (for initial setup)
SUPER_ADMIN_SECRET=super-secret-admin-key-2024

# Server Port
PORT=8001
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing

Run the comprehensive test suite:

```bash
node test-auth-improved.js
```

The test suite covers:
- User registration and login
- Super admin creation
- Role-based access control
- Profile management
- Input validation
- Authorization checks
- Account activation/deactivation

## Setup Instructions

1. **Initial Setup**
   - Set environment variables
   - Run database migrations
   - Start the server

2. **Create First Admin**
   ```bash
   curl -X POST http://localhost:8001/api/auth/create-super-admin \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Super Admin",
       "email": "admin@wasteapp.com",
       "password": "SuperSecure123!",
       "secretKey": "super-secret-admin-key-2024"
     }'
   ```

3. **Create Additional Users**
   - Use admin account to create managers
   - Regular users can self-register

## Best Practices

1. **Security**
   - Always use HTTPS in production
   - Set strong JWT_SECRET in environment
   - Regularly rotate JWT secrets
   - Implement rate limiting for auth endpoints

2. **User Management**
   - Use account deactivation instead of deletion when possible
   - Maintain audit logs for admin actions
   - Implement password complexity requirements
   - Consider implementing password reset functionality

3. **API Usage**
   - Always include proper error handling
   - Use appropriate HTTP status codes
   - Implement request validation on client side
   - Handle token expiration gracefully

## Future Enhancements

1. **Password Reset** - Email-based password recovery
2. **Two-Factor Authentication** - SMS or app-based 2FA
3. **Account Lockout** - Prevent brute force attacks
4. **Audit Logging** - Track admin actions
5. **Email Verification** - Verify email addresses on registration
6. **Session Management** - Track active sessions
7. **API Rate Limiting** - Prevent abuse
8. **Search Functionality** - Better user search and filtering