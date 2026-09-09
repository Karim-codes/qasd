import { HotelForm } from '@/components/hajj-setup/hotel-form';
import { Section } from '@/components/hajj-setup/form-primitives';
import { OnboardingShell } from '@/components/hajj-setup/onboarding-shell';
import { Palette } from '@/constants/qasd-theme';
import { useHajjSetup } from '@/context/hajj-setup-context';
import { useRouter } from 'expo-router';

export default function HajjMakkahScreen() {
  const router = useRouter();
  const { draft, updateMakkah } = useHajjSetup();

  const canContinue =
    draft.makkahHotel.name.trim().length > 0 &&
    draft.makkahHotel.checkIn.length > 0 &&
    draft.makkahHotel.checkOut.length > 0;

  return (
    <OnboardingShell
      step={4}
      total={7}
      title={'Where you\u2019re\nstaying in Makkah'}
      subtitle="Hotel, apartment, or Airbnb — anywhere you'll rest your head."
      primaryLabel="Continue"
      primaryDisabled={!canContinue}
      onPrimary={() => router.push('/hajj-setup/hotel-madinah')}
    >
      <Section icon="business" tint={Palette.gold} title="Stay in Makkah">
        <HotelForm city="Makkah" hotel={draft.makkahHotel} update={updateMakkah} required datesRequired />
      </Section>
    </OnboardingShell>
  );
}
