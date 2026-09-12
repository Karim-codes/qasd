# Milestone 1: journey intelligence

Qasd keeps the existing onboarding experience. The `Itinerary` produced by those forms is normalized at the storage boundary into a versioned `TripRecord` containing a shared trip, stable pilgrim IDs, flight and stay arrays, and future-compatible journey events.

Existing stored itineraries and per-trip progress keys migrate lazily on first load. The compatibility itinerary returned to current screens means users do not re-enter their trip and screens can move to the normalized model incrementally.

`getNextJourneyAction(trip, pilgrimProgress, currentTime)` is the shared Home and Journey decision engine. Its highest priorities are a reliably timed flight within six hours, then an explicitly active Tawaf or Sa’i counter. It uses trip order and timing for conservative Ihram preparation language and never claims physical Miqat proximity.

Preparation checklist state and ritual progress are scoped by both trip and pilgrim. Operator-authored events and checklist definitions can later enter the same decision engine through stable IDs and a `source` field without introducing Groups or operator UI now.
