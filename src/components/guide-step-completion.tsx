import { AppIcon } from '@/components/app-icon';
import { TravelColors as C } from '@/constants/travel-design';
import { QasdFonts } from '@/constants/qasd-theme';
import { useGuideProgress, useJourneyProgress, useLearningProgress } from '@/hooks/use-local-progress';
import { UMRAH_STEPS } from '@/lib/umrah-steps';
import { learningTitle } from '@/lib/umrah-learning';
import { Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';

export function GuideStepCompletion({ id, learning = false, compact = false }: { id: string; learning?: boolean; compact?: boolean }) {
  const record = useGuideProgress();
  const journey = useJourneyProgress();
  const lesson = useLearningProgress();
  const step = UMRAH_STEPS.find(item => item.id === id);
  if (learning) {
    const reviewed = !!lesson.value.reviewed[id];
    return <TouchableOpacity
      accessibilityRole="checkbox"
      accessibilityState={{ checked: reviewed, disabled: !lesson.ready }}
      accessibilityLabel={`${step ? learningTitle(step) : 'Topic'}: reviewed`}
      disabled={!lesson.ready}
      style={{ minHeight: compact ? 44 : 58, flexDirection: 'row', alignItems: 'center', gap: 10, padding: compact ? 4 : 16, marginTop: compact ? 0 : 18, borderRadius: 16, backgroundColor: compact ? 'transparent' : reviewed ? C.forest : C.surface, borderWidth: compact ? 0 : 1, borderColor: C.line }}
      onPress={() => {
        void lesson.update(previous => ({ ...previous, lastStep: id, reviewed: { ...previous.reviewed, [id]: !previous.reviewed[id] } }));
        void Haptics.selectionAsync().catch(() => {});
      }}>
      <AppIcon name={reviewed ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={C.paper} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.paper, fontFamily: QasdFonts.bodySemiBold, fontSize: 15 }}>{reviewed ? 'Reviewed' : 'Mark as reviewed'}</Text>
        {!compact && <Text style={{ color: C.muted, fontFamily: QasdFonts.body, fontSize: 13, lineHeight: 19, marginTop: 3 }}>Saves your learning progress.</Text>}
      </View>
    </TouchableOpacity>;
  }
  const done = !!record.value.completed[id];
  const isCounterStep = id === 'tawaf-start' || id === 'sai-laps';
  const needsLaps = (id === 'tawaf-start' && record.value.counters.tawaf.count < 7)
    || (id === 'sai-laps' && record.value.counters.sai.count < 7);
  const needsSteps = id === 'complete' && UMRAH_STEPS.some(step => step.id !== 'complete' && !record.value.completed[step.id]);
  const disabled = !record.ready || isCounterStep || (!done && (needsLaps || needsSteps));
  return <TouchableOpacity
    accessibilityRole="button" accessibilityState={{ disabled }}
    accessibilityLabel={`${UMRAH_STEPS.find(step => step.id === id)?.title}: ${done ? 'completed, undo completion' : 'mark complete'}`}
    disabled={disabled}
    style={{ minHeight: compact ? 44 : 58, flexDirection: 'row', alignItems: 'center', gap: 10, padding: compact ? 4 : 16, marginTop: compact ? 0 : 18, borderRadius: 16, borderWidth: compact ? 0 : 1, borderColor: done ? '#526b5e' : C.line, backgroundColor: compact ? 'transparent' : done ? C.forest : C.surface, opacity: disabled ? 0.5 : 1 }}
    onPress={() => {
      void record.update(previous => ({ ...previous, lastStep: id, completed: { ...previous.completed, [id]: !done, ...(done ? { complete: false } : {}) } }));
      if (id === 'complete' || done) void journey.update(previous => ({ ...previous, 'umrah-rites': id === 'complete' && !done }));
      void Haptics.selectionAsync().catch(() => {});
    }}>
    <AppIcon name={done ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={C.paper} />
    <View style={{ flex: 1 }}>
      <Text style={{ color: C.paper, fontFamily: QasdFonts.bodySemiBold, fontSize: 15 }}>
        {isCounterStep && done ? '7 of 7 recorded · Step completed' : done ? 'Step completed' : needsLaps ? 'Record all 7 to complete this step' : needsSteps ? 'Complete the earlier steps first' : 'Mark step complete'}
      </Text>
      {done && !compact && <Text style={{ color: '#c4d2c7', fontFamily: QasdFonts.body, fontSize: 12, marginTop: 3 }}>{isCounterStep ? 'Use the counter to undo or reset' : 'Tap to undo completion'}</Text>}
    </View>
    {done && <AppIcon name="arrow-undo-outline" size={19} color={C.paper} />}
  </TouchableOpacity>;
}
