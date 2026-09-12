import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { isTripRecord, itineraryFromTripRecord, normalizeItinerary } from './trip';
import type { Itinerary, TripRecord } from './types';

const TRIP_KEY = '@qasd_trip_v2';
const ORIGINAL_TRIP_KEY = '@qasd_trip_original_v2';
const LEGACY_ITINERARY_KEY = '@rawaf_itinerary';
const LEGACY_ORIGINAL_KEY = '@rawaf_itinerary_original';

type StoredItinerary = Itinerary & {
  visa?: { imageUri?: unknown };
  documents?: unknown;
};

async function removeLegacySensitiveFields(data: StoredItinerary): Promise<Itinerary> {
  const cachedImageUri = data.visa?.imageUri;

  if (
    typeof cachedImageUri === 'string' &&
    FileSystem.cacheDirectory &&
    cachedImageUri.startsWith(FileSystem.cacheDirectory)
  ) {
    await FileSystem.deleteAsync(cachedImageUri, { idempotent: true }).catch(() => {});
  }

  const sanitized = JSON.parse(JSON.stringify(data)) as StoredItinerary;
  delete sanitized.visa;
  delete sanitized.documents;
  return sanitized;
}

async function loadLegacyItinerary(key: string): Promise<Itinerary | null> {
  const json = await AsyncStorage.getItem(key);
  if (!json) return null;

  const parsed = JSON.parse(json) as StoredItinerary;
  const sanitized = await removeLegacySensitiveFields(parsed);
  sanitized.localId ??= 'legacy';
  const sanitizedJson = JSON.stringify(sanitized);

  if (sanitizedJson !== json) {
    await AsyncStorage.setItem(key, sanitizedJson);
  }

  return sanitized;
}

let itineraryWrites = Promise.resolve(true);

export function saveItinerary(data: Itinerary): Promise<boolean> {
  const snapshot = normalizeItinerary(JSON.parse(JSON.stringify(data)) as Itinerary);
  return saveTripRecord(snapshot);
}

export function saveTripRecord(data: TripRecord): Promise<boolean> {
  const snapshot = JSON.parse(JSON.stringify(data)) as TripRecord;
  itineraryWrites = itineraryWrites.then(() => writeTripRecord(snapshot, TRIP_KEY));
  return itineraryWrites;
}

async function writeTripRecord(data: TripRecord, key: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed to save itinerary:', e);
    return false;
  }
}

export async function saveOriginalItinerary(data: Itinerary): Promise<boolean> {
  return writeTripRecord(normalizeItinerary(data), ORIGINAL_TRIP_KEY);
}

export async function saveOriginalTripRecord(data: TripRecord): Promise<boolean> {
  return writeTripRecord(JSON.parse(JSON.stringify(data)) as TripRecord, ORIGINAL_TRIP_KEY);
}

async function loadTripRecordAt(key: string): Promise<TripRecord | null> {
  const json = await AsyncStorage.getItem(key);
  if (!json) return null;
  const parsed: unknown = JSON.parse(json);
  if (!isTripRecord(parsed)) throw new Error('Invalid trip record');
  return parsed;
}

async function loadOrMigrateTrip(recordKey: string, legacyKey: string): Promise<TripRecord | null> {
  const stored = await loadTripRecordAt(recordKey);
  if (stored) return stored;
  const legacy = await loadLegacyItinerary(legacyKey);
  if (!legacy) return null;
  const migrated = normalizeItinerary(legacy);
  if (!await writeTripRecord(migrated, recordKey)) throw new Error('Could not migrate trip');
  return migrated;
}

export async function loadTripRecord(): Promise<TripRecord | null> {
  try {
    const trip = await loadOrMigrateTrip(TRIP_KEY, LEGACY_ITINERARY_KEY);
    // A damaged backup must not hide the usable current itinerary.
    await loadOrMigrateTrip(ORIGINAL_TRIP_KEY, LEGACY_ORIGINAL_KEY).catch(() => null);
    return trip;
  } catch {
    return null;
  }
}

export async function loadItinerary(): Promise<Itinerary | null> {
  const record = await loadTripRecord();
  return record ? itineraryFromTripRecord(record) : null;
}

export async function loadOriginalItinerary(): Promise<Itinerary | null> {
  try {
    const record = await loadOrMigrateTrip(ORIGINAL_TRIP_KEY, LEGACY_ORIGINAL_KEY);
    return record ? itineraryFromTripRecord(record) : null;
  } catch {
    return null;
  }
}

export async function loadOriginalTripRecord(): Promise<TripRecord | null> {
  try {
    return await loadOrMigrateTrip(ORIGINAL_TRIP_KEY, LEGACY_ORIGINAL_KEY);
  } catch {
    return null;
  }
}

export async function clearItinerary(): Promise<void> {
  try {
    await itineraryWrites;
    await AsyncStorage.multiRemove([
      TRIP_KEY,
      ORIGINAL_TRIP_KEY,
      LEGACY_ITINERARY_KEY,
      LEGACY_ORIGINAL_KEY,
    ]);
  } catch (e) {
    console.error(e);
  }
}
