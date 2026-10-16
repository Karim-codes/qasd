import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_HEIGHT = 70;
export const TAB_BAR_GAP = 8;

// Shared screens can also open outside the tabs, where this context is absent.
export function useTabContentInset() {
  const height = useContext(BottomTabBarHeightContext);
  const insets = useSafeAreaInsets();
  return height === undefined ? insets.bottom + 24 : height + Math.max(insets.bottom, 12) + TAB_BAR_GAP + 24;
}
