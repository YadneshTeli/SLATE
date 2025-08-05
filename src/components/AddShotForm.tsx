import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Video, X, Plus, AlertCircle, Star } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { validateShotItem } from '@/utils';
import type { ShotItem } from '@/types';

interface AddShotFormProps {
  checklistId: string;
  onClose: () => void;
}

export function AddShotForm({ checklistId, onClose }: AddShotFormProps) {
  const { addUserShotItem } = useApp();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'photo' | 'video'>('photo');
  const [priority, setPriority] = useState<ShotItem['priority']>('nice-to-have');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateShotItem({ title, type, priority, description });
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    addUserShotItem(checklistId, title, type, priority, description);
    setTitle('');
    setDescription('');
    setErrors([]);
    onClose();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Add New Shot</CardTitle>
            <CardDescription>Capture an opportunity you spotted</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Shot Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Crowd singing along to chorus"
              className="w-full"
            />
          </div>

          {/* Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Shot Type *</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={type === 'photo' ? 'default' : 'outline'}
                onClick={() => setType('photo')}
                className="h-12 flex-col gap-1"
              >
                <Camera className="h-5 w-5" />
                <span className="text-sm">Photo</span>
              </Button>
              <Button
                type="button"
                variant={type === 'video' ? 'default' : 'outline'}
                onClick={() => setType('video')}
                className="h-12 flex-col gap-1"
              >
                <Video className="h-5 w-5" />
                <span className="text-sm">Video</span>
              </Button>
            </div>
          </div>

          {/* Priority Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Priority *</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={priority === 'must-have' ? 'default' : 'outline'}
                onClick={() => setPriority('must-have')}
                className="h-12 flex-col gap-1"
              >
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm">Must-Have</span>
              </Button>
              <Button
                type="button"
                variant={priority === 'nice-to-have' ? 'default' : 'outline'}
                onClick={() => setPriority('nice-to-have')}
                className="h-12 flex-col gap-1"
              >
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">Nice-to-Have</span>
              </Button>
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Use the 24-70mm lens. Hold for 15 seconds..."
              className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Info Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Plus className="h-3 w-3 mr-1" />
              User-added shot
            </Badge>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="space-y-1 p-3 bg-red-50 border border-red-200 rounded-md">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">{error}</p>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add Shot
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
