import { AppIcon } from '@/components/app-icon';
import { LocalSaveStatus } from '@/components/local-save-status';
import { Palette, QasdFonts as F } from '@/constants/qasd-theme';
import { usePreparationChecklist } from '@/hooks/use-local-progress';
import { checklistItems, checklistSummary } from '@/lib/checklist';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function PreparationRow() {
  const router = useRouter();
  const record = usePreparationChecklist();
  const summary = checklistSummary(record.value);
  const remaining = checklistItems(record.value).filter(item => !record.value.completed[item.id]);
  const status = !record.ready ? 'Your checklist' : summary.remaining === 0 ? 'Your checklist is complete' : `${summary.remaining} items remaining`;
  return <>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Open preparation checklist. ${status}`} onPress={() => router.push('/checklist')} style={s.row}>
      <View style={s.icon}><AppIcon name="checkmark-done-outline" size={24} color={Palette.gold} /></View>
      <View style={s.copy}>
        <Text style={s.title}>Preparation</Text>
        <Text style={s.status}>{status}</Text>
        {record.ready && remaining.length > 0 && <Text numberOfLines={2} style={s.detail}>{remaining.slice(0, 2).map(item => item.title).join(' · ')}</Text>}
      </View>
      <AppIcon name="chevron-forward" size={19} color={Palette.textSecondary} />
    </TouchableOpacity>
    {(record.error || record.saving) && <LocalSaveStatus record={record} />}
  </>;
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 22, borderBottomWidth: 1, borderBottomColor: '#2a3341' },
  icon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#252e39', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0 },
  title: { color: Palette.textPrimary, fontFamily: F.bodySemiBold, fontSize: 17 },
  status: { color: Palette.textSecondary, fontFamily: F.bodyMedium, fontSize: 14, lineHeight: 21, marginTop: 3 },
  detail: { color: Palette.textSecondary, fontFamily: F.body, fontSize: 13, lineHeight: 20, marginTop: 3 },
});
