# PTMS Backend Setup & Testing Guide

## ✅ Current Status

**Backend Server**: Running on `http://localhost:3001/api`  
**Frontend Server**: Running on `http://localhost:3000`

## 🚀 How to Start the Backend

### Step 1: Navigate to Backend Directory
```bash
cd "c:\Users\afiq\Downloads\New folder (4)\Practical Training Management System (PTMS)\ptms-backend"
```

### Step 2: Start Development Server
```bash
npm run start:dev
```

The server will start on **port 3001** (frontend uses 3000).

### Step 3: Verify Server is Running
You should see:
```
[Nest] LOG [NestApplication] Nest application successfully started
PTMS backend is running on http://localhost:3001/api
```

## 📡 Available API Endpoints

All endpoints are prefixed with `/api`:

### Public Endpoints (No Auth Required)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with matric number or email
- `POST /api/auth/consent` - Submit PDPA & ToS consent
- `POST /api/auth/verify-mfa` - Verify MFA token
- `POST /api/auth/refresh` - Refresh access token

### Protected Endpoints (Requires Bearer Token)
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - Logout
- `POST /api/auth/mfa/enable` - Enable MFA
- `POST /api/auth/mfa/confirm` - Confirm MFA setup
- `POST /api/auth/mfa/disable` - Disable MFA

## 🧪 Testing with PowerShell

### Method 1: Using Invoke-WebRequest (PowerShell)

#### Register a Student
```powershell
$body = @{
    name = "Ahmad Bin Ali"
    email = "ahmad@student.uitm.edu.my"
    password = "SecurePass123!"
    role = "STUDENT"
    matricNo = "2021123456"
    program = "Bachelor of Computer Science"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

#### Login with Matric Number
```powershell
$body = @{
    identifier = "2021123456"
    password = "SecurePass123!"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$response.Content | ConvertFrom-Json
```

#### Accept PDPA & ToS (if required)
```powershell
# Get userId from login response first
$body = @{
    userId = "your-user-id-here"
    pdpaConsent = $true
    tosAccepted = $true
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/consent" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$tokens = $response.Content | ConvertFrom-Json
$accessToken = $tokens.accessToken
```

#### Get Profile (Protected Route)
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/auth/profile" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer $accessToken"
    }
```

### Method 2: Using cURL (if installed)

#### Register
```bash
curl -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Ahmad Bin Ali\",\"email\":\"ahmad@student.uitm.edu.my\",\"password\":\"SecurePass123!\",\"role\":\"STUDENT\",\"matricNo\":\"2021123456\",\"program\":\"Bachelor of Computer Science\"}"
```

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"identifier\":\"2021123456\",\"password\":\"SecurePass123!\"}"
```

### Method 3: Using Postman or Thunder Client (Recommended)

1. **Install Thunder Client** extension in VS Code (or use Postman)
2. Create a new request
3. Set method to `POST`
4. URL: `http://localhost:3001/api/auth/register`
5. Headers: `Content-Type: application/json`
6. Body (raw JSON):
```json
{
  "name": "Ahmad Bin Ali",
  "email": "ahmad@student.uitm.edu.my",
  "password": "SecurePass123!",
  "role": "STUDENT",
  "matricNo": "2021123456",
  "program": "Bachelor of Computer Science"
}
```

## 📝 Complete Test Flow

### 1. Register a Student
```powershell
$registerBody = @{
    name = "Ahmad Bin Ali"
    email = "ahmad@student.uitm.edu.my"
    password = "SecurePass123!"
    role = "STUDENT"
    matricNo = "2021123456"
    program = "Bachelor of Computer Science"
} | ConvertTo-Json

$registerResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $registerBody

Write-Host "Registration Response:"
$registerResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 2. Login (First Time - Requires Consent)
```powershell
$loginBody = @{
    identifier = "2021123456"
    password = "SecurePass123!"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

Write-Host "Login Response:"
$loginData = $loginResponse.Content | ConvertFrom-Json
$loginData | ConvertTo-Json -Depth 10

# Save userId for next step
$userId = $loginData.userId
```

### 3. Submit Consent
```powershell
$consentBody = @{
    userId = $userId
    pdpaConsent = $true
    tosAccepted = $true
} | ConvertTo-Json

$consentResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/consent" `
    -Method POST `
    -ContentType "application/json" `
    -Body $consentBody

Write-Host "Consent Response:"
$tokens = $consentResponse.Content | ConvertFrom-Json
$tokens | ConvertTo-Json -Depth 10

# Save tokens
$accessToken = $tokens.accessToken
$refreshToken = $tokens.refreshToken
```

### 4. Access Protected Route
```powershell
$profileResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/profile" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer $accessToken"
    }

Write-Host "Profile Response:"
$profileResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 5. Refresh Token (After 15 Minutes)
```powershell
$refreshBody = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

$refreshResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/refresh" `
    -Method POST `
    -ContentType "application/json" `
    -Body $refreshBody

Write-Host "Refresh Response:"
$newTokens = $refreshResponse.Content | ConvertFrom-Json
$newTokens | ConvertTo-Json -Depth 10
```

## 🔧 Troubleshooting

### Issue: Port Already in Use
**Error**: `EADDRINUSE: address already in use :::3001`

**Solution**:
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in .env file
# PORT=3002
```

### Issue: Database Connection Timeout
**Error**: `P1002: The database server was reached but timed out`

**Solution**:
1. Check internet connection
2. Verify Supabase database is running
3. Check DATABASE_URL in `.env` file
4. Try running migration again:
```bash
npm run prisma:migrate
```

### Issue: Module Not Found
**Error**: `Cannot find module '@nestjs/jwt'`

**Solution**:
```bash
cd ptms-backend
npm install
```

### Issue: Prisma Client Not Generated
**Error**: `Module '"@prisma/client"' has no exported member 'UserRole'`

**Solution**:
```bash
npm run prisma:generate
```

## 📦 Database Migration

**Important**: Run this before first use:

```bash
cd ptms-backend
npm run prisma:migrate
```

When prompted, name the migration: `add_authentication_system`

This will:
- Create the `User` table with authentication fields
- Create the `RefreshToken` table
- Add all necessary indexes

## 🎯 Quick Commands Reference

```bash
# Navigate to backend
cd "c:\Users\afiq\Downloads\New folder (4)\Practical Training Management System (PTMS)\ptms-backend"

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migration
npm run prisma:migrate

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm start

# Open Prisma Studio (Database GUI)
npm run prisma:studio
```

## 🌐 Server URLs

- **Backend API**: http://localhost:3001/api
- **Frontend**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (when running)

## 📚 Next Steps

1. ✅ Backend is running
2. 🔄 Run database migration: `npm run prisma:migrate`
3. 🧪 Test endpoints using PowerShell or Postman
4. 🎨 Integrate with frontend (Next.js)
5. 🔗 Add UiTM SSO integration
6. 📧 Add email verification
7. 🔑 Add password reset

## 💡 Tips

- Use **Thunder Client** VS Code extension for easy API testing
- Access tokens expire in **15 minutes** (by design)
- Refresh tokens last **7 days**
- Students can login with **matric number** or **email**
- First login requires **PDPA & ToS acceptance**

## 📖 Documentation

- **Quick Start**: `ptms-backend/AUTH_QUICK_START.md`
- **Full API Guide**: `ptms-backend/AUTHENTICATION_GUIDE.md`
- **Implementation Details**: `AUTHENTICATION_IMPLEMENTATION.md`
