import type { RecordStorage } from './local-record';

export const ONBOARDING_KEY = '@qasd_welcome_v1';
export const ONBOARDING_SCREENS = ['welcome', 'learn', 'prepare', 'begin'] as const;

export async function hasCompletedOnboarding(storage: RecordStorage): Promise<boolean> {
  try {
    return await storage.getItem(ONBOARDING_KEY) === 'complete';
  } catch {
    return false;
  }
}

// Skipping and completing share the same preference. It is independent of
// itinerary, preparation and ritual progress, including when a trip is cleared.
export async function completeOnboarding(storage: RecordStorage): Promise<boolean> {
  try {
    await storage.setItem(ONBOARDING_KEY, 'complete');
    return true;
  } catch {
    return false;
  }
}
