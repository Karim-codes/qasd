import { HotelForm } from '@/components/hajj-setup/hotel-form';
import { Field, Input, Section } from '@/components/hajj-setup/form-primitives';
import { OnboardingShell } from '@/components/hajj-setup/onboarding-shell';
import { Palette } from '@/constants/qasd-theme';
import { routeMadinahFirst, routeVisitsMadinah, useUmrahSetup } from '@/context/umrah-setup-context';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';

export default function UmrahDetailsScreen() {
  const router = useRouter();
  const { draft, update, updateMakkah, updateMadinah } = useUmrahSetup();

  const visitsMadinah = routeVisitsMadinah(draft.route);
  const madinahFirst = routeMadinahFirst(draft.route);

  const canContinue =
    draft.pilgrimName.trim().length > 0 && draft.makkahHotel.name.trim().length > 0;

  // Derive minimumDate from the departure date so hotel pickers can't go into the past
  const tripMinDate = useMemo(() => {
    if (!draft.departureDate) return new Date();
    const [y, m, d] = draft.departureDate.split('-').map(Number);
    if (y && m && d) return new Date(y, m - 1, d);
    return new Date();
  }, [draft.departureDate]);

  const makkahSection = (
    <Section icon="business" tint={Palette.gold} title="Stay in Makkah">
      <HotelForm city="Makkah" hotel={draft.makkahHotel} update={updateMakkah} required minimumDate={tripMinDate} />
    </Section>
  );

  const madinahSection = visitsMadinah ? (
    <Section icon="moon" tint={Palette.gold} title="Stay in Madinah">
      <HotelForm city="Madinah" hotel={draft.madinahHotel} update={updateMadinah} minimumDate={tripMinDate} />
    </Section>
  ) : null;

  return (
    <OnboardingShell
      step={3}
      total={4}
      title={'A few\ndetails'}
      subtitle="Just your name and where you'll be staying — everything else we handle."
      primaryLabel="Continue"
      primaryDisabled={!canContinue}
      onPrimary={() => router.push('/umrah-setup/review')}
    >
      <Section icon="person" tint={Palette.gold} title="Pilgrim">
        <Field label="Your name" required>
          <Input
            value={draft.pilgrimName}
            onChangeText={(v) => update({ pilgrimName: v })}
            placeholder="e.g. Abdikarim Ahmed"
            returnKeyType="done"
          />
        </Field>
      </Section>

      {madinahFirst ? (
        <>
          {madinahSection}
          {makkahSection}
        </>
      ) : (
        <>
          {makkahSection}
          {madinahSection}
        </>
      )}
    </OnboardingShell>
  );
}
