import { AppIcon } from '@/components/app-icon';
import { LocalSaveStatus } from '@/components/local-save-status';
import { Palette, QasdFonts as F } from '@/constants/qasd-theme';
import { usePreparationChecklist } from '@/hooks/use-local-progress';
import { checklistSummary } from '@/lib/checklist';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function PreparationRow() {
  const router = useRouter();
  const record = usePreparationChecklist();
  const summary = checklistSummary(record.value);
  const status = !record.ready ? 'Your checklist' : summary.remaining === 0 ? 'Your checklist is complete' : `${summary.remaining} items remaining`;
  return <>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Open preparation checklist. ${status}`} onPress={() => router.push('/checklist')} style={s.row}>
      <AppIcon name="checkmark-done-outline" size={22} color={Palette.gold} />
      <View style={s.copy}>
        <Text style={s.title}>Preparation</Text>
        <Text style={s.status}>{status}</Text>
      </View>
      <AppIcon name="chevron-forward" size={19} color={Palette.textSecondary} />
    </TouchableOpacity>
    {(record.error || record.saving) && <LocalSaveStatus record={record} />}
  </>;
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2a3341' },
  copy: { flex: 1, minWidth: 0 },
  title: { color: Palette.textPrimary, fontFamily: F.bodyMedium, fontSize: 15 },
  status: { color: Palette.textSecondary, fontFamily: F.body, fontSize: 12, lineHeight: 18, marginTop: 2 },
});
