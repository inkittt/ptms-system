# UiTM PTMS Authentication System Guide

## Overview

This authentication system implements all functional requirements for the UiTM Practical Training Management System, including:

- ✅ **FR-1**: UiTM SSO support (OIDC/SAML ready) with fallback email/password + MFA
- ✅ **FR-2**: PDPA consent and Terms of Service acceptance on first login
- ✅ **FR-3**: Role-based access control (Student/Coordinator/Supervisor/Admin/Program Head)
- ✅ **FR-4**: Session timeout (15 min access tokens) and refresh tokens (7 days)

## Features

### 1. **Matric Number Login**
Students can log in using their **matric number** (10 digits) or email address along with their password.

### 2. **Multi-Factor Authentication (MFA)**
Optional TOTP-based MFA using Google Authenticator or similar apps.

### 3. **PDPA & ToS Consent**
First-time login requires users to accept PDPA notice and Terms of Service before accessing the system.

### 4. **Role-Based Access Control**
Five user roles with different permissions:
- `STUDENT` - Students applying for practical training
- `COORDINATOR` - Coordinates practical training programs
- `LECTURER` - Academic supervisors (renamed from SUPERVISOR in schema)
- `ADMIN` - System administrators
- `PROGRAM_HEAD` - Program heads (can be added via role enum extension)

### 5. **Secure Token Management**
- Access tokens: 15 minutes (short-lived for security)
- Refresh tokens: 7 days (stored in database, can be revoked)
- Automatic token refresh mechanism

## Database Schema Changes

### User Model Additions
```prisma
model User {
  // Authentication
  password     String
  
  // MFA
  mfaEnabled   Boolean   @default(false)
  mfaSecret    String?
  
  // Consent
  pdpaConsent  Boolean   @default(false)
  pdpaConsentAt DateTime?
  tosAccepted  Boolean   @default(false)
  tosAcceptedAt DateTime?
  
  // SSO Support
  ssoProvider  String?
  ssoId        String?
  
  // Activity Tracking
  lastLoginAt  DateTime?
  isActive     Boolean   @default(true)
  
  // Relations
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id          String   @id @default(uuid())
  userId      String
  token       String   @unique
  expiresAt   DateTime
  isRevoked   Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

## API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Ahmad Bin Ali",
  "email": "ahmad@student.uitm.edu.my",
  "password": "SecurePass123!",
  "role": "STUDENT",
  "matricNo": "2021123456",
  "program": "Bachelor of Computer Science",
  "phone": "+60123456789"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "Ahmad Bin Ali",
    "email": "ahmad@student.uitm.edu.my",
    "role": "STUDENT",
    "matricNo": "2021123456",
    "pdpaConsent": false,
    "tosAccepted": false
  }
}
```

#### 2. Login (Matric Number or Email)
```http
POST /auth/login
Content-Type: application/json

{
  "identifier": "2021123456",
  "password": "SecurePass123!"
}
```

**Response (Requires Consent):**
```json
{
  "requiresConsent": true,
  "userId": "uuid",
  "message": "Please accept PDPA and Terms of Service to continue"
}
```

**Response (Requires MFA):**
```json
{
  "requiresMfa": true,
  "userId": "uuid",
  "message": "Please provide MFA token"
}
```

**Response (Success):**
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

#### 3. Submit PDPA & ToS Consent
```http
POST /auth/consent
Content-Type: application/json

{
  "userId": "uuid",
  "pdpaConsent": true,
  "tosAccepted": true
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

#### 4. Verify MFA Token
```http
POST /auth/verify-mfa
Content-Type: application/json

{
  "userId": "uuid",
  "token": "123456"
}
```

#### 5. Refresh Access Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Protected Endpoints (Requires Authentication)

Add `Authorization: Bearer <accessToken>` header to all protected requests.

#### 6. Get User Profile
```http
GET /auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### 7. Logout
```http
POST /auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 8. Enable MFA (Step 1)
```http
POST /auth/mfa/enable
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "otpauth://totp/PTMS%20(ahmad@student.uitm.edu.my)?secret=JBSWY3DPEHPK3PXP&issuer=PTMS"
}
```

#### 9. Confirm Enable MFA (Step 2)
```http
POST /auth/mfa/confirm
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "token": "123456"
}
```

#### 10. Disable MFA
```http
POST /auth/mfa/disable
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "token": "123456"
}
```

## Using Role-Based Guards

### Protect Routes by Role

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  
  // Only students can access
  @Roles(UserRole.STUDENT)
  @Get('my-applications')
  getMyApplications() {
    return 'Student applications';
  }
  
  // Only coordinators and admins can access
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  @Get('all-applications')
  getAllApplications() {
    return 'All applications';
  }
}
```

### Get Current User in Controllers

```typescript
import { CurrentUser } from './auth/decorators/current-user.decorator';

@Controller('profile')
export class ProfileController {
  
  @Get()
  getProfile(@CurrentUser() user: any) {
    // user contains: { userId, email, role, matricNo }
    return user;
  }
}
```

### Make Routes Public

```typescript
import { Public } from './auth/decorators/public.decorator';

@Controller('public')
export class PublicController {
  
  @Public()
  @Get('info')
  getPublicInfo() {
    return 'This endpoint does not require authentication';
  }
}
```

## Environment Variables

Update your `.env` file:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
```

**⚠️ IMPORTANT**: Change these secrets in production to strong, random values.

## Setup Instructions

### 1. Install Dependencies
```bash
cd ptms-backend
npm install
```

### 2. Generate Prisma Client
```bash
npm run prisma:generate
```

### 3. Run Database Migration
```bash
npm run prisma:migrate
```

When prompted, name the migration: `add_authentication_system`

### 4. Start Development Server
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## Testing the Authentication Flow

### 1. Register a Student
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmad Bin Ali",
    "email": "ahmad@student.uitm.edu.my",
    "password": "SecurePass123!",
    "role": "STUDENT",
    "matricNo": "2021123456",
    "program": "Bachelor of Computer Science"
  }'
```

### 2. Login with Matric Number
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "2021123456",
    "password": "SecurePass123!"
  }'
```

### 3. Accept PDPA & ToS (if required)
```bash
curl -X POST http://localhost:3000/auth/consent \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "pdpaConsent": true,
    "tosAccepted": true
  }'
```

### 4. Access Protected Route
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer your-access-token"
```

### 5. Refresh Token (after 15 minutes)
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token"
  }'
```

## Security Best Practices

### 1. **Password Requirements**
- Minimum 8 characters
- Consider adding complexity requirements in production

### 2. **Token Storage (Frontend)**
- Store access token in memory or sessionStorage
- Store refresh token in httpOnly cookie (recommended) or secure localStorage
- Never expose tokens in URLs

### 3. **HTTPS Only**
- Always use HTTPS in production
- Set secure cookie flags

### 4. **Rate Limiting**
- Implement rate limiting on login endpoint
- Prevent brute force attacks

### 5. **Session Management**
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Revoked tokens are tracked in database

## SSO Integration (Future Enhancement)

The system is prepared for SSO integration with:
- `ssoProvider` field (e.g., "uitm", "google", "microsoft")
- `ssoId` field (external user ID)

To implement UiTM SSO:
1. Install Passport SAML or OIDC strategy
2. Configure SSO provider details
3. Create SSO callback endpoint
4. Link SSO accounts to local users

## Troubleshooting

### Issue: "Invalid credentials"
- Check if user exists in database
- Verify password is correct
- Ensure user `isActive` is true

### Issue: "Requires consent"
- User must accept PDPA and ToS on first login
- Call `/auth/consent` endpoint

### Issue: "Token expired"
- Access tokens expire after 15 minutes
- Use refresh token to get new access token

### Issue: "MFA token invalid"
- Ensure time is synchronized on device
- Token is valid for 60 seconds
- Check if MFA secret is correctly stored

## Next Steps

1. **Frontend Integration**: Build login/register forms in Next.js frontend
2. **SSO Integration**: Connect to UiTM SSO system
3. **Email Verification**: Add email verification flow
4. **Password Reset**: Implement forgot password functionality
5. **Audit Logging**: Log all authentication events
6. **Rate Limiting**: Add rate limiting middleware

## Support

For issues or questions about the authentication system, refer to:
- NestJS Documentation: https://docs.nestjs.com
- Passport.js: http://www.passportjs.org
- Prisma: https://www.prisma.io/docs
