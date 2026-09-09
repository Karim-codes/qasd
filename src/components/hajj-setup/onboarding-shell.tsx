import { AppIcon } from '@/components/app-icon';
import { QasdFonts } from '@/constants/qasd-theme';
import { TravelColors as C, TravelType as T } from '@/constants/travel-design';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  step: number; total: number; title: string; subtitle?: string; children: ReactNode;
  primaryLabel: string; onPrimary: () => void; primaryDisabled?: boolean;
  onSkip?: () => void; skipLabel?: string; onBack?: () => void; hideBack?: boolean;
}
export function OnboardingShell({ step, total, title, subtitle, children, primaryLabel, onPrimary, primaryDisabled, onSkip, skipLabel = 'Skip for now', onBack, hideBack }: Props) {
  const router = useRouter();
  return <SafeAreaView style={s.container} edges={['top', 'bottom']}>
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}>
        {(!hideBack || onBack) ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => onBack ? onBack() : router.back()} style={s.back}><AppIcon name="arrow-back" size={21} color={C.cream} /></TouchableOpacity> : <View style={{ width: 44 }} />}
        <Text style={T.eyebrow}>MAKE IT YOUR JOURNEY</Text>
        <Text style={T.label}>{step > 0 ? `${step}/${total}` : ''}</Text>
      </View>
      {step > 0 && <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: step }} accessibilityLabel="Setup progress" style={s.progress}>
        {Array.from({ length: total }, (_, index) => <View key={index} style={[s.segment, index < step && { backgroundColor: '#c8b78f' }]} />)}
      </View>}
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={T.title}>{title}</Text>
        {subtitle && <Text style={[T.body, { marginTop: 10 }]}>{subtitle}</Text>}
        <View style={{ marginTop: 26 }}>{children}</View>
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: !!primaryDisabled }} disabled={primaryDisabled} onPress={onPrimary} style={[s.primary, primaryDisabled && { opacity: 0.45 }]}>
          <Text style={s.primaryText}>{primaryLabel}</Text><AppIcon name="arrow-forward" size={20} color={C.paper} />
        </TouchableOpacity>
        {onSkip && <TouchableOpacity accessibilityRole="button" onPress={onSkip} style={s.skip}><Text style={T.label}>{skipLabel}</Text></TouchableOpacity>}
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background }, flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 18, width: '100%', maxWidth: 640, alignSelf: 'center' },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: C.line, justifyContent: 'center', alignItems: 'center' },
  progress: { flexDirection: 'row', gap: 6, marginHorizontal: 24, marginBottom: 26, maxWidth: 592, width: '88%', alignSelf: 'center' },
  segment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: C.line },
  body: { paddingHorizontal: 24, paddingBottom: 24, width: '100%', maxWidth: 640, alignSelf: 'center' },
  footer: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 12, width: '100%', maxWidth: 640, alignSelf: 'center', borderTopWidth: 1, borderColor: C.line },
  primary: { minHeight: 56, paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, backgroundColor: C.forest, borderWidth: 1, borderColor: '#52675d', borderRadius: 14 },
  primaryText: { flex: 1, fontFamily: QasdFonts.bodySemiBold, fontSize: 16, color: C.paper },
  skip: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
