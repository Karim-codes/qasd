import { AppIcon } from '@/components/app-icon';
import { QasdFonts } from '@/constants/qasd-theme';
import { TravelColors as C, TravelType as T } from '@/constants/travel-design';
import { useItinerary } from '@/context/itinerary-context';
import { useNow } from '@/hooks/use-now';
import { daysBetween, daysUntil, formatDateShort } from '@/lib/date-helpers';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StaysScreen() {
  const router = useRouter();
  const { itinerary } = useItinerary();
  useNow();
  if (!itinerary) return null;
  const madinahFirst = itinerary.umrah?.route === 'madinah-makkah';
  const stays = [itinerary.hotels.hotel1, ...(itinerary.umrah?.route === 'makkah-only' ? [] : [itinerary.hotels.hotel2])]
    .map((hotel, index) => ({ hotel, city: hotel.city || (index === 0 ? madinahFirst ? 'Madinah' : 'Makkah' : madinahFirst ? 'Makkah' : 'Madinah') }))
    .filter(({ hotel }) => hotel.name || hotel.checkIn || hotel.checkOut);
  const totalNights = stays.reduce((sum, { hotel }) => sum + Math.max(0, daysBetween(hotel.checkIn, hotel.checkOut) ?? 0), 0);
  const datesComplete = stays.every(({ hotel }) => hotel.checkIn && hotel.checkOut && (daysBetween(hotel.checkIn, hotel.checkOut) ?? -1) >= 0);

  return <SafeAreaView style={s.container} edges={['top', 'bottom']}>
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.navigation}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={s.navButton}><AppIcon name="arrow-back" size={22} color={C.cream} /></TouchableOpacity>
        <Text style={T.eyebrow}>ROOM TO REST</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open trip settings" onPress={() => router.push('/settings')} style={s.navButton}><AppIcon name="settings-outline" size={21} color={C.cream} /></TouchableOpacity>
      </View>
      <Text style={T.title}>Your stays</Text>
      <Text style={[T.body, { marginTop: 8 }]}>{stays.length ? `${stays.length} ${stays.length === 1 ? 'stay' : 'stays'}${datesComplete ? ` · ${totalNights} ${totalNights === 1 ? 'night' : 'nights'}` : ' · Add your dates'}` : 'A place to settle in, wherever you are.'}</Text>
      {stays.length > 0 && <View style={s.routeStrip}>{stays.map(({ city }, index) => <View key={index} style={s.routePart}>
        {index > 0 && <AppIcon name="arrow-forward" size={15} color={C.muted} style={{ marginHorizontal: 12 }} />}
        <AppIcon name="location-outline" size={15} color={C.gold} /><Text style={s.routeText}>{city}</Text>
      </View>)}</View>}

      {!stays.length && <View style={s.empty}>
        <View style={s.emptyIcon}><AppIcon name="bed-outline" size={36} color={C.paperMuted} /></View>
        <Text style={s.emptyTitle}>Your room awaits.</Text>
        <Text style={s.emptyCopy}>Add your hotel and dates to keep your stay details close.</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/settings')} style={s.emptyButton}><Text style={s.buttonText}>Open trip settings</Text><AppIcon name="arrow-forward" size={19} color={C.paper} /></TouchableOpacity>
      </View>}

      {stays.map(({ hotel, city }, index) => {
        const checkIn = daysUntil(hotel.checkIn);
        const checkOut = daysUntil(hotel.checkOut);
        const active = checkIn !== null && checkOut !== null && checkIn <= 0 && checkOut > 0;
        const past = checkOut !== null && checkOut <= 0;
        const nights = daysBetween(hotel.checkIn, hotel.checkOut);
        const featured = active || (!stays.some(({ hotel: other }) => (daysUntil(other.checkIn) ?? 1) <= 0 && (daysUntil(other.checkOut) ?? 0) > 0) && index === 0);
        const ink = featured ? C.ink : C.cream;
        const muted = featured ? C.paperMuted : C.muted;
        const status = active ? 'Your stay today' : past ? 'Past stay' : checkIn === null ? 'Dates pending' : 'Coming up';
        return <View key={index}>
          {index > 0 && <View style={s.connection}><View style={s.connectionLine} /><AppIcon name="arrow-down" size={15} color={C.gold} /><Text style={T.label}>Next stop · {city}</Text><View style={s.connectionLine} /></View>}
          <View style={[s.hotelCard, featured && s.featured]}>
            <View style={s.cardTop}>
              <View style={[s.hotelIcon, featured && { backgroundColor: '#ded5c1' }]}><AppIcon name="bed-outline" size={28} color={featured ? '#6e624b' : '#d5c7aa'} /></View>
              <View style={s.flex}><Text style={[s.cityLabel, { color: muted }]}>{city}</Text><Text style={[T.label, { color: muted }]}>Stay {String(index + 1).padStart(2, '0')}</Text></View>
              <View style={[s.badge, active && s.activeBadge, featured && !active && { borderColor: '#c6beac' }]}><Text style={[s.badgeText, { color: active ? C.paper : muted }]}>{status}</Text></View>
            </View>
            <Text style={[s.hotelName, { color: ink }]}>{hotel.name || 'Add your hotel name'}</Text>
            <View style={s.nights}><AppIcon name="moon-outline" size={16} color={muted} /><Text style={[T.label, { color: muted, fontSize: 14 }]}>{nights !== null && nights >= 0 ? `${nights} ${nights === 1 ? 'night' : 'nights'} to settle in` : 'Stay dates to be confirmed'}</Text></View>
            <View style={[s.dateGrid, { borderColor: featured ? '#cec6b5' : C.line }]}>
              <View style={s.dateColumn}><Text style={[T.label, { color: muted }]}>Check-in</Text><Text style={[s.dateValue, { color: ink }]}>{formatDateShort(hotel.checkIn)}</Text></View>
              <View style={[s.dateDivider, { backgroundColor: featured ? '#cec6b5' : C.line }]} />
              <View style={s.dateColumn}><Text style={[T.label, { color: muted }]}>Check-out</Text><Text style={[s.dateValue, { color: ink }]}>{formatDateShort(hotel.checkOut)}</Text></View>
            </View>
            {active && <View style={s.stayNote}><AppIcon name="time-outline" size={16} color={muted} /><Text style={[T.label, { color: muted }]}>{checkOut === 1 ? 'Check-out tomorrow' : `${checkOut} days until check-out`}</Text></View>}
          </View>
        </View>;
      })}
      {stays.length > 0 && <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/settings')} style={s.manage}><AppIcon name="create-outline" size={18} color={C.gold} /><Text style={s.manageText}>Edit itinerary in Settings</Text><AppIcon name="arrow-forward" size={17} color={C.gold} /></TouchableOpacity>}
    </ScrollView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40, width: '100%', maxWidth: 640, alignSelf: 'center' },
  navigation: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 },
  navButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.line },
  routeStrip: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', paddingVertical: 24 },
  routePart: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
  routeText: { fontFamily: QasdFonts.bodyMedium, fontSize: 14, color: C.cream, marginLeft: 5 },
  hotelCard: { width: '100%', padding: 22, borderRadius: 22, backgroundColor: C.surface },
  featured: { backgroundColor: C.paper },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  hotelIcon: { width: 48, height: 54, borderRadius: 14, backgroundColor: C.iconSurface, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, minWidth: 75 },
  cityLabel: { fontFamily: QasdFonts.bodySemiBold, fontSize: 15, marginBottom: 3 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#445044' },
  activeBadge: { backgroundColor: C.forest, borderColor: C.forest },
  badgeText: { fontFamily: QasdFonts.bodyMedium, fontSize: 10 },
  hotelName: { fontFamily: QasdFonts.displayMedium, fontSize: 33, lineHeight: 38, marginTop: 22 },
  nights: { flexDirection: 'row', gap: 7, alignItems: 'center', marginTop: 12 },
  dateGrid: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, marginTop: 24, paddingTop: 20 },
  dateColumn: { flex: 1 },
  dateValue: { fontFamily: QasdFonts.bodyMedium, fontSize: 20, marginTop: 6 },
  dateDivider: { width: 1, height: 38, marginHorizontal: 18 },
  stayNote: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 20 },
  connection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 20 },
  connectionLine: { height: 1, flex: 1, backgroundColor: C.line },
  manage: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 56, marginTop: 20 },
  manageText: { fontFamily: QasdFonts.bodyMedium, fontSize: 13, color: C.gold },
  empty: { marginTop: 26, padding: 24, borderRadius: 22, backgroundColor: C.paper },
  emptyIcon: { width: 68, height: 68, borderRadius: 20, backgroundColor: '#ded5c1', justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { ...T.section, color: C.ink, marginTop: 20 },
  emptyCopy: { ...T.body, color: C.paperMuted, marginTop: 8 },
  emptyButton: { backgroundColor: C.forest, borderRadius: 12, minHeight: 54, padding: 16, marginTop: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  buttonText: { fontFamily: QasdFonts.bodyMedium, fontSize: 14, color: C.paper },
});
