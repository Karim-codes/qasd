import { checklistSummary, EMPTY_CHECKLIST, type ChecklistProgress } from './checklist';
import { daysUntil } from './date-helpers';
import { buildSteps, getNextJourneyStep } from './journey';
import { EMPTY_GUIDE, type GuideProgress } from './progress';
import { itineraryFromTrip, normalizeItinerary } from './trip';
import type { Itinerary, Trip, TripFlight } from './types';
import { UMRAH_STEPS } from './umrah-steps';

export type JourneyActionPath = '/(tabs)/journey' | '/(tabs)/flights' | '/stays' | '/checklist' | '/umrah-guide' | '/hajj-guide';

export interface PilgrimTripProgress {
  journeyCompleted: Record<string, boolean>;
  guide: GuideProgress;
  checklist: ChecklistProgress;
}

export interface NextJourneyAction {
  type: 'ritual' | 'flight' | 'stay' | 'transfer' | 'checklist' | 'journey' | 'review';
  eyebrow: string;
  title: string;
  subtitle: string;
  scheduledAt?: string;
  ctaLabel: string;
  destination: { pathname: JourneyActionPath; params?: Record<string, string> };
  priority: number;
  sourceEventId?: string;
  completionTarget?: string;
  detail: string;
  cta: string;
  route: JourneyActionPath;
  step?: string;
  journeyStep?: string;
}

function action(value: Omit<NextJourneyAction, 'detail' | 'cta' | 'route' | 'step' | 'journeyStep'>): NextJourneyAction {
  return {
    ...value,
    detail: value.subtitle,
    cta: value.ctaLabel,
    route: value.destination.pathname,
    step: value.destination.pathname === '/umrah-guide' ? value.destination.params?.step : undefined,
    journeyStep: value.completionTarget,
  };
}

function travelAction(trip: Trip, direction: 'outbound' | 'return', days: number, critical: boolean): NextJourneyAction | null {
  const flight = trip.flights.find(item => item.direction === direction);
  if (!flight) return null;
  const isOutbound = direction === 'outbound';
  const target = isOutbound ? 'depart-home' : 'depart-saudi';
  return action({
    type: 'flight',
    eyebrow: days === 0 ? 'Travel day' : 'Tomorrow',
    title: isOutbound ? 'Your journey begins.' : 'Your flight home.',
    subtitle: `${flight.departureCity || 'Departure'} → ${flight.arrivalCity || 'Destination'}${flight.departureTime ? ` · ${flight.departureTime}` : ''}`,
    scheduledAt: flight.departureDate,
    ctaLabel: 'View flight details',
    destination: { pathname: '/(tabs)/flights' },
    priority: critical ? 100 : 82,
    sourceEventId: flight.id,
    completionTarget: target,
  });
}

function activeRitualAction(guide: GuideProgress): NextJourneyAction | null {
  const active = (['tawaf', 'sai'] as const)
    .map(id => ({ id, ...guide.counters[id] }))
    .filter(counter => counter.count > 0 && counter.count < 7)
    .sort((a, b) => b.changedAt - a.changedAt)[0];
  if (!active) return null;
  const tawaf = active.id === 'tawaf';
  const step = tawaf ? 'tawaf-start' : 'sai-laps';
  return action({
    type: 'ritual',
    eyebrow: 'Ritual in progress',
    title: tawaf ? 'Continue Tawaf' : 'Continue Sa’i',
    subtitle: `${active.count} of 7 ${tawaf ? 'rounds' : 'lengths'} saved. Continue when you are ready.`,
    ctaLabel: 'Continue counter',
    destination: { pathname: '/umrah-guide', params: { step } },
    priority: 96,
    sourceEventId: `ritual:${active.id}`,
  });
}

function hoursUntilFlight(flight: TripFlight | undefined, currentTime: Date): number | null {
  if (!flight?.departureDate || !flight.departureTime || !flight.departureTimeZone) return null;
  const [hours, minutes] = flight.departureTime.split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (flight.departureTimeZone === 'Asia/Riyadh') {
    const instant = new Date(`${flight.departureDate}T${flight.departureTime}:00+03:00`);
    return (instant.getTime() - currentTime.getTime()) / 3_600_000;
  }
  if (flight.departureTimeZone === Intl.DateTimeFormat().resolvedOptions().timeZone) {
    const instant = new Date(`${flight.departureDate}T${flight.departureTime}:00`);
    return (instant.getTime() - currentTime.getTime()) / 3_600_000;
  }
  return null;
}

function ihramAction(trip: Trip, state: PilgrimTripProgress, currentTime: Date): NextJourneyAction | null {
  if (trip.tripType !== 'umrah' || state.journeyCompleted['umrah-rites'] || state.guide.completed.complete) return null;
  const makkahStay = trip.stays.find(stay => stay.kind === 'makkah');
  const outbound = trip.flights.find(flight => flight.direction === 'outbound');
  const referenceDate = trip.umrah?.route === 'madinah-makkah' ? makkahStay?.checkIn : outbound?.departureDate;
  const days = daysUntil(referenceDate, currentTime);
  if (days === null || days < 0 || days > 1 || state.guide.completed.ihram) return null;
  return action({
    type: 'ritual',
    eyebrow: days === 0 ? 'Prepare today' : 'Prepare before travel',
    title: 'Prepare for Ihram',
    subtitle: trip.umrah?.route === 'madinah-makkah'
      ? 'Review Ihram guidance before travelling from Madinah to Makkah.'
      : 'Review your Ihram guidance before beginning the journey to Makkah.',
    scheduledAt: referenceDate,
    ctaLabel: 'Review Ihram guidance',
    destination: { pathname: '/umrah-guide', params: { step: 'ihram' } },
    priority: 86,
    sourceEventId: 'ritual:ihram-preparation',
  });
}

export function getNextJourneyAction(trip: Trip, state: PilgrimTripProgress, currentTime: Date): NextJourneyAction {
  const itinerary = itineraryFromTrip(trip);
  const { phases } = buildSteps(itinerary, currentTime);
  const steps = phases.flatMap(phase => phase.steps);
  const next = getNextJourneyStep(steps, state.journeyCompleted);
  const umrahActive = steps.some(step => step.id === 'umrah-rites' && step.status === 'active');
  const outbound = trip.flights.find(flight => flight.direction === 'outbound');
  const returning = trip.flights.find(flight => flight.direction === 'return');
  const departure = daysUntil(outbound?.departureDate, currentTime);
  const returnDeparture = daysUntil(returning?.departureDate, currentTime);
  const ended = daysUntil(returning?.arrivalDate, currentTime);
  const outboundHours = hoursUntilFlight(outbound, currentTime);
  const returnHours = hoursUntilFlight(returning, currentTime);
  const candidates: NextJourneyAction[] = [];

  // Only a reliably timed flight within six hours overrides an active ritual session.
  if (returnDeparture === 0 && !state.journeyCompleted['depart-saudi']) {
    const due = travelAction(trip, 'return', returnDeparture, returnHours !== null && returnHours >= 0 && returnHours <= 6); if (due) candidates.push(due);
  }
  if (departure === 0 && !state.journeyCompleted['depart-home']) {
    const due = travelAction(trip, 'outbound', departure, outboundHours !== null && outboundHours >= 0 && outboundHours <= 6); if (due) candidates.push(due);
  }
  const ritual = activeRitualAction(state.guide); if (ritual) candidates.push(ritual);
  if (returnDeparture === 1 && !state.journeyCompleted['depart-saudi']) {
    const due = travelAction(trip, 'return', returnDeparture, false); if (due) candidates.push(due);
  }
  if (departure === 1 && !state.journeyCompleted['depart-home']) {
    const due = travelAction(trip, 'outbound', departure, false); if (due) candidates.push(due);
  }
  const ihram = ihramAction(trip, state, currentTime); if (ihram) candidates.push(ihram);

  if (state.guide.counters.tawaf.count === 7 && state.guide.counters.sai.count === 0 && !state.guide.completed.complete) {
    candidates.push(action({
      type: 'ritual', eyebrow: 'Tawaf complete', title: 'Continue your Umrah',
      subtitle: 'Continue with the guidance after Tawaf, then begin Sa’i.', ctaLabel: 'Continue the guide',
      destination: { pathname: '/umrah-guide', params: { step: 'tawaf-prayer' } }, priority: 90,
      sourceEventId: 'ritual:after-tawaf',
    }));
  }

  const guideStarted = Object.values(state.guide.completed).some(Boolean);
  const nextGuideStep = guideStarted && umrahActive && !state.guide.completed.complete
    ? UMRAH_STEPS.find(step => !state.guide.completed[step.id])
    : undefined;
  if (nextGuideStep) {
    candidates.push(action({
      type: 'ritual', eyebrow: 'Pick up where you left off', title: nextGuideStep.title,
      subtitle: `${nextGuideStep.phase} · Step ${UMRAH_STEPS.indexOf(nextGuideStep) + 1} of ${UMRAH_STEPS.length}`,
      ctaLabel: 'Continue the guide', destination: { pathname: '/umrah-guide', params: { step: nextGuideStep.id } },
      priority: 74, sourceEventId: `guide:${nextGuideStep.id}`,
    }));
  }

  const preparation = checklistSummary(state.checklist);
  if (preparation.remaining > 0 && departure !== null && departure >= 0) {
    candidates.push(action({
      type: 'checklist', eyebrow: departure <= 7 ? 'Before you travel' : 'Prepare at your pace',
      title: 'Complete your preparation', subtitle: `${preparation.completed} of ${preparation.total} items complete.`,
      ctaLabel: 'Open checklist', destination: { pathname: '/checklist' }, priority: departure <= 7 ? 72 : 52,
      sourceEventId: 'checklist:preparation',
    }));
  }

  for (const event of trip.journeyEvents) {
    const days = daysUntil(event.startsAt?.slice(0, 10), currentTime);
    if (days === null || days < 0 || days > 1 || state.journeyCompleted[event.id]) continue;
    candidates.push(action({
      type: event.type === 'stay' ? 'stay' : event.type === 'transfer' ? 'transfer' : 'journey',
      eyebrow: days === 0 ? 'Up next · Today' : 'Coming up', title: event.title,
      subtitle: event.destination ?? 'View this step in your journey.', scheduledAt: event.startsAt,
      ctaLabel: 'View journey', destination: { pathname: '/(tabs)/journey' }, priority: days === 0 ? 78 : 66,
      sourceEventId: event.id, completionTarget: event.id,
    }));
  }

  if (ended !== null && ended < 0) {
    candidates.push(action({ type: 'review', eyebrow: 'Back home', title: 'A journey to remember.', subtitle: 'Your itinerary and saved guidance are here whenever you need them.', ctaLabel: 'Review your journey', destination: { pathname: '/(tabs)/journey' }, priority: 20 }));
  } else if (next) {
    const base = {
      eyebrow: next.status === 'active' ? 'Up next · Today' : 'Coming up', title: next.title,
      subtitle: [next.subtitle, next.date].filter(Boolean).join(' · '), scheduledAt: next.date,
      sourceEventId: next.id, completionTarget: next.id,
    };
    if (next.id === 'umrah-rites') candidates.push(action({ ...base, type: 'ritual', ctaLabel: 'Open Umrah guide', destination: { pathname: '/umrah-guide', params: { step: 'ihram' } }, priority: 64, completionTarget: undefined }));
    else if (next.id.startsWith('hotel-')) candidates.push(action({ ...base, type: 'stay', title: `Check in to ${next.subtitle}`, ctaLabel: 'View your stay', destination: { pathname: '/stays' }, priority: next.status === 'active' ? 80 : 60 }));
    else if (['depart-home', 'arrive-saudi', 'depart-saudi', 'arrive-home', 'layover-out', 'layover-ret'].includes(next.id)) candidates.push(action({ ...base, type: 'flight', ctaLabel: 'View flight details', destination: { pathname: '/(tabs)/flights' }, priority: 58 }));
    else if (['tarwiyah', 'arafah', 'muzdalifah', 'eid', 'tashreeq', 'wada'].includes(next.id)) candidates.push(action({ ...base, type: 'ritual', ctaLabel: 'Open Hajj guide', destination: { pathname: '/hajj-guide' }, priority: 64 }));
    else candidates.push(action({ ...base, type: next.id.startsWith('travel-') ? 'transfer' : 'journey', ctaLabel: 'View journey', destination: { pathname: '/(tabs)/journey' }, priority: 56 }));
  }

  candidates.sort((a, b) => b.priority - a.priority || (a.scheduledAt ?? '').localeCompare(b.scheduledAt ?? '') || (a.sourceEventId ?? '').localeCompare(b.sourceEventId ?? ''));
  return candidates[0] ?? action({ type: 'journey', eyebrow: 'Your journey', title: 'Take a moment.', subtitle: 'No upcoming steps right now. Your full itinerary is always close by.', ctaLabel: 'View journey', destination: { pathname: '/(tabs)/journey' }, priority: 0 });
}

/** Compatibility entry point used by existing callers and saved-state tests. */
export function getHomeAction(itinerary: Itinerary, completed: Record<string, boolean>, guide: GuideProgress = EMPTY_GUIDE, currentTime = new Date(), checklist: ChecklistProgress = EMPTY_CHECKLIST) {
  return getNextJourneyAction(normalizeItinerary(itinerary, currentTime).trip, { journeyCompleted: completed, guide, checklist }, currentTime);
}
