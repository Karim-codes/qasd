import { AppIcon } from '@/components/app-icon';
import { GuideStepCompletion } from '@/components/guide-step-completion';
import { LapCounter } from '@/components/lap-counter';
import { LocalSaveStatus } from '@/components/local-save-status';
import { RitualIcon } from '@/components/ritual-glyph';
import { UmrahLessonArtwork } from '@/components/umrah-lesson-artwork';
import { QasdFonts as F } from '@/constants/qasd-theme';
import { TravelColors as C } from '@/constants/travel-design';
import { useBookmarks, useGuideProgress, useLearningProgress } from '@/hooks/use-local-progress';
import { UMRAH_STEPS } from '@/lib/umrah-steps';
import { learningTitle } from '@/lib/umrah-learning';
import { UMRAH_LESSON_SOURCES, UMRAH_LESSON_VISUALS } from '@/lib/umrah-lesson-content';
import { UMRAH_PHOTO_CREDITS } from '@/lib/umrah-photo-credits';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type ReaderPane = 'guidance' | 'dua';

interface Props {
  index: number;
  learning: boolean;
  initialPane?: ReaderPane;
  backLabel?: string;
  returnLabel?: string;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

export function GuideReader({ index, learning, initialPane = 'guidance', backLabel = 'Guide', returnLabel = 'Return to guide', onNavigate, onClose }: Props) {
  const step = UMRAH_STEPS[index];
  const visual = UMRAH_LESSON_VISUALS[step.id];
  const source = UMRAH_LESSON_SOURCES[step.id];
  const router = useRouter();
  const next = UMRAH_STEPS[index + 1];
  const lessons = useLearningProgress();
  const rituals = useGuideProgress();
  const progress = learning ? lessons : rituals;
  const bookmarks = useBookmarks();
  const [pane, setPane] = useState<ReaderPane>(initialPane);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyRevision = useRef(0);


  useEffect(() => {
    setPane(initialPane);
    setCopied(false);
    setCopyError(false);
    setPracticeOpen(false);
    copyRevision.current += 1;
    if (copyTimer.current) clearTimeout(copyTimer.current);
    return () => { if (copyTimer.current) clearTimeout(copyTimer.current); };
  }, [index, learning, initialPane]);

  const copyDua = async () => {
    if (!step.dua) return;
    const revision = copyRevision.current;
    try {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(`${step.dua.arabic}\n\n${step.dua.transliteration}\n\n${step.dua.translation}`);
      if (revision !== copyRevision.current) return;
      setCopied(true);
      setCopyError(false);
      void Haptics.selectionAsync().catch(() => {});
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      if (revision === copyRevision.current) setCopyError(true);
    }
  };

  const toggleBookmark = () => {
    void bookmarks.update(previous => ({ ...previous, [step.title]: !previous[step.title] }));
    void Haptics.selectionAsync().catch(() => {});
  };
  const duaVisible = pane === 'dua' && !!step.dua;

  return (
      <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
        <View style={s.frame}>
          <View style={s.navigation}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Back to ${backLabel.toLowerCase()}`} onPress={onClose} style={s.back}>
              <AppIcon name="chevron-back" size={21} color={C.cream} /><Text style={s.backText}>{backLabel}</Text>
            </TouchableOpacity>
            <View accessible accessibilityLabel={learning ? 'Learning mode' : 'Perform mode'} style={s.mode}><AppIcon name={learning ? 'book-outline' : 'compass-outline'} size={15} color={C.gold} /><Text style={s.modeText}>{learning ? 'Learning' : 'Performing'}</Text></View>
          </View>
          <View style={s.position}>
            <Text style={s.positionText}>{learning ? 'TOPIC' : 'STEP'} {String(index + 1).padStart(2, '0')} <Text style={s.positionTotal}>/ {UMRAH_STEPS.length}</Text></Text>
            <Text accessibilityLabel="Available offline" style={s.offline}><AppIcon name="cloud-offline-outline" size={13} color={C.muted} /> Available offline</Text>
          </View>
          <View accessibilityRole="progressbar" accessibilityLabel={learning ? 'Topic position' : 'Step position'} accessibilityValue={{ min: 1, max: UMRAH_STEPS.length, now: index + 1 }} style={s.progress}>
            {UMRAH_STEPS.map((item, i) => <View key={item.id} style={[s.segment, i < index && s.segmentPast, i === index && s.segmentActive]} />)}
          </View>

          <ScrollView key={`${step.id}:${duaVisible ? 'dua' : 'guidance'}`} style={s.scroll} contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
            <View style={s.hero}>
              <View style={s.heroCopy}>
                <Text style={s.eyebrow}>{step.phase.toUpperCase()}</Text>
                <Text accessibilityRole="header" style={s.title}>{learning ? learningTitle(step) : step.title}</Text>
                {step.arabicTitle && <Text accessibilityLanguage="ar" style={s.arabicTitle}>{step.arabicTitle}</Text>}
              </View>
              {!learning && <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.glyph}><RitualIcon name={step.glyph ?? step.icon} size={28} color={C.gold} /></View>}
            </View>

            {step.dua && <View style={s.panes} accessibilityRole="tablist">
              {(['guidance', 'dua'] as const).map(value => <TouchableOpacity key={value} accessibilityRole="tab" accessibilityState={{ selected: pane === value }} accessibilityLabel={value === 'guidance' ? 'Read guidance' : 'Read du’a'} onPress={() => setPane(value)} style={[s.pane, pane === value && s.paneSelected]}>
                <Text style={[s.paneText, pane === value && s.paneTextSelected]}>{value === 'guidance' ? 'Guidance' : 'Du’a'}</Text>
              </TouchableOpacity>)}
            </View>}

            {duaVisible && step.dua ? <>
              <View style={s.duaCard}>
                <Text style={s.paperEyebrow}>ARABIC</Text>
                <Text accessibilityLanguage="ar" style={s.duaArabic}>{step.dua.arabic}</Text>
              </View>
              <View style={s.translation}>
                <Text style={s.eyebrow}>TRANSLITERATION</Text>
                <Text style={s.transliteration}>{step.dua.transliteration}</Text>
                <View style={s.rule} />
                <Text style={s.eyebrow}>MEANING</Text>
                <Text style={s.meaning}>{step.dua.translation}</Text>
              </View>
              <View style={s.duaActions}>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Copy du’a" onPress={copyDua} style={s.secondaryAction}><AppIcon name={copied ? 'checkmark' : 'copy-outline'} size={18} color={C.cream} /><Text style={s.secondaryText}>{copied ? 'Copied' : 'Copy du’a'}</Text></TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={bookmarks.value[step.title] ? 'Remove saved du’a' : 'Save du’a'} accessibilityState={{ disabled: !bookmarks.ready }} disabled={!bookmarks.ready} onPress={toggleBookmark} style={s.secondaryAction}><AppIcon name={bookmarks.value[step.title] ? 'bookmark' : 'bookmark-outline'} size={18} color={C.gold} /><Text style={s.secondaryText}>{bookmarks.value[step.title] ? 'Saved' : 'Save du’a'}</Text></TouchableOpacity>
              </View>
              {copyError && <Text accessibilityLiveRegion="polite" style={s.error}>Could not copy. Try again.</Text>}
              {(!bookmarks.ready || bookmarks.error || bookmarks.saving) && <LocalSaveStatus record={bookmarks} />}
            </> : <>
              {learning && visual && <View style={s.lessonVisual}>
                <UmrahLessonArtwork kind={visual.artwork} />
                <Text style={s.visualCaption}>{visual.caption}</Text>
              </View>}
              {step.laps && !learning && <LapCounter key={step.id} id={step.id === 'tawaf-start' ? 'tawaf' : 'sai'} />}
              <View style={[s.guidanceCard, step.laps && !learning && { marginTop: 20 }]}>
                <Text style={s.paperEyebrow}>GUIDANCE</Text>
                <Text style={s.detail}>{learning && step.id === 'complete' ? 'This is the end of the guide. Revisit any stage, or mark this topic as reviewed when you’re ready.' : step.detail}</Text>
              </View>
              {visual?.men && <View style={s.audienceNote}>
                <Text style={s.audienceTitle}>For men</Text><Text style={s.audienceBody}>{visual.men}</Text>
              </View>}
              {visual?.women && <View style={s.audienceNote}>
                <Text style={s.audienceTitle}>For women</Text><Text style={s.audienceBody}>{visual.women}</Text>
              </View>}
              {step.laps && learning && <>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={practiceOpen ? 'Hide practice counter' : 'Try the practice counter'} accessibilityState={{ expanded: practiceOpen }} onPress={() => setPracticeOpen(value => !value)} style={s.duaLink}>
                  <View style={s.duaLinkIcon}><AppIcon name="refresh-outline" size={22} color={C.gold} /></View><View style={s.heroCopy}><Text style={s.duaLinkTitle}>{practiceOpen ? 'Hide practice counter' : 'Try a practice counter'}</Text><Text style={s.duaLinkHint}>A rehearsal, saved separately from your ritual.</Text></View><AppIcon name={practiceOpen ? 'chevron-up' : 'chevron-down'} size={20} color={C.gold} />
                </TouchableOpacity>
                {practiceOpen && <View style={{ marginTop: 18 }}><LapCounter key={`${step.id}:practice`} id={step.id === 'tawaf-start' ? 'tawaf' : 'sai'} practice /></View>}
              </>}
              {step.dua && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Read du’a" onPress={() => setPane('dua')} style={s.duaLink}>
                <View style={s.duaLinkIcon}><AppIcon name="book-outline" size={22} color={C.gold} /></View>
                <View style={s.heroCopy}><Text style={s.duaLinkTitle}>Du’a for this step</Text><Text style={s.duaLinkHint}>Arabic, transliteration and meaning</Text></View>
                <AppIcon name="arrow-forward" size={20} color={C.gold} />
              </TouchableOpacity>}
              <View style={s.sources}>
                <Text style={s.sourceText}>{source.label}</Text>
                {source.note && <Text style={[s.sourceText, { marginTop: 7 }]}>{source.note}</Text>}
                <TouchableOpacity accessibilityRole="button" onPress={() => router.push({ pathname: '/official-umrah-guide', params: { page: String(source.page) } })} style={s.sourceLink}><Text style={s.sourceAction}>Read Ibn Baz’s guide in Qasd →</Text></TouchableOpacity>
                {source.additional && <TouchableOpacity accessibilityRole="link" onPress={() => { void Linking.openURL(source.additional!.url); }} style={s.sourceLink}><Text style={s.sourceText}>{source.additional.title} ↗</Text></TouchableOpacity>}
                {learning && visual && UMRAH_PHOTO_CREDITS[visual.artwork]?.map(credit => <View key={credit.source} style={s.creditRow}>
                  <TouchableOpacity accessibilityRole="link" accessibilityLabel={`${credit.subject} photo by ${credit.author}. Open original photo and credit.`} onPress={() => { void Linking.openURL(credit.source); }} style={s.creditSource}><Text style={s.sourceText}>{credit.subject}: {credit.author} ↗</Text></TouchableOpacity>
                  {credit.licenseUrl ? <TouchableOpacity accessibilityRole="link" accessibilityLabel={`Photo licence: ${credit.license}`} onPress={() => { void Linking.openURL(credit.licenseUrl!); }} style={s.sourceLink}><Text style={s.sourceText}>{credit.license} ↗</Text></TouchableOpacity> : <Text style={s.sourceText}>{credit.license}</Text>}
                </View>)}
              </View>
            </>}
            {(!progress.ready || progress.error || progress.saving) && <LocalSaveStatus record={progress} />}
            {learning && <TouchableOpacity accessibilityRole="button" accessibilityLabel={next ? `Next topic: ${learningTitle(next)}` : returnLabel} onPress={() => next ? onNavigate(index + 1) : onClose()} style={[s.next, s.inlineNext]}>
              <View style={s.heroCopy}><Text style={s.nextLabel}>{next ? 'NEXT TOPIC' : 'UMRAH GUIDE'}</Text><Text style={s.nextTitle}>{next ? learningTitle(next) : returnLabel}</Text></View><AppIcon name={next ? 'arrow-forward' : 'checkmark'} size={22} color={C.paper} />
            </TouchableOpacity>}
          </ScrollView>

          {learning ? <View style={[s.footer, s.compactFooter]}>
            <View style={s.completionControl}><GuideStepCompletion id={step.id} learning compact /></View>
            {index > 0 && <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Previous topic: ${learningTitle(UMRAH_STEPS[index - 1])}`} onPress={() => onNavigate(index - 1)} style={s.compactPrevious}><AppIcon name="chevron-back" size={20} color={C.cream} /></TouchableOpacity>}
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={next ? `Next topic: ${learningTitle(next)}` : returnLabel} onPress={() => next ? onNavigate(index + 1) : onClose()} style={s.compactNext}><Text style={s.compactNextText}>{next ? 'Next' : 'Guide'}</Text><AppIcon name="arrow-forward" size={19} color={C.gold} /></TouchableOpacity>
          </View> : <View style={s.footer}>
            <GuideStepCompletion id={step.id} learning={learning} compact />
            <View style={s.footerNavigation}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={index > 0 ? `Previous: ${learning ? learningTitle(UMRAH_STEPS[index - 1]) : UMRAH_STEPS[index - 1].title}` : learning ? 'Previous topic' : 'Previous step'} accessibilityState={{ disabled: index === 0 }} disabled={index === 0} onPress={() => onNavigate(index - 1)} style={[s.previous, index === 0 && s.disabled]}>
                <AppIcon name="chevron-back" size={22} color={C.cream} />
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={next ? `Next: ${learning ? learningTitle(next) : next.title}` : returnLabel} onPress={() => next ? onNavigate(index + 1) : onClose()} style={s.next}>
                <View style={s.heroCopy}><Text style={s.nextLabel}>{next ? learning ? 'NEXT TOPIC' : 'NEXT STEP' : 'UMRAH GUIDE'}</Text><Text style={s.nextTitle}>{next ? learning ? learningTitle(next) : next.title : returnLabel}</Text></View>
                <AppIcon name={next ? 'arrow-forward' : 'checkmark'} size={22} color={C.paper} />
              </TouchableOpacity>
            </View>
          </View>}
        </View>
      </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background },
  frame: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' },
  navigation: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 4 },
  back: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 5, paddingRight: 14 },
  backText: { fontFamily: F.bodyMedium, fontSize: 15, color: C.cream },
  mode: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: C.surface },
  modeText: { fontFamily: F.bodyMedium, fontSize: 12, color: C.cream },
  position: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 24, marginTop: 12 },
  positionText: { fontFamily: F.bodySemiBold, fontSize: 12, letterSpacing: 1.2, color: C.cream },
  positionTotal: { color: C.muted },
  offline: { fontFamily: F.body, fontSize: 12, color: C.muted },
  progress: { flexDirection: 'row', gap: 4, marginHorizontal: 24, marginTop: 12, marginBottom: 2 },
  segment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: C.line },
  segmentPast: { backgroundColor: '#69735e' },
  segmentActive: { backgroundColor: C.gold },
  scroll: { flex: 1 },
  body: { padding: 24, paddingTop: 26, paddingBottom: 28 },
  hero: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 22 },
  heroCopy: { flex: 1, minWidth: 0 },
  eyebrow: { fontFamily: F.bodySemiBold, fontSize: 11, letterSpacing: 1.3, color: C.gold },
  title: { fontFamily: F.bodySemiBold, fontSize: 30, lineHeight: 38, letterSpacing: -0.6, color: C.cream, marginTop: 8 },
  arabicTitle: { fontSize: 24, lineHeight: 39, color: '#d5bd7e', marginTop: 4, writingDirection: 'rtl', textAlign: 'left' },
  glyph: { alignItems: 'center', justifyContent: 'center', marginTop: 19 },
  panes: { flexDirection: 'row', gap: 24, borderBottomWidth: 1, borderBottomColor: C.line, marginBottom: 22 },
  pane: { minHeight: 46, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', paddingHorizontal: 2 },
  paneSelected: { borderBottomColor: C.gold },
  paneText: { fontFamily: F.bodyMedium, fontSize: 15, color: C.muted },
  paneTextSelected: { color: C.cream },
  guidanceCard: { padding: 22, borderRadius: 20, backgroundColor: C.paper },
  lessonVisual: { marginBottom: 20 },
  visualCaption: { fontFamily: F.body, fontSize: 12, lineHeight: 19, color: C.muted, marginTop: 9 },
  audienceNote: { borderLeftWidth: 2, borderLeftColor: '#829379', paddingLeft: 14, marginTop: 20 },
  audienceTitle: { fontFamily: F.bodySemiBold, fontSize: 14, color: '#d6c28c', marginBottom: 5 },
  audienceBody: { fontFamily: F.body, fontSize: 14, lineHeight: 22, color: C.cream },
  sources: { marginTop: 12 },
  sourceLink: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  sourceText: { fontFamily: F.body, fontSize: 11, lineHeight: 17, color: C.muted },
  sourceAction: { fontFamily: F.bodyMedium, fontSize: 12, lineHeight: 18, color: C.gold },
  creditRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 10 },
  creditSource: { minHeight: 44, justifyContent: 'center', flexShrink: 1 },
  paperEyebrow: { fontFamily: F.bodySemiBold, fontSize: 10, letterSpacing: 1.5, color: C.paperMuted },
  detail: { fontFamily: F.body, fontSize: 17, lineHeight: 28, color: C.ink, marginTop: 12 },
  duaLink: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 20 },
  duaLinkIcon: { alignItems: 'center', justifyContent: 'center' },
  duaLinkTitle: { fontFamily: F.bodySemiBold, fontSize: 16, color: C.cream },
  duaLinkHint: { fontFamily: F.body, fontSize: 12, lineHeight: 18, color: C.muted, marginTop: 4 },
  duaCard: { padding: 22, borderRadius: 20, backgroundColor: C.paper },
  duaArabic: { fontSize: 28, lineHeight: 49, color: C.ink, textAlign: 'right', writingDirection: 'rtl', marginTop: 14 },
  translation: { marginTop: 26 },
  transliteration: { fontFamily: F.bodyMedium, fontSize: 16, lineHeight: 27, color: '#d9c58e', marginTop: 12 },
  rule: { height: 1, backgroundColor: C.line, marginVertical: 24 },
  meaning: { fontFamily: F.body, fontSize: 16, lineHeight: 27, color: C.cream, marginTop: 12 },
  duaActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 },
  secondaryAction: { minHeight: 48, flexGrow: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, paddingHorizontal: 14, borderWidth: 1, borderColor: C.line, borderRadius: 12 },
  secondaryText: { fontFamily: F.bodyMedium, fontSize: 14, color: C.cream },
  error: { fontFamily: F.body, fontSize: 14, color: '#f0a550', marginTop: 12 },
  footer: { paddingHorizontal: 24, paddingTop: 6, paddingBottom: 12, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.background },
  compactFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingTop: 5, paddingBottom: 5 },
  completionControl: { flex: 1, minWidth: 0 },
  compactPrevious: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  compactNext: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, paddingHorizontal: 8 },
  compactNextText: { fontFamily: F.bodySemiBold, fontSize: 14, color: C.gold },
  inlineNext: { marginTop: 24, flex: 0 },
  footerNavigation: { flexDirection: 'row', alignItems: 'stretch', gap: 12, marginTop: 6 },
  previous: { width: 52, minHeight: 64, alignItems: 'center', justifyContent: 'center' },
  next: { flex: 1, minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, backgroundColor: C.forest, borderWidth: 1, borderColor: '#52675d' },
  nextLabel: { fontFamily: F.bodyMedium, fontSize: 10, letterSpacing: 1, color: '#c4d2c7', marginBottom: 4 },
  nextTitle: { fontFamily: F.bodySemiBold, fontSize: 15, lineHeight: 21, color: C.paper },
  disabled: { opacity: 0.35 },
});
