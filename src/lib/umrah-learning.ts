import type { LearningProgress } from './learning';
import { UMRAH_STEPS, type UmrahStep } from './umrah-steps';

// Educational groupings of the existing guide, not additional ritual steps.
export const UMRAH_CHAPTERS = [
  { title: 'Ihram & arrival', short: 'Ihram', description: 'Intention, Ihram and arriving at the mosque.', icon: 'mosque' as const, indices: [0, 1, 2] },
  { title: 'Tawaf', short: 'Tawaf', description: 'The circuits around the Ka’bah, prayer and Zamzam.', icon: 'kaaba' as const, indices: [3, 4, 5, 6, 7] },
  { title: 'Sa’i', short: 'Sa’i', description: 'Safa, Marwa and the seven lengths between them.', icon: 'walk-outline' as const, indices: [8, 9] },
  { title: 'Completing Umrah', short: 'Finish', description: 'Learn about Halq, Taqsir and leaving Ihram.', icon: 'cut-outline' as const, indices: [10, 11] },
];

export function learningTitle(step: UmrahStep) {
  return step.id === 'complete' ? 'Completing Umrah' : step.title;
}

export function learningResumeIndex(progress: LearningProgress) {
  const reviewed = UMRAH_STEPS.filter(step => progress.reviewed[step.id]).length;
  const firstUnread = UMRAH_STEPS.findIndex(step => !progress.reviewed[step.id]);
  // Browsing to the end alone should not skip the start of a new learning journey.
  if (reviewed === 0) return 0;
  const last = UMRAH_STEPS.findIndex(step => step.id === progress.lastStep);
  if (last >= 0 && (!progress.reviewed[progress.lastStep] || firstUnread === -1)) return last;
  return Math.max(0, firstUnread);
}
