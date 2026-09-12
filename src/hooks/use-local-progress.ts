import { useItinerary } from '@/context/itinerary-context';
import { createLocalRecord } from '@/lib/local-record';
import { booleanMap, EMPTY_GUIDE, guideProgress } from '@/lib/progress';
import { checklistProgress, EMPTY_CHECKLIST } from '@/lib/checklist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

const records = new Map<string, ReturnType<typeof createLocalRecord<any>>>();
function useLocalRecord<T>(key: string, initial: T, validate: (raw: unknown) => T, legacyKeys: string[] = []) {
  const { isLoading } = useItinerary();
  if (!records.has(key)) records.set(key, createLocalRecord(AsyncStorage, key, initial, validate, legacyKeys));
  const record = records.get(key)! as ReturnType<typeof createLocalRecord<T>>;
  const state = useSyncExternalStore(record.subscribe, record.getSnapshot, record.getSnapshot);
  useEffect(() => { void record.hydrate(); }, [record]);
  return { ...state, ready: state.ready && !isLoading, update: (change: (previous: T) => T) => isLoading ? Promise.resolve(false) : record.update(change), retry: record.retry };
}
function useTripKey() {
  const { itinerary } = useItinerary();
  return itinerary?.localId ?? 'standalone';
}
function usePilgrimKey() {
  const { activePilgrim } = useItinerary();
  return activePilgrim?.id ?? 'primary';
}
export function useJourneyProgress() {
  const id = useTripKey();
  const pilgrimId = usePilgrimKey();
  return useLocalRecord(`@qasd:${id}:${pilgrimId}:journey`, {}, booleanMap, [
    id === 'legacy' ? 'rawaf-journey-progress' : `rawaf-journey-progress:${id}`,
  ]);
}
export function useGuideProgress() {
  const id = useTripKey();
  const pilgrimId = usePilgrimKey();
  return useLocalRecord(`@qasd:${id}:${pilgrimId}:guide`, EMPTY_GUIDE, guideProgress, [`rawaf-umrah-progress:${id}`]);
}
export function useBookmarks() {
  return useLocalRecord('rawaf-dua-bookmarks', {}, booleanMap);
}
export function usePreparationChecklist() {
  const id = useTripKey();
  const pilgrimId = usePilgrimKey();
  return useLocalRecord(`@qasd:${id}:${pilgrimId}:checklist`, EMPTY_CHECKLIST, checklistProgress);
}
