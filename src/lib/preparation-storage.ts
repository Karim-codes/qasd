import { checklistProgress } from './checklist';
import type { RecordStorage } from './local-record';
import { GUEST_CHECKLIST_KEY, tripProgressKey } from './progress-keys';

export async function carryPreparationToTrip(storage: RecordStorage, tripId: string, pilgrimId: string) {
  const key = tripProgressKey(tripId, pilgrimId, 'checklist');
  // An existing trip always owns its own checklist. Never replace it with guest data.
  if (await storage.getItem(key) !== null) return;
  const guest = await storage.getItem(GUEST_CHECKLIST_KEY);
  if (guest !== null) await storage.setItem(key, JSON.stringify(checklistProgress(JSON.parse(guest))));
}
