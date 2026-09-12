import type { JourneyEventSource } from './types';

export interface ChecklistItem {
  id: string;
  title: string;
  source: JourneyEventSource;
}

export interface ChecklistProgress {
  completed: Record<string, boolean>;
  customItems: ChecklistItem[];
}

export const PREPARATION_ITEMS: ChecklistItem[] = [
  { id: 'passport', title: 'Passport', source: 'qasd' },
  { id: 'visa', title: 'Visa', source: 'qasd' },
  { id: 'ihram', title: 'Ihram', source: 'qasd' },
  { id: 'travel-documents', title: 'Travel documents', source: 'qasd' },
  { id: 'medication', title: 'Medication', source: 'qasd' },
  { id: 'charger-adaptor', title: 'Charger and adaptor', source: 'qasd' },
  { id: 'footwear', title: 'Comfortable footwear', source: 'qasd' },
  { id: 'emergency-contact', title: 'Save an emergency contact', source: 'qasd' },
  { id: 'offline-content', title: 'Download essential content', source: 'qasd' },
  { id: 'review-talbiyah', title: 'Review the Talbiyah', source: 'qasd' },
];

export const EMPTY_CHECKLIST: ChecklistProgress = { completed: {}, customItems: [] };

export function checklistProgress(raw: unknown): ChecklistProgress {
  const value = raw as ChecklistProgress;
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid checklist');
  const completed = Object.fromEntries(Object.entries(value.completed ?? {}).filter(([, done]) => done === true));
  const customItems = Array.isArray(value.customItems)
    ? value.customItems.filter(item => item
      && typeof item.id === 'string'
      && typeof item.title === 'string'
      && item.title.trim()
      && item.source === 'pilgrim')
    : [];
  return { completed, customItems };
}

export function checklistItems(progress: ChecklistProgress): ChecklistItem[] {
  return [...PREPARATION_ITEMS, ...progress.customItems];
}

export function checklistSummary(progress: ChecklistProgress) {
  const items = checklistItems(progress);
  const completed = items.filter(item => progress.completed[item.id]).length;
  return { completed, total: items.length, remaining: items.length - completed };
}
