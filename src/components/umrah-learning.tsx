import { AppIcon } from '@/components/app-icon';
import { RitualIcon } from '@/components/ritual-glyph';
import { QasdFonts as F } from '@/constants/qasd-theme';
import { TravelColors as C } from '@/constants/travel-design';
import { useLearningProgress } from '@/hooks/use-local-progress';
import { useTabContentInset } from '@/hooks/use-tab-content-inset';
import { learningResumeIndex, learningTitle, UMRAH_CHAPTERS } from '@/lib/umrah-learning';
import { UMRAH_STEPS } from '@/lib/umrah-steps';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props { onTopic: (index: number) => void }

export function UmrahLearning({ onTopic }: Props) {
  const learning = useLearningProgress();
  const contentInset = useTabContentInset();
  const router = useRouter();
  const openOverview = (stage: number) => router.push({ pathname: '/umrah-overview', params: { stage } });
  const reviewed = UMRAH_STEPS.filter(step => learning.value.reviewed[step.id]).length;
  const resume = learningResumeIndex(learning.value);
  return <>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { paddingBottom: contentInset }]}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Explore Umrah at a glance, four stages and twelve learning topics" activeOpacity={0.9} onPress={() => openOverview(0)} style={s.hero}>
        <View style={s.spread}><Text style={s.paperEyebrow}>THE BIG PICTURE</Text><AppIcon name="book-outline" size={25} color={C.forest} /></View>
        <Text accessibilityRole="header" style={s.heroTitle}>Umrah, made simple.</Text>
        <Text style={s.heroBody}>Get to know the journey before you take your first step.</Text>
        <View style={s.sequence}>
          {UMRAH_CHAPTERS.map((chapter, index) => <View key={chapter.title} style={s.sequenceItem}>
            <View style={s.sequenceIcon}><RitualIcon name={chapter.icon} size={25} color={C.forest} /></View>
            <Text style={s.sequenceLabel}>{chapter.short}</Text>
            {index < 3 && <View style={s.connector} />}
          </View>)}
        </View>
        <View style={s.heroAction}><View style={{ flex: 1 }}><Text style={s.heroActionTitle}>See Umrah at a glance</Text><Text style={s.heroActionHint}>4 stages · 12 topics to explore</Text></View><AppIcon name="arrow-forward" size={22} color={C.paper} /></View>
        <Text style={s.offline}>Learn anytime · No trip needed · Available offline</Text>
      </TouchableOpacity>

      <View style={s.learningHeader}><Text style={s.sectionTitle}>Your learning</Text><Text style={s.muted}>{reviewed} / {UMRAH_STEPS.length} reviewed</Text></View>
      <View accessibilityRole="progressbar" accessibilityLabel="Topics reviewed" accessibilityValue={{ min: 0, max: UMRAH_STEPS.length, now: reviewed }} style={s.progress}><View style={[s.progressFill, { width: `${reviewed / UMRAH_STEPS.length * 100}%` }]} /></View>
      <TouchableOpacity accessibilityRole="button" onPress={() => onTopic(resume)} style={s.continue}>
        <View style={s.continueIcon}><AppIcon name="book-outline" size={22} color={C.gold} /></View>
        <View style={{ flex: 1 }}><Text style={s.eyebrow}>{reviewed === 0 ? 'START LEARNING' : reviewed === UMRAH_STEPS.length ? 'REVISIT A TOPIC' : 'CONTINUE LEARNING'}</Text><Text style={s.continueTitle}>{learningTitle(UMRAH_STEPS[resume])}</Text></View><AppIcon name="arrow-forward" size={21} color={C.cream} />
      </TouchableOpacity>
      <Text style={s.note}>Read, understand and revisit. Only topics you mark as reviewed count towards your learning.</Text>

      <Text accessibilityRole="header" style={[s.sectionTitle, { marginTop: 28, marginBottom: 6 }]}>Explore by stage</Text>
      <Text style={[s.muted, { marginBottom: 16 }]}>Choose a stage to see its learning topics.</Text>
      {UMRAH_CHAPTERS.map((chapter, index) => <TouchableOpacity key={chapter.title} accessibilityRole="button" accessibilityLabel={`Explore ${chapter.title}, ${chapter.indices.length} topics`} onPress={() => openOverview(index)} style={s.stage}>
        <View style={s.stageIcon}><RitualIcon name={chapter.icon} size={26} color={C.gold} /></View>
        <View style={{ flex: 1 }}><Text style={s.stageNumber}>STAGE 0{index + 1} · {chapter.indices.length} TOPICS</Text><Text style={s.stageTitle}>{chapter.title}</Text><Text style={s.stageDescription}>{chapter.description}</Text></View><AppIcon name="chevron-forward" size={17} color={C.muted} />
      </TouchableOpacity>)}
    </ScrollView>

  </>;
}


const s = StyleSheet.create({
  content: { padding: 22, paddingTop: 8, width: '100%', maxWidth: 640, alignSelf: 'center' },
  spread: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  hero: { padding: 22, borderRadius: 26, backgroundColor: C.paper },
  paperEyebrow: { fontFamily: F.bodySemiBold, fontSize: 10, letterSpacing: 1.5, color: C.paperMuted },
  heroTitle: { fontFamily: F.bodySemiBold, fontSize: 29, lineHeight: 36, letterSpacing: -0.6, color: C.ink, marginTop: 16 },
  heroBody: { fontFamily: F.body, fontSize: 15, lineHeight: 23, color: C.paperMuted, marginTop: 10 },
  sequence: { flexDirection: 'row', marginTop: 24, marginBottom: 24 },
  sequenceItem: { flex: 1, alignItems: 'center' },
  sequenceIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#dbdfd1', alignItems: 'center', justifyContent: 'center' },
  sequenceLabel: { fontFamily: F.bodyMedium, fontSize: 11, color: C.ink, marginTop: 8 },
  connector: { position: 'absolute', height: 1, backgroundColor: '#bdc4b3', width: 16, right: -8, top: 22 },
  heroAction: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.forest, borderRadius: 16, padding: 16 },
  heroActionTitle: { fontFamily: F.bodySemiBold, fontSize: 15, color: C.paper },
  heroActionHint: { fontFamily: F.body, fontSize: 11, lineHeight: 17, color: '#c6d2c7', marginTop: 4 },
  offline: { fontFamily: F.body, fontSize: 10, lineHeight: 16, color: C.paperMuted, textAlign: 'center', marginTop: 14 },
  learningHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 27 },
  sectionTitle: { fontFamily: F.bodySemiBold, fontSize: 20, lineHeight: 28, color: C.cream },
  muted: { fontFamily: F.body, fontSize: 12, lineHeight: 19, color: C.muted },
  progress: { height: 3, borderRadius: 3, backgroundColor: C.line, overflow: 'hidden', marginVertical: 14 },
  progressFill: { height: 3, backgroundColor: C.gold },
  continue: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: C.surface, borderRadius: 18, padding: 16 },
  continueIcon: { width: 42, height: 44, borderRadius: 14, backgroundColor: C.iconSurface, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontFamily: F.bodySemiBold, fontSize: 10, letterSpacing: 1.3, color: C.gold },
  continueTitle: { fontFamily: F.bodyMedium, fontSize: 17, color: C.cream, marginTop: 5 },
  note: { fontFamily: F.body, fontSize: 12, lineHeight: 19, color: C.muted, marginTop: 12 },
  stage: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: C.line },
  stageIcon: { width: 48, height: 52, borderRadius: 17, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  stageNumber: { fontFamily: F.bodyMedium, fontSize: 9, letterSpacing: 1, color: C.muted },
  stageTitle: { fontFamily: F.bodySemiBold, fontSize: 18, lineHeight: 25, color: C.cream, marginTop: 5 },
  stageDescription: { fontFamily: F.body, fontSize: 12, lineHeight: 19, color: C.muted, marginTop: 4 },
});
