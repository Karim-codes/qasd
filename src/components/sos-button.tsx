import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { useItinerary } from '@/context/itinerary-context';
import { AppIcon as Ionicons } from '@/components/app-icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Linking,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SOSButton() {
  const [visible, setVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const { itinerary } = useItinerary();

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const openSheet = () => {
    setVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const callGuide = () => {
    const phone = itinerary?.guide?.phone || '+966 55 123 4567';
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  const callRawaf = () => Linking.openURL('tel:+9668001110605');
  const emailRawaf = () => Linking.openURL('mailto:care@rawafglobal.com');

  return (
    <>
      <Animated.View style={[styles.sosContainer, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity onPress={openSheet} activeOpacity={0.8}>
          <LinearGradient
            colors={[Palette.red, '#c74444']}
            style={styles.sosBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.sosText}>SOS</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={closeSheet}>
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.handle} />
              <Text style={styles.sheetTitle}>Emergency Support</Text>
              <Text style={styles.sheetSubtitle}>Help is just a tap away</Text>

              <TouchableOpacity style={styles.contactCard} onPress={callGuide}>
                <View style={styles.contactIcon}>
                  <Ionicons name="person" size={20} color={Palette.gold} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Your Guide</Text>
                  <Text style={styles.contactName}>{itinerary?.guide?.name || 'Guide'}</Text>
                </View>
                <View style={styles.callBtn}>
                  <Ionicons name="call" size={20} color="#fff" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactCard} onPress={callRawaf}>
                <View style={styles.contactIcon}>
                  <Ionicons name="business" size={20} color={Palette.gold} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Rawaf Care</Text>
                  <Text style={styles.contactName}>+966 800 111 0605</Text>
                </View>
                <View style={styles.callBtn}>
                  <Ionicons name="call" size={20} color="#fff" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactCard} onPress={emailRawaf}>
                <View style={styles.contactIcon}>
                  <Ionicons name="mail" size={20} color={Palette.gold} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Email Support</Text>
                  <Text style={styles.contactName}>care@rawafglobal.com</Text>
                </View>
                <View style={[styles.callBtn, { backgroundColor: Palette.gold }]}>
                  <Ionicons name="mail" size={20} color="#fff" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeBtn} onPress={closeSheet}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  sosContainer: {
    position: 'absolute',
    top: 4,
    right: 16,
    zIndex: 999,
  },
  sosBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Palette.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  sosText: {
    color: '#fff',
    fontFamily: QasdFonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Palette.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.goldBorder,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.textMuted,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: QasdFonts.display,
    fontSize: 28,
    color: Palette.textPrimary,
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontFamily: QasdFonts.body,
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontFamily: QasdFonts.body,
    fontSize: 12,
    color: Palette.textSecondary,
  },
  contactName: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 15,
    color: Palette.textPrimary,
    marginTop: 2,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 15,
    color: Palette.textSecondary,
  },
});
