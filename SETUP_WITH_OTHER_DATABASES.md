# 🗄️ Using Other Databases (Alternative to Supabase)

This guide shows you how to set up PTMS with other PostgreSQL databases instead of Supabase.

---

## Supported Databases

PTMS works with any **PostgreSQL 12+** database:
- ✅ **Railway** (recommended for beginners)
- ✅ **Neon** (serverless PostgreSQL)
- ✅ **Render**
- ✅ **Heroku Postgres**
- ✅ **AWS RDS**
- ✅ **Google Cloud SQL**
- ✅ **Azure Database for PostgreSQL**
- ✅ **Local PostgreSQL** (for development)

---

## Option 1: Railway (Easiest)

### 1. Create Railway Account
1. Go to **https://railway.app**
2. Sign up with GitHub
3. Verify email

### 2. Create PostgreSQL Database
1. Click **"New Project"**
2. Select **"Provision PostgreSQL"**
3. Wait 30 seconds for deployment

### 3. Get Database URL
1. Click on your **PostgreSQL** service
2. Go to **"Connect"** tab
3. Copy the **"Postgres Connection URL"**
   - Format: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`

### 4. Configure Backend

Open `ptms-backend/.env` and update:

```env
# Database - Use the same URL for both
DATABASE_URL="[paste your Railway Postgres URL here]"
DIRECT_URL="[paste your Railway Postgres URL here]"

# Storage - Use local storage instead of Supabase
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads

# Remove or comment out Supabase settings
# SUPABASE_URL=
# SUPABASE_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
```

### 5. Setup Database Tables

```bash
cd ptms-backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

---

## Option 2: Neon (Serverless)

### 1. Create Neon Account
1. Go to **https://neon.tech**
2. Sign up with GitHub or email
3. Verify email

### 2. Create Project
1. Click **"Create a project"**
2. Fill in:
   - **Name:** `PTMS-Database`
   - **Region:** Choose closest to you
   - **Postgres version:** 16 (latest)
3. Click **"Create project"**

### 3. Get Connection String
1. On project dashboard, find **"Connection string"**
2. Copy the **"Pooled connection"** string
   - Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

### 4. Configure Backend

Open `ptms-backend/.env`:

```env
# Database
DATABASE_URL="[paste your Neon pooled connection string here]"
DIRECT_URL="[paste your Neon pooled connection string here]"

# Storage
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads
```

### 5. Setup Database Tables

```bash
cd ptms-backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

---

## Option 3: Render

### 1. Create Render Account
1. Go to **https://render.com**
2. Sign up with GitHub or email

### 2. Create PostgreSQL Database
1. Click **"New +"** → **"PostgreSQL"**
2. Fill in:
   - **Name:** `ptms-database`
   - **Database:** `ptms`
   - **User:** `ptms_user`
   - **Region:** Choose closest
   - **Plan:** Free
3. Click **"Create Database"**
4. Wait 2-3 minutes

### 3. Get Connection Strings
1. Scroll down to **"Connections"** section
2. Copy both:
   - **Internal Database URL** (for pooled connection)
   - **External Database URL** (for direct connection)

### 4. Configure Backend

Open `ptms-backend/.env`:

```env
# Database
DATABASE_URL="[paste Internal Database URL here]"
DIRECT_URL="[paste External Database URL here]"

# Storage
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads
```

### 5. Setup Database Tables

```bash
cd ptms-backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

---

## Option 4: Local PostgreSQL (Development)

### 1. Install PostgreSQL

**Windows:**
1. Download from **https://www.postgresql.org/download/windows/**
2. Run installer
3. Remember your password!
4. Default port: 5432

**Mac:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

**Windows/Linux:**
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ptms;

# Create user (optional)
CREATE USER ptms_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ptms TO ptms_user;

# Exit
\q
```

**Mac:**
```bash
createdb ptms
```

### 3. Configure Backend

Open `ptms-backend/.env`:

```env
# Database - Local PostgreSQL
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/ptms"
DIRECT_URL="postgresql://postgres:your_password@localhost:5432/ptms"

# Storage
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads
```

### 4. Setup Database Tables

```bash
cd ptms-backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

---

## Important Notes

### 1. File Storage

When **NOT using Supabase**, you must use **local file storage**:

```env
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads
```

**What this means:**
- Files are stored in `ptms-backend/uploads/` folder
- Files persist on your server's disk
- For production, consider using AWS S3, Cloudinary, or similar services

### 2. Connection Pooling

Some databases provide two URLs:
- **Pooled/Session URL** → Use for `DATABASE_URL`
- **Direct URL** → Use for `DIRECT_URL`

If only one URL is provided, use it for both.

### 3. SSL/TLS Requirements

Some cloud databases require SSL. Add to your connection string if needed:

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### 4. Migration Issues

If you get migration errors:
1. Make sure database is accessible
2. Check firewall/network settings
3. Verify credentials are correct
4. Try direct connection instead of pooled

### 5. Production Considerations

For production deployments:
- ✅ Use managed PostgreSQL (Railway, Neon, Render, AWS RDS)
- ✅ Enable SSL/TLS
- ✅ Set up automated backups
- ✅ Use connection pooling
- ✅ Monitor database performance
- ❌ Don't use local PostgreSQL for production

---

## Troubleshooting

### Error: "Can't reach database server"
- Check if database is running
- Verify connection string is correct
- Check firewall/network settings
- Ensure database allows connections from your IP

### Error: "Authentication failed"
- Double-check username and password
- Ensure user has proper permissions
- Try resetting database password

### Error: "SSL connection required"
- Add `?sslmode=require` to your connection string

### Error: "Too many connections"
- Reduce `connection_limit` in DATABASE_URL
- Use connection pooling
- Close unused connections

---

## Next Steps

After setting up your database:

1. **Continue with frontend setup** → See `SETUP_TUTORIAL.md` Step 6
2. **Configure email** → See `SETUP_TUTORIAL.md` Step 5
3. **Start the application** → See `SETUP_TUTORIAL.md` Step 9

---

## Need Help?

- Check the main `SETUP_TUTORIAL.md` for general setup
- Review `PROJECT_HANDOVER.md` for architecture details
- Ensure PostgreSQL version is 12 or higher
