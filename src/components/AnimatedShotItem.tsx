import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Camera, Video, CheckCircle, AlertCircle, User } from 'lucide-react';
import { formatTimestamp } from '@/utils';
import { cn } from '@/lib/utils';
import type { ShotItem, User as UserType } from '@/types';

interface AnimatedShotItemProps {
  shot: ShotItem;
  isCompleted?: boolean;
  onToggleComplete: (shotId: string) => void;
  users?: UserType[];
  className?: string;
}

export function AnimatedShotItem({ 
  shot, 
  isCompleted = false, 
  onToggleComplete,
  users = [],
  className 
}: AnimatedShotItemProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCompleted, setShowCompleted] = useState(shot.isCompleted);

  const completedUser = users.find(user => user.id === shot.completedBy);

  useEffect(() => {
    if (shot.isCompleted !== showCompleted) {
      setIsAnimating(true);
      
      if (shot.isCompleted) {
        // Completing animation
        setTimeout(() => {
          setShowCompleted(true);
          setIsAnimating(false);
        }, 300);
      } else {
        // Uncompleting animation
        setShowCompleted(false);
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      }
    }
  }, [shot.isCompleted, showCompleted]);

  const handleToggle = () => {
    onToggleComplete(shot.id);
  };

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",
        isAnimating && isCompleted && "animate-pulse",
        isAnimating && !isCompleted && "animate-bounce",
        showCompleted && "opacity-75",
        className
      )}
    >
      <Card 
        className={cn(
          "transition-all duration-300 ease-in-out transform hover:scale-[1.02]",
          showCompleted ? "bg-muted/30 border-green-200" : "bg-card hover:bg-accent/50",
          isAnimating && "scale-105 shadow-lg"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {/* Checkbox */}
            <div className="mt-1">
              <Checkbox 
                checked={showCompleted}
                onCheckedChange={handleToggle}
                className={cn(
                  "transition-all duration-200",
                  showCompleted && "bg-green-500 border-green-500"
                )}
              />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              {/* Title and Icons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Must-Have Priority Indicator */}
                {shot.priority === 'must-have' && (
                  <div title="Must-Have Shot">
                    <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
                  </div>
                )}
                
                {/* Shot Type Icon */}
                {shot.type === 'video' ? 
                  <Video className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    showCompleted ? "text-blue-400" : "text-blue-500"
                  )} /> : 
                  <Camera className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    showCompleted ? "text-green-400" : "text-green-500"
                  )} />
                }
                
                {/* User-Added Indicator */}
                {shot.isUserAdded && (
                  <div title="Added by Shooter">
                    <User className="h-4 w-4 text-purple-500" />
                  </div>
                )}
                
                <span className={cn(
                  "font-medium transition-all duration-300",
                  showCompleted && "line-through text-muted-foreground"
                )}>
                  {shot.title}
                </span>
                
                {shot.isUserAdded && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs transition-opacity duration-300",
                      showCompleted && "opacity-60"
                    )}
                  >
                    <User className="h-3 w-3 mr-1" />
                    User Added
                  </Badge>
                )}
              </div>
              
              {/* Description */}
              {shot.description && (
                <p className={cn(
                  "text-sm text-muted-foreground transition-all duration-300",
                  showCompleted && "line-through opacity-60"
                )}>
                  {shot.description}
                </p>
              )}
              
              {/* Priority and Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={shot.priority === 'must-have' ? 'must-have' : 'nice-to-have'}
                    className={cn(
                      "transition-opacity duration-300",
                      showCompleted && "opacity-60"
                    )}
                  >
                    {shot.priority === 'must-have' ? (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Must-Have
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Nice-to-Have
                      </>
                    )}
                  </Badge>
                </div>
                
                {/* Completion Info */}
                {showCompleted && shot.completedAt && (
                  <div 
                    className={cn(
                      "text-xs text-muted-foreground transition-all duration-500 delay-200",
                      "animate-fade-in"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>
                        {completedUser?.name || 'Unknown'} • {formatTimestamp(shot.completedAt)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
