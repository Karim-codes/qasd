import { AppIcon } from '@/components/app-icon';
import { TravelColors as C } from '@/constants/travel-design';
import { QasdFonts } from '@/constants/qasd-theme';
import { useGuideProgress, useJourneyProgress } from '@/hooks/use-local-progress';
import { UMRAH_STEPS } from '@/lib/umrah-steps';
import { Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';

export function GuideStepCompletion({ id }: { id: string }) {
  const record = useGuideProgress();
  const journey = useJourneyProgress();
  const done = !!record.value.completed[id];
  const needsLaps = (id === 'tawaf-start' && record.value.counters.tawaf.count < 7)
    || (id === 'sai-laps' && record.value.counters.sai.count < 7);
  const needsSteps = id === 'complete' && UMRAH_STEPS.some(step => step.id !== 'complete' && !record.value.completed[step.id]);
  const disabled = !record.ready || (!done && (needsLaps || needsSteps));
  return <TouchableOpacity
    accessibilityRole="button" accessibilityState={{ disabled }}
    accessibilityLabel={`${UMRAH_STEPS.find(step => step.id === id)?.title}: ${done ? 'completed, undo completion' : 'mark complete'}`}
    disabled={disabled}
    style={{ minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, marginTop: 18, borderRadius: 16, borderWidth: 1, borderColor: done ? '#526b5e' : C.line, backgroundColor: done ? C.forest : C.surface, opacity: disabled ? 0.5 : 1 }}
    onPress={() => {
      void record.update(previous => ({ ...previous, lastStep: id, completed: { ...previous.completed, [id]: !done, ...(done ? { complete: false } : {}) } }));
      if (id === 'complete' || done) void journey.update(previous => ({ ...previous, 'umrah-rites': id === 'complete' && !done }));
      void Haptics.selectionAsync().catch(() => {});
    }}>
    <AppIcon name={done ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={C.paper} />
    <View style={{ flex: 1 }}>
      <Text style={{ color: C.paper, fontFamily: QasdFonts.bodySemiBold, fontSize: 15 }}>
        {done ? 'Step completed' : needsLaps ? 'Record all 7 to complete this step' : needsSteps ? 'Complete the earlier steps first' : 'Mark step complete'}
      </Text>
      {done && <Text style={{ color: '#c4d2c7', fontFamily: QasdFonts.body, fontSize: 12, marginTop: 3 }}>Tap to undo completion</Text>}
    </View>
    {done && <AppIcon name="arrow-undo-outline" size={19} color={C.paper} />}
  </TouchableOpacity>;
}
