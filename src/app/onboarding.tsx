import { AppIcon } from '@/components/app-icon';
import { UmrahLessonArtwork } from '@/components/umrah-lesson-artwork';
import { QasdFonts as F } from '@/constants/qasd-theme';
import { TravelColors as C } from '@/constants/travel-design';
import { useItinerary } from '@/context/itinerary-context';
import { completeOnboarding, ONBOARDING_SCREENS } from '@/lib/onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { type Href, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Alert, Animated, Pressable, ScrollView, StyleSheet, Text as NativeText, type TextProps, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAKKAH_ART = require('../../assets/onboarding/makkah-paper.png');
const JOURNEY_ART = require('../../assets/onboarding/journey-paper.png');
const MARK = require('../../assets/brand/qasd-mark.png');
const LABELS = ['WELCOME TO QASD', 'LEARN WITH CLARITY', 'KEEP LIFE SIMPLE', 'READY WHEN YOU ARE'];

// Scale type and leading together. In this custom-font layout, changing the
// iOS content category otherwise enlarges glyphs without matching line boxes.
function Text({ style, maxFontSizeMultiplier = 2, ...props }: TextProps) {
  const { fontScale } = useWindowDimensions();
  const textStyle = StyleSheet.flatten(style) ?? {};
  const size = textStyle.fontSize ?? 14;
  const scale = Math.min(fontScale, maxFontSizeMultiplier ?? 2);
  return <NativeText {...props} allowFontScaling={false} style={[style, { fontSize: size * scale, lineHeight: (textStyle.lineHeight ?? size * 1.35) * scale }]} />;
}

function LearningPreview() {
  const [topic, setTopic] = useState<'tawaf' | 'sai'>('tawaf');
  return <View style={s.lessonPreview}>
    <View accessibilityRole="tablist" style={s.previewTabs}>
      {([{ id: 'tawaf', label: 'Tawaf' }, { id: 'sai', label: 'Sa’i' }] as const).map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: topic === item.id }} onPress={() => setTopic(item.id)} style={[s.previewTab, topic === item.id && s.previewTabActive]}><Text style={[s.previewTabText, topic === item.id && s.previewTabTextActive]}>{item.label}</Text></Pressable>)}
    </View>
    <UmrahLessonArtwork kind={topic} preview />
  </View>;
}

function PreparationPreview() {
  const [packed, setPacked] = useState(false);
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale > 1.3;
  return <View style={s.preparationPreview}>
    <View style={s.tripPreview} accessible accessibilityLabel="Example journey preview. Keep your flights and stays together in Qasd.">
      <View style={s.tripHeading}><Text style={s.tripEyebrow}>YOUR UMRAH, TOGETHER</Text></View>
      <View style={[s.cities, largeText && { flexDirection: 'column', alignItems: 'flex-start' }]}><Text style={s.city}>Madinah</Text><View style={[s.flightLine, largeText && { flex: 0, width: 54 }]}><View style={s.flightDot} /><View style={s.flightRule} /><AppIcon name={largeText ? 'arrow-down' : 'arrow-forward'} color={C.gold} size={18} /></View><Text style={s.city}>Makkah</Text></View>
      <Text style={s.exampleLabel}>Example journey</Text>
      <View style={s.tripDetails}><View style={s.tripDetail}><Text style={s.tripDetailTitle}>Flights</Text><Text style={s.tripDetailBody}>Your travel details</Text></View><View style={s.tripDetail}><Text style={s.tripDetailTitle}>Stays</Text><Text style={s.tripDetailBody}>A place for each stop</Text></View></View>
    </View>
    <View style={s.checklistPreview}>
      <View style={s.checklistHeading}><Text style={s.checklistTitle}>One less thing to remember.</Text><Text style={s.tryLabel}>TRY IT</Text></View>
      <Pressable accessibilityRole="checkbox" accessibilityLabel="Preview checklist: pack the essentials" accessibilityState={{ checked: packed }} onPress={() => setPacked(value => !value)} style={s.checklistRow}>
        <View style={[s.checkCircle, packed && s.checkCircleDone]}>{packed && <AppIcon name="checkmark" size={14} color={C.paper} />}</View><Text style={[s.checklistText, packed && s.checkedText]}>Pack the essentials</Text><Text style={s.tapLabel}>{packed ? 'Ready' : 'Tap to check'}</Text>
      </Pressable>
      <Text style={s.demoNote}>A preview of your preparation checklist.</Text>
    </View>
  </View>;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { itinerary } = useItinerary();
  const { height, width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const finishingRef = useRef(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const entrance = useRef(new Animated.Value(1)).current;
  const paper = page === 1 || page === 2;
  const last = page === ONBOARDING_SCREENS.length - 1;
  const compact = height < 760 || width < 390;

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduceMotion(value); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (reduceMotion) { entrance.setValue(1); return; }
    entrance.setValue(0);
    const animation = Animated.timing(entrance, { toValue: 1, duration: 360, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [entrance, page, reduceMotion]);

  const finish = async (destination: Href = '/(tabs)') => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setFinishing(true);
    const saved = await completeOnboarding(AsyncStorage);
    if (!saved) Alert.alert('You’re welcome to continue', 'Your welcome preference couldn’t be saved. You may see this introduction again next time.');
    router.replace(destination);
  };

  const ink = paper ? C.ink : C.cream;
  const muted = paper ? C.paperMuted : C.muted;
  return <SafeAreaView style={[s.screen, paper && s.paperScreen]} edges={['top', 'bottom']}>
    <StatusBar style={paper ? 'dark' : 'light'} />
    <View style={s.frame}>
      <View style={s.header}>
        <View style={s.headerSide}>{page > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Previous introduction screen" onPress={() => setPage(value => value - 1)} hitSlop={8} style={s.headerButton}><AppIcon name="arrow-back" size={22} color={ink} /></Pressable>}</View>
        <View accessible accessibilityLabel="Qasd" style={s.wordmark}><Image source={MARK} contentFit="contain" style={s.wordmarkIcon} /><Text maxFontSizeMultiplier={1.1} style={[s.brand, { color: ink }]}>Qasd</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Skip introduction and explore Qasd" disabled={finishing} onPress={() => void finish()} style={[s.headerSide, s.skip]}><Text style={[s.skipText, { color: muted }]}>Skip</Text></Pressable>
      </View>
      <ScrollView key={page} style={s.scroll} contentContainerStyle={[s.scrollContent, { width: Math.min(width, 540) }]} showsVerticalScrollIndicator={false} bounces={false}>
        <Animated.View style={[s.content, { opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [reduceMotion ? 0 : 12, 0] }) }] }]}>
          {page === 0 && <>
            <View style={[s.hero, { height: compact ? 235 : Math.min(height * 0.43, 420) }]}>
              <Image source={MAKKAH_ART} accessible accessibilityLabel="Original paper-and-ink illustration of the Ka’bah, cream mosque arches and minarets against a navy sky. An artistic impression, not a navigation map." contentFit="contain" style={StyleSheet.absoluteFill} />
              <LinearGradient colors={[C.background, 'rgba(16,24,39,0)', 'rgba(16,24,39,0)', C.background]} locations={[0, 0.12, 0.65, 1]} style={StyleSheet.absoluteFill} />
              <View style={s.photoLocation}><View style={s.locationRule} /><Text style={s.locationText}>MAKKAH · THE JOURNEY AHEAD</Text></View>
            </View>
            <View style={[s.introCopy, compact && s.compactIntro]}><Text style={s.eyebrow}>A JOURNEY WITH PURPOSE</Text><Text maxFontSizeMultiplier={1.35} accessibilityRole="header" style={[s.title, compact && s.compactTitle]}>A clearer path{ '\n' }to Umrah.</Text><Text style={s.body}>Learn the steps. Prepare the essentials.{ '\n' }Keep your journey close.</Text>

            </View>
          </>}
          {page === 1 && <View style={s.featureContent}>
            <Text style={[s.eyebrow, s.paperEyebrow]}>KNOW WHAT COMES NEXT</Text><Text maxFontSizeMultiplier={1.35} accessibilityRole="header" style={[s.title, s.paperTitle, compact && s.compactTitle]}>See the steps.{ '\n' }Feel prepared.</Text><Text style={[s.body, s.paperBody]}>Visual lessons, du’a and the original Ibn Baz guide, available offline.</Text>
            <LearningPreview />
          </View>}
          {page === 2 && <View style={s.featureContent}>
            <Text style={[s.eyebrow, s.paperEyebrow]}>MAKE SPACE FOR THE JOURNEY</Text><Text maxFontSizeMultiplier={1.35} accessibilityRole="header" style={[s.title, s.paperTitle, compact && s.compactTitle]}>Plans in place.{ '\n' }Room to focus.</Text><Text style={[s.body, s.paperBody]}>Your checklist, flights and stays, gathered in one place. Add the details when you’re ready.</Text>
            <PreparationPreview />
          </View>}
          {page === 3 && <View style={s.beginContent}>
            <View style={[s.brandArtwork, compact && { height: 130 }]}><Image source={JOURNEY_ART} accessible accessibilityLabel="Original paper-and-ink illustration of an open guide and travel bag beside an archway, with a path leading towards the mosque." contentFit="contain" style={s.journeyArtwork} /></View>
            <Text style={s.eyebrow}>WITH YOU, FROM THE FIRST STEP</Text><Text maxFontSizeMultiplier={1.35} accessibilityRole="header" style={[s.title, compact && s.compactTitle]}>Your journey.{ '\n' }At your pace.</Text><Text style={s.body}>Explore the guide now. Plan your Umrah whenever you’re ready.</Text>
            <View style={s.privacyNote}><View style={s.privacyRule} /><Text style={s.privacyText}>No account. Your plans stay on your device.</Text></View>
          </View>}
        </Animated.View>
      </ScrollView>
      <View style={[s.footer, paper && s.paperFooter]}>
        <View style={s.progressHeading}><Text style={[s.progressLabel, { color: muted }]}>{LABELS[page]}</Text><Text accessibilityLiveRegion="polite" accessibilityLabel={`Introduction screen ${page + 1} of 4`} style={[s.progressNumber, { color: muted }]}>0{page + 1} / 04</Text></View>
        <View accessible={false} style={s.progressTrack}>{ONBOARDING_SCREENS.map((id, index) => <View key={id} style={[s.progressSegment, paper && s.paperSegment, index <= page && { backgroundColor: paper ? C.forest : C.gold }]} />)}</View>
        <Pressable accessibilityRole="button" accessibilityLabel={last ? 'Explore Qasd' : page === 0 ? 'Get started' : 'Continue'} accessibilityState={{ disabled: finishing }} disabled={finishing} onPress={() => last ? void finish() : setPage(value => value + 1)} style={({ pressed }) => [s.primary, paper && s.paperPrimary, pressed && s.pressed]}>
          <Text style={[s.primaryText, paper && s.paperPrimaryText]}>{last ? 'Explore Qasd' : page === 0 ? 'Get started' : 'Continue'}</Text>{finishing ? <ActivityIndicator color={paper ? C.paper : C.background} /> : <AppIcon name="arrow-forward" size={22} color={paper ? C.paper : C.background} />}
        </Pressable>
        {last && <Pressable accessibilityRole="button" disabled={finishing} onPress={() => void finish(itinerary ? '/(tabs)/journey' : '/umrah-setup/destination')} style={s.secondary}><Text style={s.secondaryText}>{itinerary ? 'View my trip' : 'Plan my Umrah'}</Text><AppIcon name="arrow-forward" size={15} color={C.gold} /></Pressable>}
      </View>
    </View>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background }, paperScreen: { backgroundColor: C.paper },
  frame: { flex: 1, width: '100%', maxWidth: 540, alignSelf: 'center' },
  header: { minHeight: 58, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerSide: { width: 52, minHeight: 44, justifyContent: 'center' }, headerButton: { minHeight: 44, justifyContent: 'center', alignItems: 'flex-start' },
  wordmark: { flexDirection: 'row', gap: 8, alignItems: 'center' }, wordmarkIcon: { width: 26, height: 30 }, brand: { fontFamily: F.displayMedium, fontSize: 30, lineHeight: 36 },
  skip: { alignItems: 'flex-end' }, skipText: { fontFamily: F.bodyMedium, fontSize: 13 },
  scroll: { flex: 1 }, scrollContent: { flexGrow: 1 }, content: { flex: 1, width: '100%' },
  hero: { width: '100%', overflow: 'hidden' }, photoLocation: { position: 'absolute', bottom: 65, left: 28, flexDirection: 'row', alignItems: 'center', gap: 10 }, locationRule: { width: 22, height: 1, backgroundColor: C.gold }, locationText: { fontFamily: F.bodySemiBold, fontSize: 9, letterSpacing: 1.1, color: C.cream },
  introCopy: { paddingHorizontal: 28, marginTop: -34, paddingBottom: 12 }, compactIntro: { marginTop: -24 },
  eyebrow: { fontFamily: F.bodySemiBold, fontSize: 10, letterSpacing: 1.7, lineHeight: 17, color: C.gold, marginBottom: 12 },
  title: { fontFamily: F.displayMedium, fontSize: 55, lineHeight: 55, letterSpacing: -0.8, color: C.cream, marginBottom: 16 }, compactTitle: { fontSize: 43, lineHeight: 44 },
  body: { fontFamily: F.body, fontSize: 15, lineHeight: 24, color: C.muted },
  featureContent: { paddingHorizontal: 26, paddingTop: 16, paddingBottom: 18 }, paperEyebrow: { color: '#77612e' }, paperTitle: { color: C.ink, fontSize: 48, lineHeight: 49 }, paperBody: { color: C.paperMuted },
  lessonPreview: { marginTop: 28, padding: 16, borderRadius: 22, backgroundColor: '#f8f4eb', borderWidth: 1, borderColor: '#d8d2c3' },
  previewTabs: { flexDirection: 'row', marginBottom: 16, borderBottomWidth: 1, borderColor: '#d8d2c3', gap: 26 }, previewTab: { minHeight: 44, justifyContent: 'center', borderBottomWidth: 2, borderColor: 'transparent' }, previewTabActive: { borderColor: C.forest }, previewTabText: { fontFamily: F.bodyMedium, color: C.paperMuted, fontSize: 15 }, previewTabTextActive: { color: C.forest },
  preparationPreview: { marginTop: 24 }, tripPreview: { backgroundColor: C.background, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }, tripHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, tripEyebrow: { fontFamily: F.bodySemiBold, fontSize: 9, letterSpacing: 1.4, color: C.gold, flex: 1 },
  cities: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20 }, city: { fontFamily: F.displayMedium, fontSize: 29, color: C.cream }, flightLine: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 3 }, flightRule: { height: 1, flex: 1, backgroundColor: '#7a725a' }, flightDot: { height: 5, width: 5, borderRadius: 3, backgroundColor: C.gold },
  exampleLabel: { fontFamily: F.body, fontSize: 10, color: C.muted, marginTop: 7 }, tripDetails: { flexDirection: 'row', borderTopWidth: 1, borderColor: C.line, marginTop: 18, paddingTop: 14, gap: 18 }, tripDetail: { flex: 1 }, tripDetailTitle: { fontFamily: F.bodyMedium, fontSize: 13, color: C.cream }, tripDetailBody: { fontFamily: F.body, fontSize: 10, lineHeight: 17, color: C.muted, marginTop: 4 },
  checklistPreview: { padding: 20, backgroundColor: '#f8f4eb', borderWidth: 1, borderColor: '#d8d2c3', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }, checklistHeading: { flexDirection: 'row', gap: 8, alignItems: 'center' }, checklistTitle: { fontFamily: F.bodySemiBold, fontSize: 12, lineHeight: 18, color: C.ink, flex: 1 }, tryLabel: { fontFamily: F.bodySemiBold, fontSize: 8, letterSpacing: 1, color: C.paperMuted }, checklistRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 60, marginTop: 4 }, checkCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#8c967f', alignItems: 'center', justifyContent: 'center' }, checkCircleDone: { backgroundColor: C.forest, borderColor: C.forest }, checklistText: { fontFamily: F.body, color: C.ink, fontSize: 13, flex: 1 }, checkedText: { textDecorationLine: 'line-through', color: C.paperMuted }, tapLabel: { fontFamily: F.bodyMedium, fontSize: 10, color: C.paperMuted }, demoNote: { fontFamily: F.body, fontSize: 10, lineHeight: 16, color: C.paperMuted },
  beginContent: { flex: 1, paddingHorizontal: 28, paddingTop: 16, paddingBottom: 20, justifyContent: 'center' }, brandArtwork: { height: 200, marginBottom: 18, justifyContent: 'center' }, journeyArtwork: { width: '100%', height: '100%' }, privacyNote: { flexDirection: 'row', gap: 12, marginTop: 18, alignItems: 'center' }, privacyRule: { width: 2, height: 24, backgroundColor: '#756132' }, privacyText: { fontFamily: F.body, fontSize: 12, lineHeight: 20, color: C.muted },
  footer: { paddingHorizontal: 26, paddingTop: 12, paddingBottom: 12, backgroundColor: C.background }, paperFooter: { backgroundColor: C.paper }, progressHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, progressLabel: { fontFamily: F.bodyMedium, fontSize: 8, letterSpacing: 1.2 }, progressNumber: { fontFamily: F.bodyMedium, fontSize: 10 }, progressTrack: { flexDirection: 'row', gap: 5, marginTop: 10, marginBottom: 20 }, progressSegment: { flex: 1, height: 2, backgroundColor: '#35404e' }, paperSegment: { backgroundColor: '#cfc9bb' },
  primary: { minHeight: 56, borderRadius: 16, backgroundColor: C.paper, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 15 }, primaryText: { flex: 1, marginRight: 12, fontFamily: F.bodySemiBold, fontSize: 15, color: C.background }, paperPrimary: { backgroundColor: C.forest }, paperPrimaryText: { color: C.paper }, pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] }, secondary: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 5 }, secondaryText: { fontFamily: F.bodyMedium, fontSize: 13, color: C.gold },
});
