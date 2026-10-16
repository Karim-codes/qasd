const { test } = require('node:test');
const assert = require('node:assert/strict');
const { hasFlightDetails } = require('../src/lib/flights.ts');
const { EMPTY_ITINERARY } = require('../src/lib/sample-data.ts');

test('planned cities and dates do not count as entered flight details', () => {
  const flight = { ...EMPTY_ITINERARY.flights.outbound, departureCity: 'London', arrivalCity: 'Jeddah', departureDate: '2026-11-01', flightNumbers: ['  '] };
  assert.equal(hasFlightDetails(flight), false);
  assert.equal(hasFlightDetails({ ...flight, airline: 'Saudia' }), true);
  assert.equal(hasFlightDetails({ ...flight, flightNumbers: ['SV100'] }), true);
  assert.equal(hasFlightDetails({ ...flight, bookingRef: 'ABC123' }), true);
  assert.equal(hasFlightDetails({ ...flight, departureTime: '12:00' }), true);
});
