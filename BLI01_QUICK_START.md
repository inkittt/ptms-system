# BLI-01 Form Quick Start Guide

## Issue: 401 Unauthorized Error

The error you're seeing means **you need to login first** before accessing the BLI-01 form. The form requires authentication to load your profile data and active sessions.

## Solution: Login Before Accessing the Form

### Step 1: Start Both Servers

**Backend (Terminal 1):**
```bash
cd ptms-backend
npm run start:dev
```
Backend should be running at `http://localhost:3000`

**Frontend (Terminal 2):**
```bash
cd ptms-frontend
npm run dev
```
Frontend should be running at `http://localhost:3001`

### Step 2: Login as a Student

1. Open your browser and go to: `http://localhost:3001/login`

2. Login with a student account. If you don't have one, you need to either:
   - **Register a new student account** at `/register`
   - **Use an existing student account** from your database

### Step 3: Access the BLI-01 Form

After logging in successfully:
1. Navigate to: `http://localhost:3001/student/bli01`
2. The form should now load without the 401 error
3. Your profile data will auto-fill (name, matric number, program)
4. Select a training session and complete the remaining fields
5. Submit the form

## Creating Test Data

### Create a Student User (if needed)

You can create a test student using the register page or directly in the database:

**Option 1: Via Register Page**
1. Go to `http://localhost:3001/register`
2. Fill in the form with role = "STUDENT"
3. Complete the registration

**Option 2: Via Database Seed Script**

Create a file `ptms-backend/prisma/create-test-student.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const student = await prisma.user.create({
    data: {
      name: 'Test Student',
      email: 'student@test.com',
      password: hashedPassword,
      role: 'STUDENT',
      matricNo: '2021123456',
      program: 'Bachelor of Computer Science',
      phone: '123456-78-9012',
      creditsEarned: 115,
      isActive: true,
      pdpaConsent: true,
      tosAccepted: true,
    },
  });

  console.log('Test student created:', student);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```bash
cd ptms-backend
npx ts-node prisma/create-test-student.ts
```

### Create an Active Session (Required)

The BLI-01 form needs at least one active training session. Create one:

**File: `ptms-backend/prisma/create-test-session.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const session = await prisma.session.create({
    data: {
      name: 'Practical Training 2024/2025',
      year: 2024,
      semester: 1,
      minCredits: 113,
      minWeeks: 12,
      maxWeeks: 24,
      isActive: true,
      deadlinesJSON: {
        bli01Deadline: '2025-02-28',
        bli02Deadline: '2025-03-15',
        bli03Deadline: '2025-06-30',
      },
    },
  });

  console.log('Test session created:', session);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```bash
cd ptms-backend
npx ts-node prisma/create-test-session.ts
```

## Troubleshooting

### Still Getting 401 Error After Login?

1. **Check localStorage** - Open browser DevTools (F12) → Application/Storage → Local Storage
   - Verify `accessToken` exists
   - If missing, try logging out and logging in again

2. **Check backend is running** - Verify `http://localhost:3000/api` is accessible

3. **Check CORS** - Ensure backend allows requests from `http://localhost:3001`

4. **Token expired** - Tokens may expire. Try logging out and logging in again:
   ```javascript
   // In browser console
   localStorage.clear();
   // Then login again
   ```

### No Active Sessions Available?

If you see "No active sessions available" in the dropdown:
1. Run the create-test-session script above
2. Or manually create a session in the database:
   ```sql
   INSERT INTO "Session" (id, name, year, semester, "minCredits", "minWeeks", "maxWeeks", "isActive", "createdAt", "updatedAt")
   VALUES (gen_random_uuid(), 'Practical Training 2024/2025', 2024, 1, 113, 12, 24, true, NOW(), NOW());
   ```

### Profile Data Not Auto-Filling?

Make sure your user record has:
- `name` - Full name
- `matricNo` - Student number
- `program` - Program name
- `phone` - Can be used for IC number temporarily

Update in database:
```sql
UPDATE "User" 
SET name = 'Your Name',
    "matricNo" = '2021123456',
    program = 'Bachelor of Computer Science',
    phone = '123456-78-9012'
WHERE email = 'your-email@test.com';
```

## Testing the Complete Flow

1. **Login** → `http://localhost:3001/login`
2. **Navigate to BLI-01** → `http://localhost:3001/student/bli01`
3. **Verify auto-fill** → Name, IC, Matric No, Program should be filled
4. **Select session** → Choose from dropdown
5. **Enter CGPA** → e.g., "3.45"
6. **Select faculty** → Choose from dropdown
7. **Submit** → Should redirect to `/student/applications`
8. **Verify in database**:
   ```sql
   SELECT * FROM "Application" WHERE "userId" = 'your-user-id';
   SELECT * FROM "FormResponse" WHERE "formTypeEnum" = 'BLI_01';
   ```

## Expected Behavior

✅ **Before Login:** Redirects to `/login` with alert
✅ **After Login:** Form loads with auto-filled data
✅ **On Submit:** Creates application and redirects to applications page
✅ **In Database:** Application record + FormResponse record created

## Quick Test Credentials

After running the test scripts above:
- **Email:** `student@test.com`
- **Password:** `password123`
- **Role:** STUDENT

## Need Help?

If you're still having issues:
1. Check backend logs for errors
2. Check browser console for detailed error messages
3. Verify database has required data (User, Session)
4. Ensure both servers are running
5. Clear browser cache and localStorage
