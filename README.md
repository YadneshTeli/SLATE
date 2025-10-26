# SLATE - Shot List Assignment & Tracking Engine

A modern, production-ready web application for videographers and photographers to manage and track shot completion during live events like concerts, corporate functions, and weddings. Built with React 19, TypeScript, Firebase, and optimized for mobile-first workflows.

## 🎯 Overview

SLATE streamlines the entire production workflow from project creation to shot completion, enabling teams to work efficiently both online and offline. Admins can create detailed shot lists, assign teams to zones, and monitor progress in real-time, while shooters get a focused, distraction-free interface to complete their assignments.

## ✨ Core Features

### 🔐 Authentication & User Management
- **Firebase Authentication**: Secure email/password and Google Sign-In
- **Role-Based Access Control**: Admin and Shooter roles with distinct permissions
- **User Onboarding**: Guided setup for new users with role selection
- **Profile Management**: Update name, phone number, and profile picture
- **Password Reset**: Email-based password recovery
- **Session Persistence**: Auto-login with secure token management

### 📋 Project Management (Admin)
- **Full CRUD Operations**: Create, Read, Update, Delete for Projects, Checklists, and Shots
- **Flexible Project Organization**:
  - Projects with descriptions and dates
  - Checklists for categorizing shots (e.g., "Opening Act", "Headliner", "Crowd")
  - Individual shot items with detailed specifications
- **Team Assignment**:
  - Assign multiple shooters per project
  - Define zones for each shooter (e.g., "Stage", "Pit", "GA", "Sponsor Village")
  - Real-time shooter availability tracking
- **Priority System**:
  - **Must-Have**: Critical shots that cannot be missed
  - **Nice-to-Have**: Optional shots to capture if time permits
- **Bulk Operations**: Edit multiple shots and checklists efficiently
- **Project Filtering**: View all projects or filter by specific project

### 📊 Admin Dashboard
- **Multi-Project Overview**:
  - Project selector dropdown (view all or specific project)
  - Aggregate statistics across all projects
  - Individual project cards with quick stats
- **Real-Time Metrics**:
  - Total shots and completion percentages
  - Must-have vs nice-to-have progress tracking
  - Active shooter counts
  - Recent activity feed
- **Visual Progress Tracking**:
  - Animated progress bars with GSAP
  - Color-coded priority indicators
  - Completion rate badges
- **Team Performance Dashboard**:
  - Individual shooter progress by zone
  - Shot type breakdown (photo vs video)
  - Completion timelines

### 🎥 Shooter Interface
- **Focused Workflow**:
  - Clean, distraction-free checklist view
  - Large, touch-optimized buttons (44px minimum - WCAG AAA compliant)
  - Priority-based visual indicators
- **Shot Completion**:
  - One-tap completion toggle
  - Automatic timestamp recording
  - Visual feedback with animations
- **Add Custom Shots**:
  - Create new shots on the fly
  - Set priority and description
  - Choose photo or video type
- **Persistent Header**:
  - Always-visible project name
  - Assigned zone display
  - Real-time progress counter (e.g., "16/25 Completed")
- **Last Viewed Project**: Automatically opens last worked-on project

### 📱 Mobile-First Responsive Design
- **Adaptive Layouts**:
  - **Mobile** (< 640px): Single column, stacked elements
  - **Tablet** (640-1024px): Optimized grid layouts
  - **Desktop** (> 1024px): Sidebar navigation with expanded views
- **Touch Optimizations**:
  - 44px minimum tap targets (WCAG AAA)
  - `touch-manipulation` CSS for fast touch response
  - Swipe-friendly card interfaces
- **Responsive Typography**:
  - Scales from `text-xs` to `text-base` across breakpoints
  - Truncation and line-clamping for overflow content
- **Flexible Components**:
  - `flex-col sm:flex-row` stacking patterns
  - `w-full sm:w-auto` adaptive widths
  - Responsive spacing with Tailwind's `sm:` and `md:` variants

### 🔄 Offline Support & PWA
- **Progressive Web App**:
  - Installable on mobile devices and desktop
  - Service Worker for asset caching
  - Background sync when connection restored
- **IndexedDB Storage**:
  - Persistent offline data storage
  - Automatic sync queue management
  - Conflict resolution strategies
- **Offline-First Architecture**:
  - Continue working without internet
  - Local-first state updates
  - Automatic Firebase sync when online
- **Connection Status**:
  - Visual offline indicator
  - Connection state monitoring
  - Graceful degradation

### 🔥 Firebase Integration
- **Realtime Database**:
  - Live data synchronization
  - Real-time collaboration
  - Optimistic UI updates
- **Firebase Authentication**:
  - Email/password authentication
  - Google OAuth integration
  - Secure session management
- **Security Rules**:
  - Role-based data access
  - User-specific data permissions
  - Protected admin operations
- **Database Structure**:
  ```
  /users/{userId}
  /projects/{projectId}
  /checklists/{checklistId}
  /shotItems/{shotItemId}
  /projectProgress/{projectId}
  ```

### 🎨 Modern UI/UX
- **shadcn/ui Components**: High-quality, accessible component library
- **Tailwind CSS**: Utility-first styling with custom design system
- **GSAP Animations**:
  - Page transitions
  - Progress bar animations
  - Staggered list reveals
  - Smooth micro-interactions
- **Lucide Icons**: Consistent, scalable icon system
- **Dark Mode Ready**: Color scheme prepared for dark theme
- **Loading States**: Skeleton screens and spinners for async operations

## 🛠 Tech Stack

### Frontend
- **React 19.1.0**: Latest React with concurrent features
- **TypeScript 5.8**: Type-safe development
- **Vite 7.0**: Lightning-fast build tool and dev server
- **React Router DOM 7.7**: Client-side routing with data loading
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **shadcn/ui**: Radix UI-based component system

### Backend & Services
- **Firebase 12.0**:
  - Realtime Database for data storage
  - Authentication for user management
  - Hosting for deployment
- **IndexedDB**: Browser-based offline storage

### Animation & Interaction
- **GSAP 3.13**: Professional-grade animation library
- **Lucide React 0.536**: Modern icon library

### Development Tools
- **ESLint 9.30**: Code quality and consistency
- **TypeScript ESLint 8.35**: TypeScript-specific linting
- **PostCSS & Autoprefixer**: CSS processing

## 📁 Project Structure

```
SLATE/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── progress.tsx
│   │   │   └── ...
│   │   ├── animations/     # GSAP animation components
│   │   │   └── PageTransitions.tsx
│   │   ├── AddShotForm.tsx          # Enhanced shot creation form
│   │   ├── AnimatedShotItem.tsx     # Shot list item with animations
│   │   ├── AppRouter.tsx            # Application routing
│   │   ├── AuthComponent.tsx        # Demo authentication (legacy)
│   │   ├── AuthForm.tsx             # Firebase auth form
│   │   ├── EnhancedAdminDashboard.tsx  # Multi-project dashboard
│   │   ├── OfflineIndicator.tsx     # Network status indicator
│   │   ├── PersistentHeader.tsx     # Sticky project header
│   │   ├── ProjectCreationDashboard.tsx  # Project CRUD interface
│   │   ├── ProjectDashboard.tsx     # Shooter's project view
│   │   ├── ProjectManagement.tsx    # Admin project tools
│   │   ├── ProtectedRoute.tsx       # Route authorization
│   │   ├── RoleSelection.tsx        # Google sign-in role picker
│   │   ├── TeamProgressDashboard.tsx  # Team analytics
│   │   ├── UserManagement.tsx       # Admin user controls
│   │   ├── UserOnboarding.tsx       # New user onboarding flow
│   │   └── UserProfile.tsx          # User profile management
│   ├── contexts/
│   │   ├── AppContext.tsx           # Global app state
│   │   └── AuthContext.tsx          # Authentication state
│   ├── hooks/
│   │   ├── useApp.ts                # App context hook
│   │   └── usePWA.ts                # PWA installation hook
│   ├── lib/
│   │   ├── firebase.ts              # Firebase configuration
│   │   ├── authService.ts           # Authentication service
│   │   ├── realtimeService.ts       # Database operations
│   │   └── syncService.ts           # Offline sync logic
│   ├── pages/
│   │   ├── AdminDashboardPage.tsx   # Admin dashboard page
│   │   ├── AdminProjectsPage.tsx    # Admin projects list
│   │   ├── AuthPage.tsx             # Login/signup page
│   │   ├── ChecklistPage.tsx        # Individual checklist view
│   │   ├── DashboardPage.tsx        # Main dashboard router
│   │   ├── ProjectDetailPage.tsx    # Project details
│   │   ├── ProjectManagementPage.tsx  # Project management
│   │   ├── ProjectsPage.tsx         # Projects list
│   │   └── ShooterProjectPage.tsx   # Shooter's project view
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   ├── utils/
│   │   ├── demoData.ts              # Demo data generator
│   │   ├── index.ts                 # Utility functions
│   │   └── offlineDataManager.ts    # IndexedDB manager
│   ├── App.tsx                      # Root component
│   ├── main.tsx                     # Application entry
│   └── index.css                    # Global styles
├── public/
│   ├── manifest.json                # PWA manifest
│   ├── sw.js                        # Service worker
│   └── vite.svg                     # App icon
├── database.rules.json              # Firebase security rules
├── firebase.json                    # Firebase configuration
├── .firebaserc                      # Firebase project settings
├── tailwind.config.js               # Tailwind configuration
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite configuration
└── package.json                     # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** 9.0 or higher
- **Firebase Account** (for production deployment)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/YadneshTeli/SLATE.git
   cd SLATE
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup** (for production)
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   App will open at `http://localhost:5173`

5. **Build for Production**
   ```bash
   npm run build
   ```

### Firebase Configuration

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Project** (if not already done)
   ```bash
   firebase init
   ```
   Select:
   - Realtime Database
   - Hosting
   - Authentication

4. **Deploy Database Rules**
   ```bash
   npm run firebase:deploy:rules
   ```

5. **Deploy to Firebase Hosting**
   ```bash
   npm run firebase:deploy
   ```

### Adding to Authorized Domains

After deployment, add your domain to Firebase:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Add your deployment URL (e.g., `slate-pwa.netlify.app` or `your-app.web.app`)

## 👥 User Roles & Permissions

### Admin
**Capabilities:**
- ✅ Create, edit, and delete projects
- ✅ Create, edit, and delete checklists
- ✅ Create, edit, and delete shots
- ✅ Assign shooters to projects with zones
- ✅ View team progress and analytics
- ✅ Manage user roles (promote/demote)
- ✅ Access admin dashboard and all projects
- ✅ Real-time monitoring of all shooters

**Use Cases:**
- Project Managers
- Production Coordinators
- Creative Directors

### Shooter
**Capabilities:**
- ✅ View assigned projects and zones
- ✅ Mark shots as complete/incomplete
- ✅ Add new shots to own checklist (user-added shots)
- ✅ View personal progress and stats
- ✅ Work offline with automatic sync
- ❌ Cannot edit or delete admin-created shots
- ❌ Cannot access other shooters' projects
- ❌ Cannot modify project settings

**Use Cases:**
- Videographers
- Photographers
- Camera Operators
- Content Creators

## 📱 Mobile Usage Guide

### For Shooters

1. **First Time Setup**
   - Sign in with email or Google
   - Select "Shooter" role during onboarding
   - Complete profile with phone number

2. **Daily Workflow**
   - App automatically opens last viewed project
   - See assigned zone in persistent header
   - Progress counter shows "16/25 Completed"
   - Tap shots to mark complete (must-have shots highlighted in red)
   - Add custom shots with + button

3. **Offline Mode**
   - Continue working without internet
   - Offline indicator shows connection status
   - Changes sync automatically when online

4. **Installing as App** (PWA)
   - iOS: Safari → Share → "Add to Home Screen"
   - Android: Chrome → Menu → "Install App"

### For Admins

1. **Project Creation**
   - Create project with name, description, date
   - Add checklists (e.g., "Opening", "Main Set", "Encore")
   - Add shots to each checklist with priorities
   - Assign shooters and define their zones

2. **Team Monitoring**
   - Dashboard shows all projects or filter specific project
   - View aggregate stats across all projects
   - Click project cards to see detailed progress
   - Recent activity feed shows latest completions

3. **Real-Time Collaboration**
   - See shooter progress update live
   - Filter by project to focus on specific event
   - Edit shots and checklists on the fly

## 🎯 Key Workflows

### Creating a New Project

```
Admin Dashboard → Projects Tab → Create Project
→ Enter project details
→ Create checklists
→ Add shots to each checklist
→ Assign shooters with zones
→ Save Project
```

### Completing Shots (Shooter)

```
Login → Auto-open last project
→ View checklist organized by priority
→ Tap shot to mark complete
→ Add custom shots if needed
→ Progress updates in header
```

### Monitoring Team Progress

```
Admin Dashboard → Select "All Projects" or specific project
→ View aggregate metrics
→ Click project card for details
→ See individual shooter progress
→ Check recent activity feed
```

## 🔒 Security Features

- **Firebase Security Rules**: Role-based access control
- **Authentication Required**: All routes protected
- **HTTPS Only**: Secure data transmission
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based requests
- **Data Validation**: Client and server-side validation

## 🌐 Browser Support

- **Chrome/Edge** 90+
- **Firefox** 88+
- **Safari** 14+
- **Mobile Safari** 14+
- **Chrome Android** 90+

## 🚀 Performance Optimizations

- **Code Splitting**: Lazy-loaded routes and components
- **Tree Shaking**: Removes unused code
- **Asset Optimization**: Minified JS/CSS, compressed images
- **Service Worker Caching**: Instant load for repeat visits
- **Optimistic UI**: Immediate feedback before server confirmation
- **Virtual Scrolling**: Efficient rendering of large lists

## 🧪 Testing Accounts

### Demo Admin
- **Email**: admin@hmcstudios.com
- **Password**: admin123
- **Role**: Admin (Project Manager)
- **Access**: Full CRUD operations, team management

### Demo Shooter
- **Email**: shooter@hmcstudios.com
- **Password**: shooter123
- **Role**: Shooter (Videographer)
- **Access**: Assigned projects, shot completion

*Note: Demo accounts use Firebase Authentication in production*

## 📊 Data Model

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'shooter';
  phoneNumber?: string;
  profilePicture?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}
```

### Project
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  date?: Date;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdBy: string;  // User ID
  assignments: ProjectAssignment[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectAssignment {
  userId: string;
  zone?: string;  // e.g., "Stage", "Pit", "GA"
  assignedAt: Date;
}
```

### Checklist
```typescript
interface Checklist {
  id: string;
  projectId: string;
  name: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### ShotItem
```typescript
interface ShotItem {
  id: string;
  checklistId: string;
  title: string;
  description?: string;
  type: 'photo' | 'video';
  priority: 'must-have' | 'nice-to-have';
  isCompleted: boolean;
  isUserAdded: boolean;  // Created by shooter
  createdBy: string;  // User ID
  completedBy?: string;  // User ID
  completedAt?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🛣 Roadmap

### v1.1 (Current - Completed ✅)
- ✅ Firebase Realtime Database integration
- ✅ Google Sign-In authentication
- ✅ Multi-project filtering in admin dashboard
- ✅ Full CRUD for projects, checklists, and shots
- ✅ Mobile-first responsive design
- ✅ Offline support with IndexedDB
- ✅ PWA with service worker

### v1.2 (Planned)
- 📸 Camera integration for direct capture
- 🖼 Image upload and reference photos
- 🔔 Push notifications for assignments
- 📧 Email notifications for project updates
- 📱 Native mobile apps (React Native)

### v2.0 (Future)
- 🌍 Multi-language support (i18n)
- 📊 Advanced analytics and reporting
- 📤 Export data to CSV/PDF
- 🎨 Dark mode
- 🔗 Integration with Dropbox/Google Drive
- 👥 Team chat and collaboration
- 📅 Calendar integration
- 🎥 Video player integration

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

Copyright © 2025 Yadnesh Teli

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Firebase** for backend infrastructure
- **Tailwind CSS** for the styling framework
- **GSAP** for professional animations
- **Lucide** for the icon system
- **Vite** for the blazing-fast build tool

## 📞 Support

For issues, questions, or feature requests:
- **GitHub Issues**: [Create an issue](https://github.com/YadneshTeli/SLATE/issues)
- **Email**: support@hmcstudios.com
- **Documentation**: [Full docs](#) (coming soon)

---

**Built with ❤️ by Yadnesh Teli (Taskuick Solutions) for HMC Studios and professional videographers worldwide.**
