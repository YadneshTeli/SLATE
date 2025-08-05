import type { Project, Checklist, ShotItem } from '@/types';

export function initializeDemoData(userId: string) {
  // Demo Project: Sunburn Music Festival
  const demoProject: Project = {
    id: 'demo-project-sunburn',
    name: 'Sunburn Music Festival',
    description: 'Electronic music festival in Goa - capturing the essence of India\'s biggest EDM event',
    date: new Date('2025-01-15'),
    status: 'active',
    createdBy: userId,
    assignments: [
      {
        userId: 'vittal',
        zones: ['Stage', 'Pit'],
        assignedAt: new Date('2025-01-10')
      },
      {
        userId: 'shravan', 
        zones: ['GA', 'Sponsor Village'],
        assignedAt: new Date('2025-01-10')
      }
    ],
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10')
  };

  // Demo Checklists
  const demoChecklists: Checklist[] = [
    {
      id: 'demo-checklist-main-stage',
      projectId: 'demo-project-sunburn',
      name: 'Main Stage Video',
      description: 'Video coverage of the main stage performances',
      order: 0,
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10')
    },
    {
      id: 'demo-checklist-crowd',
      projectId: 'demo-project-sunburn',
      name: 'Crowd & Atmosphere Photos',
      description: 'Capturing the energy and atmosphere of the festival',
      order: 1,
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10')
    },
    {
      id: 'demo-checklist-sponsors',
      projectId: 'demo-project-sunburn',
      name: 'Sponsor Activations',
      description: 'Documentation of sponsor activations and branding',
      order: 2,
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10')
    }
  ];

  // Demo Shot Items
  const demoShotItems: ShotItem[] = [
    // Main Stage Video shots
    {
      id: 'demo-shot-wide-entrance',
      checklistId: 'demo-checklist-main-stage',
      title: 'Wide shot of headline artist entrance',
      type: 'video',
      priority: 'must-have',
      description: 'Use the 24-70mm lens. Hold for 15 seconds, capture the full stage lighting rig.',
      isCompleted: false,
      createdBy: userId,
      isUserAdded: false,
      order: 0,
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10')
    },
    {
      id: 'demo-shot-crowd-reaction',
      checklistId: 'demo-checklist-main-stage',
      title: 'Crowd reaction during drop',
      type: 'video',
      priority: 'must-have',
      description: 'Capture the crowd\'s energy when the bass drops. Focus on front sections.',
      isCompleted: true,
      completedAt: new Date('2025-01-12'),
      completedBy: 'vittal',
      createdBy: userId,
      isUserAdded: false,
      order: 1,
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-12')
    },
    {
      id: 'demo-shot-dj-closeup',
      checklistId: 'demo-checklist-main-stage',
      title: 'DJ hand movements closeup',
      type: 'video',
      priority: 'nice-to-have',
      description: 'Close-up shots of DJ mixing, use 70-200mm lens.',
      isCompleted: false,
      createdBy: userId,
      isUserAdded: false,
      order: 2,
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10')
    },
    // User-added shot
    {
      id: 'demo-shot-guitar-bass-duel',
      checklistId: 'demo-checklist-main-stage',
      title: 'Guitar/Bass duel closeup',
      type: 'video',
      priority: 'nice-to-have',
      description: 'Amazing unscripted moment - guitarist and bassist playing back-to-back',
      isCompleted: true,
      completedAt: new Date('2025-01-12'),
      completedBy: 'vittal',
      createdBy: 'vittal',
      isUserAdded: true,
      order: 3,
      createdAt: new Date('2025-01-12'),
      updatedAt: new Date('2025-01-12')
    },

    // Crowd & Atmosphere Photos
    {
      id: 'demo-shot-crowd-aerial',
      checklistId: 'demo-checklist-crowd',
      title: 'Aerial view of festival grounds',
      type: 'photo',
      priority: 'must-have',
      description: 'Wide aerial shot showing the scale of the festival. Use drone if permitted.',
      isCompleted: true,
      completedAt: new Date('2025-01-11'),
      completedBy: 'shravan',
      createdBy: userId,
      isUserAdded: false,
      order: 0,
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-11')
    },
    {
      id: 'demo-shot-sunset-stage',
      checklistId: 'demo-checklist-crowd',
      title: 'Golden hour stage silhouettes',
      type: 'photo',
      priority: 'must-have',
      description: 'Capture the stage silhouettes during golden hour with crowd in foreground.',
      isCompleted: false,
      createdBy: userId,
      isUserAdded: false,
      order: 1,
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10')
    },
    {
      id: 'demo-shot-dancing-group',
      checklistId: 'demo-checklist-crowd',
      title: 'Group of friends dancing',
      type: 'photo',
      priority: 'nice-to-have',
      description: 'Candid shots of groups enjoying the music together.',
      isCompleted: false,
      createdBy: userId,
      isUserAdded: false,
      order: 2,
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10')
    },

    // Sponsor Activations
    {
      id: 'demo-shot-sponsor-booth',
      checklistId: 'demo-checklist-sponsors',
      title: 'Main sponsor booth overview',
      type: 'photo',
      priority: 'must-have',
      description: 'Wide shot of the main sponsor activation area with branding visible.',
      isCompleted: false,
      createdBy: userId,
      isUserAdded: false,
      order: 0,
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10')
    },
    {
      id: 'demo-shot-branded-products',
      checklistId: 'demo-checklist-sponsors',
      title: 'Branded merchandise display',
      type: 'photo',
      priority: 'nice-to-have',
      description: 'Close-up shots of sponsor products and merchandise.',
      isCompleted: false,
      createdBy: userId,
      isUserAdded: false,
      order: 1,
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10')
    }
  ];

  return {
    projects: [demoProject],
    checklists: demoChecklists,
    shotItems: demoShotItems
  };
}
