import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { User, Briefcase, Camera, Phone, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface UserOnboardingProps {
  initialEmail?: string;
  initialName?: string;
  onComplete: (data: OnboardingData) => void;
  onCancel?: () => void;
}

export interface OnboardingData {
  name: string;
  role: 'admin' | 'shooter';
  phoneNumber?: string;
  preferences?: {
    notifications: boolean;
  };
}

const steps = [
  { id: 'welcome', title: 'Welcome to SLATE', description: 'Let\'s get you set up' },
  { id: 'role', title: 'Choose Your Role', description: 'Select how you\'ll be using SLATE' },
  { id: 'details', title: 'Your Details', description: 'Tell us a bit about yourself' },
  { id: 'complete', title: 'All Set!', description: 'You\'re ready to go' },
];

import gsap from 'gsap';

export function UserOnboarding({ initialEmail, initialName, onComplete, onCancel }: UserOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    name: initialName || '',
    role: 'shooter',
    phoneNumber: '',
    preferences: {
      notifications: true,
    },
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(formData);
  };

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData({ ...formData, ...updates });
  };

  // GSAP refs for step enter animation
  const stepRef = useRef<HTMLDivElement | null>(null);
  const prevStepRef = useRef<number>(0);

  useEffect(() => {
    const el = stepRef.current;
    if (!el) return;

    const direction = currentStep > prevStepRef.current ? 1 : -1;

    // simple enter animation: slide from right when going forward, left when back
    gsap.fromTo(
      el,
      { x: direction > 0 ? 200 : -200, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.45, ease: 'power2.out' }
    );

    prevStepRef.current = currentStep;
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    index <= currentStep
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-semibold">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 w-12 mx-2 transition-all ${
                      index < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>

        <CardContent>
          <div
            ref={stepRef}
            key={currentStep}
            className="relative"
          >
              {/* Step 0: Welcome */}
              {currentStep === 0 && (
                <div className="space-y-6 py-8">
                  <div className="text-center">
                    <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <User className="w-10 h-10 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Welcome{initialName ? `, ${initialName}` : ''}!
                    </h3>
                    {initialEmail && (
                      <p className="text-gray-600 mb-4">{initialEmail}</p>
                    )}
                    <p className="text-gray-600 max-w-md mx-auto">
                      SLATE is your comprehensive video production management platform.
                      Let's take a moment to set up your account and get you started.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <Briefcase className="w-8 h-8 text-purple-600 mb-2" />
                      <h4 className="font-semibold mb-1">For Admins</h4>
                      <p className="text-sm text-gray-600">
                        Manage projects, teams, and track progress
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <Camera className="w-8 h-8 text-purple-600 mb-2" />
                      <h4 className="font-semibold mb-1">For Shooters</h4>
                      <p className="text-sm text-gray-600">
                        Capture shots, update checklists, and collaborate
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Role Selection */}
              {currentStep === 1 && (
                <div className="space-y-6 py-8">
                  <p className="text-center text-gray-600 mb-6">
                    Choose the role that best describes how you'll use SLATE
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => updateFormData({ role: 'admin' })}
                      className={`p-6 border-2 rounded-lg text-left transition-all hover:shadow-lg ${
                        formData.role === 'admin'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            formData.role === 'admin'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">Admin</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            I manage projects, assign tasks, and oversee production workflows
                          </p>
                          <ul className="text-xs text-gray-500 space-y-1">
                            <li>• Create and manage projects</li>
                            <li>• Assign team members</li>
                            <li>• Track progress and analytics</li>
                            <li>• Manage user permissions</li>
                          </ul>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => updateFormData({ role: 'shooter' })}
                      className={`p-6 border-2 rounded-lg text-left transition-all hover:shadow-lg ${
                        formData.role === 'shooter'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            formData.role === 'shooter'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Camera className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">Shooter</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            I capture content, complete checklists, and work on assigned projects
                          </p>
                          <ul className="text-xs text-gray-500 space-y-1">
                            <li>• View assigned projects</li>
                            <li>• Add and update shots</li>
                            <li>• Complete checklists</li>
                            <li>• Real-time collaboration</li>
                          </ul>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Additional Details */}
              {currentStep === 2 && (
                <div className="space-y-6 py-8">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateFormData({ name: e.target.value })}
                        placeholder="Enter your full name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        We'll use this for important project notifications
                      </p>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-3">Preferences</h4>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferences?.notifications}
                          onChange={(e) =>
                            updateFormData({
                              preferences: {
                                ...formData.preferences,
                                notifications: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm">
                          Receive email notifications for project updates
                        </span>
                      </label>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <h4 className="font-semibold text-blue-900 mb-2">Your Role Summary</h4>
                      <p className="text-sm text-blue-800">
                        You're signing up as a{' '}
                        <span className="font-semibold">
                          {formData.role === 'admin' ? 'Admin' : 'Shooter'}
                        </span>
                        . {formData.role === 'admin'
                          ? "You'll have full access to create and manage projects."
                          : "You'll be able to work on projects assigned to you by admins."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Complete */}
              {currentStep === 3 && (
                <div className="space-y-6 py-8 text-center">
                  <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold">You're All Set!</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Your SLATE account has been configured. You're ready to start{' '}
                    {formData.role === 'admin'
                      ? 'managing projects and collaborating with your team'
                      : 'working on your assigned projects and capturing amazing content'}
                    .
                  </p>

                  <div className="bg-purple-50 rounded-lg p-6 mt-6">
                    <h4 className="font-semibold mb-4">Quick Start Tips</h4>
                    <div className="grid grid-cols-1 gap-3 text-left">
                      {formData.role === 'admin' ? (
                        <>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              1
                            </div>
                            <p className="text-sm">Create your first project from the dashboard</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              2
                            </div>
                            <p className="text-sm">Invite team members and assign them to projects</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              3
                            </div>
                            <p className="text-sm">Monitor progress in real-time with the analytics dashboard</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              1
                            </div>
                            <p className="text-sm">Wait for an admin to assign you to a project</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              2
                            </div>
                            <p className="text-sm">View your project checklist and capture shots</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              3
                            </div>
                            <p className="text-sm">Collaborate with your team in real-time</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onCancel : handleBack}
              disabled={currentStep === 0 && !onCancel}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 2 && !formData.name.trim())
                }
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                Get Started
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
