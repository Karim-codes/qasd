import type { UmrahRoute } from '@/lib/types';
import React, { createContext, useCallback, useContext, useState } from 'react';

export interface UmrahHotelStay {
  name: string;
  checkIn: string; // ISO YYYY-MM-DD
  checkOut: string;
}

export interface UmrahDraft {
  pilgrimName: string;
  route: UmrahRoute;
  flyingFrom: string; // optional — user's home city / airport
  departureDate: string; // ISO YYYY-MM-DD — the "go" date
  returnDate: string; // ISO YYYY-MM-DD — the return home date
  makkahHotel: UmrahHotelStay;
  madinahHotel: UmrahHotelStay;
}

const EMPTY_HOTEL: UmrahHotelStay = { name: '', checkIn: '', checkOut: '' };

export const EMPTY_UMRAH_DRAFT: UmrahDraft = {
  pilgrimName: '',
  route: 'makkah-madinah',
  flyingFrom: '',
  departureDate: '',
  returnDate: '',
  makkahHotel: { ...EMPTY_HOTEL },
  madinahHotel: { ...EMPTY_HOTEL },
};

interface UmrahSetupContextValue {
  draft: UmrahDraft;
  update: (partial: Partial<UmrahDraft>) => void;
  updateMakkah: (partial: Partial<UmrahHotelStay>) => void;
  updateMadinah: (partial: Partial<UmrahHotelStay>) => void;
  reset: () => void;
}

const UmrahSetupContext = createContext<UmrahSetupContextValue | null>(null);

export function UmrahSetupProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<UmrahDraft>(EMPTY_UMRAH_DRAFT);

  const update = useCallback((partial: Partial<UmrahDraft>) => {
    setDraft((p) => ({ ...p, ...partial }));
  }, []);

  const updateMakkah = useCallback((partial: Partial<UmrahHotelStay>) => {
    setDraft((p) => ({ ...p, makkahHotel: { ...p.makkahHotel, ...partial } }));
  }, []);

  const updateMadinah = useCallback((partial: Partial<UmrahHotelStay>) => {
    setDraft((p) => ({ ...p, madinahHotel: { ...p.madinahHotel, ...partial } }));
  }, []);

  const reset = useCallback(() => setDraft(EMPTY_UMRAH_DRAFT), []);

  return (
    <UmrahSetupContext.Provider
      value={{ draft, update, updateMakkah, updateMadinah, reset }}
    >
      {children}
    </UmrahSetupContext.Provider>
  );
}

export function useUmrahSetup() {
  const ctx = useContext(UmrahSetupContext);
  if (!ctx) throw new Error('useUmrahSetup must be used inside UmrahSetupProvider');
  return ctx;
}

// ─── Route helpers ──────────────────────────────────────────────────────────

export const UMRAH_ROUTE_OPTIONS: {
  value: UmrahRoute;
  label: string;
  sub: string;
}[] = [
  {
    value: 'makkah-madinah',
    label: 'Makkah first, then Madinah',
    sub: 'Perform Umrah, then visit the Prophet ﷺ',
  },
  {
    value: 'madinah-makkah',
    label: 'Madinah first, then Makkah',
    sub: 'Visit Madinah, then head to Makkah for Umrah',
  },
  {
    value: 'makkah-only',
    label: 'Makkah only',
    sub: 'A focused Umrah — no Madinah stay this trip',
  },
];

export function routeLabel(route: UmrahRoute): string {
  return UMRAH_ROUTE_OPTIONS.find((o) => o.value === route)?.label ?? '';
}

export function routeVisitsMadinah(route: UmrahRoute): boolean {
  return route !== 'makkah-only';
}

export function routeMadinahFirst(route: UmrahRoute): boolean {
  return route === 'madinah-makkah';
}
