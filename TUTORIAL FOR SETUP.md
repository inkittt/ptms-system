# 🚀 SETUP TUTORIAL
**Easy Setup Guide for PTMS**

Complete setup in 30 minutes. No prior experience needed.

---

## What You Need
- Node.js v18+ installed
- Internet connection
- Text editor

---

## PART 1: CREATE SUPABASE PROJECT

### 1. Sign Up

1. Go to **https://supabase.com**
2. Sign up with GitHub or email
3. Verify email if needed

### 2. Create Project

1. Click **"New Project"**
2. Fill in:
   - **Name:** `PTMS-Database`
   - **Password:** Generate and **save it** (you can't recover this!)
   - **Region:** Pick closest to you
   - **Plan:** Free
3. Click **Create** and wait 2-3 minutes

### 3. Get Credentials

Once project is ready:

**A. Get API Keys**

- Go to **integrations** → **Data API**
- Copy these and save them:
  - **Project URL** (e.g., https://abc123.supabase.co)
  
- Go to **Project Settings** → **API Keys**
- Copy these and save them:  
  - **anon key**
  - **service_role key** (keep secret!)

**B. Get Database URLs**
- Go to **connect (at the top of the page with plug symbol)** → **Connection string**
- Select **URI** tab
- Copy both:
  - **Session Pooler** (port 6543)
  - **Direct Connection** (port 5432)
- Note: Replace `[YOUR-PASSWORD]` with your database password later

**C. Create Storage**
- Click **Storage** → **New bucket**
- Name: `documents`
- Toggle **Public:** ON
- Click **Create**

---

## PART 2: CONFIGURE PROJECT

### 4. Setup Backend Environment

The `.env` file already exists in `ptms-backend/.env`. You just need to **replace the existing values** with your credentials from Step 3.

**What to Replace:**

1. **DATABASE_URL** (Line 3)
   - Find the line starting with `DATABASE_URL=`
   - **Replace:** The password and project ID in the existing URL
   - Look for `postgres:XXXXXX@db.YYYYYY.supabase.co` in your existing URL
   - Replace `XXXXXX` with your database password from Step 2
   - Replace `YYYYYY` with your project ID from Step 3B (Session Pooler URL)
   - Example: `DATABASE_URL="postgresql://postgres:YourPassword123@db.abc123xyz.supabase.co:6543/postgres?pgbouncer=true&connection_limit=5&pool_timeout=30&connect_timeout=60"`

2. **DIRECT_URL** (Line 4)
   - Find the line starting with `DIRECT_URL=`
   - **Replace:** The password and project ID in the existing URL
   - Look for `postgres:XXXXXX@db.YYYYYY.supabase.co` in your existing URL
   - Replace `XXXXXX` with your database password from Step 2
   - Replace `YYYYYY` with your project ID from Step 3B (Direct Connection URL)
   - Example: `DIRECT_URL="postgresql://postgres:YourPassword123@db.abc123xyz.supabase.co:5432/postgres?connect_timeout=60"`

3. **SUPABASE_URL** (Line 23)
   - Find the line starting with `SUPABASE_URL=`
   - **Replace:** The entire URL after the `=` sign
   - Paste your **Project URL** from Step 3A
   - Example: `SUPABASE_URL=https://abc123xyz.supabase.co`

4. **SUPABASE_KEY** (Line 24)
   - Find the line starting with `SUPABASE_KEY=`
   - **Replace:** The entire key after the `=` sign
   - Paste your **anon key** from Step 3A (starts with `eyJhbGci...`)

5. **SUPABASE_SERVICE_ROLE_KEY** (Line 25)
   - Find the line starting with `SUPABASE_SERVICE_ROLE_KEY=`
   - **Replace:** The entire key after the `=` sign
   - Paste your **service_role key** from Step 3A (starts with `eyJhbGci...`)

**Note:** Leave `SUPABASE_BUCKET=documents` and `STORAGE_PROVIDER=supabase` as they are - no changes needed!

### 5. Setup Email (Optional)

Add email settings to `ptms-backend/.env`:

**Option A: Gmail (for production)**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=[16-character-app-password]
EMAIL_FROM=noreply@university.edu
```

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Search **"App passwords"**
4. Create new → Select "Mail" → Generate
5. Copy the password (remove spaces)

**Option B: Mailtrap (for testing)**
```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=[your-mailtrap-username]
EMAIL_PASSWORD=[your-mailtrap-password]
EMAIL_FROM=test@ptms.com
```

Sign up free at https://mailtrap.io

> **Note:** Email is optional. Skip if you don't need notifications.

### 6. Setup Frontend Environment

Create or edit `ptms-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## PART 3: INSTALL & SETUP

### 7. Install Backend

Open terminal and run:

```bash
cd ptms-backend
npm install
```

Wait for installation (2-5 minutes).

### 8. Setup Database

Run these commands one by one:

```bash
# Generate Prisma client
npm run prisma:generate

# Create database tables
npm run prisma:migrate
```

When asked for migration name, type: `init`

```bash
# Add sample data (30 students + 3 coordinators)
npm run prisma:seed
```

You should see: "Created 3 coordinators" and "Created 30 students"

### 9. Install Frontend

Open new terminal or navigate:

```bash
cd ../ptms-frontend
npm install
```

---

## PART 4: START THE APPLICATION

### 10. Start Backend

Terminal 1:
```bash
cd ptms-backend
npm run start:dev
```

Wait until you see:
```
Application is running on: http://localhost:3000
```

Keep this terminal running!

### 11. Start Frontend

Terminal 2:
```bash
cd ptms-frontend
npm run dev
```

Wait until you see:
```
✓ Ready on http://localhost:3001
```

---

## PART 5: TEST

### 12. Login

Open browser: **http://localhost:3001**

**Test Student Account:**
- Email: `2021234501@student.uitm.edu.my`
- Password: `password123`

**Test Coordinator Account:**
- Email: `sarah.johnson@university.edu`
- Password: `password123`

If you can login, **setup is complete!** 🎉

---

## 📌 Quick Commands

### View Database
```bash
cd ptms-backend
npm run prisma:studio
```
Opens http://localhost:5555

### Reset Database
```bash
cd ptms-backend
npx ts-node clean-and-seed.ts
```

### Daily Startup
**Terminal 1:**
```bash
cd ptms-backend
npm run start:dev
```

**Terminal 2:**
```bash
cd ptms-frontend
npm run dev
```

---

## ⚠️ Common Problems

### Can't connect to database
- Check `DATABASE_URL` has correct password
- Verify Supabase project is active (go to supabase.com)

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install
npm run prisma:generate
```

### Port already in use
Change PORT in `.env` to different number (e.g., 3001)

### File upload fails
- Check bucket name is exactly `documents`
- Verify bucket is set to **public**
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct

### Frontend can't reach backend
- Make sure backend is running on port 3000
- Check `NEXT_PUBLIC_API_URL=http://localhost:3000` in frontend `.env.local`

---

## 📚 Test Accounts

**30 Students Available:**

**Computer Science (CS255):**
- `2021234501@student.uitm.edu.my` - Alice Tan (120 credits)
- `2021234502@student.uitm.edu.my` - Benjamin Lim (115 credits)
- `2021234503@student.uitm.edu.my` - Catherine Wong (118 credits)

**Software Engineering (SE243):**
- `2021567801@student.uitm.edu.my` - Karen Liew (117 credits)
- `2021567802@student.uitm.edu.my` - Liam Ong (114 credits)

**Information Technology (IT226):**
- `2021890101@student.uitm.edu.my` - Uma Devi (115 credits)
- `2021890102@student.uitm.edu.my` - Victor Wong (119 credits)

**All passwords:** `password123`

> See `DATABASE_SUMMARY.md` for complete list

**3 Coordinators:**
- `sarah.johnson@university.edu` - Computer Science
- `ahmad.rahman@university.edu` - Software Engineering
- `emily.chen@university.edu` - Information Technology

---

## ✅ Checklist

Setup complete when you can check all:

- [ ] Supabase project created
- [ ] Credentials copied and saved
- [ ] Storage bucket `documents` created
- [ ] Backend `.env` configured
- [ ] Frontend `.env.local` configured
- [ ] Backend dependencies installed
- [ ] Database migrated
- [ ] Database seeded
- [ ] Backend running (port 3000)
- [ ] Frontend running (port 3001)
- [ ] Can login as student
- [ ] Can login as coordinator

---

## 🎓 Next Steps

1. **Explore the app** - Click around both dashboards
2. **View database** - Use Prisma Studio to see data
3. **Read docs** - Check `PROJECT_HANDOVER.md` for full overview
4. **Start coding** - Make small changes to learn

---

**Created:** February 16, 2026  
**Time:** ~30 minutes  