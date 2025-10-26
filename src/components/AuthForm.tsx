import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, LogIn, UserPlus, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'admin' | 'shooter'>('shooter');
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, sendPasswordReset, loading, error, clearError } = useAuth();  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (resetMode) {
        await sendPasswordReset(resetEmail);
        setResetSent(true);
        return;
      }

      if (isSignUp) {
        await signUp(email, password, name, role, phoneNumber);
      } else {
        await signIn(email, password);
      }
      
      onSuccess?.();
    } catch (err) {
      // Error is handled by the AuthContext
      console.error('Auth error:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    console.log('🔵 [AuthForm] Google Sign-In button clicked!');
    try {
      console.log('🔵 [AuthForm] Calling signInWithGoogle...');
      await signInWithGoogle();
      console.log('🔵 [AuthForm] signInWithGoogle completed successfully');
      // If sign-in succeeds and user exists, redirect will happen via onAuthStateChanged
      onSuccess?.();
      console.log('🔵 [AuthForm] onSuccess called');
    } catch (err: unknown) {
      // Errors are handled by AuthContext
      // ROLE_SELECTION_REQUIRED will trigger onboarding UI at App level
      console.error('🔴 [AuthForm] Google sign in error:', err);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhoneNumber('');
    setRole('shooter');
    setResetMode(false);
    setResetEmail('');
    setResetSent(false);
    clearError();
  };

  if (resetMode && resetSent) {
    return (
      <Card className="w-full max-w-md mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold">Check Your Email</h2>
          <p className="text-gray-600">
            We've sent a password reset link to <strong>{resetEmail}</strong>
          </p>
          <Button 
            onClick={() => {
              setResetMode(false);
              setResetSent(false);
              setResetEmail('');
            }}
            variant="outline"
            className="w-full"
          >
            Back to Sign In
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold">
            {resetMode ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {resetMode 
              ? 'Enter your email to receive a reset link'
              : isSignUp 
                ? 'Sign up for SLATE to get started'
                : 'Sign in to your SLATE account'
            }
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Google Sign In */}
        {!resetMode && (
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant="outline"
            className="w-full flex items-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285f4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34a853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#fbbc05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#ea4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
        )}

        {/* Divider */}
        {!resetMode && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={resetMode ? resetEmail : email}
                onChange={(e) => resetMode ? setResetEmail(e.target.value) : setEmail(e.target.value)}
                className="pl-10"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          {/* Password (not shown in reset mode) */}
          {!resetMode && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Name and Role (only for sign up) */}
          {isSignUp && !resetMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'shooter')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="shooter">Shooter (Videographer/Photographer)</option>
                  <option value="admin">Admin (Project Manager)</option>
                </select>
                <p className="text-xs text-gray-500">
                  {role === 'admin' 
                    ? 'Can create projects and manage teams'
                    : 'Can complete shots and add new items to assigned projects'
                  }
                </p>
              </div>
            </>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {resetMode ? 'Sending...' : isSignUp ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {resetMode ? (
                  <Mail className="w-4 h-4" />
                ) : isSignUp ? (
                  <UserPlus className="w-4 h-4" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {resetMode ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
              </div>
            )}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          {!resetMode && (
            <p className="text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  resetForm();
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          )}

          {!isSignUp && !resetMode && (
            <p className="text-sm">
              <button
                onClick={() => {
                  setResetMode(true);
                  clearError();
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Forgot your password?
              </button>
            </p>
          )}

          {resetMode && (
            <p className="text-sm">
              <button
                onClick={() => {
                  setResetMode(false);
                  setResetEmail('');
                  clearError();
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>

        {/* Demo Accounts Info */}
        <div className="border-t pt-4">
          <p className="text-xs text-gray-500 text-center mb-2">Demo Accounts (for testing):</p>
          <div className="flex gap-2 justify-center">
            <Badge variant="outline" className="text-xs">admin@slate-demo.com</Badge>
            <Badge variant="outline" className="text-xs">shooter@slate-demo.com</Badge>
          </div>
          <p className="text-xs text-gray-400 text-center mt-1">Password: demo123</p>
        </div>
      </div>
    </Card>
  );
}
