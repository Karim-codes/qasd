import { UmrahOverview } from '@/components/umrah-overview';
import { UMRAH_CHAPTERS } from '@/lib/umrah-learning';
import { UMRAH_STEPS } from '@/lib/umrah-steps';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function UmrahOverviewScreen() {
  const router = useRouter();
  const { stage } = useLocalSearchParams<{ stage?: string }>();
  const parsedStage = Number(stage);
  const initialStage = Number.isInteger(parsedStage) && parsedStage >= 0 && parsedStage < UMRAH_CHAPTERS.length ? parsedStage : 0;
  return <UmrahOverview initialStage={initialStage}
    onClose={() => router.canGoBack() ? router.back() : router.replace({ pathname: '/(tabs)/guide', params: { mode: 'learn' } })}
    onTopic={index => router.push({ pathname: '/umrah-topic', params: { step: UMRAH_STEPS[index].id, mode: 'learn', from: 'overview' } })}
  />;
}
