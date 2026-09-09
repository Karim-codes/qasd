import { DateField, formatDateLabel } from '@/components/hajj-setup/date-time-field';
import { OnboardingShell } from '@/components/hajj-setup/onboarding-shell';
import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { routeMadinahFirst, useUmrahSetup } from '@/context/umrah-setup-context';
import { daysBetween } from '@/lib/date-helpers';
import { AppIcon as Ionicons } from '@/components/app-icon';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function UmrahDatesScreen() {
  const router = useRouter();
  const { draft, update } = useUmrahSetup();

  const nights = daysBetween(draft.departureDate, draft.returnDate);
  const validOrder = nights === null || nights >= 0;
  const canContinue =
    draft.departureDate.length > 0 && draft.returnDate.length > 0 && (nights ?? 0) >= 0;

  const arrivalCity = routeMadinahFirst(draft.route) ? 'Madinah' : 'Makkah';

  const depDate = draft.departureDate
    ? new Date(
        Number(draft.departureDate.slice(0, 4)),
        Number(draft.departureDate.slice(5, 7)) - 1,
        Number(draft.departureDate.slice(8, 10))
      )
    : undefined;

  return (
    <OnboardingShell
      step={2}
      total={4}
      title={'When are you\ntravelling?'}
      subtitle="Just your travel dates — we'll shape the rest of your itinerary around them."
      primaryLabel="Continue"
      primaryDisabled={!canContinue}
      onPrimary={() => router.push('/umrah-setup/details')}
    >
      <View style={s.card}>
        <View style={s.rowHead}>
          <View style={s.iconBubble}>
            <Ionicons name="airplane" size={16} color={Palette.gold} />
          </View>
          <View>
            <Text style={s.rowLabel}>DEPARTURE</Text>
            <Text style={s.rowHint}>The day you fly out to {arrivalCity}</Text>
          </View>
        </View>
        <DateField
          value={draft.departureDate}
          onChange={(v) => update({ departureDate: v })}
          placeholder="Choose your departure date"
          minimumDate={new Date()}
        />
      </View>

      <View style={s.connector}>
        <View style={s.connectorLine} />
        {nights !== null && validOrder && (
          <View style={s.nightsPill}>
            <Ionicons name="moon" size={12} color={Palette.gold} />
            <Text style={s.nightsText}>
              {nights} {nights === 1 ? 'night' : 'nights'}
            </Text>
          </View>
        )}
        <View style={s.connectorLine} />
      </View>

      <View style={s.card}>
        <View style={s.rowHead}>
          <View style={s.iconBubble}>
            <Ionicons name="home" size={16} color={Palette.gold} />
          </View>
          <View>
            <Text style={s.rowLabel}>RETURN</Text>
            <Text style={s.rowHint}>The day you fly back home</Text>
          </View>
        </View>
        <DateField
          value={draft.returnDate}
          onChange={(v) => update({ returnDate: v })}
          placeholder="Choose your return date"
          minimumDate={depDate}
        />
      </View>

      {!validOrder && (
        <Text style={s.warn}>Your return date is before you depart — please check.</Text>
      )}

      {canContinue && (
        <Text style={s.summary}>
          {formatDateLabel(draft.departureDate)} — {formatDateLabel(draft.returnDate)}
        </Text>
      )}
    </OnboardingShell>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Palette.cardBg,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconBubble: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Palette.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: Palette.textPrimary,
  },
  rowHint: {
    fontFamily: QasdFonts.body,
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 1,
  },
  connector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  connectorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Palette.border,
  },
  nightsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Palette.goldMuted,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  nightsText: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 12,
    color: Palette.gold,
  },
  warn: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 13,
    color: Palette.red,
    marginTop: 14,
    textAlign: 'center',
  },
  summary: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});
