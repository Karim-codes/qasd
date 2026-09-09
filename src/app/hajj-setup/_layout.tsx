import { HajjSetupProvider } from '@/context/hajj-setup-context';
import { Stack } from 'expo-router';

export default function HajjSetupLayout() {
  return (
    <HajjSetupProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="welcome" />
        <Stack.Screen name="name" />
        <Stack.Screen name="flight-outbound" />
        <Stack.Screen name="flight-return" />
        <Stack.Screen name="hotel-makkah" />
        <Stack.Screen name="hotel-madinah" />
        <Stack.Screen name="camp" />
        <Stack.Screen name="review" />
        <Stack.Screen
          name="celebration"
          options={{ gestureEnabled: false, animation: 'fade' }}
        />
      </Stack>
    </HajjSetupProvider>
  );
}
