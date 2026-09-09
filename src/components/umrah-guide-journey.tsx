import { AppIcon } from '@/components/app-icon';
import { RitualIcon } from '@/components/ritual-glyph';
import { TravelColors as C, TravelType as T } from '@/constants/travel-design';
import { QasdFonts as F } from '@/constants/qasd-theme';
import { useGuideProgress } from '@/hooks/use-local-progress';
import { UMRAH_STEPS, type UmrahStep } from '@/lib/umrah-steps';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const chapters = [
  { title: 'A sacred beginning', place: 'Ihram & arrival', subtitle: 'Prepare your intention. Enter with peace.', icon: 'mosque' as const, indices: [0, 1, 2] },
  { title: 'Around the Ka’bah', place: 'Tawaf', subtitle: 'Seven circuits, one place of devotion.', icon: 'kaaba' as const, indices: [3, 4, 5, 6, 7] },
  { title: 'Between two hills', place: 'Sa’i', subtitle: 'From Safa to Marwa, one lap at a time.', icon: 'walk-outline' as const, indices: [8, 9] },
  { title: 'A beautiful completion', place: 'Halq & Taqsir', subtitle: 'The final steps of your Umrah.', icon: 'cut-outline' as const, indices: [10, 11] },
];

// All chapters share one continuous path; these coordinates describe ritual order.
const chapterFor = (index: number) => chapters.findIndex(c => c.indices.includes(index));
const routeY = (index: number) => 160 + index * 148 + chapterFor(index) * 100;
const routeChapterY = (chapter: number) => routeY(chapters[chapter].indices[0]) - 124;

function RitualRoute({ activeIdx, completed, onStep }: {
  activeIdx: number; completed: Record<string, boolean>; onStep: (step: UmrahStep, index: number) => void;
}) {
  const [width, setWidth] = useState(300);
  const points = UMRAH_STEPS.map((_, index) => ({ x: width * (index % 2 === 0 ? 0.23 : 0.77), y: routeY(index) }));
  return <View style={r.canvas} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    <View pointerEvents="none" style={{ height: routeY(11) + 140 }}>
      {points.slice(0, -1).flatMap((from, i) => {
        const to = points[i + 1];
        const position = (t: number) => ({ x: from.x + (to.x - from.x) * (t * t * (3 - 2 * t)), y: from.y + (to.y - from.y) * t });
        const finished = completed[UMRAH_STEPS[i].id] && completed[UMRAH_STEPS[i + 1].id];
        return Array.from({ length: 24 }, (_, segment) => {
          const a = position(segment / 24), b = position((segment + 1) / 24);
          const length = Math.hypot(b.x - a.x, b.y - a.y);
          const angle = Math.atan2(b.y - a.y, b.x - a.x);
          return <View key={`${i}-${segment}`} style={{ position: 'absolute', left: (a.x + b.x) / 2 - length / 2 - 6, top: (a.y + b.y) / 2 - 6, width: length + 12, height: 12, borderRadius: 6, backgroundColor: finished ? '#738a6b' : '#b6c2a8', transform: [{ rotate: `${angle}rad` }] }}><View style={{ position: 'absolute', left: length / 2 + 4, top: 5, width: 4, height: 2, borderRadius: 1, backgroundColor: '#edf0e6' }} /></View>;
        });
      })}
      {chapters.map((chapter, i) => <View key={chapter.place} style={[r.chapter, { top: routeChapterY(i) }]}>
        <View style={r.chapterGlyph}><RitualIcon name={chapter.icon} size={36} color={C.forest} /></View>
        <View style={{ flex: 1 }}><Text style={r.eyebrow}>CHAPTER 0{i + 1}</Text><Text style={r.chapterTitle}>{chapter.place}</Text></View>
      </View>)}
      <Text style={[r.mapNote, { top: routeY(11) + 93 }]}>Ritual route · Not a navigation map</Text>
    </View>
    {points.map((point, i) => {
      const step = UMRAH_STEPS[i];
      const done = !!completed[step.id];
      const selected = i === activeIdx;
      const left = i % 2 === 0;
      return <View key={step.id} style={{ position: 'absolute', top: point.y - 30, left: 0, right: 0 }}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Step ${i + 1}: ${step.title}${done ? ', completed' : ''}`} onPress={() => onStep(step, i)} style={[r.stop, { left: point.x - 29 }, done && r.stopDone, selected && r.stopSelected]}>
          {done ? <AppIcon name="checkmark" size={24} color={C.paper} /> : <Text style={r.stopNumber}>{String(i + 1).padStart(2, '0')}</Text>}
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Read ${step.title}`} onPress={() => onStep(step, i)} style={[r.stopLabel, { left: left ? width * 0.44 : 14, width: width * 0.49 - 14 }]}>
          <Text style={r.eyebrow}>{selected ? 'LAST OPENED' : done ? 'COMPLETED' : `STOP ${String(i + 1).padStart(2, '0')}`}</Text>
          <Text style={r.stopTitle}>{step.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Text style={r.openText}>{step.laps ? 'Open counter' : 'Explore step'}</Text><AppIcon name="arrow-forward" size={13} color={C.forest} /></View>
        </TouchableOpacity>
      </View>;
    })}
  </View>;
}

const r = StyleSheet.create({
  canvas: { backgroundColor: '#dce3d3', borderRadius: 26, overflow: 'hidden' },
  chapter: { position: 'absolute', left: 18, right: 18, flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#dce3d3', paddingVertical: 8 },
  chapterGlyph: { width: 56, height: 56, backgroundColor: '#cad5be', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontFamily: F.bodySemiBold, fontSize: 9, letterSpacing: 1.1, color: '#56644d' },
  chapterTitle: { fontFamily: F.displayMedium, fontSize: 28, color: C.ink, marginTop: 4 },
  stop: { position: 'absolute', width: 58, height: 58, borderRadius: 29, backgroundColor: C.paper, borderWidth: 4, borderColor: '#b6c2a8', alignItems: 'center', justifyContent: 'center' },
  stopDone: { backgroundColor: C.forest, borderColor: '#738a6b' },
  stopSelected: { borderColor: '#ad8930', borderWidth: 4 },
  stopNumber: { fontFamily: F.bodySemiBold, fontSize: 17, color: C.ink },
  stopLabel: { position: 'absolute', minHeight: 70, paddingVertical: 2, backgroundColor: '#dce3d3', borderRadius: 10 },
  stopTitle: { fontFamily: F.displayMedium, fontSize: 24, lineHeight: 26, color: C.ink, marginTop: 4, marginBottom: 7 },
  openText: { fontFamily: F.bodyMedium, fontSize: 10, color: C.forest },
  mapNote: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: F.body, fontSize: 10, color: '#56644d' },
});

export function GuideJourney({ mode, activeIdx, onStep }: { mode: 'linear' | 'roadmap'; activeIdx: number; onStep: (step: UmrahStep, index: number) => void }) {
  const progress = useGuideProgress();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const [mapTop, setMapTop] = useState(0);
  const done = UMRAH_STEPS.filter(step => progress.value.completed[step.id]).length;
  const nextIdx = UMRAH_STEPS.findIndex(step => !progress.value.completed[step.id]);
  const resumeIdx = progress.value.lastStep ? activeIdx : Math.max(0, nextIdx);
  const stepRow = (index: number) => {
    const step = UMRAH_STEPS[index];
    const completed = !!progress.value.completed[step.id];
    const selected = index === activeIdx && !!progress.value.lastStep;
    return <TouchableOpacity key={step.id} accessibilityRole="button" accessibilityLabel={`${index + 1}. ${step.title}${completed ? ', completed' : ''}`} onPress={() => onStep(step, index)} style={[s.step, selected && s.selected]} activeOpacity={0.75}>
      <View style={[s.number, completed && s.numberDone]}>{completed ? <AppIcon name="checkmark" size={18} color={C.paper} /> : <Text style={s.numberText}>{String(index + 1).padStart(2, '0')}</Text>}</View>
      <View style={{ flex: 1 }}>
        <Text style={s.stepTitle}>{step.title}</Text>
        <Text style={s.caption}>{completed ? 'Completed' : step.laps ? 'Guidance & lap counter' : step.dua ? 'Guidance & du’a' : step.phase}</Text>
      </View>
      <AppIcon name="chevron-forward" size={16} color={C.muted} />
    </TouchableOpacity>;
  };
  return <ScrollView ref={scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingTop: 8, paddingBottom: Math.max(24, insets.bottom) + 24 }}>
    {mode === 'linear' ? <View style={s.hero}>
      <View style={s.spread}><Text style={s.eyebrow}>YOUR UMRAH COMPANION</Text><RitualIcon name="kaaba" size={28} color={C.forest} /></View>
      <Text style={s.heroTitle}>{'Every step,\nwith intention.'}</Text>
      <Text style={s.heroBody}>{'Your rituals, du’as and counters.\nHere whenever you need them.'}</Text>
      <View style={s.progress}><View style={[s.fill, { width: `${done / UMRAH_STEPS.length * 100}%` }]} /></View>
      <View style={s.spread}><Text style={s.heroSmall}>{done} of {UMRAH_STEPS.length} steps completed</Text><Text style={s.heroSmall}>Available offline</Text></View>
      <TouchableOpacity accessibilityRole="button" style={s.resume} onPress={() => onStep(UMRAH_STEPS[resumeIdx], resumeIdx)}>
        <View style={{ flex: 1 }}><Text style={s.resumeSmall}>{done === UMRAH_STEPS.length ? 'REVISIT YOUR GUIDE' : progress.value.lastStep ? 'PICK UP WHERE YOU LEFT OFF' : 'BEGIN YOUR UMRAH'}</Text><Text style={s.resumeText}>{UMRAH_STEPS[resumeIdx].title}</Text></View>
        <AppIcon name="arrow-forward" color={C.paper} size={21} />
      </TouchableOpacity>
    </View> : <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Open ${UMRAH_STEPS[resumeIdx].title}`} onPress={() => onStep(UMRAH_STEPS[resumeIdx], resumeIdx)} style={s.routeResume}>
      <View style={s.routeResumeIcon}><AppIcon name="navigate-outline" size={23} color={C.forest} /></View>
      <View style={{ flex: 1 }}><Text style={s.eyebrow}>{done === UMRAH_STEPS.length ? 'YOUR JOURNEY, COMPLETED' : 'CONTINUE YOUR JOURNEY'}</Text><Text style={s.routeResumeTitle}>{UMRAH_STEPS[resumeIdx].title}</Text><Text style={s.heroSmall}>{done} / 12 steps completed · Available offline</Text></View>
      <AppIcon name="arrow-forward" size={20} color={C.forest} />
    </TouchableOpacity>}
    {mode === 'linear' ? <>
      <Text style={[T.section, { marginTop: 26 }]}>One step at a time</Text>
      <Text style={[T.body, { marginTop: 4, marginBottom: 22 }]}>Open any step for guidance. Go at your pace.</Text>
      {chapters.map((group, i) => <View key={group.place} style={{ marginBottom: 22 }}>
        <View style={s.groupHeading}><Text style={s.chapterNo}>0{i + 1}</Text><Text style={s.groupTitle}>{group.place}</Text><View style={s.rule} /><RitualIcon name={group.icon} size={22} color={C.gold} /></View>
        {group.indices.map(stepRow)}
      </View>)}
    </> : <>
      <View style={[s.spread, { marginTop: 24 }]}><Text style={T.section}>Your path through Umrah</Text></View>
      <Text style={[T.body, { marginTop: 4 }]}>Follow the path. Tap a stop to explore.</Text>
      <View style={s.chapterTabs}>{chapters.map((c, i) => <TouchableOpacity key={c.place} accessibilityRole="button" accessibilityLabel={`Jump to ${c.place}`} onPress={() => scroll.current?.scrollTo({ y: mapTop + routeChapterY(i), animated: true })} style={s.chapterTab}><RitualIcon name={c.icon} size={23} color={C.paper} /><Text style={s.tabText}>{['Arrival', 'Tawaf', 'Sa’i', 'Finish'][i]}</Text></TouchableOpacity>)}</View>
      <View onLayout={event => setMapTop(event.nativeEvent.layout.y)}>
        <RitualRoute activeIdx={activeIdx} completed={progress.value.completed} onStep={onStep} />
      </View>
    </>}
    <Text style={s.blessing}>May Allah accept every step of your Umrah.</Text>
  </ScrollView>;
}

const s = StyleSheet.create({
  routeResume: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 21, backgroundColor: C.paper },
  routeResumeIcon: { width: 42, height: 48, borderRadius: 15, backgroundColor: '#dbe0d1', alignItems: 'center', justifyContent: 'center' },
  routeResumeTitle: { fontFamily: F.displayMedium, fontSize: 25, color: C.ink, marginVertical: 4 },
  hero: { backgroundColor: C.paper, padding: 22, borderRadius: 26 },
  spread: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  eyebrow: { fontFamily: F.bodySemiBold, fontSize: 10, letterSpacing: 1.5, color: C.paperMuted },
  heroTitle: { fontFamily: F.displayMedium, fontSize: 42, lineHeight: 43, color: C.ink, marginTop: 14 },
  heroBody: { fontFamily: F.body, fontSize: 14, lineHeight: 21, color: C.paperMuted, marginTop: 10 },
  heroSmall: { fontFamily: F.body, fontSize: 10, color: C.paperMuted },
  progress: { height: 4, backgroundColor: '#d5cebf', borderRadius: 4, overflow: 'hidden', marginTop: 22, marginBottom: 8 },
  fill: { height: 4, backgroundColor: C.forest },
  resume: { backgroundColor: C.forest, borderRadius: 17, padding: 15, marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  resumeSmall: { fontFamily: F.bodyMedium, fontSize: 9, letterSpacing: 1, color: '#c9d3c8' },
  resumeText: { fontFamily: F.bodyMedium, fontSize: 16, color: C.paper, marginTop: 5 },
  groupHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  chapterNo: { fontFamily: F.body, fontSize: 12, color: C.gold },
  groupTitle: { fontFamily: F.displayMedium, fontSize: 25, color: C.paper },
  rule: { flex: 1, height: 1, backgroundColor: C.line },
  step: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: C.surface, borderRadius: 19, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: C.line },
  selected: { borderColor: '#7f927e' },
  number: { width: 38, height: 42, borderRadius: 13, backgroundColor: C.iconSurface, justifyContent: 'center', alignItems: 'center' },
  numberDone: { backgroundColor: C.forest },
  numberText: { fontFamily: F.bodyMedium, fontSize: 12, color: C.gold },
  stepTitle: { fontFamily: F.bodyMedium, fontSize: 16, color: C.cream },
  caption: { fontFamily: F.body, fontSize: 12, color: C.muted, marginTop: 4 },
  chapterTabs: { flexDirection: 'row', gap: 8, marginVertical: 20 },
  chapterTab: { flex: 1, alignItems: 'center', gap: 7, paddingVertical: 14, backgroundColor: C.surface, borderRadius: 18 },
  tabText: { fontFamily: F.bodyMedium, fontSize: 11, color: C.muted },
  blessing: { fontFamily: F.displayMedium, fontSize: 22, textAlign: 'center', color: C.muted, lineHeight: 28, marginTop: 30 },
});
