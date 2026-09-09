import { FlightLegForm } from '@/components/hajj-setup/flight-leg-form';
import { OnboardingShell } from '@/components/hajj-setup/onboarding-shell';
import { useHajjSetup } from '@/context/hajj-setup-context';
import { useRouter } from 'expo-router';

export default function HajjReturnScreen() {
  const router = useRouter();
  const { draft, updateReturn } = useHajjSetup();

  const canContinue =
    draft.return.airline.trim().length > 0 &&
    draft.return.departureCity.trim().length > 0 &&
    draft.return.departureDate.length > 0 &&
    draft.return.arrivalCity.trim().length > 0 &&
    draft.return.arrivalDate.length > 0;

  return (
    <OnboardingShell
      step={3}
      total={7}
      title={'Your return\nflight'}
      subtitle="Heading back home, in shaa Allah."
      primaryLabel="Continue"
      primaryDisabled={!canContinue}
      onPrimary={() => router.push('/hajj-setup/hotel-makkah')}
    >
      <FlightLegForm
        variant="return"
        leg={draft.return}
        update={updateReturn}
        departurePlaceholder="Jeddah (JED) or Madinah (MED)"
        arrivalPlaceholder="London (LHR)"
      />
    </OnboardingShell>
  );
}
