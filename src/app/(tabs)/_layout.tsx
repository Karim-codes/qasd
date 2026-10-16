import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { AppIcon as Ionicons } from '@/components/app-icon';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_GAP, TAB_BAR_HEIGHT } from '@/hooks/use-tab-content-inset';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  name,
  nameOutline,
  color,
  focused,
}: {
  name: IoniconName;
  nameOutline: IoniconName;
  color: string;
  focused: boolean;
}) {
  const lift = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(lift, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      tension: 120,
      friction: 9,
    }).start();
  }, [focused, lift]);

  const translateY = lift.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });

  return (
    <View style={styles.tabIconContainer}>
      <Animated.View
        style={[
          styles.iconPlate,
          focused && styles.iconPlateActive,
          { transform: [{ translateY }] },
        ]}
      >
        <Ionicons name={focused ? name : nameOutline} size={22} color={color} />
      </Animated.View>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 12) + TAB_BAR_GAP;
  const [reduceTransparency, setReduceTransparency] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let cancelled = false;
    void AccessibilityInfo.isReduceTransparencyEnabled().then(value => { if (!cancelled) setReduceTransparency(value); });
    const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduceTransparency);
    return () => { cancelled = true; subscription.remove(); };
  }, []);
  return <View style={styles.container}>
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { bottom }],
        tabBarActiveTintColor: Palette.gold,
        tabBarInactiveTintColor: Palette.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarLabelPosition: 'below-icon',
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => <View style={[StyleSheet.absoluteFill, styles.glass, reduceTransparency && styles.opaqueGlass]}>
          {!reduceTransparency && <BlurView tint="systemThinMaterialDark" intensity={85} style={StyleSheet.absoluteFill} />}
          <LinearGradient colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.035)', 'rgba(255,255,255,0.015)']} locations={[0, 0.46, 1]} style={StyleSheet.absoluteFill} />
          <View style={styles.glassEdge} />
        </View>,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" nameOutline="home-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          title: 'Guide',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="book" nameOutline="book-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: 'Journey',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="map" nameOutline="map-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="flights"
        options={{
          title: 'Flights',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="airplane" nameOutline="airplane-outline" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
    <LinearGradient pointerEvents="none" colors={['rgba(16,24,39,0)', Palette.background, Palette.background]} locations={[0, 0.28, 1]} style={[styles.floor, { height: bottom }]} />
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  floor: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  glass: { borderRadius: 26, overflow: 'hidden', backgroundColor: Platform.OS === 'ios' ? 'rgba(23,34,49,0.32)' : 'rgba(26,38,54,0.95)' },
  opaqueGlass: { backgroundColor: '#233042' },
  glassEdge: { ...StyleSheet.absoluteFillObject, borderRadius: 26, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', borderTopColor: 'rgba(255,255,255,0.3)' },
  tabBar: {
    position: 'absolute',
    marginHorizontal: 16,
    height: TAB_BAR_HEIGHT,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderRadius: 26,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26,
    shadowRadius: 20,
  },
  tabLabel: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 11,
    marginTop: 0,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  iconPlate: {
    width: 40,
    height: 30,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlateActive: {
    backgroundColor: 'rgba(201,168,76,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(234,210,140,0.16)',
  },
});
