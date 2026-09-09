import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette } from '@/constants/qasd-theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gradient?: boolean;
}

export default function GoldCard({ children, style, gradient = false }: Props) {
  if (gradient) {
    return (
      <LinearGradient
        colors={[Palette.cardBg, Palette.cardBgLight]}
        style={[styles.card, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.cardBg,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
    marginBottom: 14,
  },
});
