import { booleanMap } from './progress';

export interface LearningProgress {
  reviewed: Record<string, boolean>;
  lastStep: string;
}

export const EMPTY_LEARNING: LearningProgress = { reviewed: {}, lastStep: '' };

export function learningProgress(raw: unknown): LearningProgress {
  const value = raw as LearningProgress;
  if (!value || typeof value.lastStep !== 'string') throw new Error('Invalid learning progress');
  return { reviewed: booleanMap(value.reviewed), lastStep: value.lastStep };
}
