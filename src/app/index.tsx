import { Image } from 'react-native';
import { AppIcon } from '@/components/app-icon';
import { QasdFonts } from '@/constants/qasd-theme';
import { TravelColors as C, TravelType as T } from '@/constants/travel-design';
import { useItinerary } from '@/context/itinerary-context';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, ActivityIndicator, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();
  const focused = useIsFocused();
  const { hasData, isLoading } = useItinerary();
  const cardReveal = useRef(new Animated.Value(0)).current;
  const ayahReveal = useRef(new Animated.Value(0)).current;
  const meaningReveal = useRef(new Animated.Value(0)).current;
  const ruleReveal = useRef(new Animated.Value(0)).current;
  useEffect(() => { if (focused && !isLoading && hasData) router.replace('/(tabs)'); }, [focused, isLoading, hasData, router]);
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then(reduceMotion => {
      if (cancelled) return;
      if (reduceMotion) {
        [cardReveal, ayahReveal, meaningReveal, ruleReveal].forEach(value => value.setValue(1));
        return;
      }
      Animated.sequence([
        Animated.timing(cardReveal, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(ayahReveal, { toValue: 1, duration: 650, useNativeDriver: true }),
          Animated.timing(ruleReveal, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
        Animated.timing(meaningReveal, { toValue: 1, duration: 480, useNativeDriver: true }),
      ]).start();
    });
    return () => { cancelled = true; };
  }, [ayahReveal, cardReveal, meaningReveal, ruleReveal]);
  if (isLoading || hasData) return <View style={s.loading}><ActivityIndicator color={C.gold} /></View>;
  return <SafeAreaView style={s.container} edges={['top', 'bottom']}>
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.brandRow}><Text style={s.brand}>Qasd</Text><Image source={require("@assets/brand/icon.png")} accessibilityLabel="Qasd" style={{ width: 48, height: 48, borderRadius: 13 }} /></View>
      <Text style={T.eyebrow}>FOR YOUR SACRED JOURNEY</Text>
      <Text style={[T.title, { fontSize: 46, lineHeight: 51, marginTop: 14 }]}>Your journey,{ '\n' }close at hand.</Text>
      <Text style={[T.body, { marginTop: 16 }]}>Flights, stays and step-by-step guidance for Hajj and Umrah. All in one place.</Text>
      <Animated.View style={[s.card, { opacity: cardReveal, transform: [{ translateY: cardReveal.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }]}> 
        <Animated.Text style={[s.arabic, { opacity: ayahReveal, transform: [{ translateY: ayahReveal.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>وَأَذِّن فِي ٱلنَّاسِ بِٱلْحَجِّ يَأْتُوكَ رِجَالًا</Animated.Text>
        <View style={s.ayahRuleTrack}><Animated.View style={[s.ayahRule, { transform: [{ scaleX: ruleReveal }] }]} /></View>
        <Animated.View style={{ opacity: meaningReveal, transform: [{ translateY: meaningReveal.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
          <Text style={s.quote}>“And proclaim to the people the Hajj; they will come to you on foot…”</Text>
          <Text style={s.source}>Surah Al-Hajj · 22:27</Text>
        </Animated.View>
      </Animated.View>
      <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/choose-trip')} style={s.button}><Text style={s.buttonText}>Plan my journey</Text><AppIcon name="arrow-forward" size={21} color={C.paper} /></TouchableOpacity>
      <Text style={s.note}>Made for the journey. Ready for each step.</Text>
    </ScrollView>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background }, loading: { flex: 1, backgroundColor: C.background, alignItems: 'center', justifyContent: 'center' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, width: '100%', maxWidth: 640, alignSelf: 'center' },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 42 },
  brand: { fontFamily: QasdFonts.displayMedium, fontSize: 36, color: C.cream },
  card: { backgroundColor: C.paper, borderRadius: 22, padding: 26, marginVertical: 30 },
  arabic: { fontSize: 29, lineHeight: 46, color: C.ink, textAlign: 'right' },
  ayahRuleTrack: { height: 1, backgroundColor: '#d7cfbd', marginTop: 18, overflow: 'hidden' },
  ayahRule: { flex: 1, backgroundColor: C.gold },
  quote: { ...T.body, color: C.paperMuted, marginTop: 20 },
  source: { ...T.label, color: C.paperMuted, marginTop: 16 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, backgroundColor: C.forest, minHeight: 56, padding: 18 },
  buttonText: { fontFamily: QasdFonts.bodySemiBold, fontSize: 16, color: C.paper },
  note: { ...T.label, textAlign: 'center', marginTop: 20 },
});
