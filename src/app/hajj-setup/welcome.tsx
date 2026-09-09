import { AppIcon } from '@/components/app-icon';
import { OnboardingShell } from '@/components/hajj-setup/onboarding-shell';
import { TravelColors as C, TravelType as T } from '@/constants/travel-design';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

export default function HajjSetupWelcome() {
  const router = useRouter();
  return <OnboardingShell step={0} total={7} title={'Let’s plan\nyour Hajj.'} subtitle="Bring your flights, stays and camp together. We’ll keep the details close throughout your pilgrimage." primaryLabel="Begin setup" onPrimary={() => router.push('/hajj-setup/name')}>
    <View style={{ backgroundColor: C.paper, borderRadius: 22, padding: 24 }}>
      <View style={{ width: 56, height: 60, backgroundColor: '#ded5c1', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}><AppIcon name="compass-outline" size={30} color={C.paperMuted} /></View>
      <Text style={[T.section, { color: C.ink, marginBottom: 8 }]}>A place for every detail.</Text>
      <Text style={[T.body, { color: C.paperMuted, marginBottom: 24 }]}>Seven short steps. Add what you know now and update the rest when you’re ready.</Text>
      {([{ icon: 'airplane-outline', text: 'Flights, hotels and your camp' }, { icon: 'book-outline', text: 'Hajj and Umrah guidance' }, { icon: 'create-outline', text: 'Edit your plans later in Settings' }] as const).map(item => <View key={item.text} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderColor: '#d2cbbb' }}><AppIcon name={item.icon} size={21} color={C.paperMuted} /><Text style={[T.body, { flex: 1, color: C.ink, fontSize: 14 }]}>{item.text}</Text></View>)}
    </View>
  </OnboardingShell>;
}
