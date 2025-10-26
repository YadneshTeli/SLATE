# Contributing to SLATE

Thank you for your interest in contributing to SLATE! We welcome contributions from the community to help make this project better for videographers and photographers worldwide.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Development Setup](#development-setup)

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Be respectful and considerate in communication
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## 🚀 Getting Started

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SLATE.git
   cd SLATE
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/YadneshTeli/SLATE.git
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## 🔄 Development Workflow

### 1. Keep Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### 2. Development Server

```bash
npm run dev
```

The app will run at `http://localhost:5173`

### 3. Build and Test

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### 4. Firebase Setup (Optional)

For testing Firebase features, create a `.env.local` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📝 Coding Standards

### TypeScript

- **Use TypeScript** for all new files
- **Define interfaces** for data structures in `src/types/index.ts`
- **Avoid `any` type** - use proper typing or `unknown` if necessary
- **Use type inference** where possible

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  role: 'admin' | 'shooter';
}

const user: User = {
  id: '123',
  name: 'John Doe',
  role: 'admin'
};

// ❌ Avoid
const user: any = { ... };
```

### React Components

- **Use functional components** with hooks
- **Use named exports** for components (not default exports)
- **Keep components focused** - one responsibility per component
- **Extract reusable logic** into custom hooks

```typescript
// ✅ Good
export const UserProfile = ({ userId }: { userId: string }) => {
  const user = useUser(userId);
  
  return (
    <div>
      <h1>{user.name}</h1>
    </div>
  );
};

// ❌ Avoid
export default function UserProfile(props) {
  // ...
}
```

### Styling

- **Use Tailwind CSS** utility classes
- **Follow mobile-first** approach
- **Use responsive breakpoints**: `sm:`, `md:`, `lg:`
- **Maintain 44px minimum** touch targets for mobile

```tsx
// ✅ Good
<button className="min-h-[44px] px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 sm:px-6 sm:py-3">
  Click Me
</button>
```

### File Organization

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui primitives
│   └── [Component].tsx
├── pages/           # Page-level components
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── lib/             # Firebase, utilities, services
├── types/           # TypeScript interfaces
└── utils/           # Helper functions
```

### Naming Conventions

- **Components**: PascalCase - `UserProfile.tsx`
- **Hooks**: camelCase with "use" prefix - `useAuth.ts`
- **Utilities**: camelCase - `formatDate.ts`
- **Constants**: UPPER_SNAKE_CASE - `MAX_FILE_SIZE`
- **Interfaces**: PascalCase - `interface Project { ... }`

## 📦 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear commit history:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes

### Examples

```bash
# Feature
git commit -m "feat(dashboard): add multi-project filtering"

# Bug fix
git commit -m "fix(auth): resolve Google sign-in redirect issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactor
git commit -m "refactor(components): extract reusable ShotCard component"
```

### Commit Message Rules

- Use **present tense** ("add feature" not "added feature")
- Use **imperative mood** ("move cursor to..." not "moves cursor to...")
- Keep **subject line under 72 characters**
- Separate subject from body with blank line
- Reference **issue numbers** in footer if applicable

```bash
feat(offline): add IndexedDB sync queue

Implement offline-first architecture with IndexedDB for data persistence.
Changes sync automatically when connection is restored.

Closes #123
```

## 🔀 Pull Request Process

### Before Submitting

1. **Update your branch** with latest upstream changes
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Ensure code quality**
   ```bash
   npm run lint       # Fix linting issues
   npm run build      # Verify build succeeds
   ```

3. **Test your changes**
   - Test on mobile viewport
   - Test offline functionality (if applicable)
   - Test both Admin and Shooter roles

### Submitting PR

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub with:
   - **Clear title** following commit conventions
   - **Detailed description** of changes
   - **Screenshots/videos** for UI changes
   - **Reference issue** if applicable

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on mobile viewport
- [ ] Tested offline functionality
- [ ] Tested admin role
- [ ] Tested shooter role
- [ ] Build succeeds
- [ ] No console errors

## Screenshots (if applicable)
Add screenshots or GIFs

## Related Issues
Closes #123
```

### Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged
- Your contribution will be credited

## 🐛 Reporting Bugs

### Before Reporting

1. **Check existing issues** to avoid duplicates
2. **Test on latest version** of main branch
3. **Gather information**:
   - Browser and version
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior

### Bug Report Template

```markdown
**Describe the Bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
Add screenshots if applicable

**Environment**
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Device: [e.g., iPhone 15, Desktop]
- SLATE Version: [e.g., v1.1.0]

**Additional Context**
Any other relevant information
```

## 💡 Suggesting Features

We welcome feature suggestions! Please:

1. **Check existing feature requests** first
2. **Describe the problem** your feature solves
3. **Propose a solution** with details
4. **Consider alternatives** you've thought about

### Feature Request Template

When creating a feature request, please include:

```markdown
**Problem Statement**
- Describe the problem or limitation you're experiencing
- Explain why this is important to solve

**Proposed Solution**
- Clear description of your proposed feature
- How it would work from a user perspective
- Any technical considerations you're aware of

**Alternatives Considered**
- Other approaches you've thought about
- Why those alternatives might not be ideal

**Use Cases**
- Real-world scenarios where this feature helps
- Specific workflows it would improve
- Who would benefit (admins, shooters, or both)

**Additional Context**
- Mockups, wireframes, or screenshots
- Examples from other applications
- Any relevant research or references
```

## 🛠 Development Setup

### Recommended VS Code Extensions

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **TypeScript Vue Plugin (Volar)** - TypeScript support
- **Error Lens** - Inline error display

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### Project Structure Guidelines

- **Components**: Place in appropriate folder based on purpose
- **Hooks**: Extract reusable logic into custom hooks
- **Utils**: Pure functions with no side effects
- **Types**: Centralized in `src/types/index.ts`
- **Services**: Firebase and API calls in `src/lib/`

## 🎯 Areas for Contribution

We especially welcome contributions in:

- 📱 **Mobile Optimization**: Improving touch interactions and responsive design
- 🔄 **Offline Support**: Enhancing PWA capabilities and sync logic
- 🎨 **UI/UX**: Accessibility improvements and visual enhancements
- 📊 **Analytics**: Adding insights and reporting features
- 🧪 **Testing**: Unit tests, integration tests, E2E tests
- 📚 **Documentation**: Guides, tutorials, API docs
- 🌍 **Internationalization**: Multi-language support
- ♿ **Accessibility**: WCAG compliance improvements

## 📞 Questions?

- **GitHub Discussions**: Ask questions or discuss ideas
- **GitHub Issues**: Report bugs or request features
- **Email**: yadneshteli.dev@gmail.com

## 🙏 Thank You

Your contributions make SLATE better for photographers and videographers worldwide. We appreciate your time and effort! 

---

**Happy Contributing! 🎉**

Built with ❤️ by the SLATE community
