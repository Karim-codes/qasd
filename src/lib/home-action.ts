import { daysUntil } from './date-helpers';
import { buildSteps, getNextJourneyStep } from './journey';
import type { GuideProgress } from './progress';
import type { Itinerary } from './types';
import { UMRAH_STEPS } from './umrah-steps';

export interface HomeAction {
  eyebrow: string;
  title: string;
  detail: string;
  cta: string;
  route: '/(tabs)/journey' | '/(tabs)/flights' | '/stays' | '/umrah-guide' | '/hajj-guide';
  step?: string;
  journeyStep?: string;
}
export function getHomeAction(itinerary: Itinerary, completed: Record<string, boolean>, guide: GuideProgress): HomeAction {
  const { phases } = buildSteps(itinerary);
  const steps = phases.flatMap(phase => phase.steps);
  const next = getNextJourneyStep(steps, completed);
  const departure = daysUntil(itinerary.flights.outbound.departureDate);
  const returning = daysUntil(itinerary.flights.return.departureDate);
  const ended = daysUntil(itinerary.flights.return.arrivalDate);
  const startedGuide = guide.counters.tawaf.count > 0 || guide.counters.sai.count > 0 || Object.values(guide.completed).some(Boolean);
  const umrahActive = steps.some(step => step.id === 'umrah-rites' && step.status === 'active');

  // A due flight should not disappear behind an in-progress ritual or hotel stay.
  const flightId = returning !== null && returning >= 0 && returning <= 1 && !completed['depart-saudi']
    ? 'depart-saudi'
    : departure !== null && departure >= 0 && departure <= 1 && !completed['depart-home'] ? 'depart-home' : null;
  if (flightId) {
    const flight = flightId === 'depart-home' ? itinerary.flights.outbound : itinerary.flights.return;
    const days = flightId === 'depart-home' ? departure : returning;
    return { eyebrow: days === 0 ? 'Travel day' : 'Tomorrow', title: flightId === 'depart-home' ? 'Your journey begins.' : 'Your flight home.', detail: `${flight.departureCity || 'Departure'} → ${flight.arrivalCity || 'Destination'}${flight.departureTime ? ` · ${flight.departureTime}` : ''}`, cta: 'View flight details', route: '/(tabs)/flights', journeyStep: flightId };
  }
  if (ended !== null && ended < 0) return { eyebrow: 'Back home', title: 'A journey to remember.', detail: 'Your itinerary and saved guidance are here whenever you need them.', cta: 'Review your journey', route: '/(tabs)/journey' };

  if (!completed['umrah-rites'] && !guide.completed.complete && (umrahActive && (startedGuide || next?.id === 'umrah-rites'))) {
    const counterStep = guide.counters.tawaf.count > 0 && !guide.completed['tawaf-start'] ? 'tawaf-start'
      : guide.counters.sai.count > 0 && !guide.completed['sai-laps'] ? 'sai-laps' : null;
    const step = UMRAH_STEPS.find(item => item.id === counterStep) ?? UMRAH_STEPS.find(item => !guide.completed[item.id])!;
    const count = counterStep === 'tawaf-start' ? guide.counters.tawaf.count : guide.counters.sai.count;
    return { eyebrow: startedGuide ? 'Pick up where you left off' : 'Your Umrah', title: counterStep ? (counterStep === 'tawaf-start' ? 'Continue Tawaf' : 'Continue Sa’i') : step.title, detail: counterStep ? `${count} of 7 ${counterStep === 'tawaf-start' ? 'rounds' : 'lengths'} saved. Continue at your own pace.` : `${step.phase} · Step ${UMRAH_STEPS.indexOf(step) + 1} of ${UMRAH_STEPS.length}`, cta: counterStep ? 'Continue counter' : 'Open this step', route: '/umrah-guide', step: step.id };
  }
  if (!next) return { eyebrow: 'Your journey', title: 'Take a moment.', detail: 'No upcoming steps right now. Your full itinerary is always close by.', cta: 'View journey', route: '/(tabs)/journey' };
  const base = { eyebrow: next.status === 'active' ? 'Up next · Today' : 'Coming up', title: next.title, detail: [next.subtitle, next.date].filter(Boolean).join(' · '), cta: 'View journey', route: '/(tabs)/journey' as HomeAction['route'], journeyStep: next.id };
  if (next.id === 'umrah-rites') return { ...base, cta: 'Open Umrah guide', route: '/umrah-guide', step: 'ihram', journeyStep: undefined };
  if (next.id.startsWith('hotel-')) return { ...base, title: `Check in to ${next.subtitle}`, cta: 'View your stay', route: '/stays' };
  if (['depart-home', 'arrive-saudi', 'depart-saudi', 'arrive-home', 'layover-out', 'layover-ret'].includes(next.id)) return { ...base, cta: 'View flight details', route: '/(tabs)/flights' };
  if (['tarwiyah', 'arafah', 'muzdalifah', 'eid', 'tashreeq', 'wada'].includes(next.id)) return { ...base, cta: 'Open Hajj guide', route: '/hajj-guide' };
  return base;
}
