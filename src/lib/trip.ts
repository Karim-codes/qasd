import type {
  Flight,
  Hotel,
  Itinerary,
  Pilgrim,
  Trip,
  TripFlight,
  TripRecord,
  TripStay,
  TripType,
} from './types';

function tripTypeOf(itinerary: Itinerary): TripType {
  return itinerary.tripType ?? (itinerary.camp?.name || itinerary.hajj?.arafahDate ? 'hajj' : 'umrah');
}

function knownTimeZone(location: string): string | undefined {
  const normalized = location.toLowerCase();
  return /(jeddah|jed\b|madinah|madina|medina|med\b|makkah|mecca)/.test(normalized) ? 'Asia/Riyadh' : undefined;
}

function identifiedFlight(tripId: string, direction: 'outbound' | 'return', flight: Flight): TripFlight {
  return {
    ...flight,
    departureTimeZone: flight.departureTimeZone ?? knownTimeZone(`${flight.departureCity} ${flight.departureAirport ?? ''}`),
    arrivalTimeZone: flight.arrivalTimeZone ?? knownTimeZone(`${flight.arrivalCity} ${flight.arrivalAirport ?? ''}`),
    id: `${tripId}:flight:${direction}`,
    direction,
    source: flight && 'source' in flight ? (flight as TripFlight).source : 'pilgrim',
  };
}

function stayKind(hotel: Hotel): TripStay['kind'] {
  const city = hotel.city.toLowerCase();
  if (city.includes('makkah') || city.includes('mecca')) return 'makkah';
  if (city.includes('madinah') || city.includes('medina') || city.includes('madina')) return 'madinah';
  return 'other';
}

function identifiedStay(tripId: string, index: number, hotel: Hotel): TripStay {
  return {
    ...hotel,
    id: `${tripId}:stay:${index + 1}`,
    kind: stayKind(hotel),
    source: hotel && 'source' in hotel ? (hotel as TripStay).source : 'pilgrim',
  };
}

export function normalizeItinerary(itinerary: Itinerary, now = new Date()): TripRecord {
  const tripId = itinerary.localId ?? `trip-${now.getTime()}`;
  const pilgrimId = `${tripId}:pilgrim:primary`;
  const pilgrim: Pilgrim = { id: pilgrimId, ...itinerary.pilgrim };
  const flights = [
    identifiedFlight(tripId, 'outbound', itinerary.flights.outbound),
    identifiedFlight(tripId, 'return', itinerary.flights.return),
  ];
  const stays = [itinerary.hotels.hotel1, itinerary.hotels.hotel2]
    .filter(hotel => hotel && (hotel.name || hotel.city || hotel.checkIn || hotel.checkOut))
    .map((hotel, index) => identifiedStay(tripId, index, hotel));
  const trip: Trip = {
    id: tripId,
    tripType: tripTypeOf(itinerary),
    pilgrimIds: [pilgrimId],
    primaryPilgrimId: pilgrimId,
    flights,
    stays,
    journeyEvents: [],
    umrah: itinerary.umrah,
    hajj: itinerary.hajj,
    guide: itinerary.guide,
    camp: itinerary.camp,
    transportation: itinerary.transportation,
  };
  return { schemaVersion: 2, trip, pilgrims: { [pilgrimId]: pilgrim }, updatedAt: now.toISOString() };
}

export function mergeItineraryIntoTripRecord(existing: TripRecord, itinerary: Itinerary, now = new Date()): TripRecord {
  const next = normalizeItinerary({ ...itinerary, localId: existing.trip.id }, now);
  return {
    ...next,
    trip: {
      ...next.trip,
      journeyEvents: existing.trip.journeyEvents,
      flights: [...next.trip.flights, ...existing.trip.flights.filter(flight => flight.direction === 'other')],
      stays: [...next.trip.stays, ...existing.trip.stays.slice(2)],
      pilgrimIds: existing.trip.pilgrimIds,
      primaryPilgrimId: existing.trip.primaryPilgrimId,
    },
    pilgrims: {
      ...existing.pilgrims,
      [existing.trip.primaryPilgrimId]: {
        ...next.pilgrims[next.trip.primaryPilgrimId],
        id: existing.trip.primaryPilgrimId,
      },
    },
  };
}

function emptyHotel(): Hotel {
  return { name: '', city: '', checkIn: '', checkOut: '' };
}

export function itineraryFromTripRecord(record: TripRecord): Itinerary {
  const { trip } = record;
  const pilgrim = record.pilgrims[trip.primaryPilgrimId] ?? Object.values(record.pilgrims)[0];
  const outbound = trip.flights.find(flight => flight.direction === 'outbound') ?? trip.flights[0];
  const returning = trip.flights.find(flight => flight.direction === 'return') ?? trip.flights[1] ?? trip.flights[0];
  const stays = trip.stays;
  return {
    localId: trip.id,
    tripType: trip.tripType,
    pilgrim: {
      name: pilgrim?.name ?? '',
      packageName: pilgrim?.packageName ?? '',
      packageNumber: pilgrim?.packageNumber ?? '',
      pilgrimType: pilgrim?.pilgrimType ?? '',
    },
    guide: trip.guide,
    camp: trip.camp,
    hajj: trip.hajj,
    umrah: trip.umrah,
    transportation: trip.transportation,
    flights: { outbound, return: returning },
    hotels: { hotel1: stays[0] ?? emptyHotel(), hotel2: stays[1] ?? emptyHotel() },
  };
}

export function itineraryFromTrip(trip: Trip): Itinerary {
  const pilgrim: Pilgrim = {
    id: trip.primaryPilgrimId,
    name: '',
    packageName: '',
    packageNumber: '',
    pilgrimType: '',
  };
  return itineraryFromTripRecord({
    schemaVersion: 2,
    trip,
    pilgrims: { [pilgrim.id]: pilgrim },
    updatedAt: '',
  });
}

export function isTripRecord(value: unknown): value is TripRecord {
  const record = value as TripRecord;
  return record?.schemaVersion === 2
    && typeof record.trip?.id === 'string'
    && typeof record.trip?.primaryPilgrimId === 'string'
    && Array.isArray(record.trip?.flights)
    && Array.isArray(record.trip?.stays)
    && !!record.pilgrims
    && typeof record.pilgrims === 'object';
}
