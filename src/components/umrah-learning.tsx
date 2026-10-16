import { AppIcon } from '@/components/app-icon';
import { HARAM_PHOTO, UmrahLessonArtwork } from '@/components/umrah-lesson-artwork';
import { QasdFonts as F } from '@/constants/qasd-theme';
import { TravelColors as C } from '@/constants/travel-design';
import { useLearningProgress } from '@/hooks/use-local-progress';
import { useTabContentInset } from '@/hooks/use-tab-content-inset';
import { HARAM_PHOTO_SOURCE, type LessonArtwork } from '@/lib/umrah-lesson-content';
import { learningResumeIndex, nextLearningIndex, learningTitle, UMRAH_CHAPTERS } from '@/lib/umrah-learning';
import { UMRAH_STEPS } from '@/lib/umrah-steps';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props { onTopic: (index: number) => void }
const STAGE_ARTWORK: LessonArtwork[] = ['ihram', 'haram', 'sai', 'trim'];

export function UmrahLearning({ onTopic }: Props) {
  const learning = useLearningProgress();
  const contentInset = useTabContentInset();
  const reviewed = UMRAH_STEPS.filter(step => learning.value.reviewed[step.id]).length;
  const resume = learningResumeIndex(learning.value);
  const next = nextLearningIndex(learning.value);
  const router = useRouter();
  const [expandedStage, setExpandedStage] = useState<number | null>(0);

  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { paddingBottom: contentInset }]}>
    <View style={s.hero}>
      <Image source={HARAM_PHOTO} accessible accessibilityLabel="The Ka’bah inside al-Masjid al-Haram in Makkah" contentFit="cover" style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(8,18,22,0.02)', 'rgba(8,18,22,0.88)']} locations={[0.15, 1]} style={StyleSheet.absoluteFill} />
      <View style={s.heroCopy}>
        <Text style={s.heroEyebrow}>A JOURNEY OF UNDERSTANDING</Text>
        <Text accessibilityRole="header" style={s.heroTitle}>Learn your Umrah.</Text>
        <Text style={s.heroBody}>See each stage. Know your next step.</Text>
      </View>
    </View>

    <View style={s.learningHeader}>
      <Text style={s.sectionTitle}>Your learning</Text>
      <Text style={s.muted}>{reviewed} / {UMRAH_STEPS.length} reviewed</Text>
    </View>
    <View accessibilityRole="progressbar" accessibilityLabel="Topics reviewed" accessibilityValue={{ min: 0, max: UMRAH_STEPS.length, now: reviewed }} style={s.progress}>
      <View style={[s.progressFill, { width: `${reviewed / UMRAH_STEPS.length * 100}%` }]} />
    </View>
    {next !== null ? <TouchableOpacity accessibilityRole="button" disabled={!learning.ready} accessibilityState={{ disabled: !learning.ready }} accessibilityLabel={`${reviewed === 0 ? 'Start learning' : 'Continue learning'}: next unreviewed topic, ${learningTitle(UMRAH_STEPS[next])}`} onPress={() => onTopic(next)} style={s.continue}>
      <View style={s.flex}>
        <Text style={s.eyebrow}>{reviewed === 0 ? 'START LEARNING' : 'CONTINUE LEARNING · NEXT UNREVIEWED'}</Text>
        <Text style={s.continueTitle}>{learningTitle(UMRAH_STEPS[next])}</Text>
      </View>
      <AppIcon name="arrow-forward" size={21} color={C.paper} />
    </TouchableOpacity> : <Text style={s.muted}>All topics reviewed. Revisit any stage below.</Text>}
    {learning.ready && resume !== null && resume !== next && <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Resume reading: ${learningTitle(UMRAH_STEPS[resume])}`} onPress={() => onTopic(resume)} style={s.resume}>
      <View style={s.flex}><Text style={s.resumeLabel}>Resume reading</Text><Text style={s.muted}>{learningTitle(UMRAH_STEPS[resume])}</Text></View><AppIcon name="arrow-forward" size={18} color={C.gold} />
    </TouchableOpacity>}

    <View style={s.stageHeading}>
      <Text accessibilityRole="header" style={s.sectionTitle}>Explore by stage</Text>
      <Text style={s.muted}>4 stages · 12 topics</Text>
    </View>
    {UMRAH_CHAPTERS.map((chapter, stageIndex) => {
      const expanded = expandedStage === stageIndex;
      const done = chapter.indices.filter(index => learning.value.reviewed[UMRAH_STEPS[index].id]).length;
      return <View key={chapter.title} style={s.stage}>
        <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={`${expanded ? 'Hide' : 'Show'} ${chapter.title} topics, ${done} of ${chapter.indices.length} reviewed`} onPress={() => setExpandedStage(expanded ? null : stageIndex)} activeOpacity={0.8} style={s.stageHeader}>
          <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><UmrahLessonArtwork kind={STAGE_ARTWORK[stageIndex]} compact /></View>
          <View style={s.flex}>
            <Text style={s.stageNumber}>0{stageIndex + 1} · {chapter.indices.length} TOPICS</Text>
            <Text style={s.stageTitle}>{chapter.title}</Text>
            <Text style={s.stageDescription}>{chapter.short === 'Ihram' ? 'Clothing, intention & arrival' : chapter.short === 'Tawaf' ? 'Around the Ka’bah' : chapter.short === 'Sa’i' ? 'Between Safa & Marwa' : 'The final steps'}</Text>
          </View>
          <AppIcon name={expanded ? 'chevron-up' : 'chevron-down'} size={17} color={C.muted} />
        </TouchableOpacity>
        {expanded && <View style={s.topics}>
          {chapter.indices.map(index => {
            const step = UMRAH_STEPS[index];
            const complete = !!learning.value.reviewed[step.id];
            return <TouchableOpacity key={step.id} accessibilityRole="button" accessibilityLabel={`Learn about ${learningTitle(step)}${complete ? ', reviewed' : ''}`} onPress={() => onTopic(index)} style={s.topic}>
              {complete ? <AppIcon name="checkmark" size={17} color={C.gold} /> : <Text style={s.topicNumber}>{String(index + 1).padStart(2, '0')}</Text>}
              <Text style={s.topicTitle}>{learningTitle(step)}</Text>
              <AppIcon name="arrow-forward" size={17} color={C.gold} />
            </TouchableOpacity>;
          })}
        </View>}
      </View>;
    })}
    <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/official-umrah-guide')} style={s.resume}>
      <AppIcon name="book-outline" size={20} color={C.gold} /><View style={s.flex}><Text style={s.resumeLabel}>Read Ibn Baz’s Umrah guide</Text><Text style={s.muted}>Original publication · Available offline</Text></View><AppIcon name="arrow-forward" size={18} color={C.gold} />
    </TouchableOpacity>
    <TouchableOpacity accessibilityRole="link" accessibilityLabel="Photo credit: Adli Wahid, Creative Commons Attribution ShareAlike 4.0. Open source." onPress={() => { void Linking.openURL(HARAM_PHOTO_SOURCE); }} style={s.creditLink}>
      <Text style={s.credit}>Haram photo: Adli Wahid · CC BY-SA 4.0</Text>
    </TouchableOpacity>
  </ScrollView>;
}

const s = StyleSheet.create({
  content: { padding: 22, paddingTop: 4, width: '100%', maxWidth: 640, alignSelf: 'center' },
  flex: { flex: 1, minWidth: 0 },
  hero: { height: 204, borderRadius: 20, overflow: 'hidden', backgroundColor: C.surface, justifyContent: 'flex-end' },
  heroCopy: { padding: 20 },
  heroEyebrow: { fontFamily: F.bodySemiBold, fontSize: 9, letterSpacing: 1.4, color: '#e8d9af' },
  heroTitle: { fontFamily: F.displayMedium, fontSize: 36, lineHeight: 42, color: '#fffaf0', marginTop: 5 },
  heroBody: { fontFamily: F.body, fontSize: 13, lineHeight: 20, color: '#e0e2dc', marginTop: 4 },
  learningHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 22 },
  sectionTitle: { fontFamily: F.bodySemiBold, fontSize: 17, lineHeight: 24, color: C.cream },
  muted: { fontFamily: F.body, fontSize: 12, lineHeight: 19, color: C.muted },
  progress: { height: 3, borderRadius: 3, backgroundColor: C.line, overflow: 'hidden', marginTop: 10, marginBottom: 12 },
  progressFill: { height: 3, backgroundColor: C.gold },
  continue: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 68, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, backgroundColor: C.forest },
  eyebrow: { fontFamily: F.bodyMedium, fontSize: 9, letterSpacing: 0.8, color: '#c6d0bd' },
  continueTitle: { fontFamily: F.bodySemiBold, fontSize: 16, lineHeight: 22, color: C.paper, marginTop: 3 },
  resume: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  resumeLabel: { fontFamily: F.bodyMedium, fontSize: 14, color: C.cream, marginBottom: 3 },
  stageHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 26, marginBottom: 12 },
  stage: { borderBottomWidth: 1, borderBottomColor: C.line, paddingVertical: 14 },
  stageHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stageNumber: { fontFamily: F.bodyMedium, fontSize: 9, letterSpacing: 1, color: C.gold },
  stageTitle: { fontFamily: F.bodySemiBold, fontSize: 17, lineHeight: 23, color: C.cream, marginTop: 5 },
  stageDescription: { fontFamily: F.body, fontSize: 12, lineHeight: 18, color: C.muted, marginTop: 4 },
  topics: { marginTop: 14 },
  topic: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.line },
  topicNumber: { width: 20, fontFamily: F.bodyMedium, fontSize: 11, color: C.muted },
  topicTitle: { flex: 1, fontFamily: F.bodyMedium, fontSize: 14, lineHeight: 21, color: C.cream },
  creditLink: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', marginTop: 12 },
  credit: { fontFamily: F.body, fontSize: 10, lineHeight: 16, color: C.muted },
});
