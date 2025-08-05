import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Page entrance animation
      gsap.fromTo(
        containerRef.current,
        { 
          opacity: 0, 
          y: 20,
          scale: 0.98
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.6, 
          ease: 'power2.out' 
        }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export function FadeIn({ children, delay = 0, direction = 'up', className = '' }: FadeInProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      const directionMap = {
        up: { y: 20, x: 0 },
        down: { y: -20, x: 0 },
        left: { y: 0, x: 20 },
        right: { y: 0, x: -20 }
      };

      const { x, y } = directionMap[direction];

      gsap.fromTo(
        elementRef.current,
        { 
          opacity: 0, 
          x,
          y
        },
        { 
          opacity: 1, 
          x: 0,
          y: 0,
          duration: 0.5, 
          ease: 'power2.out',
          delay 
        }
      );
    }
  }, [delay, direction]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function ScaleIn({ children, delay = 0, className = '' }: ScaleInProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      gsap.fromTo(
        elementRef.current,
        { 
          opacity: 0, 
          scale: 0.8,
          transformOrigin: 'center center'
        },
        { 
          opacity: 1, 
          scale: 1,
          duration: 0.5, 
          ease: 'back.out(1.7)',
          delay 
        }
      );
    }
  }, [delay]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

interface StaggeredListProps {
  children: React.ReactNode[];
  stagger?: number;
  className?: string;
}

export function StaggeredList({ children, stagger = 0.1, className = '' }: StaggeredListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const items = containerRef.current.children;
      
      gsap.fromTo(
        items,
        { 
          opacity: 0, 
          y: 20
        },
        { 
          opacity: 1, 
          y: 0,
          duration: 0.5, 
          ease: 'power2.out',
          stagger
        }
      );
    }
  }, [stagger, children]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
