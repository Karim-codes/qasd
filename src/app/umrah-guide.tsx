import { AppIcon } from '@/components/app-icon';
import { type ReaderPane } from '@/components/guide-reader';
import { LocalSaveStatus } from '@/components/local-save-status';
import { GuideJourney } from '@/components/umrah-guide-journey';
import { UmrahLearning } from '@/components/umrah-learning';
import { QasdFonts as F } from '@/constants/qasd-theme';
import { TravelColors as C } from '@/constants/travel-design';
import { useBookmarks, useGuideProgress, useLearningProgress } from '@/hooks/use-local-progress';
import { useTabContentInset } from '@/hooks/use-tab-content-inset';
import { learningTitle } from '@/lib/umrah-learning';
import { UMRAH_STEPS } from '@/lib/umrah-steps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ViewMode = 'linear' | 'roadmap';

export default function UmrahGuideScreen({ embedded = false }: { embedded?: boolean }) {
  const contentInset = useTabContentInset();
  const router = useRouter();
  const params = useLocalSearchParams<{ step?: string; mode?: string }>();
  const guideMode = params.mode === 'perform' ? 'perform' : 'learn';
  const isLearning = guideMode === 'learn';
  const ritual = useGuideProgress();
  const learning = useLearningProgress();
  const progress = isLearning ? learning : ritual;
  const bookmarks = useBookmarks();
  const [viewMode, setViewMode] = useState<ViewMode>('linear');
  const [showSaved, setShowSaved] = useState(false);
  const activeIdx = Math.max(0, UMRAH_STEPS.findIndex(step => step.id === progress.value.lastStep));
  const savedSteps = UMRAH_STEPS.filter(step => step.dua && bookmarks.value[step.title]);

  const openReader = (index: number, pane: ReaderPane = 'guidance') => router.push({
    pathname: '/umrah-topic',
    params: { step: UMRAH_STEPS[index].id, mode: guideMode, pane, from: showSaved ? 'saved' : 'guide' },
  });

  // Keep existing Home/Journey and external step links working with the reader route.
  useEffect(() => {
    if (!params.step || !UMRAH_STEPS.some(step => step.id === params.step)) return;
    const step = params.step;
    router.setParams({ step: undefined });
    router.push({ pathname: '/umrah-topic', params: { step, mode: guideMode } });
  }, [params.step, guideMode, router]);

  const changeMode = (mode: 'learn' | 'perform') => {
    setShowSaved(false);
    router.setParams({ mode, step: undefined });
  };
  const handleBack = () => router.canGoBack() ? router.back() : router.replace('/(tabs)');

  return <SafeAreaView style={s.container} edges={['top']}>
    <View style={s.header}>
      {!embedded && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={handleBack} style={s.back}><AppIcon name="chevron-back" size={23} color={C.cream} /></TouchableOpacity>}
      <Text accessibilityRole="header" style={s.title}>Umrah guide</Text>
      <Text accessibilityLanguage="ar" style={s.arabic}>ٱلْعُمْرَة</Text>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={showSaved ? 'Show all guidance' : `Show saved du’as, ${savedSteps.length} saved`} accessibilityState={{ selected: showSaved }} onPress={() => setShowSaved(value => !value)} style={s.saved}>
        <AppIcon name={showSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={showSaved ? C.gold : C.cream} />
        {savedSteps.length > 0 && <Text style={s.savedCount}>{savedSteps.length}</Text>}
      </TouchableOpacity>
    </View>

    <View style={s.modes} accessibilityRole="tablist">
      {(['learn', 'perform'] as const).map(mode => <TouchableOpacity key={mode} accessibilityRole="tab" accessibilityState={{ selected: guideMode === mode }} onPress={() => changeMode(mode)} style={[s.mode, guideMode === mode && s.modeSelected]}>
        <Text style={[s.modeText, guideMode === mode && { color: C.paper }]}>{mode === 'learn' ? 'Learn' : 'Perform'}</Text>
      </TouchableOpacity>)}
    </View>
    {!isLearning && !showSaved && <View style={s.toolbar}>
      <View style={s.views} accessibilityRole="tablist">
        {(['linear', 'roadmap'] as const).map(mode => <TouchableOpacity key={mode} accessibilityRole="tab" accessibilityState={{ selected: viewMode === mode && !showSaved }} onPress={() => { setViewMode(mode); setShowSaved(false); }} style={[s.view, viewMode === mode && !showSaved && s.viewSelected]}>
          <AppIcon name={mode === 'linear' ? 'list-outline' : 'map-outline'} size={15} color={viewMode === mode && !showSaved ? C.cream : C.muted} />
          <Text style={[s.viewText, viewMode === mode && !showSaved && { color: C.cream }]}>{mode === 'linear' ? 'Timeline' : 'Road Map'}</Text>
        </TouchableOpacity>)}
      </View>
    </View>}
    {(!progress.ready || progress.error || progress.saving) && <View style={s.status}><LocalSaveStatus record={progress} /></View>}

    {showSaved ? <ScrollView contentContainerStyle={[s.savedContent, { paddingBottom: contentInset }]}>
      <Text style={s.savedTitle}>Saved du’as</Text>
      {(!bookmarks.ready || bookmarks.error || bookmarks.saving) && <LocalSaveStatus record={bookmarks} />}
      {savedSteps.map(step => <TouchableOpacity key={step.id} accessibilityRole="button" accessibilityLabel={`Read saved du’a: ${step.title}`} onPress={() => openReader(UMRAH_STEPS.indexOf(step), 'dua')} style={s.savedRow}>
        <AppIcon name="bookmark" size={20} color={C.gold} /><View style={{ flex: 1 }}><Text style={s.savedRowTitle}>{isLearning ? learningTitle(step) : step.title}</Text><Text style={s.savedRowHint}>Arabic, transliteration and meaning</Text></View><AppIcon name="chevron-forward" size={18} color={C.muted} />
      </TouchableOpacity>)}
      {bookmarks.ready && savedSteps.length === 0 && <View style={s.empty}>
        <AppIcon name="bookmark-outline" size={32} color={C.gold} />
        <Text style={s.emptyTitle}>Keep your du’as close</Text>
        <Text style={s.emptyBody}>Save a du’a while reading to find it here, even offline.</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => setShowSaved(false)} style={s.browse}><Text style={s.browseText}>Browse the guide</Text><AppIcon name="arrow-forward" size={19} color={C.paper} /></TouchableOpacity>
      </View>}
    </ScrollView> : isLearning ? <UmrahLearning onTopic={index => openReader(index)} /> : <GuideJourney mode={viewMode} activeIdx={activeIdx} onStep={(_, index) => openReader(index)} embedded={embedded} />}

  </SafeAreaView>;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 18 },
  back: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -10 },
  title: { flex: 1, fontFamily: F.bodySemiBold, fontSize: 26, lineHeight: 34, color: C.cream, letterSpacing: -0.4 },
  arabic: { fontSize: 22, lineHeight: 34, color: C.gold },
  modes: { flexDirection: 'row', marginHorizontal: 22, padding: 4, gap: 4, marginBottom: 4, backgroundColor: C.surface, borderRadius: 15 },
  mode: { flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 11 },
  modeSelected: { backgroundColor: C.forest },
  modeText: { fontFamily: F.bodySemiBold, fontSize: 15, color: C.muted },
  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22 },
  views: { flex: 1, flexDirection: 'row', gap: 16 },
  view: { flex: 1, minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 9, paddingHorizontal: 6 },
  viewSelected: { borderBottomWidth: 2, borderBottomColor: C.gold },
  viewText: { fontFamily: F.bodyMedium, fontSize: 12, color: C.muted },
  saved: { minWidth: 44, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  savedCount: { fontFamily: F.bodyMedium, fontSize: 12, color: C.cream },
  status: { paddingHorizontal: 22 },
  savedContent: { padding: 22 },
  savedTitle: { fontFamily: F.bodySemiBold, fontSize: 23, lineHeight: 31, color: C.cream, marginBottom: 18 },
  savedRow: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 80, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  savedRowTitle: { fontFamily: F.bodyMedium, fontSize: 17, color: C.cream },
  savedRowHint: { fontFamily: F.body, fontSize: 13, lineHeight: 20, color: C.muted, marginTop: 4 },
  empty: { padding: 24, borderRadius: 20, backgroundColor: C.surface },
  emptyTitle: { fontFamily: F.bodySemiBold, fontSize: 21, color: C.cream, marginTop: 18 },
  emptyBody: { fontFamily: F.body, fontSize: 15, lineHeight: 24, color: C.muted, marginTop: 10 },
  browse: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, backgroundColor: C.forest, padding: 16, minHeight: 52, borderRadius: 12, marginTop: 22 },
  browseText: { fontFamily: F.bodySemiBold, fontSize: 15, color: C.paper },
});
