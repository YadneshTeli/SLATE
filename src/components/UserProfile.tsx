import { useState } from 'react';
import { User, LogOut, Shield, Camera, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

interface UserProfileProps {
  showHeader?: boolean;
  showSignOut?: boolean;
  className?: string;
}

export function UserProfile({ 
  showHeader = true, 
  showSignOut = true,
  className = '' 
}: UserProfileProps) {
  const { user, signOut, updateProfile, loading, error } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editRole, setEditRole] = useState(user?.role || 'shooter');

  if (!user) return null;

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ 
        name: editName, 
        role: editRole 
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditName(user.name);
    setEditRole(user.role);
    setIsEditing(false);
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Shield className="w-4 h-4" /> : <Camera className="w-4 h-4" />;
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        {showHeader && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Profile</h3>
              <p className="text-sm text-gray-500">Manage your account settings</p>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              size="sm"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Profile Content */}
        <div className="space-y-4">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <select
                  id="edit-role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'admin' | 'shooter')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="shooter">Shooter (Videographer/Photographer)</option>
                  <option value="admin">Admin (Project Manager)</option>
                </select>
                <p className="text-xs text-gray-500">
                  Note: Role changes may require admin approval in production
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  size="sm"
                  className="flex-1"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // Display Mode
            <div className="space-y-3">
              {/* Name */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Name</span>
                <span className="font-medium">{user.name}</span>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm font-mono">{user.email}</span>
              </div>

              {/* Role */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role</span>
                <Badge className={`${getRoleColor(user.role)} flex items-center gap-1`}>
                  {getRoleIcon(user.role)}
                  <span className="capitalize">{user.role}</span>
                </Badge>
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Permissions */}
              <div className="pt-2 border-t">
                <span className="text-sm text-gray-600 block mb-2">Permissions</span>
                <div className="space-y-1">
                  {user.role === 'admin' ? (
                    <>
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Create and manage projects
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Assign users to projects
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        View real-time progress dashboard
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Manage shot lists and checklists
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        Complete assigned shots
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        Add new shot items
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        Work offline with auto-sync
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        View assigned project progress
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        {showSignOut && !isEditing && (
          <div className="pt-4 border-t">
            <Button
              onClick={signOut}
              variant="outline"
              className="w-full flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

interface UserAvatarProps {
  user?: { name: string; role: 'admin' | 'shooter' } | null;
  size?: 'sm' | 'md' | 'lg';
  showRole?: boolean;
  className?: string;
}

export function UserAvatar({ 
  user, 
  size = 'md', 
  showRole = false,
  className = '' 
}: UserAvatarProps) {
  if (!user) return null;

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-purple-500 text-white' 
      : 'bg-blue-500 text-white';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        ${getRoleColor(user.role)}
        rounded-full 
        flex items-center justify-center 
        font-semibold
      `}>
        {getInitials(user.name)}
      </div>
      {showRole && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{user.name}</span>
          <span className="text-xs text-gray-500 capitalize">{user.role}</span>
        </div>
      )}
    </div>
  );
}
