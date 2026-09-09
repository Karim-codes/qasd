import { OnboardingShell } from '@/components/hajj-setup/onboarding-shell';
import { Palette, QasdFonts } from '@/constants/qasd-theme';
import {
    UMRAH_ROUTE_OPTIONS,
    routeMadinahFirst,
    routeVisitsMadinah,
    useUmrahSetup,
} from '@/context/umrah-setup-context';
import type { UmrahRoute } from '@/lib/types';
import { AppIcon as Ionicons } from '@/components/app-icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function UmrahDestinationScreen() {
  const router = useRouter();
  const { draft, update } = useUmrahSetup();
  const [pickerOpen, setPickerOpen] = useState(false);

  const madinahFirst = routeMadinahFirst(draft.route);
  const visitsMadinah = routeVisitsMadinah(draft.route);

  const firstCity = madinahFirst
    ? { name: 'Madinah', icon: 'moon' as const, note: 'Al-Masjid an-Nabawi' }
    : { name: 'Makkah', icon: 'compass-outline' as const, note: 'Al-Masjid al-Haram · Umrah' };
  const secondCity = madinahFirst ? 'Makkah' : 'Madinah';

  const selectedLabel =
    UMRAH_ROUTE_OPTIONS.find((o) => o.value === draft.route)?.label ?? '';

  return (
    <OnboardingShell
      step={1}
      total={4}
      hideBack
      onBack={() => router.replace('/choose-trip')}
      title={'Where to\nfirst?'}
      subtitle="Umrah is performed in Makkah. Pick the order you'll visit the holy cities — you can change it anytime."
      primaryLabel="Continue"
      onPrimary={() => router.push('/umrah-setup/dates')}
    >
      {/* Featured destination */}
      <LinearGradient
        colors={['#eee7d8', '#eee7d8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.hero}
      >
        <View style={s.heroIcon}>
          <Ionicons name={firstCity.icon} size={28} color="#766447" />
        </View>
        <Text style={s.heroEyebrow}>YOU&apos;LL ARRIVE IN</Text>
        <Text style={s.heroCity}>{firstCity.name}</Text>
        <Text style={s.heroNote}>{firstCity.note}</Text>

        {visitsMadinah && (
          <View style={s.thenRow}>
            <Ionicons name="arrow-forward" size={13} color={Palette.textSecondary} />
            <Text style={s.thenText}>then {secondCity}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Journey dropdown */}
      <Text style={s.fieldLabel}>JOURNEY ORDER</Text>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setPickerOpen(true)}
        style={s.dropdown}
      >
        <View style={{ flex: 1 }}>
          <Text style={s.dropdownValue}>{selectedLabel}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={Palette.gold} />
      </TouchableOpacity>

      {/* Flying from — optional */}
      <Text style={[s.fieldLabel, { marginTop: 20 }]}>FLYING FROM (OPTIONAL)</Text>
      <View style={s.inputWrap}>
        <Ionicons name="airplane-outline" size={16} color={Palette.textMuted} />
        <TextInput
          style={s.textInput}
          value={draft.flyingFrom}
          onChangeText={(v: string) => update({ flyingFrom: v })}
          placeholder="e.g. London (LHR)"
          placeholderTextColor={Palette.textMuted}
        />
      </View>

      <RoutePicker
        visible={pickerOpen}
        selected={draft.route}
        onClose={() => setPickerOpen(false)}
        onSelect={(route) => {
          update({ route });
          setPickerOpen(false);
        }}
      />
    </OnboardingShell>
  );
}

function RoutePicker({
  visible,
  selected,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selected: UmrahRoute;
  onClose: () => void;
  onSelect: (route: UmrahRoute) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>Choose your journey</Text>

          {UMRAH_ROUTE_OPTIONS.map((opt) => {
            const active = opt.value === selected;
            return (
              <TouchableOpacity
                key={opt.value}
                activeOpacity={0.85}
                onPress={() => onSelect(opt.value)}
                style={[s.option, active && s.optionActive]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[s.optionLabel, active && { color: Palette.green }]}>
                    {opt.label}
                  </Text>
                  <Text style={s.optionSub}>{opt.sub}</Text>
                </View>
                <Ionicons
                  name={active ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={active ? Palette.green : Palette.textMuted}
                />
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  hero: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#eee7d8',
    marginBottom: 22,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#ded5c1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroEyebrow: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.8,
    color: '#766447',
  },
  heroCity: {
    fontFamily: QasdFonts.displayMedium,
    fontSize: 40,
    color: '#202b2a',
    lineHeight: 46,
    marginTop: 2,
  },
  heroNote: {
    fontFamily: QasdFonts.body,
    fontSize: 13,
    color: '#655f52',
    marginTop: 2,
  },
  thenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  thenText: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 13,
    color: '#655f52',
  },
  fieldLabel: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Palette.textSecondary,
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.cardBgLight,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  dropdownValue: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8,12,24,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Palette.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 34,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: Palette.border,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.textMuted,
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 15,
    color: Palette.textPrimary,
    marginBottom: 12,
    marginLeft: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.cardBgLight,
  },
  optionActive: {
    borderColor: 'rgba(46,204,135,0.5)',
    backgroundColor: 'rgba(46,204,135,0.08)',
  },
  optionLabel: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  optionSub: {
    fontFamily: QasdFonts.body,
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.cardBgLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: QasdFonts.body,
    fontSize: 15,
    color: Palette.textPrimary,
    padding: 0,
  },
});
