# BLI-01 Form Backend Integration Guide

## Overview
The BLI-01 form has been successfully connected to the backend API. This guide explains the implementation and how to use it.

## Backend Implementation

### 1. Applications Module Structure
Created a new `applications` module in the backend with the following files:

- **`src/applications/applications.module.ts`** - Module definition
- **`src/applications/applications.controller.ts`** - API endpoints
- **`src/applications/applications.service.ts`** - Business logic
- **`src/applications/dto/create-application.dto.ts`** - Data validation

### 2. API Endpoints

#### POST `/api/applications`
Creates a new BLI-01 application.

**Request Body:**
```json
{
  "studentName": "John Doe",
  "icNo": "123456-78-9012",
  "matricNo": "2021234567",
  "trainingSession": "uuid-of-session",
  "cgpa": "3.45",
  "program": "Bachelor of Computer Science",
  "faculty": "Faculty of Computer & Mathematical Sciences"
}
```

**Response:**
```json
{
  "message": "Application created successfully",
  "application": {
    "id": "uuid",
    "userId": "uuid",
    "sessionId": "uuid",
    "status": "DRAFT",
    "createdAt": "2024-01-04T09:24:00.000Z",
    "updatedAt": "2024-01-04T09:24:00.000Z"
  }
}
```

#### GET `/api/applications`
Retrieves all applications for the logged-in student.

**Response:**
```json
{
  "applications": [
    {
      "id": "uuid",
      "status": "DRAFT",
      "session": {
        "id": "uuid",
        "name": "Practical Training 2024",
        "year": 2024,
        "semester": 1
      },
      "documents": [],
      "formResponses": [
        {
          "formTypeEnum": "BLI_01",
          "payloadJSON": { ... }
        }
      ]
    }
  ]
}
```

#### GET `/api/applications/sessions/active`
Retrieves all active training sessions.

**Response:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "name": "Practical Training 2024",
      "year": 2024,
      "semester": 1,
      "minCredits": 113,
      "minWeeks": 12,
      "maxWeeks": 24
    }
  ]
}
```

#### GET `/api/applications/profile`
Retrieves the current user's profile for auto-filling the form.

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@student.edu.my",
    "matricNo": "2021234567",
    "program": "Bachelor of Computer Science",
    "phone": "123456-78-9012",
    "creditsEarned": 115
  }
}
```

#### GET `/api/applications/:id`
Retrieves a specific application by ID.

### 3. Database Schema
The application data is stored in:

- **`Application`** table - Main application record
- **`FormResponse`** table - Stores BLI-01 form data as JSON in `payloadJSON` field
- **`User`** table - Updated with student information from the form

## Frontend Implementation

### 1. API Client
Created `src/lib/api/applications.ts` with typed API functions:

```typescript
import { applicationsApi } from '@/lib/api/applications';

// Create application
await applicationsApi.createApplication(formData);

// Get user's applications
const { applications } = await applicationsApi.getMyApplications();

// Get active sessions
const { sessions } = await applicationsApi.getActiveSessions();

// Get user profile
const { profile } = await applicationsApi.getUserProfile();
```

### 2. BLI-01 Form Page
Updated `src/app/student/bli01/page.tsx` with:

- **Auto-fill functionality** - Loads user profile data on mount
- **Session selection** - Fetches and displays active training sessions
- **Form validation** - Uses Zod schema for client-side validation
- **Loading states** - Shows spinner while loading data
- **Error handling** - Displays user-friendly error messages
- **Faculty dropdown** - Complete list of UiTM faculties

### 3. Form Fields
The simplified BLI-01 form includes:

1. **Student Name** - Auto-filled from profile
2. **NRIC** - Auto-filled from profile (stored in phone field)
3. **UiTM Student Number** - Auto-filled from profile
4. **Training Session** - Dropdown of active sessions
5. **CGPA** - Manual entry
6. **Program** - Auto-filled from profile
7. **Faculty** - Dropdown selection

## How to Use

### Backend Setup

1. Ensure the database is running and migrations are applied:
```bash
cd ptms-backend
npm run prisma:migrate:dev
```

2. Start the backend server:
```bash
npm run start:dev
```

The backend will be available at `http://localhost:3000`

### Frontend Setup

1. Ensure the environment variable is set in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

2. Start the frontend development server:
```bash
cd ptms-frontend
npm run dev
```

The frontend will be available at `http://localhost:3001`

### Testing the Integration

1. **Login as a student** - Navigate to `/login` and login with student credentials

2. **Navigate to BLI-01 form** - Go to `/student/bli01`

3. **Verify auto-fill** - Check that name, matric number, and program are pre-filled

4. **Select training session** - Choose from available active sessions

5. **Fill remaining fields** - Complete CGPA and faculty selection

6. **Submit form** - Click "Submit BLI-01 Form"

7. **Verify submission** - You should be redirected to `/student/applications` and see your new application

### Checking the Database

You can verify the data was saved by checking:

```sql
-- Check applications
SELECT * FROM "Application" WHERE "userId" = 'your-user-id';

-- Check form responses
SELECT * FROM "FormResponse" WHERE "formTypeEnum" = 'BLI_01';
```

## Authentication

All endpoints require JWT authentication. The frontend automatically includes the access token from localStorage in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Error Handling

The backend returns appropriate HTTP status codes:

- **200** - Success
- **400** - Bad Request (validation errors, duplicate application)
- **401** - Unauthorized (missing or invalid token)
- **404** - Not Found (session or application not found)
- **500** - Internal Server Error

## Next Steps

To extend this implementation:

1. **Add PDF generation** - Generate SLI-01 PDF after BLI-01 submission
2. **Add file uploads** - Allow students to upload supporting documents
3. **Add status tracking** - Show application progress through workflow
4. **Add notifications** - Email/SMS notifications on status changes
5. **Add validation** - Check eligibility (credits earned, CGPA requirements)

## Troubleshooting

### "No active sessions available"
- Ensure sessions are created in the database with `isActive = true`
- Check the sessions table: `SELECT * FROM "Session" WHERE "isActive" = true;`

### "User not authenticated"
- Verify the access token is stored in localStorage
- Check the token hasn't expired
- Try logging out and logging back in

### "Error loading profile data"
- Ensure the user profile exists in the database
- Check the User table has the required fields populated

### CORS errors
- Verify the backend CORS configuration allows the frontend origin
- Check `main.ts` has proper CORS setup

## API Testing with cURL

```bash
# Get active sessions
curl -X GET http://localhost:3000/api/applications/sessions/active \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create application
curl -X POST http://localhost:3000/api/applications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "John Doe",
    "icNo": "123456-78-9012",
    "matricNo": "2021234567",
    "trainingSession": "session-uuid",
    "cgpa": "3.45",
    "program": "Bachelor of Computer Science",
    "faculty": "Faculty of Computer & Mathematical Sciences"
  }'

# Get my applications
curl -X GET http://localhost:3000/api/applications \
  -H "Authorization: Bearer YOUR_TOKEN"
```
