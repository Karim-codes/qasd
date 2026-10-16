import { GuideReader } from '@/components/guide-reader';
import { useGuideProgress, useLearningProgress } from '@/hooks/use-local-progress';
import { UMRAH_STEPS } from '@/lib/umrah-steps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function UmrahTopicScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ step?: string; mode?: string; pane?: string; from?: string }>();
  const index = Math.max(0, UMRAH_STEPS.findIndex(step => step.id === params.step));
  const learning = params.mode !== 'perform';
  const lessons = useLearningProgress();
  const rituals = useGuideProgress();
  const updateLessons = lessons.update;
  const updateRituals = rituals.update;
  const lastStep = UMRAH_STEPS[index].id;

  useEffect(() => {
    if (learning && lessons.ready) void updateLessons(previous => previous.lastStep === lastStep ? previous : { ...previous, lastStep });
    if (!learning && rituals.ready) void updateRituals(previous => previous.lastStep === lastStep ? previous : { ...previous, lastStep });
  }, [learning, lessons.ready, rituals.ready, updateLessons, updateRituals, lastStep]);

  const backLabel = params.from === 'overview' ? 'All topics' : params.from === 'saved' ? 'Saved du’as' : 'Guide';
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else if (params.from === 'overview') router.replace('/umrah-overview');
    else router.replace({ pathname: '/(tabs)/guide', params: { mode: learning ? 'learn' : 'perform' } });
  };
  return <GuideReader index={index} learning={learning} initialPane={params.pane === 'dua' ? 'dua' : 'guidance'}
    backLabel={backLabel} returnLabel={`Return to ${backLabel.toLowerCase()}`}
    onClose={goBack}
    onNavigate={next => {
      if (next >= 0 && next < UMRAH_STEPS.length) router.setParams({ step: UMRAH_STEPS[next].id, pane: 'guidance' });
    }}
  />;
}
