import { Palette } from '@/constants/qasd-theme';
import { ItineraryProvider } from '@/context/itinerary-context';
import {
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: 'index',
};

const QasdDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Palette.background,
    card: Palette.cardBg,
    primary: Palette.gold,
    text: Palette.textPrimary,
    border: Palette.border,
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Palette.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Palette.gold} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Palette.background }}>
      <ItineraryProvider>
        <ThemeProvider value={QasdDarkTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Palette.background },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="choose-trip" options={{ presentation: 'card' }} />
            <Stack.Screen name="umrah-setup" options={{ presentation: 'card' }} />
            <Stack.Screen name="hajj-setup" options={{ presentation: 'card' }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="hajj-guide" options={{ presentation: 'card' }} />
            <Stack.Screen name="umrah-guide" options={{ presentation: 'card' }} />
            <Stack.Screen name="stays" options={{ presentation: 'card' }} />
            <Stack.Screen name="settings" options={{ presentation: 'card' }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </ItineraryProvider>
    </GestureHandlerRootView>
  );
}
