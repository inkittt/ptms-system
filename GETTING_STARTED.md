# PTMS - Getting Started Guide

## What to Execute First: Step-by-Step Implementation Plan

Based on the CST688 PTMS Software Requirements Specification, here's your prioritized execution plan:

---

## 🎯 Phase 0: Project Setup & Planning (Week 1)

### Step 1: Environment Setup
```bash
# Create project directory
mkdir ptms-system
cd ptms-system

# Initialize Git repository
git init
git branch -M main
```

### Step 2: Choose Your Tech Stack
Based on the SRS recommendations, choose one:

**Option A: Node.js Stack**
- Frontend: Next.js 14+ (React + TypeScript)
- Backend: NestJS
- Database: PostgreSQL
- ORM: Prisma
- Queue: Redis

**Option B: .NET Stack**
- Frontend: Next.js 14+ (React + TypeScript)
- Backend: .NET 8 Web API
- Database: PostgreSQL
- ORM: Entity Framework Core
- Queue: Redis

### Step 3: Create Project Structure
```bash
# For Node.js Stack
mkdir -p frontend backend database docs

# Initialize frontend
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --src-dir

# Initialize backend
cd ../backend
npm init -y
npm install @nestjs/cli -g
nest new .

cd ptms-frontend
npm run dev -- --turbo




# Return to root
cd ..
```

### Step 4: Database Design
Create the database schema based on Section 8 (Data Model):

**Priority Tables to Create First:**
1. `users` - User accounts and roles
2. `sessions` - Academic sessions/semesters
3. `eligibility` - Student eligibility records
4. `applications` - Main application records
5. `companies` - Company information
6. `documents` - Document tracking
7. `form_responses` - Form data storage
8. `reviews` - Approval workflow
9. `notifications` - Notification queue
10. `audit_logs` - Audit trail

### Step 5: Create ERD and Database Schema
```bash
# Create database design document
touch docs/database-schema.sql
touch docs/erd-diagram.md
```

---

## 🚀 Phase 1: Core Foundation (Weeks 2-3)

### Week 2: Authentication & Authorization

#### Execute First:
1. **Set up PostgreSQL Database**
```bash
# Using Docker
docker run --name ptms-postgres -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=ptms -p 5432:5432 -d postgres:15

# Or install PostgreSQL locally
```

2. **Implement User Model & Auth**
- Create User table with roles (Student, Coordinator, Supervisor, Admin, Program Head)
- Implement JWT authentication
- Set up password hashing (bcrypt)
- Create login/register endpoints

3. **Set up RBAC (Role-Based Access Control)**
- Implement permission matrix from Section 3
- Create middleware for role checking
- Set up route guards

#### Key Files to Create:
```
backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   └── guards/
│   │       └── roles.guard.ts
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   └── database/
│       └── migrations/
│           └── 001_create_users_table.sql
```

#### API Endpoints to Build First:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh token
- `GET /users` - List users (Admin only)

### Week 3: Session & Eligibility Management

#### Execute:
1. **Create Session Management**
- Session CRUD operations
- Configure deadlines, min/max weeks, credit requirements

2. **Implement Eligibility System**
- CSV import for student eligibility data
- Eligibility checking logic (≥113 credits)
- Dashboard eligibility display

#### Key Files to Create:
```
backend/
├── src/
│   ├── sessions/
│   │   ├── sessions.controller.ts
│   │   ├── sessions.service.ts
│   │   └── entities/
│   │       └── session.entity.ts
│   ├── eligibility/
│   │   ├── eligibility.controller.ts
│   │   ├── eligibility.service.ts
│   │   ├── eligibility-import.service.ts
│   │   └── entities/
│   │       └── eligibility.entity.ts
```

#### API Endpoints:
- `POST /sessions` - Create session
- `GET /sessions` - List sessions
- `GET /sessions/:id` - Get session details
- `POST /eligibility/import` - Import CSV
- `GET /eligibility/:userId` - Check eligibility

---

## 🎯 Phase 2: Application Workflow (Weeks 4-6)

### Week 4: Application Wizard (Steps 1-2)

#### Execute:
1. **Create Application Model**
2. **Implement BLI-01 Form (Step 1)**
   - Student information form
   - Generate SLI-01 document
3. **Implement File Upload (Step 2)**
   - BLI-02 or Offer Letter upload
   - File validation (PDF/JPG/PNG, ≤10MB)
   - Google Drive integration

#### Key Files:
```
backend/
├── src/
│   ├── applications/
│   │   ├── applications.controller.ts
│   │   ├── applications.service.ts
│   │   └── entities/
│   │       └── application.entity.ts
│   ├── documents/
│   │   ├── documents.controller.ts
│   │   ├── documents.service.ts
│   │   ├── document-generator.service.ts
│   │   └── google-drive.service.ts
│   └── forms/
│       ├── bli-01.dto.ts
│       └── form-validator.service.ts

frontend/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── applications/
│   │       ├── new/
│   │       │   └── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   └── components/
│       ├── ApplicationWizard/
│       │   ├── Step1BLI01.tsx
│       │   ├── Step2Upload.tsx
│       │   └── WizardNavigation.tsx
│       └── FileUpload/
│           └── FileUpload.tsx
```

### Week 5: BLI-03 & Review Queue

#### Execute:
1. **Implement BLI-03 Form (Step 3)**
   - Online form + hardcopy upload
   - Company details validation
2. **Create Coordinator Review Queue**
   - Pending, Changes Requested, Approved queues
   - Review actions (Approve/Request Changes/Reject)

### Week 6: SLI-03 Issuance & Document Package

#### Execute:
1. **SLI-03 Generation**
   - Official letter generation
   - Set official start/end dates
2. **Document Package Creation**
   - Bundle SLI-03 + DLI-01
   - ZIP package generation
   - Download functionality

---

## 🎯 Phase 3: Supervisor & Notifications (Weeks 7-8)

### Week 7: Supervisor Portal & BLI-04

#### Execute:
1. **Supervisor Secure Link System**
   - Generate tokenized links
   - Link expiration logic
2. **BLI-04 Form**
   - Reporting duty confirmation
   - E-signature implementation
   - Supervisor submission

### Week 8: Notification System

#### Execute:
1. **Email Notifications**
   - SMTP integration
   - Email templates (EN/BM)
2. **Notification Queue**
   - Redis queue setup
   - Reminder scheduling (T-14, T-7, T-3, T-1)
3. **In-app Notifications**

---

## 🎯 Phase 4: Testing & Deployment (Weeks 9-10)

### Week 9: Testing

#### Execute:
1. **Unit Tests**
2. **Integration Tests**
3. **E2E Tests** (Playwright/Cypress)
4. **Accessibility Tests**
5. **UAT with Sample Data**

### Week 10: Deployment & Documentation

#### Execute:
1. **Containerization**
```bash
# Create Dockerfile for frontend
# Create Dockerfile for backend
# Create docker-compose.yml
```

2. **CI/CD Pipeline**
   - GitHub Actions setup
   - Automated testing
   - Deployment to staging/production

3. **Documentation**
   - API documentation (Swagger/OpenAPI)
   - User guides
   - Admin manual
   - Deployment runbook

---

## 📋 Immediate Action Checklist

### Today - Do These First:

- [ ] **1. Read the entire SRS document** (CST688 Practical Training Management System.pdf)
- [ ] **2. Set up development environment**
  - [ ] Install Node.js 18+ or .NET 8 SDK
  - [ ] Install PostgreSQL 15+
  - [ ] Install Docker Desktop
  - [ ] Install Git
  - [ ] Install VS Code with extensions
- [ ] **3. Create project repository**
  - [ ] Initialize Git repo
  - [ ] Create .gitignore
  - [ ] Set up branch strategy (main, develop, feature/*)
- [ ] **4. Design database schema**
  - [ ] Create ERD diagram
  - [ ] Write SQL migration scripts
  - [ ] Document relationships
- [ ] **5. Set up project structure**
  - [ ] Create frontend project (Next.js)
  - [ ] Create backend project (NestJS or .NET)
  - [ ] Set up environment variables
  - [ ] Configure TypeScript/ESLint
- [ ] **6. Create initial documentation**
  - [ ] README.md with setup instructions
  - [ ] ARCHITECTURE.md with system design
  - [ ] API.md for endpoint documentation

### This Week - Priority Tasks:

- [ ] **Week 1 Deliverables:**
  - [ ] Complete project setup
  - [ ] Database schema finalized
  - [ ] ERD diagram created
  - [ ] Clickable prototype/wireframes
  - [ ] Development environment running
  - [ ] First commit pushed to repository

---

## 🛠️ Required Tools & Services

### Development Tools:
- **IDE**: VS Code, WebStorm, or Visual Studio
- **Database Client**: pgAdmin, DBeaver, or TablePlus
- **API Testing**: Postman or Insomnia
- **Version Control**: Git + GitHub/GitLab

### Services to Set Up:
1. **Google Cloud Console**
   - Enable Google Drive API
   - Create service account
   - Generate credentials
2. **Email Service**
   - Configure institutional SMTP or
   - Set up SendGrid/Mailgun account
3. **Cloud Storage** (if not using Google Drive)
   - AWS S3 or Azure Blob Storage

### Optional (for production):
- **Hosting**: Azure App Service, AWS ECS, or Vercel
- **Monitoring**: Sentry, LogRocket, or Application Insights
- **CI/CD**: GitHub Actions, GitLab CI, or Azure DevOps

---

## 📚 Key Documents to Create

1. **Technical Documents:**
   - `docs/ARCHITECTURE.md` - System architecture
   - `docs/DATABASE_SCHEMA.md` - Database design
   - `docs/API_DOCUMENTATION.md` - API endpoints
   - `docs/DEPLOYMENT.md` - Deployment guide

2. **User Documents:**
   - `docs/USER_GUIDE_STUDENT.md`
   - `docs/USER_GUIDE_COORDINATOR.md`
   - `docs/USER_GUIDE_SUPERVISOR.md`
   - `docs/ADMIN_MANUAL.md`

3. **Development Documents:**
   - `docs/CODING_STANDARDS.md`
   - `docs/TESTING_STRATEGY.md`
   - `docs/SECURITY_GUIDELINES.md`

---

## 🎓 Learning Resources

If you're new to any of these technologies:

- **Next.js**: https://nextjs.org/learn
- **NestJS**: https://docs.nestjs.com/
- **Prisma**: https://www.prisma.io/docs/getting-started
- **PostgreSQL**: https://www.postgresql.org/docs/
- **TypeScript**: https://www.typescriptlang.org/docs/

---

## ⚠️ Important Notes

1. **Start Small**: Don't try to build everything at once. Follow the weekly plan.
2. **Test Early**: Write tests as you build features, not after.
3. **Document as You Go**: Update documentation with each feature.
4. **Version Control**: Commit frequently with clear messages.
5. **Security First**: Implement authentication and authorization before building features.
6. **PDPA Compliance**: Keep data protection in mind from day one.

---

## 🆘 Need Help?

If you get stuck:
1. Review the SRS document (CST688 Practical Training Management System.pdf)
2. Check the specific section related to your current task
3. Refer to the API Contract (Section 9) for endpoint specifications
4. Review the Data Model (Section 8) for database structure
5. Consult the Workflows (Section 7) for business logic

---

## Next Steps

After reading this guide, your immediate next action should be:

**Execute This Command:**
```bash
# Create project directory and initialize
mkdir ptms-system && cd ptms-system
git init
echo "# PTMS - Practical Training Management System" > README.md
git add README.md
git commit -m "Initial commit: Project setup"
```

Then proceed with **Phase 0: Project Setup & Planning** above.

Good luck with your implementation! 🚀
