import { LocalSaveStatus } from '@/components/local-save-status';
import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { useGuideProgress, useJourneyProgress } from '@/hooks/use-local-progress';
import { changeCounter, type CounterId } from '@/lib/progress';
import { AppIcon as Ionicons } from '@/components/app-icon';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function LapCounter({ id }: { id: CounterId }) {
  const record = useGuideProgress();
  const journey = useJourneyProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const count = record.value.counters[id].count;
  const title = id === 'tawaf' ? 'Tawaf' : 'Sa’i';
  const change = (action: 'add' | 'undo' | 'reset') => {
    let accepted = false;
    let completed = false;
    void record.update(previous => {
      const next = changeCounter(previous, id, action, Date.now());
      accepted = next !== previous;
      completed = next.counters[id].count === 7;
      return next;
    });
    if (!accepted) return;
    if (action !== 'add') void journey.update(previous => ({ ...previous, 'umrah-rites': false }));
    if (completed) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    else void Haptics.impactAsync(action === 'add' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };
  return (
    <View style={s.card}>
      <View style={s.row}>
        <Text style={s.title}>{title} counter</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Reset ${title} counter`} disabled={!record.ready || count === 0 || confirmReset} onPress={() => setConfirmReset(true)} style={s.reset}>
          <Text style={[s.muted, count === 0 && s.disabled]}>Reset</Text>
        </TouchableOpacity>
      </View>
      <Text accessibilityLiveRegion="polite" accessibilityLabel={`${count} of 7 ${id === 'tawaf' ? 'rounds' : 'lengths'} completed`} style={s.count}>{record.ready ? count : '—'}<Text style={s.total}> / 7</Text></Text>
      <View style={s.dots}>{Array.from({ length: 7 }, (_, index) => <View key={index} style={[s.dot, index < count && s.done]} />)}</View>
      <Text style={s.hint}>{count === 7 ? `${title} count complete` : id === 'sai' ? `Next: ${count % 2 === 0 ? 'Safa → Marwa' : 'Marwa → Safa'}` : `Complete round ${count + 1}, then tap below.`}</Text>
      {id === 'sai' && <Text style={s.muted}>One way counts as one length. Finish at Marwa.</Text>}
      <View style={[s.row, { gap: 10, marginTop: 18 }]}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Undo last ${title} count`} disabled={!record.ready || count === 0 || confirmReset} onPress={() => change('undo')} style={[s.undo, count === 0 && s.disabled]}>
          <Ionicons name="arrow-undo-outline" size={22} color={Palette.textPrimary} />
          <Text style={s.muted}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={count === 7 ? `${title} count complete` : `Record completed ${id === 'tawaf' ? 'round' : 'length'} ${count + 1}`} disabled={!record.ready || count === 7 || confirmReset} onPress={() => change('add')} style={[s.add, (!record.ready || count === 7) && s.disabled]}>
          <Text style={s.addText}>{count === 7 ? '7 of 7 complete' : id === 'tawaf' ? 'Round completed' : 'Length completed'}</Text>
        </TouchableOpacity>
      </View>
      <LocalSaveStatus record={record} />
      {confirmReset && <View style={s.dialog} accessibilityLiveRegion="polite">
        <Text style={s.title}>Reset {title} to zero?</Text>
        <Text style={[s.hint, { textAlign: 'left' }]}>This clears your {count} saved {id === 'tawaf' ? 'rounds' : 'lengths'}. Your other counter stays as it is.</Text>
        <TouchableOpacity style={s.add} accessibilityRole="button" onPress={() => setConfirmReset(false)}><Text style={s.addText}>Keep my count</Text></TouchableOpacity>
        <TouchableOpacity style={s.reset} accessibilityRole="button" onPress={() => { change('reset'); setConfirmReset(false); }}><Text style={{ color: Palette.red, fontSize: 16 }}>Reset to zero</Text></TouchableOpacity>
      </View>}
    </View>
  );
}
const s = StyleSheet.create({
  card: { marginTop: 18, padding: 18, borderRadius: 18, backgroundColor: '#101a2d' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: QasdFonts.bodySemiBold, fontSize: 18, color: Palette.textPrimary },
  count: { fontFamily: QasdFonts.bodyMedium, fontSize: 64, color: Palette.textPrimary, textAlign: 'center', fontVariant: ['tabular-nums'] },
  total: { fontSize: 24, color: Palette.textSecondary },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 10 },
  dot: { width: 16, height: 6, borderRadius: 3, backgroundColor: '#33405a' },
  done: { backgroundColor: Palette.gold },
  hint: { fontFamily: QasdFonts.bodyMedium, fontSize: 16, lineHeight: 24, color: Palette.textPrimary, textAlign: 'center', marginVertical: 8 },
  muted: { fontFamily: QasdFonts.body, fontSize: 13, color: Palette.textSecondary },
  add: { flexGrow: 1, flexShrink: 1, minHeight: 58, padding: 12, backgroundColor: Palette.gold, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addText: { fontFamily: QasdFonts.bodySemiBold, fontSize: 16, color: '#101a2d', textAlign: 'center' },
  undo: { minWidth: 56, minHeight: 58, alignItems: 'center', justifyContent: 'center', gap: 4 },
  reset: { minHeight: 44, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.4 },
  backdrop: { flex: 1, padding: 24, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center' },
  dialog: { padding: 24, gap: 14, borderRadius: 22, backgroundColor: Palette.cardBg },
});
