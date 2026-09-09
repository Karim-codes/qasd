import { HotelForm } from '@/components/hajj-setup/hotel-form';
import { Section } from '@/components/hajj-setup/form-primitives';
import { OnboardingShell } from '@/components/hajj-setup/onboarding-shell';
import { ToggleCard } from '@/components/hajj-setup/toggle-card';
import { useHajjSetup } from '@/context/hajj-setup-context';
import { useRouter } from 'expo-router';

export default function HajjMadinahScreen() {
  const router = useRouter();
  const { draft, update, updateMadinah } = useHajjSetup();

  const canContinue =
    !draft.visitMadinah ||
    (draft.madinahHotel.name.trim().length > 0 &&
      draft.madinahHotel.checkIn.length > 0 &&
      draft.madinahHotel.checkOut.length > 0);

  return (
    <OnboardingShell
      step={5}
      total={7}
      title={'Visiting\nMadinah?'}
      subtitle="Most pilgrims spend a few days near Masjid an-Nabawi."
      primaryLabel="Continue"
      primaryDisabled={!canContinue}
      onPrimary={() => router.push('/hajj-setup/camp')}
    >
      <ToggleCard
        title="Yes, I'll visit Madinah"
        subtitle="Add your stay near Masjid an-Nabawi"
        value={draft.visitMadinah}
        onValueChange={(v) => update({ visitMadinah: v })}
      />

      {draft.visitMadinah && (
        <Section icon="moon" tint="#a8c8ff" title="Stay in Madinah">
          <HotelForm city="Madinah" hotel={draft.madinahHotel} update={updateMadinah} required datesRequired />
        </Section>
      )}
    </OnboardingShell>
  );
}
