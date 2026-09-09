import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { AppIcon as Ionicons } from '@/components/app-icon';
import { BlurView } from 'expo-blur';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

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
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Palette.gold,
        tabBarInactiveTintColor: Palette.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => (
          <BlurView tint="dark" intensity={72} style={StyleSheet.absoluteFill} />
        ),
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
          tabBarButton: ({
            accessibilityLabel,
            accessibilityState,
            children,
            onLongPress,
            style,
            testID,
          }) => (
            <TouchableOpacity
              accessibilityLabel={accessibilityLabel}
              accessibilityRole="button"
              accessibilityState={accessibilityState}
              activeOpacity={0.72}
              onLongPress={onLongPress ?? undefined}
              onPress={() => router.push('/umrah-guide')}
              style={style}
              testID={testID}
            >
              {children}
            </TouchableOpacity>
          ),
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
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: Platform.OS === 'ios' ? 9 : 7,
    height: Platform.OS === 'ios' ? 76 : 66,
    paddingTop: 7,
    paddingBottom: Platform.OS === 'ios' ? 13 : 8,
    backgroundColor: 'rgba(16,25,45,0.78)',
    borderWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26,
    shadowRadius: 20,
  },
  tabLabel: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 9,
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
    backgroundColor: 'rgba(201,168,76,0.13)',
  },
});
