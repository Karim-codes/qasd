import { useItinerary } from '@/context/itinerary-context';
import { createLocalRecord } from '@/lib/local-record';
import { booleanMap, EMPTY_GUIDE, guideProgress } from '@/lib/progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

const records = new Map<string, ReturnType<typeof createLocalRecord<any>>>();
function useLocalRecord<T>(key: string, initial: T, validate: (raw: unknown) => T) {
  const { isLoading } = useItinerary();
  if (!records.has(key)) records.set(key, createLocalRecord(AsyncStorage, key, initial, validate));
  const record = records.get(key)! as ReturnType<typeof createLocalRecord<T>>;
  const state = useSyncExternalStore(record.subscribe, record.getSnapshot, record.getSnapshot);
  useEffect(() => { void record.hydrate(); }, [record]);
  return { ...state, ready: state.ready && !isLoading, update: (change: (previous: T) => T) => isLoading ? Promise.resolve(false) : record.update(change), retry: record.retry };
}
function useTripKey() {
  const { itinerary } = useItinerary();
  return itinerary?.localId ?? 'standalone';
}
export function useJourneyProgress() {
  const id = useTripKey();
  return useLocalRecord(id === 'legacy' ? 'rawaf-journey-progress' : `rawaf-journey-progress:${id}`, {}, booleanMap);
}
export function useGuideProgress() {
  return useLocalRecord(`rawaf-umrah-progress:${useTripKey()}`, EMPTY_GUIDE, guideProgress);
}
export function useBookmarks() {
  return useLocalRecord('rawaf-dua-bookmarks', {}, booleanMap);
}
