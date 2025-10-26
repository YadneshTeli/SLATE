// Re-export all UI components for easier imports
export { Button, buttonVariants } from './ui/button'
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
export { Checkbox } from './ui/checkbox'
export { Progress } from './ui/progress'
export { Badge, badgeVariants } from './ui/badge'
export { Input } from './ui/input'

// Re-export feature components
export { AuthForm } from './AuthForm'
export { ProtectedRoute, RoleBased } from './ProtectedRoute'
export { UserProfile, UserAvatar } from './UserProfile'
export { RoleSelection } from './RoleSelection';
export { SyncStatusIndicator } from './SyncStatusIndicator';
export { TeamProgressDashboard } from './TeamProgressDashboard';
export { ShooterDashboard } from './ShooterDashboard';
export { UserManagement } from './UserManagement';
export { UserOnboarding } from './UserOnboarding';
export type { OnboardingData } from './UserOnboarding';

