import { AppIcon } from '@/components/app-icon';
import { QasdFonts } from '@/constants/qasd-theme';
import { TravelColors as C, TravelType as T } from '@/constants/travel-design';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function JourneyReady({ umrah = false }: { umrah?: boolean }) {
  const router = useRouter();
  return <SafeAreaView style={s.container} edges={['top', 'bottom']}>
    <ScrollView contentContainerStyle={s.content}>
      <Text style={T.eyebrow}>{umrah ? 'YOUR UMRAH BEGINS' : 'YOUR HAJJ BEGINS'}</Text>
      <Text style={[T.title, { marginTop: 14, marginBottom: 12 }]}>Your journey{ '\n' }is ready.</Text>
      <Text style={T.body}>Your itinerary is in place. Take the next step at your own pace.</Text>
      <View style={s.card}>
        <View style={s.icon}><AppIcon name="checkmark" size={26} color={C.paper} /></View>
        <Text style={s.arabic}>بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Text>
        <Text style={s.translation}>In the name of Allah, the Most Gracious, the Most Merciful.</Text>
        <View style={s.line} /><Text style={s.blessing}>May your {umrah ? 'Umrah' : 'Hajj'} be accepted and your journey made easy.</Text>
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={() => router.replace('/(tabs)')} style={s.button}><Text style={s.buttonText}>Open my itinerary</Text><AppIcon name="arrow-forward" size={21} color={C.paper} /></TouchableOpacity>
    </ScrollView>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, width: '100%', maxWidth: 640, alignSelf: 'center' },
  card: { backgroundColor: C.paper, borderRadius: 24, padding: 26, marginVertical: 30 },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.forest, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  arabic: { fontSize: 30, lineHeight: 50, color: C.ink, textAlign: 'right' },
  translation: { ...T.body, color: C.paperMuted, marginTop: 18 },
  line: { height: 1, backgroundColor: '#cec6b5', marginVertical: 22 },
  blessing: { ...T.section, fontSize: 26, lineHeight: 32, color: C.ink },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, borderRadius: 14, backgroundColor: C.forest, padding: 18 },
  buttonText: { fontFamily: QasdFonts.bodySemiBold, fontSize: 16, color: C.paper },
});
