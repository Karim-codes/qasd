import { useTabContentInset } from '@/hooks/use-tab-content-inset';
import { AppIcon } from '@/components/app-icon';
import { LocalSaveStatus } from '@/components/local-save-status';
import { PreparationRow } from '@/components/preparation-row';
import { RitualIcon } from '@/components/ritual-glyph';
import { Palette, QasdFonts as F } from '@/constants/qasd-theme';
import { useGuideProgress, useLearningProgress } from '@/hooks/use-local-progress';
import { UMRAH_STEPS } from '@/lib/umrah-steps';
import { learningResumeIndex, nextLearningIndex, learningTitle } from '@/lib/umrah-learning';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ExploreHome() {
  const contentInset = useTabContentInset();
  const router = useRouter();
  const learning = useLearningProgress();
  const ritual = useGuideProgress();
  const reviewed = UMRAH_STEPS.filter(step => learning.value.reviewed[step.id]).length;
  const next = nextLearningIndex(learning.value);
  const resume = learningResumeIndex(learning.value);
  const active = (['tawaf', 'sai'] as const)
    .map(id => ({ id, ...ritual.value.counters[id] }))
    .filter(counter => counter.count > 0 && counter.count < 7)
    .sort((a, b) => b.changedAt - a.changedAt)[0];
  const hasRitual = ritual.ready && !!active;
  const started = learning.ready && (reviewed > 0 || resume !== null);
  const openGuide = () => router.push({ pathname: '/(tabs)/guide', params: { mode: 'learn', step: started && next !== null ? UMRAH_STEPS[next].id : undefined } });

  return <SafeAreaView style={s.container} edges={['top']}>
    <ScrollView contentContainerStyle={[s.content, { paddingBottom: contentInset }]} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.brand}>Qasd</Text>
      </View>
      <Text style={s.welcome}>As-salamu alaykum</Text>
      <Text style={s.heading}>Prepare for your Umrah</Text>
      <Text style={s.intro}>Understand the journey, one step at a time. Start wherever you are.</Text>

      {hasRitual ? <View style={s.card}>
        <Text style={s.eyebrow}>YOUR SAVED COUNTER</Text>
        <Text style={s.cardTitle}>Continue {active.id === 'tawaf' ? 'Tawaf' : 'Sa’i'}</Text>
        <Text style={s.cardBody}>{active.count} of 7 {active.id === 'tawaf' ? 'rounds' : 'lengths'} saved on this device.</Text>
        <TouchableOpacity accessibilityRole="button" style={s.primary} onPress={() => router.push({ pathname: '/umrah-guide', params: { mode: 'perform', step: active.id === 'tawaf' ? 'tawaf-start' : 'sai-laps' } })}>
          <Text style={s.primaryText}>Continue counter</Text><AppIcon name="arrow-forward" size={21} color="#fffaf0" />
        </TouchableOpacity>
      </View> : <View style={s.card}>
        <View style={s.cardTop}><Text style={s.eyebrow}>LEARN AT YOUR OWN PACE</Text><RitualIcon name="kaaba" size={30} color="#263c36" /></View>
        <Text style={s.cardTitle}>{started ? 'A little more confidence.' : 'Understand your Umrah.'}</Text>
        <Text style={s.cardBody}>Clear guidance, du’as and a chance to practise before you travel.</Text>
        <View style={s.sequence}><Text style={s.sequenceText}>Ihram</Text><AppIcon name="chevron-forward" size={12} color="#716044" /><Text style={s.sequenceText}>Tawaf</Text><AppIcon name="chevron-forward" size={12} color="#716044" /><Text style={s.sequenceText}>Sa’i</Text><AppIcon name="chevron-forward" size={12} color="#716044" /><Text style={s.sequenceText}>Finish</Text></View>
        {started && <Text style={s.progress}>{reviewed} of {UMRAH_STEPS.length} topics reviewed{next === null ? '\nAll topics reviewed' : `\nNext unreviewed: ${learningTitle(UMRAH_STEPS[next])}`}</Text>}
        <TouchableOpacity accessibilityRole="button" onPress={openGuide} style={s.primary}>
          <Text style={s.primaryText}>{started ? next === null ? 'Revisit topics' : 'Continue learning' : 'Explore the Umrah guide'}</Text><AppIcon name="arrow-forward" size={21} color="#fffaf0" />
        </TouchableOpacity>
        {learning.ready && resume !== null && resume !== next && <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Resume reading: ${learningTitle(UMRAH_STEPS[resume])}`} onPress={() => router.push({ pathname: '/umrah-topic', params: { mode: 'learn', step: UMRAH_STEPS[resume].id } })} style={s.resume}>
          <View style={{ flex: 1 }}><Text style={s.resumeTitle}>Resume reading</Text><Text style={s.resumeTopic}>{learningTitle(UMRAH_STEPS[resume])}</Text></View><AppIcon name="arrow-forward" size={18} color="#263c36" />
        </TouchableOpacity>}
        <Text style={s.offline}>Available offline · No booking needed</Text>
      </View>}
      {(learning.error || learning.saving) && <LocalSaveStatus record={learning} />}
      {(ritual.error || ritual.saving) && <LocalSaveStatus record={ritual} />}

      <PreparationRow />

      <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/umrah-setup/destination')} style={s.plan}>
        <AppIcon name="airplane-outline" size={22} color={Palette.gold} />
        <View style={{ flex: 1, minWidth: 0 }}><Text style={s.planTitle}>Add a trip</Text><Text style={s.planBody}>Flights, stays and travel dates</Text></View>
        <AppIcon name="chevron-forward" size={18} color={Palette.textSecondary} />
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 120, maxWidth: 640, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 },
  brand: { fontFamily: F.displayMedium, fontSize: 34, color: Palette.textPrimary },
  welcome: { fontFamily: F.bodyMedium, fontSize: 14, color: Palette.textSecondary, marginBottom: 8 },
  heading: { fontFamily: F.bodySemiBold, fontSize: 28, lineHeight: 35, letterSpacing: -0.6, color: Palette.textPrimary },
  intro: { fontFamily: F.body, fontSize: 16, lineHeight: 24, color: Palette.textSecondary, marginTop: 8, marginBottom: 24 },
  card: { backgroundColor: '#eee7d8', borderRadius: 22, padding: 22 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'space-between' },
  eyebrow: { flexShrink: 1, fontFamily: F.bodySemiBold, fontSize: 11, letterSpacing: 1.1, color: '#716044' },
  cardTitle: { fontFamily: F.bodySemiBold, fontSize: 28, lineHeight: 34, letterSpacing: -0.6, color: '#202b2a', marginTop: 16 },
  cardBody: { fontFamily: F.body, fontSize: 16, lineHeight: 24, color: '#5b5b50', marginTop: 10 },
  sequence: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: 7, rowGap: 8, marginTop: 20 },
  sequenceText: { fontFamily: F.bodyMedium, fontSize: 13, color: '#655f52' },
  progress: { fontFamily: F.bodyMedium, fontSize: 13, lineHeight: 20, color: '#655f52', marginTop: 14 },
  primary: { minHeight: 56, backgroundColor: '#263c36', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 22 },
  primaryText: { flex: 1, fontFamily: F.bodySemiBold, fontSize: 16, color: '#fffaf0' },
  resume: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, marginTop: 8, paddingVertical: 8 },
  resumeTitle: { fontFamily: F.bodySemiBold, fontSize: 13, color: '#263c36' },
  resumeTopic: { fontFamily: F.body, fontSize: 12, lineHeight: 18, color: '#655f52', marginTop: 3 },
  offline: { fontFamily: F.body, fontSize: 12, lineHeight: 18, color: '#655f52', textAlign: 'center', marginTop: 12 },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 12 },
  planTitle: { fontFamily: F.bodyMedium, fontSize: 15, color: Palette.textPrimary },
  planBody: { fontFamily: F.body, fontSize: 12, lineHeight: 18, color: Palette.textSecondary, marginTop: 2 },
});
