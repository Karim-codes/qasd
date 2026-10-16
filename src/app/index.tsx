import { Palette } from '@/constants/qasd-theme';
import { useItinerary } from '@/context/itinerary-context';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function EntryScreen() {
  const { isLoading } = useItinerary();
  if (isLoading) return <View style={{ flex: 1, backgroundColor: Palette.background, alignItems: 'center', justifyContent: 'center' }}>
    <ActivityIndicator color={Palette.gold} />
  </View>;
  return <Redirect href="/(tabs)" />;
}
