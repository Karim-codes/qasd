// Learning and practice belong to the person, independently of any booking.
// Keep existing ritual keys stable so saved counts survive this change.
export const LEARNING_PROGRESS_KEY = '@qasd:learning:v1';
export const PRACTICE_PROGRESS_KEY = '@qasd:practice:v1';
export function tripProgressKey(tripId: string, pilgrimId: string, kind: 'guide' | 'journey' | 'checklist') {
  return `@qasd:${tripId}:${pilgrimId}:${kind}`;
}
export const GUEST_CHECKLIST_KEY = tripProgressKey('standalone', 'primary', 'checklist');
