import { Field, Input, Section } from '@/components/hajj-setup/form-primitives';
import { OnboardingShell } from '@/components/hajj-setup/onboarding-shell';
import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { useHajjSetup } from '@/context/hajj-setup-context';
import { AppIcon as Ionicons } from '@/components/app-icon';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function HajjCampScreen() {
  const router = useRouter();
  const { draft, update } = useHajjSetup();

  return (
    <OnboardingShell
      step={6}
      total={7}
      title={'Your Mina\ncamp'}
      subtitle="If your group has assigned a camp, add its name. Otherwise, skip."
      primaryLabel="Continue"
      onPrimary={() => router.push('/hajj-setup/review')}
      onSkip={() => {
        update({ campName: '' });
        router.push('/hajj-setup/review');
      }}
      skipLabel="Skip"
    >
      <Section icon="bonfire" tint={Palette.gold} title="Mina camp (optional)">
        <Field label="Camp name">
          <Input
            value={draft.campName}
            onChangeText={(v) => update({ campName: v })}
            placeholder="e.g. AlMuaisim Camp"
          />
        </Field>
      </Section>

      <View style={s.hint}>
        <Ionicons name="information-circle-outline" size={16} color={Palette.gold} />
        <Text style={s.hintText}>
          You can always add this later from Settings once your provider confirms.
        </Text>
      </View>
    </OnboardingShell>
  );
}

const s = StyleSheet.create({
  hint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(201,168,76,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  hintText: {
    flex: 1,
    fontFamily: QasdFonts.body,
    fontSize: 12,
    color: Palette.textSecondary,
    lineHeight: 18,
  },
});
