import { Field, Input } from '@/components/hajj-setup/form-primitives';
import { OnboardingShell } from '@/components/hajj-setup/onboarding-shell';
import { useHajjSetup } from '@/context/hajj-setup-context';
import { useRouter } from 'expo-router';

export default function HajjSetupName() {
  const router = useRouter();
  const { draft, update } = useHajjSetup();

  const canContinue = draft.pilgrimName.trim().length > 0;

  return (
    <OnboardingShell
      step={1}
      total={7}
      title={'What\u2019s your\nname?'}
      subtitle="We'll use it to personalise your itinerary."
      primaryLabel="Continue"
      primaryDisabled={!canContinue}
      onPrimary={() => router.push('/hajj-setup/flight-outbound')}
    >
      <Field label="Full name" required>
        <Input
          value={draft.pilgrimName}
          onChangeText={(v) => update({ pilgrimName: v })}
          placeholder="e.g. Abdikarim Ahmed"
          autoFocus
          returnKeyType="done"
        />
      </Field>
    </OnboardingShell>
  );
}
