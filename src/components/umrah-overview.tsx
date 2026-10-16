import { AppIcon } from '@/components/app-icon';
import { RitualIcon } from '@/components/ritual-glyph';
import { QasdFonts as F } from '@/constants/qasd-theme';
import { TravelColors as C } from '@/constants/travel-design';
import { learningTitle, UMRAH_CHAPTERS } from '@/lib/umrah-learning';
import { UMRAH_STEPS } from '@/lib/umrah-steps';
import { useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function UmrahOverview({ initialStage, onClose, onTopic }: { initialStage: number; onClose: () => void; onTopic: (index: number) => void }) {
  const scroll = useRef<ScrollView>(null);
  const stageTops = useRef<Record<number, number>>({});
  const positioned = useRef(initialStage === 0);
  const measured = useRef(false);
  const scrollToStage = () => {
    const top = stageTops.current[initialStage];
    if (positioned.current || !measured.current || top === undefined) return;
    scroll.current?.scrollTo({ y: top, animated: false });
    positioned.current = true;
  };
  return (
    <SafeAreaView edges={['top', 'bottom']} style={s.screen}>
      <View style={s.frame}>
        <View style={s.overviewNavigation}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to learning" onPress={onClose} style={s.back}><AppIcon name="chevron-back" size={21} color={C.cream} /><Text style={s.backText}>Learn</Text></TouchableOpacity>
          <View style={s.learningBadge}><AppIcon name="book-outline" size={15} color={C.gold} /><Text style={s.badgeText}>Learning</Text></View>
        </View>
        <ScrollView ref={scroll} onContentSizeChange={() => { measured.current = true; scrollToStage(); }} showsVerticalScrollIndicator={false} contentContainerStyle={s.overviewContent}>
          <Text style={s.eyebrow}>BEGIN WITH THE BIG PICTURE</Text>
          <Text accessibilityRole="header" style={s.overviewTitle}>Your Umrah{ '\n' }at a glance.</Text>
          <Text style={s.overviewIntro}>Four stages, in order. Open any topic to understand it before you travel.</Text>
          <View style={s.learningNote}><AppIcon name="book-outline" size={19} color={C.gold} /><Text style={s.learningNoteText}>This is your learning guide. Reading a topic never marks a ritual as performed.</Text></View>
          {UMRAH_CHAPTERS.map((chapter, index) => <View key={chapter.title} onLayout={event => { stageTops.current[index] = Math.max(0, event.nativeEvent.layout.y - 12); scrollToStage(); }} style={s.chapter}>
            <View style={s.chapterHeader}><View style={s.chapterIcon}><RitualIcon name={chapter.icon} size={29} color={C.forest} /></View><View style={{ flex: 1 }}><Text style={s.paperEyebrow}>STAGE 0{index + 1}</Text><Text accessibilityRole="header" style={s.chapterTitle}>{chapter.title}</Text></View></View>
            <Text style={s.chapterDescription}>{chapter.description}</Text>
            {chapter.indices.map(topicIndex => <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Learn about ${learningTitle(UMRAH_STEPS[topicIndex])}`} key={UMRAH_STEPS[topicIndex].id} onPress={() => onTopic(topicIndex)} style={s.topic}>
              <Text style={s.topicNumber}>{String(topicIndex + 1).padStart(2, '0')}</Text><Text style={s.topicTitle}>{learningTitle(UMRAH_STEPS[topicIndex])}</Text><AppIcon name="arrow-forward" size={17} color={C.forest} />
            </TouchableOpacity>)}
          </View>)}
          <Text style={s.overviewEnd}>Take your time. Your guide is here whenever you need it.</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background },
  frame: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' },
  paperEyebrow: { fontFamily: F.bodySemiBold, fontSize: 10, letterSpacing: 1.5, color: C.paperMuted },
  eyebrow: { fontFamily: F.bodySemiBold, fontSize: 10, letterSpacing: 1.3, color: C.gold },
  overviewNavigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 4 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 46, paddingRight: 14 },
  backText: { fontFamily: F.bodyMedium, fontSize: 15, color: C.cream },
  learningBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: C.surface },
  badgeText: { fontFamily: F.bodyMedium, fontSize: 12, color: C.cream },
  overviewContent: { padding: 24, paddingTop: 28, paddingBottom: 30 },
  overviewTitle: { fontFamily: F.bodySemiBold, fontSize: 34, lineHeight: 41, letterSpacing: -0.8, color: C.cream, marginTop: 12 },
  overviewIntro: { fontFamily: F.body, fontSize: 15, lineHeight: 24, color: C.muted, marginTop: 12 },
  learningNote: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22, marginBottom: 26 },
  learningNoteText: { flex: 1, fontFamily: F.body, fontSize: 12, lineHeight: 19, color: C.muted },
  chapter: { padding: 20, borderRadius: 22, backgroundColor: C.paper, marginBottom: 16 },
  chapterHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  chapterIcon: { width: 50, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#dbdfd1' },
  chapterTitle: { fontFamily: F.bodySemiBold, fontSize: 23, lineHeight: 30, color: C.ink, marginTop: 4 },
  chapterDescription: { fontFamily: F.body, fontSize: 14, lineHeight: 22, color: C.paperMuted, marginTop: 14, marginBottom: 12 },
  topic: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 53, paddingVertical: 13, borderTopWidth: 1, borderTopColor: '#d5cebf' },
  topicNumber: { fontFamily: F.bodyMedium, fontSize: 11, color: C.paperMuted },
  topicTitle: { flex: 1, fontFamily: F.bodyMedium, fontSize: 14, lineHeight: 21, color: C.ink },
  overviewEnd: { fontFamily: F.body, fontSize: 13, lineHeight: 21, color: C.muted, textAlign: 'center', paddingVertical: 10 },
});
