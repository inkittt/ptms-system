# Authentication Quick Start Guide

## 🚀 Quick Setup

### 1. Run Database Migration
```bash
cd ptms-backend
npm run prisma:migrate
```
Name the migration: `add_authentication_system`

### 2. Start Server
```bash
npm run start:dev
```

## 📝 Student Login Flow (UiTM Style)

### Step 1: Register Student
```bash
POST http://localhost:3000/auth/register
{
  "name": "Ahmad Bin Ali",
  "email": "ahmad@student.uitm.edu.my",
  "password": "SecurePass123!",
  "role": "STUDENT",
  "matricNo": "2021123456",
  "program": "Bachelor of Computer Science"
}
```

### Step 2: Login with Matric Number
```bash
POST http://localhost:3000/auth/login
{
  "identifier": "2021123456",
  "password": "SecurePass123!"
}
```

**First Login Response:**
```json
{
  "requiresConsent": true,
  "userId": "uuid",
  "message": "Please accept PDPA and Terms of Service to continue"
}
```

### Step 3: Accept PDPA & ToS
```bash
POST http://localhost:3000/auth/consent
{
  "userId": "uuid-from-step-2",
  "pdpaConsent": true,
  "tosAccepted": true
}
```

**Success Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "Ahmad Bin Ali",
    "email": "ahmad@student.uitm.edu.my",
    "role": "STUDENT",
    "matricNo": "2021123456"
  }
}
```

### Step 4: Use Access Token
```bash
GET http://localhost:3000/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 🔑 Key Features

### ✅ Matric Number Login
Students can login with:
- Matric number (10 digits): `2021123456`
- OR Email: `ahmad@student.uitm.edu.my`

### ✅ PDPA Consent (FR-2)
First login requires accepting:
- Personal Data Protection Act (PDPA) notice
- Terms of Service (ToS)

### ✅ Role-Based Access (FR-3)
Five user roles:
- `STUDENT` - Students
- `COORDINATOR` - Program coordinators
- `LECTURER` - Academic supervisors
- `ADMIN` - System administrators
- Can extend for `PROGRAM_HEAD`

### ✅ Session Management (FR-4)
- Access Token: **15 minutes** (auto-expires)
- Refresh Token: **7 days** (can be revoked)

### ✅ MFA Support (FR-1)
Optional two-factor authentication using TOTP (Google Authenticator)

## 🛡️ Protecting Routes

### Require Authentication
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Get('protected')
getProtected() {
  return 'This requires authentication';
}
```

### Require Specific Role
```typescript
import { Roles } from './auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Roles(UserRole.STUDENT)
@Get('student-only')
getStudentOnly() {
  return 'Only students can access';
}
```

### Public Route (No Auth)
```typescript
import { Public } from './auth/decorators/public.decorator';

@Public()
@Get('public')
getPublic() {
  return 'Anyone can access';
}
```

### Get Current User
```typescript
import { CurrentUser } from './auth/decorators/current-user.decorator';

@Get('me')
getMe(@CurrentUser() user: any) {
  // user = { userId, email, role, matricNo }
  return user;
}
```

## 🔄 Token Refresh Flow

When access token expires (after 15 min):
```bash
POST http://localhost:3000/auth/refresh
{
  "refreshToken": "your-refresh-token"
}
```

Returns new access token and refresh token.

## 📱 MFA Setup (Optional)

### Enable MFA
```bash
POST http://localhost:3000/auth/mfa/enable
Authorization: Bearer <access-token>
```

Returns QR code URL for Google Authenticator.

### Confirm MFA
```bash
POST http://localhost:3000/auth/mfa/confirm
Authorization: Bearer <access-token>
{
  "token": "123456"
}
```

### Login with MFA
After enabling MFA, login flow becomes:
1. POST `/auth/login` → Returns `requiresMfa: true`
2. POST `/auth/verify-mfa` with 6-digit code → Returns tokens

## 🔒 Security Notes

1. **Change JWT secrets** in `.env` before production
2. Access tokens expire in **15 minutes** for security
3. Passwords are hashed with **bcrypt**
4. Refresh tokens can be **revoked** from database
5. All tokens are **validated** on each request

## 📊 User Roles

| Role | Description | Example Use |
|------|-------------|-------------|
| `STUDENT` | Students applying for LI | Submit applications, view status |
| `COORDINATOR` | Program coordinators | Review applications, manage sessions |
| `LECTURER` | Academic supervisors | Supervise students, provide feedback |
| `ADMIN` | System administrators | Full system access, user management |

## 🎯 Next Steps

1. ✅ Authentication system is ready
2. 🔄 Run migration when database is accessible
3. 🎨 Build frontend login/register forms
4. 🔗 Integrate with UiTM SSO (OIDC/SAML)
5. 📧 Add email verification
6. 🔑 Add password reset functionality

## 📚 Full Documentation

See `AUTHENTICATION_GUIDE.md` for complete API reference and advanced usage.
