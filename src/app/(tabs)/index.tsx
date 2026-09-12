import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { useItinerary } from '@/context/itinerary-context';
import { useGuideProgress, useJourneyProgress, usePreparationChecklist } from '@/hooks/use-local-progress';
import { useNow } from '@/hooks/use-now';
import { LocalSaveStatus } from '@/components/local-save-status';
import { daysBetween, daysUntil, formatDateShort, getCurrentStay, getNextOrCurrentStay } from '@/lib/date-helpers';
import { getNextJourneyAction } from '@/lib/home-action';
import { buildSteps } from '@/lib/journey';
import { AppIcon as Ionicons } from '@/components/app-icon';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

type PrayerTime = { name: string; time: string };
type NextPrayer = PrayerTime & { diff: string; progress: number };

function getCityCoords(city: string): { lat: number; lng: number } {
  const normalized = city.toLowerCase();
  if (normalized.includes('makkah') || normalized.includes('mecca')) {
    return { lat: 21.4225, lng: 39.8262 };
  }
  return { lat: 24.4672, lng: 39.6112 };
}

function PrayerSpotlight({ city }: { city: string }) {
  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [next, setNext] = useState<NextPrayer | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchPrayers = useCallback(async () => {
    try {
      const { lat, lng } = getCityCoords(city);
      const today = new Date();
      const date = [
        String(today.getDate()).padStart(2, '0'),
        String(today.getMonth() + 1).padStart(2, '0'),
        today.getFullYear(),
      ].join('-');
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lng}&method=4`
      );
      const json = await response.json();
      const timings = json?.data?.timings;
      if (!timings) return;

      const list = PRAYER_NAMES.map((name) => ({ name, time: timings[name] }));
      setPrayers(list);

      const now = new Date();
      const toDate = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const value = new Date(now);
        value.setHours(hours, minutes, 0, 0);
        return value;
      };
      const nextIndex = list.findIndex((prayer) => toDate(prayer.time) > now);

      if (nextIndex === -1) {
        setNext({ ...list[0], diff: 'tomorrow', progress: 1 });
        return;
      }

      const prayer = list[nextIndex];
      const nextDate = toDate(prayer.time);
      const previousDate =
        nextIndex > 0 ? toDate(list[nextIndex - 1].time) : toDate(list[list.length - 1].time);
      if (nextIndex === 0) previousDate.setDate(previousDate.getDate() - 1);

      const total = nextDate.getTime() - previousDate.getTime();
      const elapsed = now.getTime() - previousDate.getTime();
      const remaining = nextDate.getTime() - now.getTime();
      const hours = Math.floor(remaining / 3_600_000);
      const minutes = Math.floor((remaining % 3_600_000) / 60_000);

      setNext({
        ...prayer,
        diff: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
        progress: Math.max(0, Math.min(1, total > 0 ? elapsed / total : 0)),
      });
    } catch {
      // Keep the home screen usable when prayer data is temporarily unavailable.
    }
  }, [city]);

  useEffect(() => {
    fetchPrayers();
  }, [fetchPrayers]);

  return (
    <View style={styles.prayerCard}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Show today's prayer times" accessibilityState={{ expanded }} onPress={() => setExpanded(value => !value)} style={styles.prayerRow}>
        <Ionicons name="moon-outline" size={22} color={Palette.gold} />
        <View style={styles.flex}>
          <Text style={styles.smallLabel}>Next prayer · {city}</Text>
          <Text style={styles.prayerName}>{next ? `${next.name}  ${next.time}` : 'Prayer times'}</Text>
        </View>
        <Text style={styles.meta}>{next ? next.diff : '—'}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={Palette.textSecondary} />
      </TouchableOpacity>
      {expanded && <View style={styles.prayerList}>
        {prayers.length ? prayers.map(prayer => <View key={prayer.name} style={styles.prayerItem}>
          <Text style={[styles.meta, prayer.name === next?.name && styles.gold]}>{prayer.name}</Text>
          <Text style={[styles.meta, prayer.name === next?.name && styles.gold]}>{prayer.time}</Text>
        </View>) : <Text style={styles.meta}>Connect to the internet to load prayer times.</Text>}
      </View>}
    </View>
  );
}

function WeatherTile({ city }: { city: string }) {
  const [weather, setWeather] = useState<{ temp: number; description: string } | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      const { lat, lng } = getCityCoords(city);
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code`
      );
      const json = await response.json();
      const current = json?.current;
      if (!current) return;

      const code = current.weather_code as number;
      let description = 'Clear';
      if (code >= 1 && code <= 3) description = 'Partly cloudy';
      else if (code >= 45 && code <= 48) description = 'Foggy';
      else if (code >= 51 && code <= 67) description = 'Rain';
      else if (code >= 71 && code <= 77) description = 'Snow';
      else if (code >= 80) description = 'Storms';

      setWeather({ temp: Math.round(current.temperature_2m), description });
    } catch {
      // Weather is supplementary; omit it if the service cannot be reached.
    }
  }, [city]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const isHot = (weather?.temp ?? 0) >= 40;

  return <View style={styles.weatherRow}>
    <Ionicons name={isHot ? 'sunny-outline' : 'partly-sunny-outline'} size={19} color={Palette.gold} />
    <Text style={styles.meta}>{city} · {weather ? `${weather.temp}° · ${weather.description}` : 'Weather unavailable'}</Text>
    {isHot && <Text style={styles.gold}>Stay hydrated</Text>}
  </View>;
}

export default function HomeTab() {
  const router = useRouter();
  const { itinerary, trip, isLoading } = useItinerary();
  const journey = useJourneyProgress();
  const guide = useGuideProgress();
  const checklist = usePreparationChecklist();
  const nowValue = useNow();
  const now = new Date(nowValue);
  useEffect(() => { if (!isLoading && !itinerary) router.replace('/'); }, [isLoading, itinerary, router]);
  if (!itinerary || !trip) return null;

  const { tripType, phases } = buildSteps(itinerary, now);
  const isUmrah = tripType === 'umrah';
  const firstName = itinerary.pilgrim.name.trim().split(/\s+/)[0] || 'Pilgrim';
  const departure = itinerary.flights.outbound.departureDate;
  const arrivalHome = itinerary.flights.return.arrivalDate;
  const daysLeft = daysUntil(departure, now);
  const daysHome = daysUntil(arrivalHome, now);
  const tripDays = daysBetween(departure, arrivalHome);
  const inProgress = daysLeft !== null && daysLeft <= 0 && daysHome !== null && daysHome >= 0;
  const status = inProgress ? `Day ${1 - daysLeft} of ${(tripDays ?? 0) + 1}` : daysLeft !== null && daysLeft > 0 ? `In ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}` : daysHome !== null && daysHome < 0 ? 'Journey complete' : 'Your journey';
  const currentStay = getCurrentStay(itinerary.hotels);
  const stay = getNextOrCurrentStay(itinerary.hotels);
  const cities = itinerary.umrah?.route === 'madinah-makkah' ? ['Madinah', 'Makkah'] : itinerary.umrah?.route === 'makkah-only' ? ['Makkah'] : ['Makkah', 'Madinah'];
  const city = currentStay?.city || stay?.city || cities[0];
  const action = getNextJourneyAction(trip, { journeyCompleted: journey.value, guide: guide.value, checklist: checklist.value }, now);
  const actionIcon = action.type === 'flight' ? 'airplane-outline'
    : action.type === 'stay' ? 'bed-outline'
      : action.type === 'checklist' ? 'checkmark-done-outline'
        : action.type === 'ritual' ? 'compass-outline'
          : 'map-outline';
  const steps = phases.flatMap(phase => phase.steps);
  const completed = steps.filter(step => journey.value[step.id]).length;
  const ready = journey.ready && guide.ready && checklist.ready;

  return <SafeAreaView style={styles.container} edges={['top']}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text style={styles.greeting}>As-salamu alaykum, {firstName}</Text>
          <Text style={styles.date}>{new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)}</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open settings" onPress={() => router.push('/settings')} style={styles.avatar}>
          <Ionicons name="person-outline" size={20} color={Palette.textPrimary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity accessibilityRole="button" accessibilityLabel="View your full journey" onPress={() => router.push('/(tabs)/journey')} activeOpacity={0.8} style={styles.tripHeader}>
        <View style={styles.rowBetween}>
          <Text style={styles.tripLabel}>{isUmrah ? 'YOUR UMRAH' : 'YOUR HAJJ'}</Text>
          <Text style={styles.status}>{status}</Text>
        </View>
        <View style={styles.cityRoute}>
          {cities.map((name, index) => <View key={name} style={styles.cityPart}>
            {index > 0 && <Ionicons name="arrow-forward" size={22} color="#86795c" style={{ marginHorizontal: 12 }} />}
            <Text style={styles.cityTitle}>{name}</Text>
          </View>)}
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.meta}>{formatDateShort(departure)} — {formatDateShort(arrivalHome)}</Text>
          <Ionicons name="arrow-forward" size={19} color={Palette.textSecondary} />
        </View>
      </TouchableOpacity>

      <View style={styles.nextCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.nextEyebrow}>{ready ? action.eyebrow : 'Your next step'}</Text>
          <Ionicons name={actionIcon} size={22} color="#776447" />
        </View>
        <Text style={styles.nextTitle}>{ready ? action.title : 'Getting your place…'}</Text>
        <Text style={styles.nextDetail}>{ready ? action.detail : 'Loading the progress saved on this device.'}</Text>
        <TouchableOpacity disabled={!ready} accessibilityRole="button" style={[styles.nextButton, !ready && { opacity: 0.5 }]} activeOpacity={0.8} onPress={() => router.push(action.step ? { pathname: '/umrah-guide', params: { step: action.step } } : action.route)}>
          <Text style={styles.nextButtonText}>{ready ? action.cta : 'Loading…'}</Text>
          <Ionicons name="arrow-forward" size={20} color="#fffaf0" />
        </TouchableOpacity>
        {ready && action.journeyStep && <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Mark ${action.title} complete`} style={styles.markDone} onPress={() => journey.update(previous => ({ ...previous, [action.journeyStep!]: true }))}>
          <Ionicons name="checkmark" size={16} color="#655c4b" />
          <Text style={styles.markDoneText}>Already done? Mark complete</Text>
        </TouchableOpacity>}
      </View>
      {(journey.error || !journey.ready || journey.saving) && <LocalSaveStatus record={journey} />}
      {(guide.error || !guide.ready || guide.saving) && <LocalSaveStatus record={guide} />}
      {(checklist.error || !checklist.ready || checklist.saving) && <LocalSaveStatus record={checklist} />}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your trip, at hand</Text>
        <Text style={styles.smallLabel}>{completed}/{steps.length} complete</Text>
      </View>
      <View style={styles.shortcutRow}>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(tabs)/flights')} style={styles.shortcut}>
          <Ionicons name="airplane-outline" size={23} color={Palette.gold} />
          <Text style={styles.shortcutTitle}>Flights</Text>
          <Text style={styles.smallLabel}>Times & details</Text>
        </TouchableOpacity>
        <View style={styles.shortcutDivider} />
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push(isUmrah ? '/umrah-guide' : '/hajj-guide')} style={styles.shortcut}>
          <Ionicons name="book-outline" size={23} color={Palette.gold} />
          <Text style={styles.shortcutTitle}>{isUmrah ? 'Umrah guide' : 'Hajj guide'}</Text>
          <Text style={styles.smallLabel}>Read at your pace</Text>
        </TouchableOpacity>
        <View style={styles.shortcutDivider} />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open preparation checklist" onPress={() => router.push('/checklist')} style={styles.shortcut}>
          <Ionicons name="checkmark-done-outline" size={23} color={Palette.gold} />
          <Text style={styles.shortcutTitle}>Prepare</Text>
          <Text style={styles.smallLabel}>Your checklist</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/stays')} activeOpacity={0.8} style={styles.stayRow}>
        <View style={styles.stayIcon}><Ionicons name="bed-outline" size={23} color="#d5c7aa" /></View>
        <View style={styles.flex}>
          <Text style={styles.smallLabel}>{currentStay ? 'Your stay' : 'Accommodation'}{stay?.city ? ` · ${stay.city}` : ''}</Text>
          <Text style={styles.stayName}>{stay?.name || 'Add your hotel'}</Text>
          <Text style={styles.smallLabel}>{stay?.checkIn ? `${formatDateShort(stay.checkIn)} — ${formatDateShort(stay.checkOut)}` : 'Keep your stay details close'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Palette.textSecondary} />
      </TouchableOpacity>

      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Around you</Text><Ionicons name="location-outline" size={18} color={Palette.textSecondary} /></View>
      <PrayerSpotlight city={city} />
      <WeatherTile city={city} />
      <Text style={styles.blessing}>May every step bring you closer.</Text>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101827' },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 118, maxWidth: 640, width: '100%', alignSelf: 'center' },
  flex: { flex: 1, minWidth: 0 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32 },
  greeting: { color: '#e6e3dc', fontFamily: QasdFonts.bodyMedium, fontSize: 15 },
  date: { color: '#9ba6ba', fontFamily: QasdFonts.body, fontSize: 13, marginTop: 5 },
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: '#3a4251', alignItems: 'center', justifyContent: 'center' },
  tripHeader: { marginBottom: 28 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  tripLabel: { fontFamily: QasdFonts.bodySemiBold, fontSize: 11, letterSpacing: 2, color: '#c8b78f' },
  status: { fontFamily: QasdFonts.bodyMedium, fontSize: 13, color: '#d8d6ce' },
  cityRoute: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 10, marginBottom: 12 },
  cityPart: { flexDirection: 'row', alignItems: 'center' },
  cityTitle: { fontFamily: QasdFonts.displayMedium, fontSize: 40, color: '#f5f0e5', lineHeight: 48 },
  meta: { fontFamily: QasdFonts.body, fontSize: 14, color: '#aab3c2', lineHeight: 21 },
  nextCard: { backgroundColor: '#eee7d8', borderRadius: 22, padding: 24 },
  nextEyebrow: { flex: 1, fontFamily: QasdFonts.bodySemiBold, fontSize: 12, color: '#716044' },
  nextTitle: { fontFamily: QasdFonts.display, fontSize: 36, lineHeight: 39, color: '#202b2a', marginTop: 18, marginBottom: 10 },
  nextDetail: { fontFamily: QasdFonts.body, fontSize: 15, lineHeight: 23, color: '#5b5b50', marginBottom: 22 },
  nextButton: { minHeight: 54, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 14, backgroundColor: '#263c36', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  nextButtonText: { flex: 1, fontFamily: QasdFonts.bodySemiBold, fontSize: 15, color: '#fffaf0' },
  markDone: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 8 },
  markDoneText: { fontFamily: QasdFonts.bodyMedium, fontSize: 12, color: '#655c4b' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 32, marginBottom: 18 },
  sectionTitle: { fontFamily: QasdFonts.displayMedium, fontSize: 26, color: '#f0ece2' },
  smallLabel: { fontFamily: QasdFonts.body, fontSize: 12, color: '#aab3c2', lineHeight: 19 },
  shortcutRow: { flexDirection: 'row', paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#2a3341' },
  shortcut: { flex: 1, alignItems: 'flex-start', gap: 6, paddingLeft: 8, paddingVertical: 6, minHeight: 88 },
  shortcutTitle: { color: '#eeeae2', fontFamily: QasdFonts.bodyMedium, fontSize: 16, marginTop: 4 },
  shortcutDivider: { width: 1, backgroundColor: '#2a3341', marginRight: 24, marginVertical: 8 },
  stayRow: { flexDirection: 'row', gap: 14, alignItems: 'center', paddingVertical: 22, borderBottomWidth: 1, borderBottomColor: '#2a3341' },
  stayIcon: { width: 50, height: 58, borderRadius: 12, backgroundColor: '#252e39', alignItems: 'center', justifyContent: 'center' },
  stayName: { fontFamily: QasdFonts.bodyMedium, fontSize: 16, color: '#eeeae2', marginVertical: 4, lineHeight: 22 },
  prayerCard: { borderBottomWidth: 1, borderBottomColor: '#2a3341', paddingBottom: 16 },
  prayerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56 },
  prayerName: { fontFamily: QasdFonts.bodyMedium, fontSize: 18, color: '#eeeae2', marginTop: 4 },
  prayerList: { paddingTop: 16, gap: 12 },
  prayerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gold: { color: Palette.gold, fontFamily: QasdFonts.bodyMedium, fontSize: 12 },
  weatherRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 18 },
  blessing: { textAlign: 'center', fontFamily: QasdFonts.displayRegular, fontSize: 19, color: '#92998f', marginTop: 36, marginBottom: 8 },
});
