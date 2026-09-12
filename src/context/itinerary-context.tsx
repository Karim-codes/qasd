import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  saveTripRecord,
  loadTripRecord,
  clearItinerary,
  saveOriginalTripRecord,
  loadOriginalTripRecord,
} from '@/lib/storage';
import { Alert } from 'react-native';
import { itineraryFromTripRecord, mergeItineraryIntoTripRecord, normalizeItinerary } from '@/lib/trip';
import type { Itinerary, Pilgrim, Trip, TripRecord } from '@/lib/types';

interface ItineraryContextValue {
  itinerary: Itinerary | null;
  trip: Trip | null;
  activePilgrim: Pilgrim | null;
  isLoading: boolean;
  hasData: boolean;
  setItinerary: (data: Itinerary) => Promise<void>;
  setOriginalItinerary: (data: Itinerary) => Promise<void>;
  updateField: (path: string, value: any) => void;
  resetToOriginal: () => Promise<void>;
  clear: () => Promise<void>;
}

const ItineraryContext = createContext<ItineraryContextValue | null>(null);

export function ItineraryProvider({ children }: { children: React.ReactNode }) {
  const [itinerary, setItineraryState] = useState<Itinerary | null>(null);
  const current = useRef<TripRecord | null>(null);
  const [record, setRecord] = useState<TripRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const trip = record?.trip ?? null;
  const activePilgrim = record ? record.pilgrims[record.trip.primaryPilgrimId] ?? null : null;

  useEffect(() => {
    loadTripRecord().then((data) => {
      if (data) {
        current.current = data;
        setRecord(data);
        setItineraryState(itineraryFromTripRecord(data));
        setHasData(true);
      }
      setIsLoading(false);
    });
  }, []);

  const setItinerary = useCallback(async (data: Itinerary) => {
    const identified = { ...data, localId: data.localId ?? `trip-${Date.now()}-${Math.random().toString(36).slice(2)}` };
    const next = normalizeItinerary(identified);
    if (!await saveTripRecord(next)) {
      Alert.alert('Trip not saved', 'Please try again. Your trip could not be saved on this device.');
      throw new Error('Could not save itinerary');
    }
    current.current = next;
    setRecord(next);
    setItineraryState(identified);
    setHasData(true);
  }, []);

  const setOriginalItinerary = useCallback(async (data: Itinerary) => {
    const next = current.current
      ? mergeItineraryIntoTripRecord(current.current, data)
      : normalizeItinerary(data);
    if (!await saveOriginalTripRecord(next)) {
      Alert.alert('Original trip not saved', 'Your current trip is saved, but the backup could not be saved on this device.');
    }
  }, []);

  const updateField = useCallback((path: string, value: any) => {
    if (!current.current) return;
    const updated = itineraryFromTripRecord(current.current);
    const keys = path.split('.');
    let obj: any = updated;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    const next = mergeItineraryIntoTripRecord(current.current, updated);
    current.current = next;
    setRecord(next);
    setItineraryState(updated);
    void saveTripRecord(next).then(saved => {
      if (!saved) Alert.alert('Changes not saved', 'Keep the app open and try editing this field again to save it.');
    });
  }, []);

  const resetToOriginal = useCallback(async () => {
    const original = await loadOriginalTripRecord();
    if (original) {
      const next = current.current
        ? mergeItineraryIntoTripRecord(current.current, itineraryFromTripRecord(original))
        : original;
      if (!await saveTripRecord(next)) {
        Alert.alert('Trip not restored', 'Please try again. Your original trip could not be saved.');
        return;
      }
      current.current = next;
      setRecord(next);
      setItineraryState(itineraryFromTripRecord(next));
      setHasData(true);
    }
  }, []);

  const clear = useCallback(async () => {
    current.current = null;
    setRecord(null);
    setItineraryState(null);
    setHasData(false);
    await clearItinerary();
  }, []);

  return (
    <ItineraryContext.Provider
      value={{
        itinerary,
        trip,
        activePilgrim,
        isLoading,
        hasData,
        setItinerary,
        setOriginalItinerary,
        updateField,
        resetToOriginal,
        clear,
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  const context = useContext(ItineraryContext);
  if (!context) throw new Error('useItinerary must be used within ItineraryProvider');
  return context;
}
