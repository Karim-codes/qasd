import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  saveItinerary,
  loadItinerary,
  clearItinerary,
  saveOriginalItinerary,
  loadOriginalItinerary,
} from '@/lib/storage';
import { Alert } from 'react-native';
import type { Itinerary } from '@/lib/types';

interface ItineraryContextValue {
  itinerary: Itinerary | null;
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
  const current = useRef<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    loadItinerary().then((data) => {
      if (data) {
        current.current = data;
        setItineraryState(data);
        setHasData(true);
      }
      setIsLoading(false);
    });
  }, []);

  const setItinerary = useCallback(async (data: Itinerary) => {
    const identified = { ...data, localId: data.localId ?? `trip-${Date.now()}-${Math.random().toString(36).slice(2)}` };
    if (!await saveItinerary(identified)) {
      Alert.alert('Trip not saved', 'Please try again. Your trip could not be saved on this device.');
      throw new Error('Could not save itinerary');
    }
    current.current = identified;
    setItineraryState(identified);
    setHasData(true);
  }, []);

  const setOriginalItinerary = useCallback(async (data: Itinerary) => {
    if (!await saveOriginalItinerary({ ...data, localId: current.current?.localId ?? data.localId })) {
      Alert.alert('Original trip not saved', 'Your current trip is saved, but the backup could not be saved on this device.');
    }
  }, []);

  const updateField = useCallback((path: string, value: any) => {
    if (!current.current) return;
    const updated = JSON.parse(JSON.stringify(current.current));
    const keys = path.split('.');
    let obj = updated;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    current.current = updated;
    setItineraryState(updated);
    void saveItinerary(updated).then(saved => {
      if (!saved) Alert.alert('Changes not saved', 'Keep the app open and try editing this field again to save it.');
    });
  }, []);

  const resetToOriginal = useCallback(async () => {
    const original = await loadOriginalItinerary();
    if (original) {
      original.localId = current.current?.localId ?? original.localId;
      if (!await saveItinerary(original)) {
        Alert.alert('Trip not restored', 'Please try again. Your original trip could not be saved.');
        return;
      }
      current.current = original;
      setItineraryState(original);
      setHasData(true);
    }
  }, []);

  const clear = useCallback(async () => {
    current.current = null;
    setItineraryState(null);
    setHasData(false);
    await clearItinerary();
  }, []);

  return (
    <ItineraryContext.Provider
      value={{
        itinerary,
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
