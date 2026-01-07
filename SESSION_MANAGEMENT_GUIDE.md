# Session Management Feature Guide

## Overview
The Session Management feature allows coordinators to create internship sessions and manage student enrollment with eligibility tracking based on credit requirements.

## Features Implemented

### 1. Session Creation (FR-5)
Coordinators can create sessions with:
- **Year and Semester**: Academic period identification
- **Deadlines**: Application, BLI-03 submission, and reporting deadlines
- **Credit Requirements**: Minimum credits (default: 113)
- **Duration**: Minimum and maximum weeks (e.g., 8-14 weeks)

### 2. CSV Student Import (FR-6)
Coordinators can import student eligibility data via CSV file containing:
- `matricNo`: Student matriculation number
- `creditsEarned`: Number of credits the student has earned
- `status`: Student status (optional, defaults to "active")

**CSV Format Example:**
```csv
matricNo,creditsEarned,status
2021234567,115,active
2021234568,110,active
2021234569,120,active
```

### 3. Student Eligibility Dashboard (FR-7)
Students can view their session enrollment status:
- **Session Details**: Year, semester, duration, deadlines
- **Eligibility Status**: Based on credits earned vs. required
- **Access Control**: Application and document pages are disabled if not enrolled or ineligible

## Backend Implementation

### Database Schema
```prisma
model Session {
  id            String        @id @default(uuid())
  name          String
  year          Int
  semester      Int
  deadlinesJSON Json?
  minCredits    Int           @default(113)
  minWeeks      Int
  maxWeeks      Int
  isActive      Boolean       @default(true)
  
  applications    Application[]
  studentSessions StudentSession[]
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model StudentSession {
  id            String   @id @default(uuid())
  sessionId     String
  userId        String
  creditsEarned Int
  isEligible    Boolean
  status        String   @default("active")
  
  session       Session  @relation(...)
  user          User     @relation(...)
  
  @@unique([sessionId, userId])
}
```

### API Endpoints

#### Coordinator Endpoints
- `POST /sessions` - Create new session
- `GET /sessions` - List all sessions
- `GET /sessions/:id` - Get session details
- `PATCH /sessions/:id` - Update session
- `DELETE /sessions/:id` - Delete session
- `POST /sessions/:id/import-students` - Import students via CSV
- `GET /sessions/:id/students` - Get students in session
- `DELETE /sessions/:sessionId/students/:userId` - Remove student from session

#### Student Endpoints
- `GET /sessions/my-session` - Get current active session
- `GET /sessions/my-sessions` - Get all enrolled sessions

### Session Enrollment Guard
The `SessionEnrollmentGuard` protects student routes by:
1. Checking if student is enrolled in an active session
2. Verifying student eligibility based on credits
3. Attaching session data to request for use in controllers

## Frontend Implementation

### Coordinator Session Page
Location: `/coordinator/sessions`

Features:
- View all sessions with statistics
- Create new sessions with form validation
- Import students via CSV upload
- View import results with success/error details
- Delete sessions (with validation)

### Student Session Page
Location: `/student/session`

Features:
- View current session details
- Display eligibility status
- Show important deadlines
- Alert if not enrolled or ineligible

### Session Protection
The `SessionProtectedRoute` component wraps student pages to:
- Check session enrollment before rendering
- Show appropriate messages if not enrolled
- Redirect to session info page
- Optionally require eligibility

**Usage:**
```tsx
<SessionProtectedRoute requireEligible={true}>
  <YourPageContent />
</SessionProtectedRoute>
```

## Usage Instructions

### For Coordinators

#### Creating a Session
1. Navigate to `/coordinator/sessions`
2. Click "Create Session"
3. Fill in the form:
   - Academic Year (e.g., 2024)
   - Semester (1 or 2)
   - Min Credits (default: 113)
   - Min/Max Weeks (e.g., 8-14)
   - Deadlines (Application, BLI-03, Reporting)
4. Click "Create Session"

#### Importing Students
1. Prepare CSV file with columns: `matricNo`, `creditsEarned`, `status`
2. Navigate to `/coordinator/sessions`
3. Click the Upload icon on the session row
4. Select your CSV file
5. Review import results
6. Students are automatically marked as eligible/ineligible based on credits

### For Students

#### Viewing Session Information
1. Navigate to `/student/session`
2. View your enrollment status
3. Check eligibility and deadlines
4. If not enrolled, contact your coordinator

#### Accessing Protected Pages
- Application and document pages require session enrollment
- If not enrolled, you'll see a message to contact your coordinator
- If ineligible, you'll see your credit status and requirements

## Sample CSV File

Create a file named `students.csv`:
```csv
matricNo,creditsEarned,status
2021234567,115,active
2021234568,110,active
2021234569,120,active
2021234570,105,active
```

## Error Handling

### Import Errors
Common errors during CSV import:
- **User not found**: Student with matricNo doesn't exist in system
- **Invalid creditsEarned**: Non-numeric value provided
- **Missing matricNo**: Row doesn't have matriculation number

### Session Errors
- **Duplicate session**: Session for year/semester already exists
- **Cannot delete**: Session has existing applications
- **Invalid weeks**: Min weeks greater than max weeks

## Security

### Backend
- All endpoints protected by JWT authentication
- Role-based access control (COORDINATOR/ADMIN only for management)
- Session enrollment verified via guard
- File upload restricted to CSV format

### Frontend
- Token-based authentication
- Route protection via SessionProtectedRoute
- Eligibility checks before rendering sensitive content

## Testing

### Backend Testing
```bash
cd ptms-backend

# Run migration
npx prisma migrate dev

# Start server
npm run start:dev
```

### Frontend Testing
```bash
cd ptms-frontend

# Start development server
npm run dev
```

### Test Flow
1. Login as coordinator
2. Create a session
3. Import students via CSV
4. Login as student
5. View session details
6. Access application pages (should work if enrolled and eligible)

## Future Enhancements
- Bulk session operations
- Session templates
- Automatic eligibility updates from academic system
- Email notifications on enrollment
- Session analytics and reporting
- Export enrolled students list
