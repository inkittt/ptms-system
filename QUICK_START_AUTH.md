# 🚀 Quick Start - Authentication System

## ✅ Status: Ready to Use!

Your frontend is now fully connected to the backend authentication system.

## 📋 Quick Setup (3 Steps)

### 1. Create Environment File

Create `ptms-frontend\.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Start Backend
```bash
cd ptms-backend
npm run start:dev
```

### 3. Start Frontend
```bash
cd ptms-frontend
npm run dev
```

## 🎯 Test It Now!

### Register a Student
1. Go to: `http://localhost:3001/register`
2. Fill in:
   - Name: Ahmad Bin Ali
   - Email: ahmad@student.uitm.edu.my
   - Password: SecurePass123!
   - Role: Student
   - Matric No: 2021123456
3. Click "Create Account"

### Login
1. Go to: `http://localhost:3001/login`
2. Enter: `2021123456` (or email)
3. Password: `SecurePass123!`
4. Accept PDPA & ToS
5. ✅ Redirected to Student Dashboard!

## 🔑 Key Features

- ✅ Login with matric number or email
- ✅ PDPA consent on first login
- ✅ Role-based routing
- ✅ Protected routes
- ✅ Auto token refresh
- ✅ Secure logout

## 📚 Full Documentation

See `FRONTEND_AUTH_SETUP.md` for complete details.

## 🎨 Using Auth in Your Components

```tsx
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function MyPage() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🛡️ Protecting Routes

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function StudentDashboard() {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      {/* Your content */}
    </ProtectedRoute>
  );
}
```

That's it! Your authentication is ready to use! 🎉
