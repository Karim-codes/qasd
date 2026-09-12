import { Palette } from '../constants/qasd-theme';
import { deriveHajjDays, formatDate, getStepStatus } from './date-helpers';
import type { Itinerary } from './types';
import type { Ionicons } from '@expo/vector-icons';

type StepStatus = 'done' | 'active' | 'upcoming';

interface DetailRow {
  label: string;
  value: string;
}

export interface Step {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string; // base color for icon halo
  status: StepStatus;
  date?: string;
  details: DetailRow[];
}

export interface Phase {
  id: string;
  label: string;
  meccaCount?: string; // e.g. "4 stops"
  steps: Step[];
}

export function buildSteps(itinerary: Itinerary, currentTime = new Date()): { tripType: 'hajj' | 'umrah'; phases: Phase[] } {
  const outbound = itinerary.flights?.outbound;
  const ret = itinerary.flights?.return;
  const hajjDays = deriveHajjDays(itinerary.hajj?.arafahDate);
  const campName = itinerary.camp?.name || '';

  // Trip type: prefer the stored tripType, fall back to heuristic (camp or Arafah date set).
  const tripType: 'hajj' | 'umrah' = itinerary.tripType ?? (campName || hajjDays ? 'hajj' : 'umrah');

  // Determine Umrah route and assign hotels correctly
  const umrahRoute = itinerary.umrah?.route;
  const madinahFirst = umrahRoute === 'madinah-makkah';

  // When madinahFirst, review.tsx stores: hotel1=Madinah, hotel2=Makkah
  // Otherwise: hotel1=Makkah, hotel2=Madinah
  const hotel1 = itinerary.hotels?.hotel1;
  const hotel2 = itinerary.hotels?.hotel2;
  const makkahHotel = (tripType === 'umrah' && madinahFirst) ? hotel2 : hotel1;
  const madinahHotel = (tripType === 'umrah' && madinahFirst) ? hotel1 : hotel2;

  const sToStatus = (startDate?: string, endDate?: string) => getStepStatus(startDate, endDate, currentTime);

  const preTrip: Step[] = [
    {
      id: 'depart-home',
      title: 'Departure from Home',
      subtitle: outbound?.departureCity || 'Your home city',
      icon: 'home-outline',
      accent: Palette.gold,
      status: sToStatus(outbound?.departureDate),
      date: outbound?.departureDate ? formatDate(outbound.departureDate) : undefined,
      details: [
        { label: 'Date', value: formatDate(outbound?.departureDate) },
        { label: 'Time', value: outbound?.departureTime || '—' },
        { label: 'Flight', value: outbound?.flightNumbers?.[0] || '—' },
        { label: 'Airline', value: outbound?.airline || '—' },
      ],
    },
    ...(outbound?.stopoverCity
      ? [
          {
            id: 'layover-out',
            title: `Layover · ${outbound.stopoverCity}`,
            subtitle: `${outbound.layoverDuration || 'Connecting flight'}`,
            icon: 'swap-horizontal' as const,
            accent: '#7eb6ff',
            status: sToStatus(outbound.departureDate, outbound.arrivalDate),
            details: [
              { label: 'Stopover', value: outbound.stopoverCity },
              { label: 'Wait', value: outbound.layoverDuration || '—' },
              { label: 'Connecting', value: outbound.flightNumbers?.[1] || '—' },
              { label: 'Airline', value: outbound.airline || '—' },
            ],
          } satisfies Step,
        ]
      : []),
    {
      id: 'arrive-saudi',
      title: 'Arrival in Saudi Arabia',
      subtitle: outbound?.arrivalAirport || outbound?.arrivalCity || '—',
      icon: 'airplane',
      accent: Palette.gold,
      status: sToStatus(outbound?.arrivalDate),
      date: outbound?.arrivalDate ? formatDate(outbound.arrivalDate) : undefined,
      details: [
        { label: 'Date', value: formatDate(outbound?.arrivalDate) },
        { label: 'Time', value: outbound?.arrivalTime || '—' },
        { label: 'Airport', value: outbound?.arrivalAirport || '—' },
        { label: 'Transfer', value: itinerary.transportation || '—' },
      ],
    },
  ];

  const makkahPhase: Step[] = [
    ...(tripType === 'umrah' && madinahFirst ? [{
      id: 'travel-makkah',
      title: 'Travel to Makkah',
      subtitle: itinerary.transportation || 'Package transportation',
      icon: 'car' as const,
      accent: '#7eb6ff',
      status: sToStatus(makkahHotel?.checkIn),
      date: makkahHotel?.checkIn ? formatDate(makkahHotel.checkIn) : undefined,
      details: [
        { label: 'Date', value: formatDate(makkahHotel?.checkIn) },
        { label: 'Transport', value: itinerary.transportation || '—' },
        { label: 'To', value: 'Makkah' },
      ],
    } satisfies Step] : []),
    {
      id: 'hotel-makkah',
      title: `Stay in ${makkahHotel?.city || 'Makkah'}`,
      subtitle: makkahHotel?.name || 'First accommodation',
      icon: 'business',
      accent: Palette.gold,
      status: sToStatus(makkahHotel?.checkIn, makkahHotel?.checkOut),
      date: makkahHotel?.checkIn ? formatDate(makkahHotel.checkIn) : undefined,
      details: [
        { label: 'Hotel', value: makkahHotel?.name || '—' },
        { label: 'City', value: makkahHotel?.city || '—' },
        { label: 'Check-in', value: formatDate(makkahHotel?.checkIn) },
        { label: 'Check-out', value: formatDate(makkahHotel?.checkOut) },
      ],
    },
    {
      id: 'umrah-rites',
      title: tripType === 'hajj' ? 'Perform Umrah (Tamattu)' : 'Perform Umrah',
      subtitle: 'Ihram · Tawaf · Sa\'i · Halq',
      icon: 'sparkles',
      accent: '#9be8c5',
      status: sToStatus(makkahHotel?.checkIn, hajjDays?.tarwiyah || makkahHotel?.checkOut),
      details: [
        { label: 'Ihram', value: 'Enter at Miqat or hotel' },
        { label: 'Tawaf', value: '7 rounds around the Ka\'bah' },
        { label: 'Sa\'i', value: '7 rounds Safa ↔ Marwa' },
        { label: 'After', value: 'Shave / trim → Ihram lifted' },
      ],
    },
  ];

  const hajjRites: Step[] = tripType === 'hajj'
    ? [
        {
          id: 'tarwiyah',
          title: 'Day of Tarwiyah — Mina',
          subtitle: `8 Dhul-Hijjah · ${campName || 'Camp'}`,
          icon: 'flag',
          accent: '#f0c674',
          status: hajjDays ? sToStatus(hajjDays.tarwiyah) : 'upcoming',
          date: hajjDays ? formatDate(hajjDays.tarwiyah) : '8 Dhul-Hijjah',
          details: [
            { label: 'Date', value: hajjDays ? formatDate(hajjDays.tarwiyah) : '8 Dhul-Hijjah' },
            { label: 'Camp', value: campName || '—' },
            { label: 'Rituals', value: 'Enter Ihram · Travel to Mina' },
            { label: 'Prayers', value: 'Dhuhr → Fajr (shortened)' },
          ],
        },
        {
          id: 'arafah',
          title: 'Day of Arafah',
          subtitle: '9 Dhul-Hijjah · The pillar of Hajj',
          icon: 'sunny',
          accent: '#ffb86b',
          status: hajjDays ? sToStatus(hajjDays.arafah) : 'upcoming',
          date: hajjDays ? formatDate(hajjDays.arafah) : '9 Dhul-Hijjah',
          details: [
            { label: 'Date', value: hajjDays ? formatDate(hajjDays.arafah) : '9 Dhul-Hijjah' },
            { label: 'Morning', value: 'Travel Mina → Arafat' },
            { label: 'Afternoon', value: 'Wuquf until sunset' },
            { label: 'Night', value: 'Depart to Muzdalifah after sunset' },
          ],
        },
        {
          id: 'muzdalifah',
          title: 'Muzdalifah',
          subtitle: 'Night of 9/10 Dhul-Hijjah · Collect pebbles',
          icon: 'moon',
          accent: '#a8c8ff',
          status: hajjDays ? sToStatus(hajjDays.arafah, hajjDays.eid) : 'upcoming',
          date: hajjDays ? formatDate(hajjDays.arafah) : '9/10 Dhul-Hijjah',
          details: [
            { label: 'Night', value: hajjDays ? formatDate(hajjDays.arafah) : '9 Dhul-Hijjah (night)' },
            { label: 'Salah', value: 'Pray Maghrib & Isha combined' },
            { label: 'Sleep', value: 'Sunnah to sleep in the open' },
            { label: 'Collect', value: '49–70 pebbles for the Jamarat' },
          ],
        },
        {
          id: 'eid',
          title: 'Eid al-Adha',
          subtitle: '10 Dhul-Hijjah · Stoning & sacrifice',
          icon: 'gift',
          accent: '#ff8b8b',
          status: hajjDays ? sToStatus(hajjDays.eid) : 'upcoming',
          date: hajjDays ? formatDate(hajjDays.eid) : '10 Dhul-Hijjah',
          details: [
            { label: 'Date', value: hajjDays ? formatDate(hajjDays.eid) : '10 Dhul-Hijjah' },
            { label: 'Stoning', value: '7 pebbles at Jamarat al-Aqabah' },
            { label: 'Sacrifice', value: 'Hady (animal sacrifice)' },
            { label: 'Then', value: 'Halq · Tawaf al-Ifadah · Sa\'i' },
          ],
        },
        {
          id: 'tashreeq',
          title: 'Ayam al-Tashreeq',
          subtitle: '11–13 Dhul-Hijjah · Stone the Jamarat',
          icon: 'ellipsis-horizontal-circle',
          accent: '#f0c674',
          status: hajjDays ? sToStatus(hajjDays.tashreeq1, hajjDays.tashreeq3) : 'upcoming',
          date: hajjDays ? formatDate(hajjDays.tashreeq1) : '11–13 Dhul-Hijjah',
          details: [
            { label: 'Day 11', value: hajjDays ? formatDate(hajjDays.tashreeq1) : '11 Dhul-Hijjah' },
            { label: 'Day 12', value: hajjDays ? formatDate(hajjDays.tashreeq2) : '12 Dhul-Hijjah' },
            { label: 'Day 13', value: hajjDays ? formatDate(hajjDays.tashreeq3) : '13 Dhul-Hijjah' },
            { label: 'Daily', value: '21 pebbles · 7 at each Jamarat' },
          ],
        },
        {
          id: 'wada',
          title: 'Tawaf al-Wada',
          subtitle: 'Farewell tawaf before leaving Makkah',
          icon: 'refresh-circle',
          accent: '#9be8c5',
          status: hajjDays ? sToStatus(hajjDays.tashreeq3, hotel1?.checkOut) : 'upcoming',
          details: [
            { label: 'After', value: hajjDays ? formatDate(hajjDays.tashreeq3) : '13 Dhul-Hijjah' },
            { label: 'Hotel', value: hotel1?.name || '—' },
            { label: 'Check-out', value: formatDate(hotel1?.checkOut) },
            { label: 'Ritual', value: 'Tawaf al-Wada (farewell)' },
          ],
        },
      ]
    : [];

  const madinahPhase: Step[] = madinahHotel?.name
    ? [
        ...(!madinahFirst ? [{
          id: 'travel-madinah',
          title: `Travel to ${madinahHotel.city || 'Madinah'}`,
          subtitle: itinerary.transportation || 'Package transportation',
          icon: 'car' as const,
          accent: '#7eb6ff',
          status: sToStatus(madinahHotel.checkIn),
          date: madinahHotel.checkIn ? formatDate(madinahHotel.checkIn) : undefined,
          details: [
            { label: 'Date', value: formatDate(madinahHotel.checkIn) },
            { label: 'Transport', value: itinerary.transportation || '—' },
            { label: 'To', value: madinahHotel.city || '—' },
          ],
        } satisfies Step] : []),
        {
          id: 'hotel-madinah',
          title: `Stay in ${madinahHotel.city || 'Madinah'}`,
          subtitle: madinahHotel.name,
          icon: 'moon',
          accent: '#a8c8ff',
          status: sToStatus(madinahHotel.checkIn, madinahHotel.checkOut),
          date: madinahHotel.checkIn ? formatDate(madinahHotel.checkIn) : undefined,
          details: [
            { label: 'Hotel', value: madinahHotel.name },
            { label: 'City', value: madinahHotel.city || '—' },
            { label: 'Check-in', value: formatDate(madinahHotel.checkIn) },
            { label: 'Check-out', value: formatDate(madinahHotel.checkOut) },
          ],
        },
        {
          id: 'masjid-nabawi',
          title: 'Visit Masjid an-Nabawi',
          subtitle: 'Pray · Greet the Prophet ﷺ · Rawdah',
          icon: 'rose',
          accent: '#9be8c5',
          status: sToStatus(madinahHotel.checkIn, madinahHotel.checkOut),
          details: [
            { label: 'Greet', value: 'Salam to the Prophet ﷺ' },
            { label: 'Visit', value: 'Abu Bakr & Umar (RA)' },
            { label: 'Rawdah', value: 'Pray in the Garden if possible' },
            { label: 'Reward', value: '1,000× prayers' },
          ],
        },
      ]
    : [];

  const returnPhase: Step[] = [
    {
      id: 'depart-saudi',
      title: 'Departure from Saudi',
      subtitle: ret?.departureAirport || ret?.departureCity || 'Saudi airport',
      icon: 'airplane',
      accent: Palette.gold,
      status: sToStatus(ret?.departureDate),
      date: ret?.departureDate ? formatDate(ret.departureDate) : undefined,
      details: [
        { label: 'Date', value: formatDate(ret?.departureDate) },
        { label: 'Time', value: ret?.departureTime || '—' },
        { label: 'Flight', value: ret?.flightNumbers?.[0] || '—' },
        { label: 'Airport', value: ret?.departureAirport || '—' },
      ],
    },
    ...(ret?.stopoverCity
      ? [
          {
            id: 'layover-ret',
            title: `Layover · ${ret.stopoverCity}`,
            subtitle: ret.layoverDuration || 'Connecting flight',
            icon: 'swap-horizontal' as const,
            accent: '#7eb6ff',
            status: sToStatus(ret.departureDate, ret.arrivalDate),
            details: [
              { label: 'Stopover', value: ret.stopoverCity },
              { label: 'Wait', value: ret.layoverDuration || '—' },
              { label: 'Connecting', value: ret.flightNumbers?.[1] || '—' },
              { label: 'Airline', value: ret.airline || '—' },
            ],
          } satisfies Step,
        ]
      : []),
    {
      id: 'arrive-home',
      title: 'Arrival Home',
      subtitle: ret?.arrivalCity || 'Home city',
      icon: 'home',
      accent: '#9be8c5',
      status: sToStatus(ret?.arrivalDate),
      date: ret?.arrivalDate ? formatDate(ret.arrivalDate) : undefined,
      details: [
        { label: 'Date', value: formatDate(ret?.arrivalDate) },
        { label: 'Time', value: ret?.arrivalTime || '—' },
        { label: 'Flight', value: ret?.flightNumbers?.join(' / ') || '—' },
      ],
    },
  ];

  // Build phase ordering based on the route
  const makkahPhaseEntry: Phase = {
    id: 'makkah',
    label: tripType === 'hajj' ? 'Makkah · Umrah Tamattu' : 'Makkah · Umrah',
    steps: makkahPhase,
  };
  const madinahPhaseEntry: Phase | null = madinahPhase.length
    ? { id: 'madinah', label: 'Madinah · Ziyarah', steps: madinahPhase }
    : null;

  const phases: Phase[] = [
    { id: 'travel-out', label: 'Pre-Trip & Travel', steps: preTrip },
    // When madinahFirst, show Madinah before Makkah
    ...(tripType === 'umrah' && madinahFirst
      ? [
          ...(madinahPhaseEntry ? [madinahPhaseEntry] : []),
          makkahPhaseEntry,
        ]
      : [
          makkahPhaseEntry,
          ...(tripType === 'hajj'
            ? [{ id: 'hajj', label: 'Hajj Rituals', steps: hajjRites } as Phase]
            : []),
          ...(madinahPhaseEntry ? [madinahPhaseEntry] : []),
        ]),
    { id: 'return', label: 'Return Home', steps: returnPhase },
  ];

  return { tripType, phases };
}


export function getNextJourneyStep(steps: Step[], completed: Record<string, boolean>) {
  return steps.find(step => !completed[step.id] && step.status === 'active')
    ?? steps.find(step => !completed[step.id] && step.status === 'upcoming');
}
