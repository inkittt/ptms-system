# Frontend Authentication Setup Guide

## ✅ Implementation Complete

The frontend authentication system has been successfully integrated with your backend API. All necessary components, pages, and services have been created.

## 📁 Files Created

### Core Authentication Files
- `src/lib/api.ts` - HTTP client with automatic token management
- `src/lib/auth.ts` - Authentication service layer
- `src/contexts/AuthContext.tsx` - React context for auth state management

### UI Components
- `src/components/auth/ConsentModal.tsx` - PDPA & ToS consent modal
- `src/components/auth/ProtectedRoute.tsx` - Route protection wrapper
- `src/components/ui/dialog.tsx` - Dialog component (Radix UI)
- `src/components/ui/scroll-area.tsx` - Scroll area component (Radix UI)

### Pages
- `src/app/login/page.tsx` - Login page with matric number support
- `src/app/register/page.tsx` - Registration page with role selection
- `src/app/unauthorized/page.tsx` - Access denied page

### Updated Files
- `src/app/layout.tsx` - Wrapped with AuthProvider
- `src/app/page.tsx` - Auto-redirects authenticated users

## 🚀 Setup Instructions

### 1. Install Missing Dependencies

```bash
cd ptms-frontend
npm install @radix-ui/react-scroll-area
```

### 2. Create Environment File

Create a file named `.env.local` in the `ptms-frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start Backend Server

Make sure your backend is running:

```bash
cd ptms-backend
npm run start:dev
```

The backend should be running on `http://localhost:3000`

### 4. Start Frontend Server

```bash
cd ptms-frontend
npm run dev
```

The frontend will be available at `http://localhost:3001` (or the next available port)

## 🎯 Features Implemented

### ✅ User Authentication
- Login with matric number or email
- Password-based authentication
- JWT token management (access + refresh tokens)
- Automatic token refresh
- Secure logout

### ✅ User Registration
- Multi-role support (Student, Coordinator, Lecturer, Admin)
- Student-specific fields (matric number, program)
- Form validation
- Success confirmation

### ✅ PDPA Consent Flow
- First-time login triggers consent modal
- Full PDPA notice and Terms of Service
- Checkbox validation
- Cannot proceed without acceptance

### ✅ Protected Routes
- Automatic redirect to login for unauthenticated users
- Role-based access control
- Loading states during authentication check

### ✅ Role-Based Routing
After successful login, users are automatically redirected based on their role:
- **STUDENT** → `/student/dashboard`
- **COORDINATOR** → `/coordinator/dashboard`
- **LECTURER** → `/supervisor/dashboard`
- **ADMIN** → `/admin/dashboard`

## 📖 Usage Examples

### Using Authentication in Components

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, logout } = useAuth();

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protecting a Route

```tsx
'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function StudentDashboard() {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div>Student Dashboard Content</div>
    </ProtectedRoute>
  );
}
```

### Making API Calls

```tsx
import { api } from '@/lib/api';

// GET request
const data = await api.get('/some-endpoint');

// POST request
const result = await api.post('/some-endpoint', { data: 'value' });

// Authorization header is automatically added
```

## 🔐 Security Features

1. **Token Storage**: Access tokens stored in localStorage
2. **Automatic Token Refresh**: Tokens refresh before expiration
3. **Secure Logout**: Tokens revoked on backend and cleared locally
4. **Protected Routes**: Unauthorized access automatically redirected
5. **Role Validation**: Server-side role verification on all protected endpoints

## 🧪 Testing the Authentication Flow

### Test Student Registration & Login

1. **Register a Student**
   - Go to `http://localhost:3001/register`
   - Fill in the form:
     - Name: Ahmad Bin Ali
     - Email: ahmad@student.uitm.edu.my
     - Password: SecurePass123!
     - Role: Student
     - Matric No: 2021123456
     - Program: Bachelor of Computer Science
   - Click "Create Account"

2. **Login**
   - Go to `http://localhost:3001/login`
   - Enter matric number: `2021123456`
   - Enter password: `SecurePass123!`
   - Click "Sign In"

3. **Accept PDPA & ToS** (First Login Only)
   - Read the consent modal
   - Check both checkboxes
   - Click "Accept & Continue"

4. **Access Dashboard**
   - You'll be automatically redirected to `/student/dashboard`

### Test Different Roles

Register users with different roles to test role-based routing:
- **Coordinator**: Will redirect to `/coordinator/dashboard`
- **Lecturer**: Will redirect to `/supervisor/dashboard`
- **Admin**: Will redirect to `/admin/dashboard`

## 🔧 API Endpoints Used

The frontend connects to these backend endpoints:

### Public Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/consent` - Submit PDPA consent
- `POST /auth/refresh` - Refresh access token

### Protected Endpoints
- `GET /auth/profile` - Get current user profile
- `POST /auth/logout` - Logout user

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3000` |

## 🐛 Troubleshooting

### Issue: "Cannot connect to backend"
**Solution**: Ensure backend is running on `http://localhost:3000`

### Issue: "CORS errors"
**Solution**: Backend should have CORS enabled for `http://localhost:3001`

### Issue: "Token expired"
**Solution**: This is normal. The system will automatically refresh tokens. If refresh fails, you'll be redirected to login.

### Issue: "Module not found: @radix-ui/react-scroll-area"
**Solution**: Run `npm install @radix-ui/react-scroll-area`

### Issue: TypeScript errors
**Solution**: Restart your IDE/TypeScript server after installing dependencies

## 🎨 Customization

### Changing Token Expiration
Tokens are managed by the backend. To change expiration:
- Access token: 15 minutes (backend: `auth.service.ts`)
- Refresh token: 7 days (backend: `auth.service.ts`)

### Styling
All pages use Tailwind CSS. Modify classes in component files to customize appearance.

### Adding New Roles
1. Update `UserRole` type in `src/lib/auth.ts`
2. Update role routing in `src/contexts/AuthContext.tsx`
3. Update backend `UserRole` enum in Prisma schema

## 📚 Next Steps

### Recommended Enhancements
1. **Add MFA Support** - UI for two-factor authentication setup
2. **Password Reset** - Forgot password flow
3. **Email Verification** - Verify email on registration
4. **Remember Me** - Persistent login option
5. **Session Management** - View and revoke active sessions
6. **Profile Management** - Edit user profile page

### Protecting Existing Routes

Update your existing dashboard pages to use authentication:

```tsx
// Example: src/app/student/dashboard/page.tsx
'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div>
        <h1>Welcome, {user?.name}!</h1>
        {/* Your existing dashboard content */}
      </div>
    </ProtectedRoute>
  );
}
```

## ✨ Summary

Your frontend is now fully integrated with the backend authentication system! Users can:
- ✅ Register with role selection
- ✅ Login with matric number or email
- ✅ Accept PDPA & ToS on first login
- ✅ Access role-specific dashboards
- ✅ Logout securely

All authentication state is managed globally via React Context, and tokens are automatically handled by the API client.
