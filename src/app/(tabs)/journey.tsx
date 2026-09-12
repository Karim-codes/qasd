import { AppIcon } from '@/components/app-icon';
import { LocalSaveStatus } from '@/components/local-save-status';
import { QasdFonts } from '@/constants/qasd-theme';
import { TravelColors as C, TravelType as T } from '@/constants/travel-design';
import { useItinerary } from '@/context/itinerary-context';
import { useGuideProgress, useJourneyProgress, usePreparationChecklist } from '@/hooks/use-local-progress';
import { useNow } from '@/hooks/use-now';
import { formatDateShort } from '@/lib/date-helpers';
import { buildSteps, getNextJourneyStep, type Step, type Phase } from '@/lib/journey';
import { getNextJourneyAction } from '@/lib/home-action';
import * as Haptics from 'expo-haptics';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const phaseNames: Record<string, string> = {
  'travel-out': 'On your way', makkah: 'Makkah', madinah: 'Madinah', hajj: 'The days of Hajj', return: 'Homeward',
};
const phaseIcons: Record<string, keyof typeof AppIcon.glyphMap> = {
  'travel-out': 'airplane-outline', makkah: 'compass-outline', madinah: 'moon-outline', hajj: 'map-outline', return: 'home-outline',
};
function destination(step: Step): { route: Href; label: string } | null {
  if (step.id.startsWith('hotel-')) return { route: '/stays', label: 'View your stay' };
  if (step.id === 'umrah-rites') return { route: '/umrah-guide', label: 'Open Umrah guide' };
  if (['tarwiyah', 'arafah', 'muzdalifah', 'eid', 'tashreeq', 'wada'].includes(step.id)) return { route: '/hajj-guide', label: 'Open Hajj guide' };
  if (['depart-home', 'arrive-saudi', 'depart-saudi', 'arrive-home', 'layover-out', 'layover-ret'].includes(step.id)) return { route: '/(tabs)/flights', label: 'View flight details' };
  if (step.id.startsWith('travel-')) return { route: '/stays', label: 'View your next stay' };
  return null;
}

function JourneyStop({ step, completed, isNext, disabled, onToggle, last }: {
  step: Step; completed: boolean; isNext: boolean; disabled: boolean; onToggle: () => void; last: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const target = destination(step);
  return <View style={[s.stop, !last && s.stopBorder, isNext && s.nextStop]}>
    <View style={s.stopRow}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Details for ${step.title}`} accessibilityState={{ expanded }} onPress={() => setExpanded(value => !value)} activeOpacity={0.75} style={s.stopMain}>
        <View style={[s.stopIcon, isNext && s.nextIcon]}><AppIcon name={step.icon} size={22} color={isNext ? C.paper : '#d5c7aa'} /></View>
        <View style={s.flex}>
          <Text style={[s.stopTitle, isNext && { color: C.paper }]}>{step.title}</Text>
          <Text style={s.stopSubtitle}>{step.subtitle}</Text>
          {(completed || isNext || step.date) && <Text style={[s.stopMeta, isNext && { color: '#d6c69d' }]}>{completed ? 'Completed' : isNext ? 'Up next' : step.date}</Text>}
        </View>
        <AppIcon name={expanded ? 'chevron-up' : 'chevron-down'} size={15} color={C.muted} />
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="checkbox" accessibilityLabel={`${step.title}: ${completed ? 'undo completion' : 'mark complete'}`} accessibilityState={{ checked: completed, disabled }} disabled={disabled} onPress={onToggle} style={s.checkTouch}>
        <View style={[s.check, completed && s.checked]}>{completed && <AppIcon name="checkmark" size={15} color={C.paper} />}</View>
      </TouchableOpacity>
    </View>
    {expanded && <View style={s.details}>
      {step.details.map((detail, index) => <View key={`${detail.label}-${index}`} style={s.detailRow}>
        <Text style={s.detailLabel}>{detail.label}</Text><Text style={s.detailValue}>{detail.value}</Text>
      </View>)}
      {target && <TouchableOpacity accessibilityRole="button" onPress={() => router.push(target.route)} style={s.detailAction}>
        <Text style={s.detailActionText}>{target.label}</Text><AppIcon name="arrow-forward" size={18} color={C.gold} />
      </TouchableOpacity>}
    </View>}
  </View>;
}

export default function JourneyTab() {
  const { itinerary, trip } = useItinerary();
  const progress = useJourneyProgress();
  const guide = useGuideProgress();
  const checklist = usePreparationChecklist();
  const router = useRouter();
  const [selected, setSelected] = useState('all');
  const now = new Date(useNow());
  if (!itinerary || !trip) return null;
  const { tripType, phases } = buildSteps(itinerary, now);
  const steps = phases.flatMap(phase => phase.steps);
  const done = steps.filter(step => progress.value[step.id]).length;
  const next = getNextJourneyStep(steps, progress.value);
  const action = getNextJourneyAction(trip, { journeyCompleted: progress.value, guide: guide.value, checklist: checklist.value }, now);
  const actionReady = progress.ready && guide.ready && checklist.ready;
  const finished = progress.ready && done === steps.length;
  const cities = phases.filter(phase => phase.id === 'makkah' || phase.id === 'madinah');
  const visible = selected === 'all' ? phases : phases.filter(phase => phase.id === selected);
  const name = itinerary.pilgrim.name.trim().split(/\s+/)[0];
  const toggle = (id: string) => {
    void progress.update(previous => ({ ...previous, [id]: !previous[id] }));
    void Haptics.selectionAsync().catch(() => {});
  };

  return <SafeAreaView style={s.container} edges={['top']}>
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.headingRow}>
        <View style={s.flex}><Text style={T.eyebrow}>{tripType === 'umrah' ? 'YOUR UMRAH' : 'YOUR HAJJ'}</Text><Text style={[T.title, { marginTop: 8 }]}>The journey</Text></View>
        <View style={s.headingIcon}><AppIcon name="map-outline" size={25} color={C.gold} /></View>
      </View>
      <Text style={[T.body, { marginTop: 7, marginBottom: 24 }]}>{name ? `${name}, every step in one place.` : 'Every step in one place.'}</Text>

      <View style={s.tripCard}>
        <View style={s.between}><Text style={s.paperEyebrow}>{finished ? 'ALHAMDULILLAH' : 'YOUR ROUTE'}</Text><AppIcon name={finished ? 'checkmark-circle-outline' : 'compass-outline'} size={23} color={C.paperMuted} /></View>
        <View style={s.route}>{cities.map((phase, index) => <View key={phase.id} style={s.routeCity}>
          {index > 0 && <AppIcon name="arrow-forward" size={19} color="#8b7955" style={{ marginHorizontal: 10 }} />}
          <Text style={s.routeTitle}>{phaseNames[phase.id]}</Text>
        </View>)}</View>
        <Text style={s.paperMeta}>{formatDateShort(itinerary.flights.outbound.departureDate)} — {formatDateShort(itinerary.flights.return.arrivalDate)}</Text>
        <View style={s.paperDivider} />
        <View style={s.between}><Text style={s.progressLabel}>{finished ? 'Your journey, remembered.' : 'A little closer with every step.'}</Text><Text style={s.progressCount}>{progress.ready ? `${done}/${steps.length}` : '—'}</Text></View>
        <View style={s.progressTrack}><View style={[s.progressFill, { width: `${progress.ready ? done / Math.max(1, steps.length) * 100 : 0}%` }]} /></View>
        {actionReady && <TouchableOpacity accessibilityRole="button" onPress={() => router.push(action.step ? { pathname: '/umrah-guide', params: { step: action.step } } : action.route)} style={s.nextAction}>
          <View style={s.flex}><Text style={s.nextActionLabel}>{action.eyebrow.toUpperCase()}</Text><Text style={s.nextActionTitle}>{action.title}</Text></View><AppIcon name="arrow-forward" size={20} color={C.paper} />
        </TouchableOpacity>}
      </View>
      {(progress.error || !progress.ready || progress.saving) && <LocalSaveStatus record={progress} />}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
        {[{ id: 'all', label: 'Whole trip' }, ...phases.map(phase => ({ id: phase.id, label: phaseNames[phase.id] ?? phase.label }))].map(filter => <TouchableOpacity key={filter.id} accessibilityRole="button" accessibilityState={{ selected: selected === filter.id }} onPress={() => setSelected(filter.id)} style={[s.filter, selected === filter.id && s.filterSelected]}>
          <Text style={[s.filterText, selected === filter.id && s.filterTextSelected]}>{filter.label}</Text>
        </TouchableOpacity>)}
      </ScrollView>
      {visible.map((phase: Phase) => {
        const count = phase.steps.filter(step => progress.value[step.id]).length;
        return <View key={phase.id} style={s.phase}>
          <View style={s.phaseHeading}>
            <View style={s.phaseNumber}><AppIcon name={phaseIcons[phase.id] ?? 'location-outline'} size={19} color="#c8b78f" /></View>
            <View style={s.flex}><Text style={T.section}>{phaseNames[phase.id] ?? phase.label}</Text><Text style={T.label}>{phase.steps.length} stops{phase.id === 'makkah' ? ' · Umrah' : phase.id === 'madinah' ? ' · Ziyarah' : ''}</Text></View>
            <Text style={s.phaseCount}>{count}/{phase.steps.length}</Text>
          </View>
          <View style={s.stops}>{phase.steps.map((step, index) => <JourneyStop key={step.id} step={step} completed={!!progress.value[step.id]} isNext={next?.id === step.id && progress.ready} disabled={!progress.ready} onToggle={() => toggle(step.id)} last={index === phase.steps.length - 1} />)}</View>
        </View>;
      })}
      {progress.ready && !progress.error && !progress.saving && <View style={s.footer}><AppIcon name="checkmark-circle-outline" size={15} color={C.muted} /><Text style={T.label}>Your progress is saved on this device</Text></View>}
    </ScrollView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 120, width: '100%', maxWidth: 640, alignSelf: 'center' },
  flex: { flex: 1, minWidth: 0 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headingIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.line },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  tripCard: { backgroundColor: C.paper, borderRadius: 22, padding: 22 },
  paperEyebrow: { ...T.eyebrow, color: C.paperMuted, flex: 1 },
  route: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 12, marginBottom: 6 },
  routeCity: { flexDirection: 'row', alignItems: 'center' },
  routeTitle: { ...T.section, fontSize: 32, lineHeight: 38, color: C.ink },
  paperMeta: { ...T.label, color: C.paperMuted, fontSize: 13 },
  paperDivider: { height: 1, backgroundColor: '#d2cbbb', marginVertical: 20 },
  progressLabel: { ...T.body, fontSize: 14, color: C.paperMuted, flex: 1 },
  progressCount: { fontFamily: QasdFonts.bodySemiBold, fontSize: 14, color: C.ink },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: '#d4cebf', marginTop: 12, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: C.forest, borderRadius: 2 },
  nextAction: { marginTop: 20, padding: 16, borderRadius: 12, backgroundColor: C.forest, flexDirection: 'row', alignItems: 'center', gap: 14 },
  nextActionLabel: { ...T.eyebrow, fontSize: 9, color: '#c8cbb6', marginBottom: 4 },
  nextActionTitle: { fontFamily: QasdFonts.bodyMedium, fontSize: 15, lineHeight: 21, color: C.paper },
  filters: { gap: 8, paddingVertical: 26 },
  filter: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 22, borderWidth: 1, borderColor: C.line },
  filterSelected: { backgroundColor: C.paper, borderColor: C.paper },
  filterText: { fontFamily: QasdFonts.bodyMedium, fontSize: 13, color: C.muted },
  filterTextSelected: { color: C.ink },
  phase: { marginBottom: 28 },
  phaseHeading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  phaseNumber: { width: 38, height: 38, borderRadius: 14, backgroundColor: C.iconSurface, justifyContent: 'center', alignItems: 'center' },
  phaseCount: { ...T.label, color: '#c8b78f' },
  stops: { borderRadius: 20, overflow: 'hidden', backgroundColor: C.surface },
  stop: { padding: 16 },
  stopBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  nextStop: { backgroundColor: '#25372f' },
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stopMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64 },
  stopIcon: { width: 40, height: 46, borderRadius: 12, backgroundColor: C.iconSurface, alignItems: 'center', justifyContent: 'center' },
  nextIcon: { backgroundColor: '#34483b' },
  stopTitle: { fontFamily: QasdFonts.bodyMedium, fontSize: 15, color: C.cream, lineHeight: 21 },
  stopSubtitle: { ...T.label, marginTop: 4 },
  stopMeta: { ...T.label, fontSize: 11, marginTop: 6, color: '#c0b59f' },
  checkTouch: { minWidth: 40, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  check: { width: 23, height: 23, borderRadius: 12, borderWidth: 1, borderColor: '#778477' },
  checked: { backgroundColor: '#42614e', borderColor: '#42614e', alignItems: 'center', justifyContent: 'center' },
  details: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#3b454a', gap: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  detailLabel: { ...T.label, width: 70 },
  detailValue: { ...T.body, color: C.cream, fontSize: 14, flex: 1 },
  detailAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, gap: 12 },
  detailActionText: { fontFamily: QasdFonts.bodyMedium, color: C.gold, fontSize: 14 },
  footer: { flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center', paddingTop: 4 },
});
