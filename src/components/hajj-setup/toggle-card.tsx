import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { StyleSheet, Switch, Text, View } from 'react-native';

export function ToggleCard({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={s.card}>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Palette.border, true: Palette.goldMuted }}
        thumbColor={value ? Palette.gold : '#888'}
      />
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.cardBg,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  title: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  sub: {
    fontFamily: QasdFonts.body,
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 2,
  },
});
