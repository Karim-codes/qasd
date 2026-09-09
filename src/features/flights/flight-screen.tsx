import EditableField from '@/components/editable-field';
import { TravelColors as C, TravelType } from '@/constants/travel-design';
import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { useItinerary } from '@/context/itinerary-context';
import { formatDate } from '@/lib/date-helpers';
import type { Flight } from '@/lib/types';
import { AppIcon as Ionicons } from '@/components/app-icon';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function routeLabel(city?: string): string {
  if (!city) return 'Home';
  const code = city.match(/\(([A-Z]{3})\)/)?.[1];
  return code || city;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function fmt12(hhmm?: string): string {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m < 10 ? '0' : ''}${m} ${period}`;
}

function TimePressable({ value, path }: { value?: string; path: string }) {
  const { updateField } = useItinerary();
  const [open, setOpen] = useState(false);

  const initial = useMemo(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      if (!Number.isNaN(h) && !Number.isNaN(m)) {
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
      }
    }
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, [value]);

  const [temp, setTemp] = useState<Date>(initial);

  return (
    <>
      <TouchableOpacity
        onPress={() => { setTemp(initial); setOpen(true); }}
        activeOpacity={0.75}
        style={styles.timeBtn}
      >
        <Text style={[styles.timeText, !value && styles.timePlaceholder]}>
          {value ? fmt12(value) : 'Add time'}
        </Text>
        <Ionicons
          name="time-outline"
          size={11}
          color={value ? Palette.gold : Palette.textMuted}
          style={{ marginTop: 2, marginLeft: 3 }}
        />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.pickerBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.pickerSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.pickerHead}>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={10}>
                <Text style={styles.pickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Set time</Text>
              <TouchableOpacity
                onPress={() => {
                  const h = temp.getHours();
                  const m = temp.getMinutes();
                  updateField(path, `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`);
                  setOpen(false);
                }}
                hitSlop={10}
              >
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerBody}>
              <DateTimePicker
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                value={temp}
                onChange={(_, d) => { if (d) setTemp(d); }}
                themeVariant="dark"
                textColor={Palette.textPrimary}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── Boarding pass card ────────────────────────────────────────────────────

function BoardingPassCard({
  flight,
  type,
  prefix,
  pilgrimName,
}: {
  flight: Flight;
  type: 'outbound' | 'return';
  prefix: string;
  pilgrimName: string;
}) {
  const numbers = flight.flightNumbers.filter(Boolean);
  return (
    <View style={[styles.boardingPass, type === 'return' && { backgroundColor: '#dce3d3' }]}>
      <View style={styles.ticketRibbon}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><Ionicons name="airplane-outline" size={16} color={C.paper} /><Text style={styles.ribbonText}>QASD / TRAVEL ITINERARY</Text></View>
        <Text style={styles.ribbonText}>{type === 'outbound' ? '01' : '02'}</Text>
      </View>
      <View style={styles.ticketBody}>
        <View style={styles.passHeader}>
          <Text style={styles.passTypeText}>{type === 'outbound' ? 'THE JOURNEY BEGINS' : 'THE WAY HOME'}</Text>
          <EditableField value={flight.airline} path={`flights.${prefix}.airline`} textStyle={styles.airlineTagText} />
        </View>
        <View style={styles.routeRow}>
          <View style={styles.routePoint}><Text style={styles.detailLabel}>FROM</Text><Text style={[styles.cityCode, routeLabel(flight.departureCity).length > 3 && { fontSize: 25 }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>{routeLabel(flight.departureCity)}</Text><Text style={styles.cityName}>{flight.departureCity || 'Add your home city in Settings'}</Text></View>
          <View style={styles.routeMiddle}><View style={styles.routeLine}><View style={styles.routeDash} /><Ionicons name="airplane-outline" size={24} color={C.forest} /><View style={styles.routeDash} /></View><Text style={styles.directText}>{type === 'outbound' ? 'OUTBOUND' : 'RETURN'}</Text></View>
          <View style={[styles.routePoint, { alignItems: 'flex-end' }]}><Text style={styles.detailLabel}>TO</Text><Text style={[styles.cityCode, routeLabel(flight.arrivalCity).length > 3 && { fontSize: 25 }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>{routeLabel(flight.arrivalCity)}</Text><Text style={[styles.cityName, { textAlign: 'right' }]}>{flight.arrivalCity || 'Add your home city in Settings'}</Text></View>
        </View>
        {flight.stopoverCity ? <View style={styles.stopoverPill}><Ionicons name="git-branch-outline" size={14} color={C.forest} /><Text style={styles.stopoverText}>Via {flight.stopoverCity}{flight.layoverDuration ? ` · ${flight.layoverDuration}` : ''}</Text></View> : null}
        <View style={styles.detailsGrid}>
          <View style={styles.detailCell}><Text style={styles.detailLabel}>DEPARTURE</Text><Text style={styles.detailValue}>{flight.departureDate ? formatDate(flight.departureDate) : 'Date to be added'}</Text><TimePressable value={flight.departureTime} path={`flights.${prefix}.departureTime`} /></View>
          <View style={styles.detailDivider} />
          <View style={styles.detailCell}><Text style={styles.detailLabel}>ARRIVAL</Text><Text style={styles.detailValue}>{flight.arrivalDate ? formatDate(flight.arrivalDate) : 'Date to be added'}</Text><TimePressable value={flight.arrivalTime} path={`flights.${prefix}.arrivalTime`} /></View>
        </View>
        {numbers.length > 0 && <View style={styles.flightNumbers}><Text style={styles.detailLabel}>FLIGHT{numbers.length > 1 ? 'S' : ''}</Text><Text style={styles.flightNumberText}>{numbers.join('  /  ')}</Text></View>}
      </View>
      <View style={styles.tearLine}>
        <View style={styles.tearCircleLeft} />
        <View style={styles.tearDashes}>{Array.from({length: 22}, (_, i) => <View key={i} style={styles.tearDash} />)}</View>
        <View style={styles.tearCircleRight} />
      </View>
      <View style={styles.passBottom}>
        <View style={styles.passField}><Text style={styles.passLabel}>PASSENGER</Text><Text style={styles.passValue}>{pilgrimName || 'Your name'}</Text>{flight.bookingRef ? <Text style={styles.booking}>Booking ref · {flight.bookingRef}</Text> : null}</View>
        <View style={styles.ticketStub}><Ionicons name={type === 'outbound' ? 'compass-outline' : 'home-outline'} size={24} color={C.forest} /><Text style={styles.stubText}>{type === 'outbound' ? 'OUT' : 'BACK'}</Text></View>
      </View>
    </View>
  );
}

export default function FlightsTab() {
  const { itinerary } = useItinerary();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

  if (!itinerary) return null;

  const isUmrah = itinerary.tripType === 'umrah';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.screenTitle}>Your flights</Text>
          <Text style={styles.screenSubtitle}>
            {isUmrah ? 'Umrah' : 'Hajj'} · Your journey, there and back
          </Text>
        </View>

        <Animated.View style={{ opacity: fadeAnim, gap: 14 }}>
          <BoardingPassCard
            flight={itinerary.flights.outbound}
            type="outbound"
            prefix="outbound"
            pilgrimName={itinerary.pilgrim?.name || ''}
          />

          <BoardingPassCard
            flight={itinerary.flights.return}
            type="return"
            prefix="return"
            pilgrimName={itinerary.pilgrim?.name || ''}
          />
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 140, width: '100%', maxWidth: 640, alignSelf: 'center' },
  headerSection: { marginBottom: 25 },
  screenTitle: { ...TravelType.title },
  screenSubtitle: { fontFamily: QasdFonts.body, fontSize: 13, color: C.muted, marginTop: 5 },
  boardingPass: { backgroundColor: C.paper, borderRadius: 24, overflow: 'hidden' },
  ticketRibbon: { backgroundColor: C.forest, paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ribbonText: { color: C.paper, fontFamily: QasdFonts.bodySemiBold, fontSize: 9, letterSpacing: 1.3 },
  ticketBody: { padding: 20, paddingBottom: 10 },
  passHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20 },
  passTypeText: { fontFamily: QasdFonts.bodySemiBold, fontSize: 9, color: C.paperMuted, letterSpacing: 1.3 },
  airlineTagText: { fontFamily: QasdFonts.bodyMedium, fontSize: 12, color: C.ink },
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  routePoint: { flex: 1 },
  routeMiddle: { alignItems: 'center', marginHorizontal: 8 },
  routeLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  routeDash: { width: 10, height: 1, backgroundColor: '#9da58f' },
  directText: { fontFamily: QasdFonts.bodySemiBold, fontSize: 8, letterSpacing: 1, color: C.paperMuted, marginTop: 7 },
  cityCode: { fontFamily: QasdFonts.displayMedium, fontSize: 36, color: C.ink },
  cityName: { fontFamily: QasdFonts.body, fontSize: 11, color: C.paperMuted, lineHeight: 16 },
  detailsGrid: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#c9c9b8', paddingTop: 16, gap: 14 },
  detailCell: { flex: 1 },
  detailDivider: { width: 1, backgroundColor: '#c9c9b8' },
  detailLabel: { fontFamily: QasdFonts.bodySemiBold, fontSize: 9, color: C.paperMuted, letterSpacing: 1.1, marginBottom: 6 },
  detailValue: { fontFamily: QasdFonts.bodyMedium, fontSize: 14, color: C.ink },
  timeText: { fontFamily: QasdFonts.bodySemiBold, fontSize: 17, color: C.ink },
  timePlaceholder: { fontSize: 12, color: C.paperMuted, fontFamily: QasdFonts.body },
  timeBtn: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  flightNumbers: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  flightNumberText: { fontFamily: QasdFonts.bodySemiBold, color: C.forest, fontSize: 13 },
  stopoverPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 16 },
  stopoverText: { flex: 1, fontFamily: QasdFonts.bodyMedium, fontSize: 12, color: C.forest },
  tearLine: { flexDirection: 'row', alignItems: 'center', height: 28 },
  tearCircleLeft: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.background, marginLeft: -14 },
  tearCircleRight: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.background, marginRight: -14 },
  tearDashes: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 7 },
  tearDash: { width: 6, height: 1, backgroundColor: '#929b87' },
  passBottom: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 10, gap: 18 },
  passField: { flex: 1 },
  passLabel: { fontFamily: QasdFonts.bodySemiBold, fontSize: 9, color: C.paperMuted, letterSpacing: 1.2, marginBottom: 6 },
  passValue: { fontFamily: QasdFonts.bodyMedium, fontSize: 16, color: C.ink },
  booking: { fontFamily: QasdFonts.body, fontSize: 11, color: C.paperMuted, marginTop: 6 },
  ticketStub: { borderLeftWidth: 1, borderColor: '#c0c6b6', paddingLeft: 20, alignItems: 'center', gap: 6 },
  stubText: { fontFamily: QasdFonts.bodySemiBold, fontSize: 9, letterSpacing: 1, color: C.forest },
  pickerBackdrop: { flex: 1, backgroundColor: 'rgba(8,12,24,0.72)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: Palette.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: Palette.goldBorder,
  },
  pickerHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  pickerTitle: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 14,
    color: Palette.textPrimary,
    letterSpacing: 0.5,
  },
  pickerCancel: { fontFamily: QasdFonts.body, fontSize: 14, color: Palette.textSecondary },
  pickerDone: { fontFamily: QasdFonts.bodyBold, fontSize: 14, color: Palette.gold },
  pickerBody: { alignItems: 'center', paddingTop: 6 },
});
