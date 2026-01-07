# Database Seed Instructions

This seed file creates test data for the PTMS system.

## What's Created

### 3 Coordinators:
1. **Dr. Sarah Johnson** (Computer Science)
   - Email: sarah.johnson@university.edu
   - Password: password123

2. **Prof. Ahmad Rahman** (Software Engineering)
   - Email: ahmad.rahman@university.edu
   - Password: password123

3. **Dr. Emily Chen** (Information Technology)
   - Email: emily.chen@university.edu
   - Password: password123

### 30 Students (10 per program):

#### CS255 - Computer Science (Matric: 2021234501 - 2021234510)
- Credits range: 108-125
- Email format: matricNo@student.uitm.edu.my
- All students have eligibility records

#### SE243 - Software Engineering (Matric: 2021567801 - 2021567810)
- Credits range: 109-124
- Email format: matricNo@student.uitm.edu.my
- All students have eligibility records

#### IT226 - Information Technology (Matric: 2021890101 - 2021890110)
- Credits range: 107-126
- Email format: matricNo@student.uitm.edu.my
- All students have eligibility records

### Additional Data:
- 1 Active Session: "Semester 1 2024/2025"
- 30 StudentSession records linking students to the session
- 30 Eligibility records with credit information

## How to Run

### Option 1: Run seed directly
```bash
cd ptms-backend
npm run prisma:seed
```

### Option 2: Run with Prisma migrate (resets and seeds)
```bash
cd ptms-backend
npx prisma migrate reset
```

### Option 3: Using ts-node directly
```bash
cd ptms-backend
npx ts-node prisma/seed.ts
```

## Login Credentials

All users (coordinators and students) have the password: **password123**

### Example Student Logins:
- 2021234501@student.uitm.edu.my (Alice Tan, CS255, 120 credits)
- 2021567801@student.uitm.edu.my (Karen Liew, SE243, 117 credits)
- 2021890101@student.uitm.edu.my (Uma Devi, IT226, 115 credits)

### Coordinator Logins:
- sarah.johnson@university.edu
- ahmad.rahman@university.edu
- emily.chen@university.edu

## Notes

- The seed script uses `upsert` operations, so it's safe to run multiple times
- All users have PDPA consent and TOS accepted set to true
- Phone numbers are randomly generated for students
- Eligibility is determined by credits >= 113 (minimum requirement)
