export function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  // Calendar-only itinerary dates belong to the local day, not UTC midnight.
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  const d = parts ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])) : new Date(dateStr);
  if (parts && (d.getFullYear() !== Number(parts[1]) || d.getMonth() !== Number(parts[2]) - 1 || d.getDate() !== Number(parts[3]))) return null;
  return isNaN(d.getTime()) ? null : d;
}

export function formatDate(dateStr?: string): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr || '—';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr?: string): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr || '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatDay(dateStr?: string): string {
  const d = parseDate(dateStr);
  if (!d) return '';
  return d.toLocaleDateString('en-GB', { weekday: 'short' });
}

export function daysUntil(dateStr?: string): number | null {
  const d = parseDate(dateStr);
  if (!d) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysBetween(startStr?: string, endStr?: string): number | null {
  const s = parseDate(startStr);
  const e = parseDate(endStr);
  if (!s || !e) return null;
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

export function getCurrentStay(hotels: { hotel1?: any; hotel2?: any } | undefined) {
  if (!hotels) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (const key of ['hotel1', 'hotel2'] as const) {
    const hotel = hotels[key];
    if (!hotel) continue;
    const checkIn = parseDate(hotel.checkIn);
    const checkOut = parseDate(hotel.checkOut);
    if (checkIn && checkOut) {
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      if (now >= checkIn && now < checkOut) return hotel;
    }
  }
  return null;
}

/**
 * Returns the next upcoming stay (check-in is in the future) or
 * the current stay if one is active. Falls back to hotel1.
 */
export function getNextOrCurrentStay(hotels: { hotel1?: any; hotel2?: any } | undefined) {
  if (!hotels) return null;
  const current = getCurrentStay(hotels);
  if (current) return current;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let nearest: any = null;
  let nearestDiff = Infinity;
  for (const key of ['hotel1', 'hotel2'] as const) {
    const hotel = hotels[key];
    if (!hotel?.checkIn) continue;
    const checkIn = parseDate(hotel.checkIn);
    if (!checkIn) continue;
    checkIn.setHours(0, 0, 0, 0);
    const diff = checkIn.getTime() - now.getTime();
    if (diff > 0 && diff < nearestDiff) {
      nearestDiff = diff;
      nearest = hotel;
    }
  }
  return nearest || hotels.hotel1 || hotels.hotel2 || null;
}

export interface HajjDays {
  tarwiyah: string;  // 8 Dhul-Hijjah
  arafah: string;    // 9 Dhul-Hijjah
  eid: string;       // 10 Dhul-Hijjah
  tashreeq1: string; // 11 Dhul-Hijjah
  tashreeq2: string; // 12 Dhul-Hijjah
  tashreeq3: string; // 13 Dhul-Hijjah
}

function shiftISO(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr;
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Derive the 6 Hajj day dates from the Day of Arafah (9 Dhul-Hijjah).
 * Returns null if no Arafah date is provided.
 */
export function deriveHajjDays(arafahDate?: string): HajjDays | null {
  if (!arafahDate) return null;
  const arafah = parseDate(arafahDate);
  if (!arafah) return null;
  return {
    tarwiyah: shiftISO(arafahDate, -1),
    arafah: arafahDate,
    eid: shiftISO(arafahDate, 1),
    tashreeq1: shiftISO(arafahDate, 2),
    tashreeq2: shiftISO(arafahDate, 3),
    tashreeq3: shiftISO(arafahDate, 4),
  };
}

export function getStepStatus(
  startDate?: string,
  endDate?: string
): 'done' | 'active' | 'upcoming' {
  if (!startDate) return 'upcoming';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = parseDate(startDate);
  if (!start) return 'upcoming';
  start.setHours(0, 0, 0, 0);
  const end = endDate ? parseDate(endDate) : null;
  if (end) end.setHours(0, 0, 0, 0);
  const effectiveEnd = end ?? start;
  if (now.getTime() > effectiveEnd.getTime()) return 'done';
  if (now.getTime() >= start.getTime() && now.getTime() <= effectiveEnd.getTime()) return 'active';
  return 'upcoming';
}
