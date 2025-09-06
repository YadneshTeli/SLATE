# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# SLATE - Shot List Assignment & Tracking Engine

A modern web-based application for videographers and photographers to track shot completion during live events like concerts and corporate functions.

## 🚀 Features

### Core Functionality
- **Shot List Management**: Interactive checklists for tracking photo/video shots
- **Priority System**: Must-have vs Nice-to-have shot categorization
- **Progress Tracking**: Real-time completion percentages and statistics
- **Offline Support**: Works without internet connection with automatic sync
- **User-Added Shots**: Shooters can add new shots on the fly

### New Enhanced Features ✨

#### 📱 Responsive Design
- **Mobile-First**: Optimized for one-handed operation on phones
- **Tablet Support**: Enhanced layout for larger screens
- **Desktop Layout**: Professional sidebar layout with grid views
- **Adaptive UI**: Automatically adjusts layout based on screen size

#### 🎯 Enhanced Add Shot Form
- **Priority Selection**: Choose between Must-Have and Nice-to-Have
- **Description Field**: Optional detailed instructions for shots
- **Improved UI**: Better visual feedback and validation
- **Type Selection**: Visual photo/video type selection with icons

#### 👥 Authentication System
- **Secure Login**: Email/password authentication
- **Demo Access**: Quick login for testing with preset users
- **Role-Based Access**: Admin vs Shooter permissions
- **Professional UI**: Clean, branded login experience

#### 📊 Admin Dashboard
- **Project Overview**: Comprehensive project statistics
- **Team Performance**: Individual shooter progress tracking
- **Recent Activity**: Live feed of completed shots
- **Visual Analytics**: Progress bars and completion metrics

#### ⚙️ Project Management (Admin)
- **Checklist Creation**: Organize shots into categories
- **Shot Management**: Add, edit, and delete individual shots
- **Team Assignment**: Assign shooters to specific zones
- **Real-time Monitoring**: Track team progress across projects

## 🛠 Tech Stack

- **Frontend**: React 19.1.0 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + useReducer
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Offline Support**: localStorage + PWA-ready architecture

## 📱 Responsive Breakpoints

- **Mobile**: < 1024px (single column, mobile-optimized)
- **Tablet/Desktop**: ≥ 1024px (sidebar + main content layout)
- **Large Desktop**: ≥ 1280px (expanded grid layouts)

## 🎭 Demo Users

The application includes demo authentication for testing:

### Admin User
- **Name**: Siddhant
- **Email**: siddhant@hmcstudios.com
- **Role**: Project Manager
- **Access**: Full project management capabilities

### Shooter Users
- **Name**: Vittal
- **Email**: vittal@hmcstudios.com
- **Role**: Videographer
- **Zone**: Stage + Pit

- **Name**: Shravan
- **Email**: shravan@hmcstudios.com
- **Role**: Photographer
- **Zone**: GA + Sponsor Village

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Application**
   Navigate to `http://localhost:5175` (or the shown port)

4. **Login**
   Use the demo credentials or create a new account

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── AddShotForm.tsx     # Enhanced shot creation form
│   ├── AuthComponent.tsx   # Authentication interface
│   ├── ProjectDashboard.tsx # Admin dashboard
│   └── ProjectManagement.tsx # Admin project tools
├── contexts/
│   └── AppContext.tsx      # Global state management
├── hooks/
│   └── useApp.ts          # App context hook
├── types/
│   └── index.ts           # TypeScript interfaces
├── utils/
│   └── index.ts           # Utility functions
├── App.tsx                # Main application component
└── main.tsx              # Application entry point
```

## 🎯 User Experience

### For Shooters
1. **Quick Access**: Login once, auto-navigate to active project
2. **Visual Priority**: Clear must-have vs nice-to-have indicators
3. **Fast Completion**: One-tap shot completion tracking
4. **Add Opportunities**: Capture unexpected shots on the fly
5. **Offline Ready**: Works without internet, syncs when connected

### For Admins
1. **Project Setup**: Create detailed shot lists and assignments
2. **Team Monitoring**: Real-time progress across all shooters
3. **Flexible Management**: Edit shots and checklists on the fly
4. **Performance Analytics**: Track team efficiency and completion rates
5. **Zone Management**: Assign specific areas to team members

## 🔄 Data Flow

1. **Admin** creates project and assigns shooters to zones
2. **Admin** creates checklists and populates with required shots
3. **Shooters** access their assigned shot lists on mobile devices
4. **Real-time sync** keeps everyone updated on progress
5. **Offline support** ensures reliability in poor network conditions

## 🎨 Design System

- **Colors**: Professional blue/gray palette with priority indicators
- **Typography**: Clean, readable fonts optimized for mobile
- **Icons**: Consistent Lucide React icon set
- **Spacing**: Tailwind's systematic spacing scale
- **Components**: Reusable shadcn/ui component library

## 🚀 Future Enhancements

- **Real-time Database**: Firebase/Firestore integration
- **Push Notifications**: Shot assignment and completion alerts
- **Image Upload**: Reference photos for shot requirements
- **Advanced Analytics**: Detailed performance metrics
- **Multi-language**: International team support
- **PWA Features**: Install as native app
- **Camera Integration**: Direct capture from within app

## 📄 License

© 2025 HMC Studios. All rights reserved.


---

Built with ❤️ for professional videographers and photographers.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
