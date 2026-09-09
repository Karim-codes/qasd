import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import type { Itinerary } from './types';

const ITINERARY_KEY = '@rawaf_itinerary';
const ORIGINAL_KEY = '@rawaf_itinerary_original';

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

async function loadStoredItinerary(key: string): Promise<Itinerary | null> {
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
  const snapshot = JSON.parse(JSON.stringify(data)) as Itinerary;
  itineraryWrites = itineraryWrites.then(() => writeItinerary(snapshot));
  return itineraryWrites;
}

async function writeItinerary(data: Itinerary): Promise<boolean> {
  try {
    const sanitized = await removeLegacySensitiveFields(data);
    await AsyncStorage.setItem(ITINERARY_KEY, JSON.stringify(sanitized));
    return true;
  } catch (e) {
    console.error('Failed to save itinerary:', e);
    return false;
  }
}

export async function saveOriginalItinerary(data: Itinerary): Promise<boolean> {
  try {
    const sanitized = await removeLegacySensitiveFields(data);
    await AsyncStorage.setItem(ORIGINAL_KEY, JSON.stringify(sanitized));
    return true;
  } catch {
    return false;
  }
}

export async function loadItinerary(): Promise<Itinerary | null> {
  try {
    const itinerary = await loadStoredItinerary(ITINERARY_KEY);
    // A damaged backup must not hide the usable current itinerary.
    await loadStoredItinerary(ORIGINAL_KEY).catch(() => null);
    return itinerary;
  } catch {
    return null;
  }
}

export async function loadOriginalItinerary(): Promise<Itinerary | null> {
  try {
    return await loadStoredItinerary(ORIGINAL_KEY);
  } catch {
    return null;
  }
}

export async function clearItinerary(): Promise<void> {
  try {
    await itineraryWrites;
    await AsyncStorage.multiRemove([ITINERARY_KEY, ORIGINAL_KEY]);
  } catch (e) {
    console.error(e);
  }
}
