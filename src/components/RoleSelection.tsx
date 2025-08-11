import { useState } from 'react';
import { Shield, Camera, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RoleSelectionProps {
  userName: string;
  userEmail: string;
  onRoleSelect: (role: 'admin' | 'shooter') => Promise<void>;
  loading?: boolean;
}

export function RoleSelection({ userName, userEmail, onRoleSelect, loading = false }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'shooter' | null>(null);

  const handleContinue = async () => {
    if (selectedRole) {
      await onRoleSelect(selectedRole);
    }
  };

  const roles = [
    {
      id: 'admin' as const,
      title: 'Admin (Project Manager)',
      description: 'Create and manage projects, assign shooters, monitor progress',
      icon: Shield,
      features: [
        'Create and manage projects',
        'Assign zones to shooters',
        'Real-time progress monitoring',
        'Manage shot lists and checklists'
      ],
      badgeColor: 'bg-purple-100 text-purple-800',
      borderColor: 'border-purple-200 hover:border-purple-400'
    },
    {
      id: 'shooter' as const,
      title: 'Shooter (Videographer/Photographer)',
      description: 'Complete assigned shots, add new items, work offline',
      icon: Camera,
      features: [
        'Complete assigned shots',
        'Add new shot items',
        'Work offline with auto-sync',
        'View assigned project progress'
      ],
      badgeColor: 'bg-blue-100 text-blue-800',
      borderColor: 'border-blue-200 hover:border-blue-400'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to SLATE!
          </h1>
          <p className="text-gray-600 mb-1">
            Hi <span className="font-medium">{userName}</span>
          </p>
          <p className="text-sm text-gray-500">{userEmail}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Choose your role to continue
          </h2>
          
          <div className="space-y-4">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              
              return (
                <div
                  key={role.id}
                  className={`
                    relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : `${role.borderColor} bg-white hover:shadow-sm`
                    }
                  `}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-12 h-12 rounded-lg flex items-center justify-center
                      ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {role.title}
                        </h3>
                        <Badge className={role.badgeColor}>
                          {role.id}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {role.description}
                      </p>
                      
                      <div className="space-y-1">
                        {role.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              'Setting up your account...'
            ) : (
              <>
                Continue as {selectedRole && selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            You can change your role later in your profile settings
          </p>
        </div>
      </Card>
    </div>
  );
}
