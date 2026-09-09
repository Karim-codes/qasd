import { formatDateLabel } from '@/components/hajj-setup/date-time-field';
import { OnboardingShell } from '@/components/hajj-setup/onboarding-shell';
import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { useItinerary } from '@/context/itinerary-context';
import {
    routeLabel,
    routeMadinahFirst,
    routeVisitsMadinah,
    useUmrahSetup,
    type UmrahHotelStay,
} from '@/context/umrah-setup-context';
import { EMPTY_ITINERARY } from '@/lib/sample-data';
import type { Hotel, Itinerary } from '@/lib/types';
import { AppIcon as Ionicons } from '@/components/app-icon';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UmrahReviewScreen() {
  const router = useRouter();
  const { draft } = useUmrahSetup();
  const { setItinerary, setOriginalItinerary } = useItinerary();
  const [saving, setSaving] = useState(false);

  const visitsMadinah = routeVisitsMadinah(draft.route);
  const madinahFirst = routeMadinahFirst(draft.route);

  const confirm = async () => {
    setSaving(true);

    const arrivalCity = madinahFirst ? 'Madinah (MED)' : 'Jeddah (JED)';
    const returnDepartCity = !visitsMadinah
      ? 'Jeddah (JED)'
      : madinahFirst
        ? 'Jeddah (JED)'
        : 'Madinah (MED)';

    const makkahStay = hotelToStay(draft.makkahHotel, 'Makkah');
    const madinahStay = hotelToStay(draft.madinahHotel, 'Madinah');
    const emptyStay: Hotel = { name: '', city: '', checkIn: '', checkOut: '' };

    const itinerary: Itinerary = {
      ...EMPTY_ITINERARY,
      tripType: 'umrah',
      umrah: { route: draft.route },
      pilgrim: {
        name: draft.pilgrimName.trim(),
        packageName: 'Umrah',
        packageNumber: '',
        pilgrimType: 'Self-Organised',
      },
      guide: { name: '', phone: '' },
      camp: { name: '' },
      transportation: '',
      flights: {
        outbound: {
          ...EMPTY_ITINERARY.flights.outbound,
          departureCity: draft.flyingFrom.trim() || '',
          departureDate: draft.departureDate,
          arrivalDate: draft.departureDate,
          arrivalCity,
        },
        return: {
          ...EMPTY_ITINERARY.flights.return,
          departureCity: returnDepartCity,
          departureDate: draft.returnDate,
          arrivalDate: draft.returnDate,
          arrivalCity: draft.flyingFrom.trim() || '',
        },
      },
      hotels: {
        hotel1: madinahFirst && visitsMadinah ? madinahStay : makkahStay,
        hotel2: !visitsMadinah ? emptyStay : madinahFirst ? makkahStay : madinahStay,
      },
    };

    await setItinerary(itinerary);
    await setOriginalItinerary(itinerary);
    setSaving(false);
    router.replace('/umrah-setup/bismillah');
  };

  return (
    <OnboardingShell
      step={4}
      total={4}
      title={'Review &\nconfirm'}
      subtitle="Tap any section to edit. When it looks right, begin your Umrah."
      primaryLabel={saving ? 'Saving...' : 'Confirm & Begin'}
      primaryDisabled={saving}
      onPrimary={confirm}
    >
      <SummaryCard
        icon="navigate"
        title="Journey"
        onEdit={() => router.push('/umrah-setup/destination')}
        rows={[['Order', routeLabel(draft.route)]]}
      />

      <SummaryCard
        icon="calendar"
        title="Travel dates"
        onEdit={() => router.push('/umrah-setup/dates')}
        rows={[
          ['Depart', draft.departureDate ? formatDateLabel(draft.departureDate) : '—'],
          ['Return', draft.returnDate ? formatDateLabel(draft.returnDate) : '—'],
        ]}
      />

      <SummaryCard
        icon="person"
        title="Pilgrim"
        onEdit={() => router.push('/umrah-setup/details')}
        rows={[['Name', draft.pilgrimName || '—']]}
      />

      <SummaryCard
        icon="business"
        title="Makkah stay"
        onEdit={() => router.push('/umrah-setup/details')}
        rows={hotelRows(draft.makkahHotel)}
      />

      {visitsMadinah && (
        <SummaryCard
          icon="moon"
          title="Madinah stay"
          onEdit={() => router.push('/umrah-setup/details')}
          rows={hotelRows(draft.madinahHotel)}
        />
      )}
    </OnboardingShell>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────

function hotelToStay(h: UmrahHotelStay, city: string): Hotel {
  return { name: h.name.trim(), city, checkIn: h.checkIn, checkOut: h.checkOut };
}

function hotelRows(h: UmrahHotelStay): [string, string][] {
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
