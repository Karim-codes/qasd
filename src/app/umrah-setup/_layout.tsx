import { UmrahSetupProvider } from '@/context/umrah-setup-context';
import { Stack } from 'expo-router';

export default function UmrahSetupLayout() {
  return (
    <UmrahSetupProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="destination" />
        <Stack.Screen name="dates" />
        <Stack.Screen name="details" />
        <Stack.Screen name="review" />
        <Stack.Screen
          name="bismillah"
          options={{ gestureEnabled: false, animation: 'fade' }}
        />
      </Stack>
    </UmrahSetupProvider>
  );
}
