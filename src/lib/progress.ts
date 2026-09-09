export type CounterId = 'tawaf' | 'sai';
export interface GuideProgress {
  completed: Record<string, boolean>;
  lastStep: string;
  counters: Record<CounterId, { count: number; changedAt: number }>;
}
export const EMPTY_GUIDE: GuideProgress = {
  completed: {}, lastStep: '',
  counters: { tawaf: { count: 0, changedAt: 0 }, sai: { count: 0, changedAt: 0 } },
};
export function booleanMap(raw: unknown): Record<string, boolean> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid saved progress');
  return Object.fromEntries(Object.entries(raw).filter(([, value]) => value === true));
}
export function guideProgress(raw: unknown): GuideProgress {
  const value = raw as GuideProgress;
  if (!value || typeof value.lastStep !== 'string') throw new Error('Invalid guide progress');
  const counters = { ...EMPTY_GUIDE.counters };
  for (const id of ['tawaf', 'sai'] as const) {
    const counter = value.counters?.[id];
    if (!counter || !Number.isInteger(counter.count) || counter.count < 0 || counter.count > 7 || !Number.isFinite(counter.changedAt)) {
      throw new Error('Invalid saved counter');
    }
    counters[id] = counter;
  }
  return { completed: booleanMap(value.completed), lastStep: value.lastStep, counters };
}
export function changeCounter(value: GuideProgress, id: CounterId, action: 'add' | 'undo' | 'reset', now: number): GuideProgress {
  const previous = value.counters[id];
  // Use shared state, not a render-time count, so two taps cannot race each other.
  if (action === 'add' && now >= previous.changedAt && now - previous.changedAt < 900) return value;
  const count = action === 'reset' ? 0 : Math.max(0, Math.min(7, previous.count + (action === 'add' ? 1 : -1)));
  if (count === previous.count) return value;
  const stepId = id === 'tawaf' ? 'tawaf-start' : 'sai-laps';
  return {
    ...value, lastStep: stepId,
    completed: count < 7 ? { ...value.completed, [stepId]: false, complete: false } : value.completed,
    counters: { ...value.counters, [id]: { count, changedAt: now } },
  };
}
