import { AppIcon } from '@/components/app-icon';
import { QasdFonts } from '@/constants/qasd-theme';
import { TravelColors as C, TravelType as T } from '@/constants/travel-design';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChooseTripScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<'umrah' | 'hajj'>('umrah');
  const selection = useRef(new Animated.Value(0)).current;

  const select = (choice: 'umrah' | 'hajj') => {
    setSelected(choice);
    Animated.spring(selection, {
      toValue: choice === 'umrah' ? 0 : 1,
      damping: 20,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: false,
    }).start();
  };

  const tripCard = (choice: 'umrah' | 'hajj') => {
    const isUmrah = choice === 'umrah';
    const active = selected === choice;
    const activeAmount = isUmrah
      ? selection.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
      : selection;
    const backgroundColor = activeAmount.interpolate({
      inputRange: [0, 1],
      outputRange: [C.surface, C.paper],
    });
    const scale = activeAmount.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] });

    return <Pressable
      key={choice}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      accessibilityLabel={`Select ${isUmrah ? 'Umrah' : 'Hajj'}`}
      onPress={() => select(choice)}
      style={s.cardPressable}
    >
      <Animated.View style={[s.card, { backgroundColor, transform: [{ scale }] }]}> 
        <View style={s.cardHead}>
          <View style={[s.icon, active && s.iconActive]}>
            <AppIcon name={isUmrah ? 'moon-outline' : 'compass-outline'} size={28} color={active ? C.paperMuted : '#d5c7aa'} />
          </View>
          <Text style={[T.label, active && s.activeMuted]}>{isUmrah ? 'At your own pace' : 'For the days of Hajj'}</Text>
        </View>
        <Text style={[s.cardTitle, active && s.activeInk]}>{isUmrah ? 'Umrah' : 'Hajj'}</Text>
        <Text style={[T.body, active && s.activeMuted]}>
          {isUmrah
            ? 'Makkah, with the option to visit Madinah. Four steps to make the trip yours.'
            : 'Your flights, hotels and camp, together with guidance for the pilgrimage.'}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Plan my ${isUmrah ? 'Umrah' : 'Hajj'}`}
          activeOpacity={0.82}
          onPress={() => router.push(isUmrah ? '/umrah-setup/destination' : '/hajj-setup/welcome')}
          style={[s.planButton, active ? s.planButtonActive : s.planButtonQuiet]}
        >
          <Text style={[s.planText, !active && s.planTextQuiet]}>Plan my {isUmrah ? 'Umrah' : 'Hajj'}</Text>
          <AppIcon name="arrow-forward" size={20} color={active ? C.paper : C.gold} />
        </TouchableOpacity>
      </Animated.View>
    </Pressable>;
  };

  return <SafeAreaView style={s.container} edges={['top', 'bottom']}>
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.top}><Text style={s.brand}>Qasd</Text><Image source={require("@assets/brand/icon.png")} accessibilityLabel="Qasd" style={{ width: 48, height: 48, borderRadius: 13 }} /></View>
      <Text style={T.eyebrow}>A JOURNEY WITH PURPOSE</Text>
      <Text style={[T.title, { marginTop: 12 }]}>Where does your{ '\n' }journey begin?</Text>
      <Text style={[T.body, { marginTop: 12, marginBottom: 28 }]}>Choose your pilgrimage. Your route, stays and guidance will follow.</Text>
      {tripCard('umrah')}
      {tripCard('hajj')}
      <Text style={s.foot}>Tap a journey to preview it. Continue when you are ready.</Text>
    </ScrollView>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { padding: 24, paddingBottom: 40, width: '100%', maxWidth: 640, alignSelf: 'center' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  brand: { fontFamily: QasdFonts.displayMedium, fontSize: 30, color: C.cream },
  cardPressable: { marginBottom: 18 },
  card: { padding: 24, borderRadius: 22, borderWidth: 1, borderColor: C.line },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  icon: { width: 52, height: 56, backgroundColor: C.iconSurface, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  iconActive: { backgroundColor: '#ded5c1' },
  cardTitle: { ...T.title, marginTop: 18, marginBottom: 6 },
  activeInk: { color: C.ink },
  activeMuted: { color: C.paperMuted },
  planButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 54, marginTop: 24 },
  planButtonActive: { backgroundColor: C.forest, borderRadius: 12, padding: 16 },
  planButtonQuiet: { borderTopWidth: 1, borderColor: C.line, paddingTop: 20 },
  planText: { fontFamily: QasdFonts.bodySemiBold, fontSize: 15, color: C.paper },
  planTextQuiet: { color: C.gold },
  foot: { ...T.label, textAlign: 'center', marginTop: 10 },
});
