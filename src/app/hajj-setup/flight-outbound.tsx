import { FlightLegForm } from '@/components/hajj-setup/flight-leg-form';
import { OnboardingShell } from '@/components/hajj-setup/onboarding-shell';
import { useHajjSetup } from '@/context/hajj-setup-context';
import { useRouter } from 'expo-router';

export default function HajjOutboundScreen() {
  const router = useRouter();
  const { draft, updateOutbound } = useHajjSetup();

  const canContinue =
    draft.outbound.airline.trim().length > 0 &&
    draft.outbound.departureCity.trim().length > 0 &&
    draft.outbound.departureDate.length > 0 &&
    draft.outbound.arrivalCity.trim().length > 0 &&
    draft.outbound.arrivalDate.length > 0;

  return (
    <OnboardingShell
      step={2}
      total={7}
      title={'Your outbound\nflight'}
      subtitle="Heading to the Holy Land. Add the details below."
      primaryLabel="Continue"
      primaryDisabled={!canContinue}
      onPrimary={() => router.push('/hajj-setup/flight-return')}
    >
      <FlightLegForm
        variant="outbound"
        leg={draft.outbound}
        update={updateOutbound}
        departurePlaceholder="London (LHR)"
        arrivalPlaceholder="Jeddah (JED) or Madinah (MED)"
      />
    </OnboardingShell>
  );
}
