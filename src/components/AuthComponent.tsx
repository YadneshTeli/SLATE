import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LogIn, Mail, Lock, Camera, AlertCircle } from 'lucide-react';
import { validateEmail } from '@/utils';
import type { User } from '@/types';

interface AuthComponentProps {
  onLogin: (user: User) => void;
  isLoading?: boolean;
}

interface LoginForm {
  email: string;
  password: string;
}

export function AuthComponent({ onLogin, isLoading = false }: AuthComponentProps) {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<string[]>([]);

  // Demo users for quick login
  const demoUsers: Pick<User, 'name' | 'email' | 'role'>[] = [
    { name: 'Siddhant', email: 'siddhant@hmcstudios.com', role: 'admin' },
    { name: 'Vittal', email: 'vittal@hmcstudios.com', role: 'shooter' },
    { name: 'Shravan', email: 'shravan@hmcstudios.com', role: 'shooter' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const validationErrors: string[] = [];
    
    if (!form.email) {
      validationErrors.push('Email is required');
    } else if (!validateEmail(form.email)) {
      validationErrors.push('Please enter a valid email address');
    }
    
    if (!form.password) {
      validationErrors.push('Password is required');
    } else if (form.password.length < 6) {
      validationErrors.push('Password must be at least 6 characters');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // In a real app, this would make an API call
    // For demo purposes, we'll check against demo users
    const demoUser = demoUsers.find(user => user.email === form.email);
    
    if (demoUser) {
      const user: User = {
        id: demoUser.name.toLowerCase(), // Use consistent IDs to match demo data
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      onLogin(user);
    } else {
      setErrors(['Invalid email or password']);
    }
  };

  const handleDemoLogin = (demoUser: Pick<User, 'name' | 'email' | 'role'>) => {
    const user: User = {
      id: demoUser.name.toLowerCase(), // Use consistent IDs: 'vittal', 'shravan', 'siddhant'
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onLogin(user);
  };

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <Camera className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold text-foreground">SLATE</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Shot List Assignment & Tracking Engine
          </p>
          <p className="text-xs text-muted-foreground">
            Sign in to access your projects
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access SLATE
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@hmcstudios.com"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="space-y-1 p-3 bg-red-50 border border-red-200 rounded-md">
                  {errors.map((error, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                <LogIn className="h-4 w-4 mr-2" />
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demo Access</CardTitle>
            <CardDescription>
              Quick login for testing and demonstration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoUsers.map((user, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleDemoLogin(user)}
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <Badge variant={user.role === 'admin' ? 'must-have' : 'nice-to-have'}>
                      {user.role === 'admin' ? 'Admin' : 'Shooter'}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-700">
                <strong>Demo Note:</strong> In production, this would connect to a real authentication service like Firebase Auth or Auth0.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2025 HMC Studios. All rights reserved.</p>
          <p>Need help? Contact your project manager.</p>
        </div>
      </div>
    </div>
  );
}
