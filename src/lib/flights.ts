import type { Flight } from './types';

// Planned cities and dates alone do not mean flight details have been entered.
export function hasFlightDetails(flight: Flight) {
  return [flight.airline, flight.bookingRef, flight.departureTime, flight.arrivalTime, ...flight.flightNumbers]
    .some(value => value.trim().length > 0);
}
