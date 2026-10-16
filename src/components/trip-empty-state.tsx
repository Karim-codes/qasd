import { useTabContentInset } from '@/hooks/use-tab-content-inset';
import { AppIcon } from '@/components/app-icon';
import { Palette, QasdFonts as F } from '@/constants/qasd-theme';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function TripEmptyState({ flights = false }: { flights?: boolean }) {
  const contentInset = useTabContentInset();
  const router = useRouter();
  return <SafeAreaView style={s.container} edges={['top']}>
    <ScrollView contentContainerStyle={[s.content, { paddingBottom: contentInset }]} showsVerticalScrollIndicator={false}>
      <Text style={s.title}>{flights ? 'Your flights' : 'Your journey'}</Text>
      <View style={s.card}>
        <AppIcon name={flights ? 'airplane-outline' : 'map-outline'} size={30} color="#263c36" />
        <Text style={s.cardTitle}>Your trip can come later.</Text>
        <Text style={s.body}>{flights ? 'Keep your flight details here when you have them.' : 'Bring your route, stays and travel dates together when you’re ready.'} You can explore the guide and prepare anytime.</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/umrah-setup/destination')} style={s.button}><Text style={s.buttonText}>Add a trip</Text><AppIcon name="arrow-forward" size={21} color="#fffaf0" /></TouchableOpacity>
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={() => router.navigate('/(tabs)/guide')} style={s.guide}><Text style={s.link}>Explore the Umrah guide</Text><AppIcon name="arrow-forward" size={19} color={Palette.gold} /></TouchableOpacity>
    </ScrollView>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  content: { padding: 24, paddingBottom: 120, maxWidth: 640, width: '100%', alignSelf: 'center' },
  title: { fontFamily: F.bodySemiBold, fontSize: 28, lineHeight: 35, color: Palette.textPrimary, marginBottom: 24 },
  card: { borderRadius: 22, padding: 22, backgroundColor: '#eee7d8' },
  cardTitle: { fontFamily: F.bodySemiBold, fontSize: 24, lineHeight: 31, color: '#202b2a', marginTop: 20 },
  body: { fontFamily: F.body, fontSize: 16, lineHeight: 24, color: '#655f52', marginTop: 10 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 16, minHeight: 56, borderRadius: 12, backgroundColor: '#263c36', marginTop: 22 },
  buttonText: { flex: 1, fontFamily: F.bodySemiBold, fontSize: 16, color: '#fffaf0' },
  guide: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  link: { fontFamily: F.bodyMedium, fontSize: 15, color: Palette.gold },
});
