# PROJECT HANDOVER DOCUMENT
# Practical Training Management System (PTMS)

**Document Version**: 1.0  
**Last Updated**: February 16, 2026  
**Prepared For**: New Development Team

---

## 📋 PROJECT OVERVIEW

The **Practical Training Management System (PTMS)** is a comprehensive web application designed to manage student practical training (internship) applications, document submissions, coordinator reviews, and session management for UiTM (Universiti Teknologi MARA).

### Key Objectives
- Streamline student internship application process
- Digital document management and PDF generation
- Coordinator review and approval workflows
- Session-based training management
- Multi-role access control (Students, Coordinators, Lecturers, Admins)

---

## 🏗️ SYSTEM ARCHITECTURE

### Tech Stack Summary

**Backend** (`ptms-backend`)
- **Framework**: NestJS 10.x (Node.js framework)
- **Language**: TypeScript 5.5
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma 5.22.0
- **Authentication**: JWT with Passport.js (passport-jwt, passport-local)
- **Storage**: Supabase Storage (configurable: local/supabase/s3/azure)
- **PDF Generation**: PDFKit
- **Email**: Nodemailer
- **Security**: bcrypt (password hashing), speakeasy (MFA)
- **File Handling**: Multer, Archiver, Sharp (image processing)

**Frontend** (`ptms-frontend`)
- **Framework**: Next.js 14.2.15 (React 18)
- **Language**: TypeScript 5.7
- **Styling**: TailwindCSS 3.4
- **UI Components**: Radix UI, shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts
- **File Upload**: React Dropzone

**Infrastructure**
- **Database Host**: Supabase PostgreSQL
- **Storage**: Supabase Storage Bucket
- **Deployment**: Not specified (can be deployed on Vercel, AWS, etc.)

---

## 📁 PROJECT STRUCTURE

```
Practical Training Management System (PTMS)/
│
├── ptms-backend/                 # NestJS Backend API
│   ├── src/
│   │   ├── applications/         # Application module (internship applications)
│   │   ├── auth/                 # Authentication & authorization
│   │   ├── notifications/        # Email/notification system
│   │   ├── prisma/              # Prisma service
│   │   ├── reports/             # Reports generation
│   │   ├── sessions/            # Training sessions management
│   │   ├── storage/             # File storage service
│   │   ├── students/            # Student-specific operations
│   │   ├── types/               # TypeScript type definitions
│   │   ├── app.module.ts        # Main app module
│   │   └── main.ts              # Application entry point
│   │
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.ts              # Database seeding script
│   │   └── migrations/          # Database migrations
│   │
│   ├── uploads/                 # Local file uploads (if using local storage)
│   ├── scripts/                 # Utility scripts
│   ├── .env                     # Environment variables (DO NOT COMMIT)
│   ├── package.json
│   └── tsconfig.json
│
├── ptms-frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/                 # Next.js 14 App Router pages
│   │   │   ├── coordinator/     # Coordinator dashboard & features
│   │   │   ├── student/         # Student dashboard & features
│   │   │   ├── auth/            # Authentication pages
│   │   │   └── api/             # API routes (if any)
│   │   │
│   │   ├── components/          # Reusable React components
│   │   ├── contexts/            # React contexts (AuthContext, etc.)
│   │   ├── lib/                 # Utility functions & API client
│   │   └── types/               # TypeScript interfaces
│   │
│   ├── public/                  # Static assets
│   ├── .env.local               # Environment variables (DO NOT COMMIT)
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── sample_students.csv          # Sample student data for testing
├── .env.local                   # Root environment variables
└── package.json                 # Root workspace dependencies

```

---

## 🗄️ DATABASE SCHEMA

### Core Tables

**Users** (`User`)
- Multi-role system: STUDENT, COORDINATOR, LECTURER, ADMIN
- Stores personal info: name, email, matricNo, icNumber, program, faculty, CGPA
- Authentication: password (bcrypt), MFA support, SSO integration
- PDPA consent & TOS acceptance tracking
- Credits earned tracking for students

**Sessions** (`Session`)
- Training periods (Year + Semester)
- Training dates, deadlines (stored as JSON)
- Min/Max weeks, min credits requirements
- Reference number format
- Coordinator assignment with digital signatures
- Multiple students per session via `StudentSession`

**Applications** (`Application`)
- Student internship applications
- Linked to User, Session, Company
- Status workflow: DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED
- Training period (startDate, endDate)
- Multiple signatures: student, supervisor, coordinator
- Emergency contacts, organization details

**Documents** (`Document`)
- Document types: BLI_01, BLI_02, BLI_03, BLI_04, SLI_01, SLI_03, SLI_04, DLI_01, etc.
- Storage: local or cloud (Supabase/S3/Azure)
- Version control
- Document status: DRAFT → PENDING_SIGNATURE → SIGNED → REJECTED
- Google Drive integration (optional)

**FormResponse** (`FormResponse`)
- Form submissions (BLI forms, supervisor evaluations)
- JSON payload storage
- Multiple signatures support
- Linked to application

**Reviews** (`Review`)
- Coordinator/lecturer reviews
- Decisions: APPROVE, REQUEST_CHANGES, REJECT
- Comments and timestamps

**Notifications** (`Notification`)
- Multi-channel: IN_APP, EMAIL, WHATSAPP, SMS
- Status tracking: PENDING, SENT, FAILED, READ
- Batch sending support

**Other Tables**
- `Company`: Organization details
- `StudentSession`: Many-to-many relationship between students and sessions
- `Eligibility`: Student eligibility tracking
- `SupervisorToken`: Secure token-based supervisor access
- `AuditLog`: System audit trail
- `RefreshToken`: JWT refresh token management

### Database Connection
- **Provider**: Supabase PostgreSQL
- **ORM**: Prisma
- **Connection**: Uses transaction pooler (port 6543) and direct connection (port 5432)

---

## 🚀 SETUP INSTRUCTIONS

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- Git

### 1. Clone Repository
```bash
cd "c:\Users\afiq\Downloads\New folder (8)\Practical Training Management System (PTMS)"
```

### 2. Backend Setup

```bash
cd ptms-backend
npm install

# Configure environment variables
# Edit .env file with your database credentials

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
# OR use custom seeding script:
npx ts-node clean-and-seed.ts

# Start development server
npm run start:dev
# Server runs on http://localhost:3000
```

### 3. Frontend Setup

```bash
cd ../ptms-frontend
npm install

# Configure environment variables
# Create .env.local file (see .env.example)

# Start development server
npm run dev
# Frontend runs on http://localhost:3001
```

### 4. Database Management

**View Database**
```bash
cd ptms-backend
npm run prisma:studio
# Opens Prisma Studio on http://localhost:5555
```

**Create New Migration**
```bash
npm run prisma:migrate
```

**Re-seed Database**
```bash
npx ts-node clean-and-seed.ts
```

---

## 🔐 ENVIRONMENT VARIABLES

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@host:6543/database?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/database"

# Server
PORT=3000
BASE_URL="http://localhost:3000"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# Storage (local, supabase, s3, azure)
STORAGE_PROVIDER=supabase
UPLOAD_DIR=./uploads

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET=documents

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@university.edu
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 👥 DEFAULT USER ACCOUNTS

### Test Credentials
**Password for all users**: `password123`

### Students (30 total across 3 programs)

**Computer Science (CS255)** - 10 students
- `2021234501@student.uitm.edu.my` - Alice Tan Wei Ling (120 credits)
- `2021234502@student.uitm.edu.my` - Benjamin Lim Khai Ming (115 credits)
- `2021234503@student.uitm.edu.my` - Catherine Wong Mei Yee (118 credits)
- ... (7 more)

**Software Engineering (SE243)** - 10 students
- `2021567801@student.uitm.edu.my` - Karen Liew Shu Ting (117 credits)
- `2021567802@student.uitm.edu.my` - Liam Ong Wei Lun (114 credits)
- ... (8 more)

**Information Technology (IT226)** - 10 students
- `2021890101@student.uitm.edu.my` - Uma Devi Binti Raj (115 credits)
- `2021890102@student.uitm.edu.my` - Victor Wong Kai Xiang (119 credits)
- ... (8 more)

### Coordinators (3 total)
- `sarah.johnson@university.edu` - Dr. Sarah Johnson (Computer Science)
- `ahmad.rahman@university.edu` - Prof. Ahmad Rahman (Software Engineering)
- `emily.chen@university.edu` - Dr. Emily Chen (Information Technology)

> **See `ptms-backend/DATABASE_SUMMARY.md` for complete list**

---

## 🎯 KEY FEATURES

### Student Features
1. **Application Management**
   - Submit internship applications
   - Upload required documents (BLI forms, offer letters, etc.)
   - Track application status
   - Digital signature support

2. **Document Submission**
   - Upload multiple document types
   - Automatic PDF generation for forms
   - Version control
   - Re-upload rejected documents

3. **Progress Tracking**
   - View application status
   - Check eligibility (based on credits earned)
   - Receive notifications

4. **Form Submissions**
   - BLI_01: Internship acceptance form
   - BLI_02: Monthly progress report
   - BLI_03: Supervisor evaluation
   - BLI_04: Student self-assessment
   - SLI forms: Various supporting documents

### Coordinator Features
1. **Session Management**
   - Create/edit training sessions
   - Set deadlines and requirements
   - Upload digital signature
   - Assign to program

2. **Application Review**
   - Review student applications
   - Approve/reject/request changes
   - Add review comments
   - Bulk operations

3. **Document Verification**
   - View submitted documents
   - Verify and sign documents
   - Request re-submission

4. **Reports & Analytics**
   - Student progress reports
   - Application statistics
   - Export data (CSV, PDF)
   - Download bulk documents (ZIP)

5. **Student Management**
   - View all students in program
   - Check eligibility
   - Bulk import students (CSV)

### System Features
1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (RBAC)
   - MFA support (TOTP)
   - Session management with refresh tokens

2. **Notification System**
   - In-app notifications
   - Email notifications (via Nodemailer)
   - Notification preferences
   - Batch sending

3. **File Storage**
   - Flexible storage (local/Supabase/S3/Azure)
   - Secure file access
   - Image processing (Sharp)
   - File compression (Archiver)

4. **Security**
   - Password hashing (bcrypt)
   - PDPA consent tracking
   - Terms of Service acceptance
   - Audit logging
   - Input validation (class-validator, Zod)

5. **PDF Generation**
   - Dynamic form generation
   - QR code integration
   - Digital signatures
   - Watermarking

---

## 🔌 API ARCHITECTURE

### Backend API Structure

**Base URL**: `http://localhost:3000`

### Main Modules & Endpoints

**Authentication** (`/auth`)
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get current user profile
- `POST /auth/mfa/enable` - Enable MFA
- `POST /auth/mfa/verify` - Verify MFA code

**Applications** (`/applications`)
- `GET /applications` - List applications
- `GET /applications/:id` - Get application details
- `POST /applications` - Create application
- `PUT /applications/:id` - Update application
- `DELETE /applications/:id` - Delete application
- `POST /applications/:id/submit` - Submit application
- `POST /applications/:id/documents` - Upload document
- `GET /applications/:id/documents/:docId` - Download document

**Sessions** (`/sessions`)
- `GET /sessions` - List sessions
- `GET /sessions/:id` - Get session details
- `POST /sessions` - Create session
- `PUT /sessions/:id` - Update session
- `POST /sessions/:id/signature` - Upload coordinator signature
- `GET /sessions/:id/students` - Get students in session

**Students** (`/students`)
- `GET /students` - List students
- `GET /students/:id` - Get student details
- `POST /students/import` - Bulk import students (CSV)
- `GET /students/:id/eligibility` - Check eligibility

**Reports** (`/reports`)
- `GET /reports/statistics` - Get statistics
- `GET /reports/export` - Export data
- `POST /reports/download-bulk` - Download multiple documents

**Notifications** (`/notifications`)
- `GET /notifications` - List user notifications
- `PUT /notifications/:id/read` - Mark as read
- `DELETE /notifications/:id` - Delete notification

**Reviews** (`/reviews`)
- `POST /applications/:id/reviews` - Submit review
- `GET /applications/:id/reviews` - Get application reviews

---

## 🛠️ COMMON DEVELOPMENT TASKS

### Adding a New Document Type

1. Update Prisma schema (`prisma/schema.prisma`)
```prisma
enum DocumentType {
  // ... existing types
  NEW_DOCUMENT_TYPE
}
```

2. Run migration
```bash
npm run prisma:migrate
```

3. Update backend service (`src/applications/documents.service.ts`)

4. Update frontend types (`src/types/index.ts`)

### Adding a New User Role

1. Update Prisma schema
```prisma
enum UserRole {
  // ... existing roles
  NEW_ROLE
}
```

2. Update auth guards (`src/auth/guards/roles.guard.ts`)

3. Update frontend routing and permissions

### Changing Email Templates

Edit email templates in:
- `ptms-backend/src/notifications/email-templates/`

### Modifying PDF Forms

Edit PDF generation logic in:
- `ptms-backend/src/applications/pdf-generator.service.ts`

---

## 📦 DEPLOYMENT NOTES

### Backend Deployment Checklist
- [ ] Set production environment variables
- [ ] Change JWT secrets to secure random strings
- [ ] Configure production database
- [ ] Set up production email SMTP
- [ ] Enable CORS for frontend domain
- [ ] Set up SSL/HTTPS
- [ ] Configure file storage (recommend cloud storage for production)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Frontend Deployment Checklist
- [ ] Update API URL to production backend
- [ ] Build production bundle: `npm run build`
- [ ] Configure CDN for static assets
- [ ] Set up domain and SSL
- [ ] Configure environment variables
- [ ] Enable production error tracking

### Recommended Deployment Platforms
- **Backend**: Railway, Render, DigitalOcean, AWS EC2/ECS
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: Supabase (already configured), AWS RDS, DigitalOcean Managed DB

---

## 🐛 TROUBLESHOOTING

### Common Issues

**Database Connection Failed**
- Check DATABASE_URL and DIRECT_URL in .env
- Verify Supabase project is active
- Check network/firewall settings

**Cannot Upload Files**
- Check STORAGE_PROVIDER setting
- Verify Supabase bucket exists and is public
- Check SUPABASE_SERVICE_ROLE_KEY is correct
- Verify upload directory permissions (if using local storage)

**Email Not Sending**
- Check EMAIL_* environment variables
- Verify SMTP credentials
- Check email service rate limits
- Review nodemailer configuration

**Frontend Cannot Connect to Backend**
- Verify NEXT_PUBLIC_API_URL is correct
- Check backend is running on specified port
- Review CORS configuration in backend

**Prisma Client Errors**
- Run `npm run prisma:generate`
- Clear node_modules and reinstall
- Check Prisma schema syntax

---

## 📚 IMPORTANT FILES & DOCUMENTATION

### Backend Documentation
- `DATABASE_SUMMARY.md` - Complete database user list and structure
- `prisma/schema.prisma` - Database schema definition
- `src/main.ts` - Application entry point and configuration

### Scripts
- `clean-and-seed.ts` - Clean and reseed database
- `check-data.ts` - Verify database data
- `check-students.ts` - Check student records
- `check-sessions.ts` - Check session records
- `test-reports.ts` - Test report generation
- `update-session-coordinator.ts` - Update session coordinators

### Frontend Key Files
- `src/app/` - Next.js pages (App Router)
- `src/components/` - Reusable UI components
- `src/lib/api.ts` - API client configuration
- `src/contexts/` - React context providers

---

## 🔒 SECURITY CONSIDERATIONS

1. **Sensitive Data**
   - Never commit `.env` files
   - Rotate JWT secrets regularly
   - Use strong database passwords
   - Keep Supabase keys secure

2. **API Security**
   - All endpoints require authentication (except /auth/login, /auth/register)
   - Role-based access control enforced
   - Input validation on all endpoints
   - Rate limiting recommended for production

3. **File Security**
   - Virus scanning recommended for production
   - File type validation enforced
   - Maximum file size limits configured
   - Secure file storage with access control

4. **Database Security**
   - Prepared statements via Prisma (SQL injection protected)
   - Password hashing with bcrypt
   - Audit logging enabled

---

## 📞 HANDOVER INFORMATION

### Project Status
✅ **Completed Features**:
- Student registration and authentication
- Application submission workflow
- Document upload and management
- Coordinator review system
- Session management
- Email notifications
- PDF generation for forms
- Digital signature support
- Reports and analytics

### Known Issues / Future Improvements
- WhatsApp/SMS notifications not implemented (only email)
- Google Drive integration partially implemented
- Mobile responsiveness needs testing
- Bulk operations can be optimized
- Advanced reporting features needed

### Development Best Practices
- Follow TypeScript strict mode
- Write unit tests for critical features
- Document API changes
- Use Prisma migrations for schema changes
- Keep dependencies updated
- Follow existing code structure and naming conventions

---

## 🎓 LEARNING RESOURCES

### NestJS
- Official Docs: https://docs.nestjs.com/
- Prisma with NestJS: https://docs.nestjs.com/recipes/prisma

### Next.js
- Official Docs: https://nextjs.org/docs
- App Router: https://nextjs.org/docs/app

### Prisma
- Official Docs: https://www.prisma.io/docs
- Schema Reference: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference

### Supabase
- Official Docs: https://supabase.com/docs
- Storage: https://supabase.com/docs/guides/storage

---

## ✅ HANDOVER CHECKLIST

- [ ] Clone repository and install dependencies
- [ ] Set up local database connection
- [ ] Configure environment variables (backend & frontend)
- [ ] Run database migrations and seed data
- [ ] Start backend server and verify API
- [ ] Start frontend and test login
- [ ] Review database schema and tables
- [ ] Test key features (application submission, review, etc.)
- [ ] Review code structure and architecture
- [ ] Set up development tools (Prisma Studio, etc.)
- [ ] Review documentation files
- [ ] Access Supabase dashboard
- [ ] Understand deployment requirements
- [ ] Set up error tracking (optional)
- [ ] Configure development environment

---

## 📝 ADDITIONAL NOTES

### Monorepo Structure
This project uses a monorepo approach with separate backend and frontend folders. Each has its own `package.json` and can be developed independently.

### Database Access
Use Prisma Studio for easy database visualization:
```bash
cd ptms-backend
npm run prisma:studio
```

### CSV Import Format
For bulk student import, use this CSV format:
```csv
matricNo,name,email,program,creditsEarned
2021234501,Alice Tan,2021234501@student.uitm.edu.my,CS255,120
```

### Supabase Configuration
- Project: imtucpxyjnjdzkkriclt.supabase.co
- Storage Bucket: `documents` (public access)
- Database: PostgreSQL 15

---

**END OF HANDOVER DOCUMENT**

For questions or clarifications, please refer to the codebase comments and existing documentation files in the repository.

Good luck with the project! 🚀
