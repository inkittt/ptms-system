# PTMS Frontend - Practical Training Management System

A modern web application for managing practical training (internship) applications for UiTM students, built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

### Student Portal
- ✅ Eligibility status dashboard (credit requirements)
- ✅ Application progress tracking
- ✅ Document management and downloads
- 🔄 6-step application wizard (in progress)
- 🔄 Real-time status updates

### Coordinator Portal
- ✅ Comprehensive dashboard with statistics
- ✅ Application funnel visualization
- ✅ Review queues (Pending, Under Review, Changes Requested, Approved)
- ✅ Quick application review interface
- 🔄 SLI-03 issuance system (in progress)
- 🔄 Session management (in progress)
- 🔄 Reports and analytics (in progress)

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React
- **Form Handling:** React Hook Form + Zod (planned)
- **State Management:** React Context API

## 📦 Installation

1. Navigate to the project directory:
```bash
cd ptms-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
ptms-frontend/
├── src/
│   ├── app/
│   │   ├── student/
│   │   │   └── dashboard/          # Student dashboard
│   │   ├── coordinator/
│   │   │   └── dashboard/          # Coordinator dashboard
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   └── ui/                     # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── progress.tsx
│   │       └── tabs.tsx
│   ├── lib/
│   │   └── utils.ts                # Utility functions
│   └── types/
│       └── index.ts                # TypeScript type definitions
├── public/                         # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🎨 UI Components

The project uses a custom component library built on top of Radix UI:

- **Button** - Multiple variants (default, outline, ghost, etc.)
- **Card** - Container component with header, content, and footer
- **Badge** - Status indicators with color variants
- **Input** - Form input fields
- **Label** - Form labels
- **Progress** - Progress bars for wizards
- **Tabs** - Tabbed interfaces for queues

## 🔗 Routes

### Public Routes
- `/` - Home page with portal selection

### Student Routes
- `/student/dashboard` - Student dashboard
- `/student/application/new` - New application wizard (planned)
- `/student/application/[id]` - Application details (planned)
- `/student/documents` - Document management (planned)

### Coordinator Routes
- `/coordinator/dashboard` - Coordinator dashboard
- `/coordinator/reviews` - Review queues (planned)
- `/coordinator/reviews/[id]` - Application review (planned)
- `/coordinator/sessions` - Session management (planned)
- `/coordinator/reports` - Reports and analytics (planned)

## 🎯 Current Status

### ✅ Completed
- Project setup with Next.js 15 and TypeScript
- Tailwind CSS configuration
- Base UI component library
- Student dashboard with eligibility tracking
- Coordinator dashboard with statistics and funnel
- Review queue interface with tabs
- Type definitions for all entities

### 🔄 In Progress
- Application wizard (6 steps)
- File upload functionality
- Document preview
- Application review page
- SLI-03 issuance

### 📋 Planned
- Authentication system
- API integration
- Real-time notifications
- Search and filter
- Export functionality
- Mobile optimization

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Development Guidelines

1. **Component Structure**: Use functional components with TypeScript
2. **Styling**: Use Tailwind CSS utility classes
3. **State Management**: Use React hooks and Context API
4. **Type Safety**: Define types in `src/types/index.ts`
5. **Code Style**: Follow ESLint configuration

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=PTMS
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the UiTM CST688 Practical Training Management System.

## 👥 Team

- **Developer**: [Your Name]
- **Coordinator**: Dr. [Coordinator Name]
- **Institution**: Universiti Teknologi MARA (UiTM)

## 📞 Support

For issues or questions, please contact the development team or create an issue in the repository.

---

**Version**: 0.1.0  
**Last Updated**: November 2024
