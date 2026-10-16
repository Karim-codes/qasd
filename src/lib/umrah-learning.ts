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

// Continue learning follows ritual order, regardless of browsing history.
// null means every topic has been reviewed; there is no next unreviewed topic.
export function nextLearningIndex(progress: LearningProgress): number | null {
  const index = UMRAH_STEPS.findIndex(step => !progress.reviewed[step.id]);
  return index === -1 ? null : index;
}

// Resume reading returns exactly the last-opened topic, even if already reviewed.
export function learningResumeIndex(progress: LearningProgress): number | null {
  const index = UMRAH_STEPS.findIndex(step => step.id === progress.lastStep);
  return index === -1 ? null : index;
}
