import { Palette } from '@/constants/qasd-theme';
import { useItinerary } from '@/context/itinerary-context';
import { hasCompletedOnboarding } from '@/lib/onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function EntryScreen() {
  const { isLoading } = useItinerary();
  const [welcomed, setWelcomed] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    void hasCompletedOnboarding(AsyncStorage).then(value => { if (active) setWelcomed(value); });
    return () => { active = false; };
  }, []);
  if (isLoading || welcomed === null) return <View style={{ flex: 1, backgroundColor: Palette.background, alignItems: 'center', justifyContent: 'center' }}>
    <ActivityIndicator color={Palette.gold} />
  </View>;
  return <Redirect href={welcomed ? '/(tabs)' : '/onboarding'} />;
}
