import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { Text, TouchableOpacity, View } from 'react-native';

export function LocalSaveStatus({ record }: { record: { ready: boolean; saving: boolean; error: string | null; retry: () => unknown } }) {
  return (
    <View style={{ paddingVertical: 10 }}>
      <Text accessibilityLiveRegion="polite" style={{ fontFamily: QasdFonts.body, fontSize: 13, color: record.error ? Palette.orange : Palette.textSecondary }}>
        {record.error ?? (!record.ready ? 'Loading saved progress…' : record.saving ? 'Saving on this device…' : 'Saved on this device · Available offline')}
      </Text>
      {record.error && <TouchableOpacity accessibilityRole="button" onPress={() => record.retry()} style={{ minHeight: 44, justifyContent: 'center' }}>
        <Text style={{ color: Palette.gold, fontFamily: QasdFonts.bodySemiBold }}>Retry saving or loading</Text>
      </TouchableOpacity>}
    </View>
  );
}
