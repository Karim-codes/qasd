import { StyleSheet } from 'react-native';
import { QasdFonts } from './qasd-theme';

export const TravelColors = {
  background: '#101827', surface: '#1b2533', paper: '#eee7d8', ink: '#202b2a',
  paperMuted: '#655f52', forest: '#263c36', cream: '#f5f0e5', muted: '#aab3c2',
  line: '#2a3341', gold: '#c9a84c', iconSurface: '#252e39',
} as const;

export const TravelType = StyleSheet.create({
  title: { fontFamily: QasdFonts.displayMedium, fontSize: 40, lineHeight: 46, color: TravelColors.cream },
  section: { fontFamily: QasdFonts.displayMedium, fontSize: 28, lineHeight: 34, color: TravelColors.cream },
  body: { fontFamily: QasdFonts.body, fontSize: 15, lineHeight: 23, color: TravelColors.muted },
  label: { fontFamily: QasdFonts.bodyMedium, fontSize: 12, lineHeight: 18, color: TravelColors.muted },
  eyebrow: { fontFamily: QasdFonts.bodySemiBold, fontSize: 11, letterSpacing: 1.8, color: '#c8b78f' },
});
