import React, { createContext, useCallback, useContext, useState } from 'react';

export interface FlightLeg {
  airline: string;
  flightNumber: string;
  departureCity: string;
  departureDate: string; // ISO YYYY-MM-DD
  departureTime: string; // HH:MM (24h)
  arrivalCity: string;
  arrivalDate: string;
  arrivalTime: string;
  bookingRef: string;
  hasLayover: boolean;
  layoverCity: string;
  layoverDuration: string; // free text e.g. "2h 30m"
}

export interface HotelStay {
  name: string;
  checkIn: string;
  checkOut: string;
}

export interface HajjDraft {
  pilgrimName: string;
  outbound: FlightLeg;
  return: FlightLeg;
  makkahHotel: HotelStay;
  visitMadinah: boolean;
  madinahHotel: HotelStay;
  campName: string;
}

const EMPTY_LEG: FlightLeg = {
  airline: '',
  flightNumber: '',
  departureCity: '',
  departureDate: '',
  departureTime: '',
  arrivalCity: '',
  arrivalDate: '',
  arrivalTime: '',
  bookingRef: '',
  hasLayover: false,
  layoverCity: '',
  layoverDuration: '',
};

const EMPTY_HOTEL: HotelStay = { name: '', checkIn: '', checkOut: '' };

export const EMPTY_DRAFT: HajjDraft = {
  pilgrimName: '',
  outbound: { ...EMPTY_LEG, arrivalCity: 'Jeddah (JED)' },
  return: { ...EMPTY_LEG, departureCity: 'Jeddah (JED)' },
  makkahHotel: { ...EMPTY_HOTEL },
  visitMadinah: true,
  madinahHotel: { ...EMPTY_HOTEL },
  campName: '',
};

interface HajjSetupContextValue {
  draft: HajjDraft;
  update: (partial: Partial<HajjDraft>) => void;
  updateOutbound: (partial: Partial<FlightLeg>) => void;
  updateReturn: (partial: Partial<FlightLeg>) => void;
  updateMakkah: (partial: Partial<HotelStay>) => void;
  updateMadinah: (partial: Partial<HotelStay>) => void;
  reset: () => void;
}

const HajjSetupContext = createContext<HajjSetupContextValue | null>(null);

export function HajjSetupProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<HajjDraft>(EMPTY_DRAFT);

  const update = useCallback((partial: Partial<HajjDraft>) => {
    setDraft((p) => ({ ...p, ...partial }));
  }, []);

  const updateOutbound = useCallback((partial: Partial<FlightLeg>) => {
    setDraft((p) => ({ ...p, outbound: { ...p.outbound, ...partial } }));
  }, []);

  const updateReturn = useCallback((partial: Partial<FlightLeg>) => {
    setDraft((p) => ({ ...p, return: { ...p.return, ...partial } }));
  }, []);

  const updateMakkah = useCallback((partial: Partial<HotelStay>) => {
    setDraft((p) => ({ ...p, makkahHotel: { ...p.makkahHotel, ...partial } }));
  }, []);

  const updateMadinah = useCallback((partial: Partial<HotelStay>) => {
    setDraft((p) => ({ ...p, madinahHotel: { ...p.madinahHotel, ...partial } }));
  }, []);

  const reset = useCallback(() => setDraft(EMPTY_DRAFT), []);

  return (
    <HajjSetupContext.Provider
      value={{ draft, update, updateOutbound, updateReturn, updateMakkah, updateMadinah, reset }}
    >
      {children}
    </HajjSetupContext.Provider>
  );
}

export function useHajjSetup() {
  const ctx = useContext(HajjSetupContext);
  if (!ctx) throw new Error('useHajjSetup must be used inside HajjSetupProvider');
  return ctx;
}
