import { formatDateLabel, formatTimeLabel } from '@/components/hajj-setup/date-time-field';
import { OnboardingShell } from '@/components/hajj-setup/onboarding-shell';
import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { useHajjSetup, type FlightLeg, type HotelStay } from '@/context/hajj-setup-context';
import { useItinerary } from '@/context/itinerary-context';
import { EMPTY_ITINERARY } from '@/lib/sample-data';
import type { Itinerary } from '@/lib/types';
import { AppIcon as Ionicons } from '@/components/app-icon';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HajjReviewScreen() {
  const router = useRouter();
  const { draft } = useHajjSetup();
  const { setItinerary, setOriginalItinerary } = useItinerary();
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    setSaving(true);
    const itinerary: Itinerary = {
      ...EMPTY_ITINERARY,
      tripType: 'hajj',
      pilgrim: {
        name: draft.pilgrimName.trim(),
        packageName: 'Hajj',
        packageNumber: '',
        pilgrimType: 'Self-Organised',
      },
      guide: { name: '', phone: '' },
      camp: { name: draft.campName.trim() },
      transportation: '',
      flights: {
        outbound: legToFlight(draft.outbound),
        return: legToFlight(draft.return),
      },
      hotels: {
        hotel1: hotelToStay(draft.makkahHotel, 'Makkah'),
        hotel2: draft.visitMadinah
          ? hotelToStay(draft.madinahHotel, 'Madinah')
          : { name: '', city: '', checkIn: '', checkOut: '' },
      },
    };
    await setItinerary(itinerary);
    await setOriginalItinerary(itinerary);
    setSaving(false);
    router.replace('/hajj-setup/celebration');
  };

  return (
    <OnboardingShell
      step={7}
      total={7}
      title={'Review &\nconfirm'}
      subtitle="Tap any section to edit. When everything looks right, save your trip."
      primaryLabel={saving ? 'Saving...' : 'Confirm & Save'}
      primaryDisabled={saving}
      onPrimary={confirm}
    >
      <SummaryCard
        icon="person"
        title="Pilgrim"
        onEdit={() => router.push('/hajj-setup/name')}
        rows={[['Name', draft.pilgrimName || '—']]}
      />

      <SummaryCard
        icon="airplane"
        title="Outbound flight"
        onEdit={() => router.push('/hajj-setup/flight-outbound')}
        rows={flightRows(draft.outbound)}
      />

      <SummaryCard
        icon="airplane-outline"
        title="Return flight"
        onEdit={() => router.push('/hajj-setup/flight-return')}
        rows={flightRows(draft.return)}
      />

      <SummaryCard
        icon="business"
        title="Makkah stay"
        onEdit={() => router.push('/hajj-setup/hotel-makkah')}
        rows={hotelRows(draft.makkahHotel)}
      />

      <SummaryCard
        icon="moon"
        title="Madinah stay"
        onEdit={() => router.push('/hajj-setup/hotel-madinah')}
        rows={
          draft.visitMadinah
            ? hotelRows(draft.madinahHotel)
            : [['Visiting', 'Not this trip']]
        }
      />

      <SummaryCard
        icon="bonfire"
        title="Mina camp"
        onEdit={() => router.push('/hajj-setup/camp')}
        rows={[['Camp', draft.campName || 'Not specified']]}
      />
    </OnboardingShell>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────

function legToFlight(leg: FlightLeg) {
  return {
    airline: leg.airline.trim(),
    flightNumbers: leg.flightNumber
      .split(/[\s,/]+/)
      .map((x) => x.trim())
      .filter(Boolean),
    departureCity: leg.departureCity.trim(),
    departureDate: leg.departureDate,
    departureTime: leg.departureTime,
    arrivalCity: leg.arrivalCity.trim(),
    arrivalDate: leg.arrivalDate,
    arrivalTime: leg.arrivalTime,
    arrivalAirport: '',
    stopoverCity: leg.hasLayover ? leg.layoverCity.trim() : '',
    layoverDuration: leg.hasLayover ? leg.layoverDuration.trim() : '',
    bookingRef: leg.bookingRef.trim(),
  };
}

function hotelToStay(h: HotelStay, city: string) {
  return {
    name: h.name.trim(),
    city,
    checkIn: h.checkIn,
    checkOut: h.checkOut,
  };
}

function flightRows(leg: FlightLeg): [string, string][] {
  const rows: [string, string][] = [
    ['Airline', leg.airline || '—'],
    ['Flight', leg.flightNumber || '—'],
    [
      'Depart',
      leg.departureCity
        ? `${leg.departureCity}${leg.departureDate ? ` · ${formatDateLabel(leg.departureDate)}` : ''}${leg.departureTime ? ` · ${formatTimeLabel(leg.departureTime)}` : ''}`
        : '—',
    ],
    [
      'Arrive',
      leg.arrivalCity
        ? `${leg.arrivalCity}${leg.arrivalDate ? ` · ${formatDateLabel(leg.arrivalDate)}` : ''}${leg.arrivalTime ? ` · ${formatTimeLabel(leg.arrivalTime)}` : ''}`
        : '—',
    ],
  ];
  if (leg.hasLayover) {
    rows.push([
      'Layover',
      `${leg.layoverCity || '—'}${leg.layoverDuration ? ` · ${leg.layoverDuration}` : ''}`,
    ]);
  }
  return rows;
}

function hotelRows(h: HotelStay): [string, string][] {
  return [
    ['Place', h.name || '—'],
    ['Check-in', h.checkIn ? formatDateLabel(h.checkIn) : '—'],
    ['Check-out', h.checkOut ? formatDateLabel(h.checkOut) : '—'],
  ];
}

// ─── UI ───────────────────────────────────────────────────────────────────

function SummaryCard({
  icon,
  title,
  rows,
  onEdit,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  rows: [string, string][];
  onEdit: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onEdit} style={s.card}>
      <View style={s.cardHead}>
        <View style={s.iconBubble}>
          <Ionicons name={icon} size={16} color={Palette.gold} />
        </View>
        <Text style={s.cardTitle}>{title}</Text>
        <View style={s.editPill}>
          <Ionicons name="pencil" size={12} color={Palette.gold} />
          <Text style={s.editText}>Edit</Text>
        </View>
      </View>
      <View style={s.rows}>
        {rows.map(([k, v]) => (
          <View key={k} style={s.row}>
            <Text style={s.rowKey}>{k}</Text>
            <Text style={s.rowVal} numberOfLines={2}>
              {v}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Palette.cardBg,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  iconBubble: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: Palette.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    flex: 1,
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 14,
    color: Palette.textPrimary,
    letterSpacing: 0.3,
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Palette.goldMuted,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  editText: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 10,
    color: Palette.gold,
    letterSpacing: 0.8,
  },
  rows: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  rowKey: {
    width: 90,
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 11,
    color: Palette.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingTop: 2,
  },
  rowVal: {
    flex: 1,
    fontFamily: QasdFonts.body,
    fontSize: 13,
    color: Palette.textPrimary,
    lineHeight: 18,
  },
});
