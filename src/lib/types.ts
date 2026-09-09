export interface Flight {
  airline: string;
  flightNumbers: string[];
  departureCity: string;
  departureDate: string;
  departureTime: string;
  departureAirport?: string;
  arrivalCity: string;
  arrivalDate: string;
  arrivalTime: string;
  arrivalAirport?: string;
  stopoverCity: string;
  layoverDuration: string;
  bookingRef: string;
}

export interface Hotel {
  name: string;
  city: string;
  checkIn: string;
  checkOut: string;
}

export type TripType = 'hajj' | 'umrah';

/**
 * The order a pilgrim visits the holy cities on an Umrah trip.
 * - 'makkah-madinah' → Makkah first, then Madinah (default)
 * - 'madinah-makkah' → Madinah first, then Makkah
 * - 'makkah-only'    → Makkah only, no Madinah stay
 */
export type UmrahRoute = 'makkah-madinah' | 'madinah-makkah' | 'makkah-only';

export interface Itinerary {
  /** Stable local identity, preserved when editing trip details. */
  localId?: string;
  /**
   * Which kind of trip this itinerary represents.
   * - 'hajj'  → full Hajj package (Nusuk PDF, camps, Arafah, etc.)
   * - 'umrah' → Umrah-only trip (manually entered, no Hajj rituals).
   * Optional for backward-compatibility with existing stored data.
   */
  tripType?: TripType;
  pilgrim: {
    name: string;
    packageName: string;
    packageNumber: string;
    pilgrimType: string;
  };
  guide: {
    name: string;
    phone: string;
  };
  camp: {
    name: string;
  };
  hajj?: {
    arafahDate?: string; // ISO date of 9 Dhul-Hijjah; drives the ritual timeline
  };
  umrah?: {
    route: UmrahRoute; // order the holy cities are visited on an Umrah trip
  };
  transportation: string;
  flights: {
    outbound: Flight;
    return: Flight;
  };
  hotels: {
    hotel1: Hotel;
    hotel2: Hotel;
  };
}
