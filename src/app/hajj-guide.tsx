import { RitualGlyphKind, RitualIcon } from '@/components/ritual-glyph';
import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { AppIcon as Ionicons } from '@/components/app-icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type RiteStep = {
  time: string;
  title: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  source?: string; // short label e.g. "Sahih Muslim 1218"
};

type Proof = {
  topic: string;
  narration: string;
  source: string;
};

type HajjDay = {
  hijri: string;
  gregorian: string; // approx for 1447H
  name: string;
  arabicName: string;
  location: string;
  locationIcon: keyof typeof Ionicons.glyphMap;
  summary: string;
  steps: RiteStep[];
  reminder?: string;
  proofs: Proof[];
};

// Approximate 1447H Hajj dates (Saudi moon-sighting may shift ±1 day)
const HAJJ_DAYS: HajjDay[] = [
  {
    hijri: '8 Dhul-Hijjah',
    gregorian: '2026-05-25',
    name: 'Yawm at-Tarwiyah',
    arabicName: 'يَوْم ٱلتَّرْوِيَة',
    location: 'Mina',
    locationIcon: 'home',
    summary:
      'The first official day of Hajj. Enter Ihram, make your intention, and travel to Mina for a day of prayer and reflection.',
    steps: [
      {
        time: 'Before Fajr',
        title: 'Enter the state of Ihram',
        detail:
          'Perform Ghusl, wear your Ihram garments, and make the niyyah (intention) for Hajj. Begin reciting the Talbiyah: “Labbayk Allahumma Labbayk…”.',
        icon: 'shirt',
      },
      {
        time: 'Morning',
        title: 'Travel to Mina',
        detail:
          'Leave Makkah for Mina (≈8 km). Try to arrive before Dhuhr. Continue the Talbiyah throughout the journey.',
        icon: 'bus',
        source: 'Sahih Muslim 1218',
      },
      {
        time: 'Day & Night',
        title: 'Five prayers in Mina',
        detail:
          'Pray Dhuhr, Asr, Maghrib, Isha, and Fajr (of the 9th) in Mina. Shorten (qasr) the four-unit prayers to two — but do NOT combine them. Spend the night in dhikr, du’a, and rest.',
        icon: 'moon',
        source: 'Sahih Muslim 1218 · Sunan Abi Dawud 1911',
      },
    ],
    reminder: 'Stay hydrated. Avoid arguments and harsh words while in Ihram.',
    proofs: [
      {
        topic: 'Proceeding to Mina',
        narration:
          'The Prophet (ﷺ) proceeded to Mina on the Day of Tarwiyah… and he offered there the Dhuhr, Asr, Maghrib, Isha, and Fajr prayers.',
        source: 'Sahih Muslim 1218 (Hadith of Jabir ibn Abdullah)',
      },
      {
        topic: 'Praying Dhuhr in Mina, Fajr of the 9th in Mina',
        narration:
          'The Messenger of Allah (ﷺ) offered the noon prayer on the 8th of Dhul-Hijjah and dawn prayer on the 9th of Dhul-Hijjah in Mina.',
        source: 'Sunan Abi Dawud 1911',
      },
    ],
  },
  {
    hijri: '9 Dhul-Hijjah',
    gregorian: '2026-05-26',
    name: 'Yawm Arafah',
    arabicName: 'يَوْم عَرَفَة',
    location: 'Arafat → Muzdalifah',
    locationIcon: 'sunny',
    summary:
      'The greatest day of Hajj. Standing at Arafat is the pillar — without it, there is no Hajj.',
    steps: [
      {
        time: 'After Fajr',
        title: 'Depart for Arafat',
        detail:
          'After praying Fajr in Mina, travel to Arafat. Continue the Talbiyah and du’a along the way.',
        icon: 'navigate',
      },
      {
        time: 'After Zawal',
        title: 'Combined Dhuhr & Asr',
        detail:
          'After the khutbah, pray Dhuhr and Asr together (jam‘ taqdim, shortened) with one Adhan and two Iqamahs. The Prophet (ﷺ) prayed nothing between them.',
        icon: 'time',
        source: 'Sahih Muslim 1218',
      },
      {
        time: 'Until Maghrib',
        title: 'Wuquf — the Standing',
        detail:
          'Face the Qiblah, raise your hands, and make sincere du’a until sunset. This is the most blessed time of the year. Repent, ask, weep, and seek forgiveness.',
        icon: 'hand-left',
        source: 'Sahih Muslim 1218',
      },
      {
        time: 'After sunset',
        title: 'Travel to Muzdalifah',
        detail:
          'Leave Arafat calmly after Maghrib (do NOT pray Maghrib at Arafat). Pray Maghrib and Isha together in Muzdalifah with one Adhan and two Iqamahs.',
        icon: 'moon',
        source: 'Sahih Muslim 1218',
      },
      {
        time: 'Night',
        title: 'Sleep under the open sky',
        detail:
          'Rest in Muzdalifah and collect 49–70 small pebbles for stoning the Jamarat. Pray Fajr there, then make du’a until just before sunrise.',
        icon: 'sparkles',
      },
    ],
    reminder:
      'Do not delay leaving Arafat before sunset. The du’a of Arafah is the best du’a.',
    proofs: [
      {
        topic: 'Combining Dhuhr & Asr at Arafah',
        narration:
          'He (ﷺ) came to the bottom of the valley and addressed the people… then Bilal called the Adhan… he then prayed Dhuhr and then Asr, and he did not pray anything between them.',
        source: 'Sahih Muslim 1218',
      },
      {
        topic: 'Maghrib & Isha combined at Muzdalifah',
        narration:
          'He (ﷺ) came to Muzdalifah and offered there the Maghrib and Isha prayers with one Adhan and two Iqamahs.',
        source: 'Sahih Muslim 1218',
      },
    ],
  },
  {
    hijri: '10 Dhul-Hijjah',
    gregorian: '2026-05-27',
    name: 'Yawm an-Nahr (Eid al-Adha)',
    arabicName: 'يَوْم ٱلنَّحْر',
    location: 'Muzdalifah → Mina → Makkah',
    locationIcon: 'star',
    summary:
      'The Day of Sacrifice. Four major rites: stoning Jamrat al-Aqaba, sacrifice, shaving/trimming, and Tawaf al-Ifadah. The Prophet (ﷺ) permitted flexibility in their order.',
    steps: [
      {
        time: 'Before sunrise',
        title: 'Leave Muzdalifah for Mina',
        detail: 'Travel to Mina carrying your pebbles. Continue the Talbiyah until you throw your first stone.',
        icon: 'walk',
      },
      {
        time: 'Forenoon (Duha)',
        title: 'Stone Jamrat al-Aqaba',
        detail:
          'Throw 7 pebbles, one at a time, at the largest pillar (Jamrat al-Kubra) from the middle of the valley, saying “Allahu Akbar” with each throw. Stop the Talbiyah after the first stone.',
        icon: 'ellipse',
        source: 'Sahih Muslim 1299',
      },
      {
        time: 'After stoning',
        title: 'Sacrifice (Hadi)',
        detail:
          'Your Hajj package usually arranges the sacrifice on your behalf. Confirm with your guide that it has been completed.',
        icon: 'checkmark-done',
      },
      {
        time: 'Then',
        title: 'Shave or trim the hair',
        detail:
          'Men: shave (preferred — the Prophet ﷺ made du’a 3 times for those who shaved, once for those who trimmed). Women: trim a fingertip’s length. After this you exit partial Ihram — most restrictions are lifted (except marital relations).',
        icon: 'cut',
        source: 'Sahih Bukhari 1727',
      },
      {
        time: 'Same day (or soon after)',
        title: 'Tawaf al-Ifadah & Sa‘i',
        detail:
          'Travel to Makkah to perform Tawaf al-Ifadah (7 rounds) and Sa‘i between Safa and Marwa (if you did not do Sa‘i with Tawaf al-Qudum). After this, full Ihram is over.',
        icon: 'refresh-circle',
      },
      {
        time: 'Night',
        title: 'Return to Mina',
        detail: 'Spend the night of the 11th in Mina.',
        icon: 'moon',
      },
    ],
    reminder:
      'Eid Mubarak. The order is recommended, but if you do any rite out of order — “Do it now, and there is no harm.”',
    proofs: [
      {
        topic: 'Stoning Jamrat al-Aqaba',
        narration:
          'I saw the Messenger of Allah (ﷺ) throwing pebbles… from the middle of the valley on the day of sacrifice.',
        source: 'Sahih Muslim 1299',
      },
      {
        topic: 'Flexibility in the order of rites',
        narration:
          'A man said, “I slaughtered before I threw (pebbles).” The Prophet (ﷺ) said, “Throw now, and there is no harm.” Another said, “I shaved before I slaughtered.” He said, “Slaughter now, and there is no harm.”',
        source: 'Sahih Bukhari 1721',
      },
      {
        topic: 'Du’a for those who shave',
        narration:
          'O Allah! Be merciful to those who have their head shaved. (The Prophet ﷺ repeated this three times for those who shaved and once for those who trimmed.)',
        source: 'Sahih Bukhari 1727',
      },
    ],
  },
  {
    hijri: '11 Dhul-Hijjah',
    gregorian: '2026-05-28',
    name: 'Ayyam at-Tashreeq · Day 1',
    arabicName: 'أَيَّام ٱلتَّشْرِيق',
    location: 'Mina',
    locationIcon: 'home',
    summary: 'Days of remembrance. Stone all three Jamarat after Zawal and stay overnight in Mina.',
    steps: [
      {
        time: 'After Zawal',
        title: 'Stone the small Jamrah (Sughra)',
        detail:
          'Throw 7 pebbles, one at a time, saying “Allahu Akbar” with each. Then move forward, face the Qiblah, raise your hands, and make a long du’a.',
        icon: 'ellipse',
        source: 'Sahih Bukhari 1751',
      },
      {
        time: 'Then',
        title: 'Stone the middle Jamrah (Wusta)',
        detail:
          'Throw 7 pebbles. Then move to the left, face the Qiblah, raise your hands, and make a long du’a — just as you did at the first.',
        icon: 'ellipse',
        source: 'Sahih Bukhari 1751',
      },
      {
        time: 'Then',
        title: 'Stone Jamrat al-Aqaba',
        detail:
          'Throw 7 pebbles. Do NOT stand for du’a after this one — depart immediately. (21 pebbles total today.)',
        icon: 'ellipse',
        source: 'Sahih Bukhari 1746, 1751',
      },
      {
        time: 'Throughout the day',
        title: 'Dhikr & Takbeer',
        detail:
          'Increase in remembrance of Allah. The Takbeer of Tashreeq is recited after every fard prayer.',
        icon: 'sparkles',
      },
      {
        time: 'Night',
        title: 'Sleep in Mina',
        detail: 'Spending the night (mabit) in Mina is obligatory.',
        icon: 'moon',
      },
    ],
    proofs: [
      {
        topic: 'Stoning after Zawal on Tashreeq days',
        narration:
          'The Messenger of Allah (ﷺ) used to pelt the Jamarah on the Day of Nahr (10th) in the forenoon, and on the following days (11th–13th) after the sun had passed the meridian.',
        source: 'Sahih Bukhari 1746',
      },
      {
        topic: 'Long du’a after the first and second Jamarah',
        narration:
          'After the first and second Jamarah, he (ﷺ) would stand for a long time, face the Qiblah, and make du’a. After the third (Aqaba), he would depart without standing.',
        source: 'Sahih Bukhari 1751',
      },
    ],
  },
  {
    hijri: '12 Dhul-Hijjah',
    gregorian: '2026-05-29',
    name: 'Ayyam at-Tashreeq · Day 2',
    arabicName: 'أَيَّام ٱلتَّشْرِيق',
    location: 'Mina',
    locationIcon: 'home',
    summary:
      'Stone the three Jamarat again after Zawal. You may leave Mina before Maghrib (Nafr al-Awwal) or stay one more night.',
    steps: [
      {
        time: 'After Zawal',
        title: 'Stone all three Jamarat',
        detail:
          '7 pebbles at the small, middle, then large pillar — 21 total. Long du’a after the small and middle. No standing after Aqaba.',
        icon: 'ellipse',
        source: 'Sahih Bukhari 1746, 1751',
      },
      {
        time: 'Before Maghrib',
        title: 'Nafr al-Awwal (optional early departure)',
        detail:
          'You may leave Mina before sunset. If sunset catches you in Mina, you must stay for the 13th and stone again.',
        icon: 'exit',
      },
    ],
    reminder: 'If you stay, the reward is greater. Either choice is permissible.',
    proofs: [
      {
        topic: 'Stoning after Zawal',
        narration:
          'The Messenger of Allah (ﷺ)… on the following days (11th–13th) [pelted] after the sun had passed the meridian.',
        source: 'Sahih Bukhari 1746',
      },
      {
        topic: 'Du’a routine between Jamarat',
        narration:
          'After the first and second Jamarah, he (ﷺ) would stand for a long time, face the Qiblah, and make du’a. After the third (Aqaba), he would depart without standing.',
        source: 'Sahih Bukhari 1751',
      },
    ],
  },
  {
    hijri: '13 Dhul-Hijjah',
    gregorian: '2026-05-30',
    name: 'Ayyam at-Tashreeq · Day 3',
    arabicName: 'أَيَّام ٱلتَّشْرِيق',
    location: 'Mina → Makkah',
    locationIcon: 'home',
    summary: 'Final day of stoning for those who stayed. Then Tawaf al-Wada before leaving Makkah.',
    steps: [
      {
        time: 'After Zawal',
        title: 'Stone all three Jamarat',
        detail:
          '7 pebbles at each pillar in order — 21 total. Long du’a after the small and middle, none after Aqaba.',
        icon: 'ellipse',
        source: 'Sahih Bukhari 1746, 1751',
      },
      {
        time: 'Before leaving Makkah',
        title: 'Tawaf al-Wada (Farewell Tawaf)',
        detail:
          '7 rounds around the Ka‘bah as your final act in Makkah. The people were ordered to make this their last action before leaving. Make du’a and ask Allah to accept your Hajj.',
        icon: 'refresh-circle',
        source: 'Sahih Bukhari 1755',
      },
    ],
    reminder: 'May Allah accept your Hajj — Hajj Mabrur.',
    proofs: [
      {
        topic: 'The Farewell Tawaf',
        narration:
          'The people were ordered to perform the Tawaf of the Ka‘bah as the last thing before leaving (Makkah).',
        source: 'Sahih Bukhari 1755',
      },
    ],
  },
];

type RoadmapLeg = {
  hijri: string; // which Hajj day this leg belongs to
  from: string;
  to: string;
  distanceKm: number;
  transport: 'Bus' | 'Walk' | 'Car/Bus' | 'Walk / Bus';
  transportIcon: keyof typeof Ionicons.glyphMap;
  when: string;
  purpose: string;
};

// Geographic flow of the Hajj — Makkah ↔ Mina ↔ Arafat ↔ Muzdalifah
const ROADMAP_LEGS: RoadmapLeg[] = [
  {
    hijri: '8 Dhul-Hijjah',
    from: 'Makkah (your hotel)',
    to: 'Mina',
    distanceKm: 8,
    transport: 'Bus',
    transportIcon: 'bus',
    when: 'Morning of 8th — before Dhuhr',
    purpose: 'Arrive in Mina in Ihram. Pray Dhuhr → Fajr (of 9th) shortened.',
  },
  {
    hijri: '9 Dhul-Hijjah',
    from: 'Mina',
    to: 'Arafat',
    distanceKm: 14,
    transport: 'Bus',
    transportIcon: 'bus',
    when: 'After Fajr on the 9th',
    purpose: 'Reach Arafat before Zawal for the Wuquf — the pillar of Hajj.',
  },
  {
    hijri: '9 Dhul-Hijjah',
    from: 'Arafat',
    to: 'Muzdalifah',
    distanceKm: 9,
    transport: 'Bus',
    transportIcon: 'bus',
    when: 'After sunset on the 9th',
    purpose: 'Pray Maghrib + Isha together. Sleep. Collect 49–70 pebbles.',
  },
  {
    hijri: '10 Dhul-Hijjah',
    from: 'Muzdalifah',
    to: 'Mina (Jamarat)',
    distanceKm: 5,
    transport: 'Walk / Bus',
    transportIcon: 'walk',
    when: 'After Fajr — before sunrise',
    purpose: 'Stone Jamrat al-Aqaba (7 pebbles). Sacrifice. Shave/trim.',
  },
  {
    hijri: '10 Dhul-Hijjah',
    from: 'Mina',
    to: 'Makkah (Haram)',
    distanceKm: 8,
    transport: 'Car/Bus',
    transportIcon: 'car',
    when: 'Same day or soon after',
    purpose: 'Tawaf al-Ifadah (7 rounds) and Sa‘i. Then return to Mina for the night.',
  },
  {
    hijri: '11 Dhul-Hijjah',
    from: 'Mina camp',
    to: 'Jamarat',
    distanceKm: 2,
    transport: 'Walk',
    transportIcon: 'walk',
    when: 'After Zawal',
    purpose: 'Stone all three Jamarat: Sughra → Wusta → Aqaba (21 pebbles).',
  },
  {
    hijri: '12 Dhul-Hijjah',
    from: 'Mina camp',
    to: 'Jamarat',
    distanceKm: 2,
    transport: 'Walk',
    transportIcon: 'walk',
    when: 'After Zawal',
    purpose: 'Stone all three again. Optional: leave Mina before Maghrib (Nafr al-Awwal).',
  },
  {
    hijri: '13 Dhul-Hijjah',
    from: 'Mina',
    to: 'Makkah (Haram)',
    distanceKm: 8,
    transport: 'Car/Bus',
    transportIcon: 'car',
    when: 'After final stoning',
    purpose: 'Tawaf al-Wada — your last act in Makkah before departure.',
  },
];

// ─── SERPENTINE ROADMAP ENGINE (mirrors Umrah guide visual style) ───────────

const NODE_SIZE = 64;
const NODE_GAP_Y = 72;
const ROAD_PAD_H = 24;
const PATH_COLS = 3;

type HajjNode = {
  id: string;
  site: string;
  arabicSite?: string;
  hijri: string;
  icon?: keyof typeof Ionicons.glyphMap;
  glyph?: RitualGlyphKind;
  transport?: string;
  transportIcon?: keyof typeof Ionicons.glyphMap;
  distanceFromPrev?: string;
  detail: string;
  when: string;
  important?: boolean;
};

const HAJJ_NODES: HajjNode[] = [
  {
    id: 'makkah-arrival',
    site: 'Makkah',
    arabicSite: 'مَكَّة',
    hijri: 'Before 8 Dhul-Hijjah',
    glyph: 'kaaba',
    detail:
      'Arrive in Makkah and check in to your hotel. Perform Umrah first if you haven\'t. Rest and prepare spiritually for Hajj.',
    when: 'Upon arrival',
    important: true,
  },
  {
    id: 'mina-tarwiyah',
    site: 'Mina',
    arabicSite: 'مِنَى',
    hijri: '8 Dhul-Hijjah',
    glyph: 'tent',
    transport: 'Bus',
    transportIcon: 'bus',
    distanceFromPrev: '~8 km',
    detail:
      'Enter Ihram and travel to Mina. Pray Dhuhr, Asr, Maghrib, Isha, and Fajr (of the 9th) — shortened but not combined. Spend the night in dhikr.',
    when: 'Morning, before Dhuhr',
    important: true,
  },
  {
    id: 'arafat',
    site: 'Arafat',
    arabicSite: 'عَرَفَات',
    hijri: '9 Dhul-Hijjah',
    icon: 'sunny',
    transport: 'Bus',
    transportIcon: 'bus',
    distanceFromPrev: '~14 km',
    detail:
      'The pillar of Hajj. Combine Dhuhr + Asr (jam\' taqdim, shortened). Stand facing Qiblah making du\'a until sunset. Do NOT leave before Maghrib.',
    when: 'After Fajr — depart Mina',
    important: true,
  },
  {
    id: 'muzdalifah',
    site: 'Muzdalifah',
    arabicSite: 'مُزْدَلِفَة',
    hijri: '9 Dhul-Hijjah (night)',
    icon: 'moon',
    transport: 'Bus',
    transportIcon: 'bus',
    distanceFromPrev: '~9 km',
    detail:
      'Pray Maghrib + Isha combined. Sleep under the open sky. Collect 49–70 small pebbles. Pray Fajr and make du\'a until just before sunrise.',
    when: 'After sunset — leave Arafat',
  },
  {
    id: 'mina-eid',
    site: 'Mina · Jamarat',
    arabicSite: 'الجَمَرَات',
    hijri: '10 Dhul-Hijjah — Eid',
    glyph: 'jamarat',
    transport: 'Walk / Bus',
    transportIcon: 'walk',
    distanceFromPrev: '~5 km',
    detail:
      'Stone Jamrat al-Aqaba (7 pebbles). Sacrifice (Hady). Shave or trim. Stop Talbiyah after the first stone.',
    when: 'Before sunrise from Muzdalifah',
    important: true,
  },
  {
    id: 'makkah-tawaf',
    site: 'Makkah · Haram',
    arabicSite: 'ٱلطَّوَاف',
    hijri: '10 Dhul-Hijjah',
    icon: 'sync',
    transport: 'Bus / Car',
    transportIcon: 'car',
    distanceFromPrev: '~8 km',
    detail:
      'Tawaf al-Ifadah (7 rounds) + Sa\'i between Safa and Marwa. After this, full Ihram is over. Return to Mina for the night.',
    when: 'Same day as Eid, or soon after',
    important: true,
  },
  {
    id: 'mina-tashreeq',
    site: 'Mina · Days 11–13',
    arabicSite: 'أَيَّام ٱلتَّشْرِيق',
    hijri: '11–13 Dhul-Hijjah',
    glyph: 'jamarat',
    transport: 'Walk',
    transportIcon: 'walk',
    distanceFromPrev: '~2 km',
    detail:
      'Stone all 3 Jamarat (Sughra→Wusta→Aqaba, 21 pebbles/day) after Zawal each day. Long du\'a after the first two, none after the third. Sleep in Mina each night.',
    when: 'After Zawal (midday), daily',
  },
  {
    id: 'makkah-farewell',
    site: 'Makkah · Farewell',
    arabicSite: 'طَوَاف ٱلوَدَاع',
    hijri: '13 Dhul-Hijjah',
    glyph: 'kaaba',
    transport: 'Bus / Car',
    transportIcon: 'car',
    distanceFromPrev: '~8 km',
    detail:
      'Tawaf al-Wada — 7 farewell rounds around the Ka\'bah. This is your last act before leaving Makkah. Ask Allah to accept your Hajj.',
    when: 'Before departing Makkah',
    important: true,
  },
];

function getRoadCols(count: number): number[] {
  const cycle = [0, 1, 2, 1];
  return Array.from({ length: count }, (_, i) => cycle[i % cycle.length]);
}

function getColX(col: number, containerW: number): number {
  const usable = containerW - ROAD_PAD_H * 2 - NODE_SIZE;
  return ROAD_PAD_H + (usable * col) / (PATH_COLS - 1);
}

/** Map a roadmap node back to the matching HAJJ_DAY by extracting the first day number. */
function getDayForNode(node: HajjNode): HajjDay | null {
  const m = node.hijri.match(/(\d+)/);
  if (!m) return null;
  const dayNum = m[1];
  return HAJJ_DAYS.find((d) => d.hijri.startsWith(`${dayNum} `)) ?? null;
}

function HajjStarField() {
  const stars = useRef(
    Array.from({ length: 40 }, () => ({
      x: Math.random() * Dimensions.get('window').width,
      y: Math.random() * 2000,
      size: 1 + Math.random() * 2,
      opacity: new Animated.Value(0.1 + Math.random() * 0.4),
      delay: Math.random() * 3000,
    })),
  ).current;

  useEffect(() => {
    stars.forEach((star) => {
      const twinkle = () => {
        Animated.sequence([
          Animated.timing(star.opacity, {
            toValue: 0.05,
            duration: 1500 + Math.random() * 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: 0.3 + Math.random() * 0.3,
            duration: 1500 + Math.random() * 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(twinkle);
      };
      setTimeout(twinkle, star.delay);
    });
  }, []);

  return (
    <>
      {stars.map((star, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: Palette.gold,
            opacity: star.opacity,
          }}
        />
      ))}
    </>
  );
}

function HajjPulsingRing({ size }: { size: number }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size + 18,
        height: size + 18,
        borderRadius: (size + 18) / 2,
        borderWidth: 2,
        borderColor: Palette.gold,
        opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.55] }),
        transform: [
          { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
        ],
      }}
    />
  );
}

function HajjConnector({
  fromX, fromY, toX, toY, done,
}: { fromX: number; fromY: number; toX: number; toY: number; done?: boolean }) {
  const DOTS = 16;
  const half = NODE_SIZE / 2;
  const x1 = fromX + half, y1 = fromY + half;
  const x2 = toX + half,   y2 = toY + half;
  const cpX = (x1 + x2) / 2 + (x2 - x1) * 0.25;
  const cpY = (y1 + y2) / 2;

  const dots = [];
  for (let i = 1; i < DOTS; i++) {
    const t = i / DOTS, inv = 1 - t;
    const bx = inv * inv * x1 + 2 * inv * t * cpX + t * t * x2;
    const by = inv * inv * y1 + 2 * inv * t * cpY + t * t * y2;
    const sz = 3 + Math.sin(t * Math.PI) * 1.5;
    dots.push(
      <View
        key={i}
        style={{
          position: 'absolute',
          left: bx - sz / 2,
          top: by - sz / 2,
          width: sz,
          height: sz,
          borderRadius: sz / 2,
          backgroundColor: done ? 'rgba(201,168,76,0.85)' : 'rgba(201,168,76,0.28)',
        }}
      />,
    );
  }
  return <>{dots}</>;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function HajjGuideScreen() {
  const router = useRouter();
  const today = todayISO();

  const initialIndex = useMemo(() => {
    const idx = HAJJ_DAYS.findIndex((d) => d.gregorian === today);
    if (idx >= 0) return idx;
    // Pick nearest upcoming if before, else last
    const upcoming = HAJJ_DAYS.findIndex((d) => d.gregorian > today);
    if (upcoming >= 0) return upcoming;
    return 0;
  }, [today]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [proofsOpen, setProofsOpen] = useState(false);
  const [proofSourceFilter, setProofSourceFilter] = useState<string | null>(null);
  const [mode, setMode] = useState<'rituals' | 'roadmap'>('rituals');
  const [roadmapActiveIdx, setRoadmapActiveIdx] = useState(0);
  const [detailNode, setDetailNode] = useState<HajjNode | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [inlineProofOpen, setInlineProofOpen] = useState(false);
  const [inlineProofSource, setInlineProofSource] = useState<string | null>(null);
  const [inlineProofDay, setInlineProofDay] = useState<HajjDay | null>(null);
  const [inlineProofMounted, setInlineProofMounted] = useState(false);
  const inlineProofAnim = useRef(new Animated.Value(0)).current;
  const { width: containerW } = useWindowDimensions();
  const day = HAJJ_DAYS[activeIndex];
  const isToday = day.gregorian === today;
  const dayLegs = ROADMAP_LEGS.filter((l) => l.hijri === day.hijri);
  const totalKm = ROADMAP_LEGS.reduce((sum, l) => sum + l.distanceKm, 0);

  const roadCols = useMemo(() => getRoadCols(HAJJ_NODES.length), []);
  const nodePositions = useMemo(
    () =>
      HAJJ_NODES.map((_, i) => ({
        x: getColX(roadCols[i], containerW),
        y: NODE_GAP_Y + i * (NODE_SIZE + NODE_GAP_Y),
      })),
    [containerW],
  );
  const totalRoadH = NODE_GAP_Y + HAJJ_NODES.length * (NODE_SIZE + NODE_GAP_Y) + 80;

  const inlineProofItems = useMemo(() => {
    if (!inlineProofDay) return [] as Proof[];
    if (!inlineProofSource) return inlineProofDay.proofs;
    const needle = inlineProofSource.toLowerCase();
    const exact = inlineProofDay.proofs.filter(
      (p) => p.source.toLowerCase().includes(needle) || p.topic.toLowerCase().includes(needle),
    );
    if (exact.length > 0) return exact;
    const broadNeedle = needle.replace(/\d+/g, '').trim();
    if (!broadNeedle) return inlineProofDay.proofs;
    const broad = inlineProofDay.proofs.filter(
      (p) => p.source.toLowerCase().includes(broadNeedle) || p.topic.toLowerCase().includes(broadNeedle),
    );
    return broad.length > 0 ? broad : inlineProofDay.proofs;
  }, [inlineProofDay, inlineProofSource]);

  useEffect(() => {
    if (inlineProofOpen) {
      setInlineProofMounted(true);
      inlineProofAnim.setValue(0);
      Animated.spring(inlineProofAnim, {
        toValue: 1,
        tension: 120,
        friction: 14,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (!inlineProofMounted) return;
    Animated.timing(inlineProofAnim, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setInlineProofMounted(false);
    });
  }, [inlineProofOpen, inlineProofMounted, inlineProofAnim]);

  const proofView = useMemo(() => {
    if (!proofSourceFilter) return { items: day.proofs, isFiltered: false };
    const needle = proofSourceFilter.toLowerCase();
    const matches = day.proofs.filter(
      (p) => p.source.toLowerCase().includes(needle) || p.topic.toLowerCase().includes(needle),
    );
    return {
      items: matches.length > 0 ? matches : day.proofs,
      isFiltered: matches.length > 0,
    };
  }, [day.proofs, proofSourceFilter]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={Palette.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hajj Guide</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Day selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daysStrip}
        contentContainerStyle={styles.daysStripContent}
      >
        {HAJJ_DAYS.map((d, i) => {
          const active = i === activeIndex;
          const todayBadge = d.gregorian === today;
          return (
            <TouchableOpacity
              key={d.hijri}
              onPress={() => setActiveIndex(i)}
              activeOpacity={0.7}
              style={[styles.dayPill, active && styles.dayPillActive]}
            >
              <Text style={[styles.dayPillNum, active && styles.dayPillNumActive]}>
                {d.hijri.split(' ')[0]}
              </Text>
              <Text style={[styles.dayPillLabel, active && styles.dayPillLabelActive]}>
                Dhul-Hijjah
              </Text>
              {todayBadge && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Mode toggle — always visible */}
      <View style={styles.segment}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setMode('rituals')}
          style={[styles.segmentBtn, mode === 'rituals' && styles.segmentBtnActive]}
        >
          <Ionicons
            name="book-outline"
            size={14}
            color={mode === 'rituals' ? Palette.gold : Palette.textSecondary}
          />
          <Text style={[styles.segmentText, mode === 'rituals' && styles.segmentTextActive]}>
            Rituals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setMode('roadmap')}
          style={[styles.segmentBtn, mode === 'roadmap' && styles.segmentBtnActive]}
        >
          <Ionicons
            name="map-outline"
            size={14}
            color={mode === 'roadmap' ? Palette.gold : Palette.textSecondary}
          />
          <Text style={[styles.segmentText, mode === 'roadmap' && styles.segmentTextActive]}>
            Roadmap
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'roadmap' ? (
        /* ── SERPENTINE ROADMAP VIEW ────────────────────────────────── */
        <>
          <View style={styles.progressWrap}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((roadmapActiveIdx + 1) / HAJJ_NODES.length) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {roadmapActiveIdx + 1} of {HAJJ_NODES.length}
            </Text>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ height: totalRoadH, position: 'relative' }}>
              <HajjStarField />

              {/* Connectors */}
              {nodePositions.map((pos, i) => {
                if (i === 0) return null;
                const prev = nodePositions[i - 1];
                return (
                  <HajjConnector
                    key={`con-${i}`}
                    fromX={prev.x}
                    fromY={prev.y}
                    toX={pos.x}
                    toY={pos.y}
                    done={i <= roadmapActiveIdx}
                  />
                );
              })}

              {/* Nodes */}
              {HAJJ_NODES.map((node, i) => {
                const pos = nodePositions[i];
                const isActive = i === roadmapActiveIdx;
                const isDone = i < roadmapActiveIdx;
                const isLast = i === HAJJ_NODES.length - 1;

                return (
                  <View
                    key={node.id}
                    style={{
                      position: 'absolute',
                      left: pos.x,
                      top: pos.y,
                      width: NODE_SIZE,
                      height: NODE_SIZE,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isActive && <HajjPulsingRing size={NODE_SIZE} />}

                    <TouchableOpacity
                      onPress={() => {
                        setRoadmapActiveIdx(i);
                        setDetailNode(node);
                        setDetailOpen(true);
                      }}
                      activeOpacity={0.8}
                      hitSlop={{ top: 10, bottom: 34, left: 24, right: 24 }}
                      style={[
                        styles.node,
                        isDone && styles.nodeDone,
                        isActive && styles.nodeActive,
                        !isDone && !isActive && styles.nodeLocked,
                        isLast && styles.nodeFinish,
                      ]}
                    >
                      <RitualIcon
                        name={node.glyph ?? node.icon ?? 'ellipse'}
                        size={isDone ? 22 : 26}
                        color={isDone ? '#0f1628' : isActive ? Palette.gold : Palette.textMuted}
                      />
                      {isDone && (
                        <View style={styles.checkBadge}>
                          <Ionicons name="checkmark" size={10} color="#fff" />
                        </View>
                      )}
                      {node.important && !isDone && (
                        <View style={styles.importantBadge}>
                          <Ionicons name="star" size={8} color={Palette.gold} />
                        </View>
                      )}
                    </TouchableOpacity>

                    <View style={styles.nodeLabel}>
                      <Text
                        style={[
                          styles.nodeLabelText,
                          isActive && styles.nodeLabelActive,
                          isDone && styles.nodeLabelDone,
                        ]}
                        numberOfLines={2}
                      >
                        {node.site}
                      </Text>
                      <Text
                        style={[styles.nodePhaseText, isActive && { color: Palette.gold }]}
                        numberOfLines={1}
                      >
                        {node.hijri}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {/* START marker */}
              <View
                style={[
                  styles.endMarker,
                  { top: NODE_GAP_Y - 32, left: getColX(roadCols[0], containerW) + NODE_SIZE / 2 - 30 },
                ]}
              >
                <Text style={styles.endMarkerText}>START</Text>
                <Ionicons name="flag" size={14} color={Palette.green} />
              </View>

              {/* FINISH marker */}
              <View
                style={[
                  styles.endMarker,
                  {
                    top: nodePositions[nodePositions.length - 1].y + NODE_SIZE + 14,
                    left: getColX(roadCols[roadCols.length - 1], containerW) + NODE_SIZE / 2 - 30,
                  },
                ]}
              >
                <Text style={styles.endMarkerText}>FINISH</Text>
                <Ionicons name="star" size={14} color={Palette.gold} />
              </View>
            </View>
          </ScrollView>
        </>
      ) : (
      /* ── RITUALS VIEW ───────────────────────────────────────────── */
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#1e2d52', '#1a2545', '#162038']}
          style={styles.dayHero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isToday && (
            <View style={styles.todayBadge}>
              <View style={styles.todayBadgeDot} />
              <Text style={styles.todayBadgeText}>TODAY</Text>
            </View>
          )}
          <Text style={styles.dayHeroHijri}>{day.hijri}</Text>
          <Text style={styles.dayHeroName}>{day.name}</Text>
          <Text style={styles.dayHeroArabic}>{day.arabicName}</Text>

          <View style={styles.dayHeroLocationRow}>
            <Ionicons name={day.locationIcon} size={14} color={Palette.gold} />
            <Text style={styles.dayHeroLocation}>{day.location}</Text>
          </View>

          <Text style={styles.dayHeroSummary}>{day.summary}</Text>

          {/* Decorative corners */}
          <View style={[styles.heroCorner, { top: 12, left: 12 }]} />
          <View style={[styles.heroCorner, { top: 12, right: 12, transform: [{ rotate: '90deg' }] }]} />
          <View style={[styles.heroCorner, { bottom: 12, left: 12, transform: [{ rotate: '270deg' }] }]} />
          <View style={[styles.heroCorner, { bottom: 12, right: 12, transform: [{ rotate: '180deg' }] }]} />
        </LinearGradient>

        {/* Timeline (rituals only) */}
        <>
            <Text style={styles.sectionTitle}>Your day, step by step</Text>
            <View style={styles.timeline}>
              {day.steps.map((step, i) => {
                const last = i === day.steps.length - 1;
                return (
                  <View key={i} style={styles.timelineRow}>
                    <View style={styles.timelineLeft}>
                      <View style={styles.timelineIconWrap}>
                        <Ionicons name={step.icon} size={16} color={Palette.gold} />
                      </View>
                      {!last && <View style={styles.timelineLine} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTime}>{step.time.toUpperCase()}</Text>
                      <Text style={styles.timelineTitle}>{step.title}</Text>
                      <Text style={styles.timelineDetail}>{step.detail}</Text>
                      {step.source && (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setProofsOpen(true)}
                          style={styles.sourceChip}
                        >
                          <Ionicons name="book" size={11} color={Palette.gold} />
                          <Text style={styles.sourceChipText}>{step.source}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Proofs from the Sunnah button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setProofsOpen(true)}
              style={styles.proofsBtn}
            >
              <Ionicons name="book" size={18} color={Palette.gold} />
              <View style={{ flex: 1 }}>
                <Text style={styles.proofsBtnTitle}>Proofs from the Sunnah</Text>
                <Text style={styles.proofsBtnSub}>
                  {day.proofs.length} hadith · {day.name}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Palette.gold} />
            </TouchableOpacity>

            {day.reminder && (
              <View style={styles.reminderCard}>
                <Ionicons name="information-circle" size={18} color={Palette.gold} />
                <Text style={styles.reminderText}>{day.reminder}</Text>
              </View>
            )}
          </>

        {/* Nav arrows */}
        <View style={styles.navRow}>
          <TouchableOpacity
            disabled={activeIndex === 0}
            onPress={() => setActiveIndex((i) => Math.max(0, i - 1))}
            style={[styles.navBtn, activeIndex === 0 && styles.navBtnDisabled]}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color={Palette.textPrimary} />
            <Text style={styles.navBtnText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={activeIndex === HAJJ_DAYS.length - 1}
            onPress={() => setActiveIndex((i) => Math.min(HAJJ_DAYS.length - 1, i + 1))}
            style={[styles.navBtn, activeIndex === HAJJ_DAYS.length - 1 && styles.navBtnDisabled]}
            activeOpacity={0.7}
          >
            <Text style={styles.navBtnText}>Next</Text>
            <Ionicons name="chevron-forward" size={18} color={Palette.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
      )} {/* end mode ternary */}

      {/* Node detail bottom sheet (roadmap) */}
      <Modal
        visible={detailOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailOpen(false)}
      >
        <View style={styles.sheetBackdrop}>
          <Pressable
            style={styles.sheetBackdropTapZone}
            onPress={() => {
              setInlineProofOpen(false);
              setDetailOpen(false);
            }}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            {detailNode && (
              <>
                <View style={styles.sheetHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetEyebrow}>{detailNode.hijri.toUpperCase()}</Text>
                    <Text style={styles.sheetTitle}>{detailNode.site}</Text>
                    {detailNode.arabicSite && (
                      <Text style={[styles.sheetSub, { fontFamily: 'serif', fontSize: 18 }]}>
                        {detailNode.arabicSite}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setInlineProofOpen(false);
                      setDetailOpen(false);
                    }}
                    style={styles.sheetClose}
                    hitSlop={10}
                  >
                    <Ionicons name="close" size={20} color={Palette.textPrimary} />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  style={styles.sheetScroll}
                  contentContainerStyle={styles.sheetContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.timelineDetail}>{detailNode.detail}</Text>

                  <View style={[styles.legMetaRow, { marginTop: 14 }]}>
                    {detailNode.transport && (
                      <View style={styles.legMetaChip}>
                        <Ionicons name={detailNode.transportIcon ?? 'walk'} size={12} color={Palette.gold} />
                        <Text style={styles.legMetaText}>{detailNode.transport}</Text>
                      </View>
                    )}
                    {detailNode.distanceFromPrev && (
                      <View style={styles.legMetaChip}>
                        <Ionicons name="navigate" size={12} color={Palette.gold} />
                        <Text style={styles.legMetaText}>{detailNode.distanceFromPrev}</Text>
                      </View>
                    )}
                    {detailNode.important && (
                      <View style={[styles.legMetaChip, { backgroundColor: 'rgba(201,168,76,0.15)' }]}>
                        <Ionicons name="star" size={12} color={Palette.gold} />
                        <Text style={styles.legMetaText}>Key rite</Text>
                      </View>
                    )}
                  </View>

                  {/* What to do at this site — pulls the day's full ritual steps */}
                  {(() => {
                    const relatedDay = getDayForNode(detailNode);
                    if (!relatedDay) return null;
                    return (
                      <>
                        <View style={styles.sheetSectionHeader}>
                          <Ionicons name="list" size={14} color={Palette.gold} />
                          <Text style={styles.sheetSectionTitle}>What to do here</Text>
                          <View style={styles.sheetSectionBadge}>
                            <Text style={styles.sheetSectionBadgeText}>
                              {relatedDay.steps.length} step{relatedDay.steps.length === 1 ? '' : 's'}
                            </Text>
                          </View>
                        </View>

                        <View style={[styles.timeline, { marginTop: 4 }]}>
                          {relatedDay.steps.map((step, i) => {
                            const last = i === relatedDay.steps.length - 1;
                            return (
                              <View key={i} style={styles.timelineRow}>
                                <View style={styles.timelineLeft}>
                                  <View style={styles.timelineIconWrap}>
                                    <Ionicons name={step.icon} size={14} color={Palette.gold} />
                                  </View>
                                  {!last && <View style={styles.timelineLine} />}
                                </View>
                                <View style={styles.timelineContent}>
                                  <Text style={styles.timelineTime}>{step.time.toUpperCase()}</Text>
                                  <Text style={styles.timelineTitle}>{step.title}</Text>
                                  <Text style={styles.timelineDetail}>{step.detail}</Text>
                                  {step.source && (
                                    <TouchableOpacity
                                      activeOpacity={0.75}
                                      onPress={() => {
                                        setInlineProofDay(relatedDay);
                                        setInlineProofSource(step.source ?? null);
                                        setInlineProofOpen(true);
                                      }}
                                      style={styles.sourceChip}
                                    >
                                      <Ionicons name="book" size={10} color={Palette.gold} />
                                      <Text style={styles.sourceChipText}>{step.source}</Text>
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View>
                            );
                          })}
                        </View>

                        {relatedDay.reminder && (
                          <View style={styles.reminderCard}>
                            <Ionicons name="information-circle" size={16} color={Palette.gold} />
                            <Text style={styles.reminderText}>{relatedDay.reminder}</Text>
                          </View>
                        )}

                        {relatedDay.proofs.length > 0 && (
                          <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => {
                              const dayIdx = HAJJ_DAYS.indexOf(relatedDay);
                              if (dayIdx >= 0) setActiveIndex(dayIdx);
                              setProofSourceFilter(null);
                              setDetailOpen(false);
                              setTimeout(() => setProofsOpen(true), 250);
                            }}
                            style={styles.proofsBtn}
                          >
                            <Ionicons name="book" size={18} color={Palette.gold} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.proofsBtnTitle}>Proofs from the Sunnah</Text>
                              <Text style={styles.proofsBtnSub}>
                                {relatedDay.proofs.length} hadith · {relatedDay.name}
                              </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={Palette.gold} />
                          </TouchableOpacity>
                        )}
                      </>
                    );
                  })()}

                  <View style={styles.navRow}>
                    <TouchableOpacity
                      disabled={roadmapActiveIdx === 0}
                      onPress={() => {
                        const prev = roadmapActiveIdx - 1;
                        setRoadmapActiveIdx(prev);
                        setInlineProofOpen(false);
                        setDetailNode(HAJJ_NODES[prev]);
                      }}
                      style={[styles.navBtn, roadmapActiveIdx === 0 && styles.navBtnDisabled]}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="chevron-back" size={16} color={Palette.textPrimary} />
                      <Text style={styles.navBtnText}>Previous</Text>
                    </TouchableOpacity>
                    {roadmapActiveIdx < HAJJ_NODES.length - 1 ? (
                      <TouchableOpacity
                        onPress={() => {
                          const next = roadmapActiveIdx + 1;
                          setRoadmapActiveIdx(next);
                          setInlineProofOpen(false);
                          setDetailNode(HAJJ_NODES[next]);
                        }}
                        style={[styles.navBtn, styles.navBtnPrimary]}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.navBtnText, { color: '#0f1628' }]}>Next</Text>
                        <Ionicons name="chevron-forward" size={16} color="#0f1628" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setInlineProofOpen(false);
                          setDetailOpen(false);
                        }}
                        style={[styles.navBtn, styles.navBtnPrimary]}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="checkmark-circle" size={16} color="#0f1628" />
                        <Text style={[styles.navBtnText, { color: '#0f1628' }]}>Finish</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={{ height: 20 }} />
                </ScrollView>

                {inlineProofMounted && inlineProofDay && (
                  <Animated.View
                    style={[
                      styles.inlineProofBackdrop,
                      {
                        opacity: inlineProofAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }),
                      },
                    ]}
                  >
                    <Pressable
                      style={styles.inlineProofBackdropTapZone}
                      onPress={() => setInlineProofOpen(false)}
                    />
                    <Animated.View
                      style={[
                        styles.inlineProofSheet,
                        {
                          opacity: inlineProofAnim,
                          transform: [
                            {
                              translateY: inlineProofAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [38, 0],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <View style={styles.inlineProofHandle} />
                      <View style={styles.inlineProofHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.sheetEyebrow}>HADITH</Text>
                          <Text style={styles.inlineProofTitle}>{inlineProofDay.name}</Text>
                          {inlineProofSource && (
                            <Text style={styles.sheetSub}>{inlineProofSource}</Text>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={() => setInlineProofOpen(false)}
                          style={styles.sheetClose}
                          hitSlop={10}
                        >
                          <Ionicons name="close" size={18} color={Palette.textPrimary} />
                        </TouchableOpacity>
                      </View>

                      <ScrollView
                        style={styles.inlineProofScroll}
                        contentContainerStyle={styles.inlineProofContent}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                      >
                        {inlineProofItems.map((p, i) => (
                          <View key={`${p.source}-${i}`} style={styles.proofCard}>
                            <View style={styles.proofTopicRow}>
                              <View style={styles.proofNumber}>
                                <Text style={styles.proofNumberText}>{i + 1}</Text>
                              </View>
                              <Text style={styles.proofTopic}>{p.topic}</Text>
                            </View>
                            <View style={styles.proofQuoteWrap}>
                              <View style={styles.proofQuoteBar} />
                              <Text style={styles.proofNarration}>“{p.narration}”</Text>
                            </View>
                            <View style={styles.proofSourceRow}>
                              <Ionicons name="book" size={12} color={Palette.gold} />
                              <Text style={styles.proofSource}>{p.source}</Text>
                            </View>
                          </View>
                        ))}
                        <View style={{ height: 14 }} />
                      </ScrollView>
                    </Animated.View>
                  </Animated.View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Proofs bottom sheet */}
      <Modal
        visible={proofsOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setProofsOpen(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setProofsOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetEyebrow}>PROOFS FROM THE SUNNAH</Text>
                <Text style={styles.sheetTitle}>{day.name}</Text>
                <Text style={styles.sheetSub}>{day.hijri}</Text>
                {proofView.isFiltered && proofSourceFilter && (
                  <Text style={styles.sheetSub}>Filtered: {proofSourceFilter}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => {
                  setProofsOpen(false);
                  setProofSourceFilter(null);
                }}
                style={styles.sheetClose}
                hitSlop={10}
              >
                <Ionicons name="close" size={20} color={Palette.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={styles.sheetContent}
              showsVerticalScrollIndicator={false}
            >
              {proofView.items.map((p, i) => (
                <View key={i} style={styles.proofCard}>
                  <View style={styles.proofTopicRow}>
                    <View style={styles.proofNumber}>
                      <Text style={styles.proofNumberText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.proofTopic}>{p.topic}</Text>
                  </View>
                  <View style={styles.proofQuoteWrap}>
                    <View style={styles.proofQuoteBar} />
                    <Text style={styles.proofNarration}>“{p.narration}”</Text>
                  </View>
                  <View style={styles.proofSourceRow}>
                    <Ionicons name="book" size={12} color={Palette.gold} />
                    <Text style={styles.proofSource}>{p.source}</Text>
                  </View>
                </View>
              ))}
              <View style={{ height: 24 }} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 17,
    color: Palette.textPrimary,
  },

  daysStrip: { maxHeight: 78, flexGrow: 0 },
  daysStripContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  dayPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Palette.cardBg,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
    minWidth: 72,
    position: 'relative',
  },
  dayPillActive: {
    backgroundColor: Palette.goldMuted,
    borderColor: Palette.goldLight,
  },
  dayPillNum: {
    fontFamily: QasdFonts.display,
    fontSize: 22,
    color: Palette.textPrimary,
    lineHeight: 24,
  },
  dayPillNumActive: { color: Palette.gold },
  dayPillLabel: {
    fontFamily: QasdFonts.body,
    fontSize: 10,
    color: Palette.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  dayPillLabelActive: { color: Palette.gold },
  todayDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.green,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 30 },

  dayHero: {
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    overflow: 'hidden',
    marginBottom: 22,
    marginTop: 4,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Palette.greenMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 12,
    gap: 6,
  },
  todayBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Palette.green },
  todayBadgeText: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 10,
    color: Palette.green,
    letterSpacing: 1,
  },
  dayHeroHijri: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 12,
    color: Palette.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dayHeroName: {
    fontFamily: QasdFonts.display,
    fontSize: 30,
    color: Palette.textPrimary,
    lineHeight: 34,
    marginTop: 4,
  },
  dayHeroArabic: {
    fontFamily: QasdFonts.displayRegular,
    fontSize: 22,
    color: Palette.gold,
    marginTop: 4,
    textAlign: 'right',
  },
  dayHeroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  dayHeroLocation: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 13,
    color: Palette.textPrimary,
  },
  dayHeroSummary: {
    fontFamily: QasdFonts.body,
    fontSize: 14,
    color: Palette.textSecondary,
    lineHeight: 20,
    marginTop: 12,
  },
  heroCorner: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: Palette.gold,
  },

  sectionTitle: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 13,
    color: Palette.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  timeline: { marginBottom: 18 },
  timelineRow: { flexDirection: 'row', gap: 14 },
  timelineLeft: { alignItems: 'center', width: 32 },
  timelineIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.goldMuted,
    borderWidth: 1,
    borderColor: Palette.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 1.5,
    backgroundColor: Palette.goldBorder,
    marginTop: 4,
    marginBottom: -4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 22,
  },
  timelineTime: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 10,
    color: Palette.gold,
    letterSpacing: 1.2,
  },
  timelineTitle: {
    fontFamily: QasdFonts.display,
    fontSize: 19,
    color: Palette.textPrimary,
    marginTop: 2,
    lineHeight: 24,
  },
  timelineDetail: {
    fontFamily: QasdFonts.body,
    fontSize: 14,
    color: Palette.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },

  reminderCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Palette.goldMuted,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
  },
  reminderText: {
    flex: 1,
    fontFamily: QasdFonts.body,
    fontSize: 13,
    color: Palette.textPrimary,
    lineHeight: 19,
  },

  navRow: { flexDirection: 'row', gap: 10 },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: Palette.cardBg,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 14,
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnPrimary: { backgroundColor: Palette.gold, borderColor: Palette.gold },
  navBtnText: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 14,
    color: Palette.textPrimary,
  },

  // Serpentine roadmap nodes
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    backgroundColor: Palette.cardBg,
    borderWidth: 1.5,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: {
    backgroundColor: Palette.gold,
    borderColor: Palette.gold,
  },
  nodeActive: {
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderColor: Palette.gold,
    borderWidth: 2.5,
  },
  nodeLocked: {
    opacity: 0.55,
  },
  nodeFinish: {
    backgroundColor: 'rgba(201,168,76,0.2)',
    borderColor: Palette.gold,
    borderWidth: 2,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importantBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(201,168,76,0.25)',
    borderWidth: 1,
    borderColor: Palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLabel: {
    position: 'absolute',
    top: NODE_SIZE + 4,
    width: 88,
    alignItems: 'center',
  },
  nodeLabelText: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 10,
    color: Palette.textMuted,
    textAlign: 'center',
    lineHeight: 13,
  },
  nodeLabelActive: { color: Palette.textPrimary },
  nodeLabelDone: { color: Palette.gold },
  nodePhaseText: {
    fontFamily: QasdFonts.body,
    fontSize: 9,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: 1,
  },
  endMarker: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  endMarkerText: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 11,
    color: Palette.textSecondary,
    letterSpacing: 1,
  },

  // Progress bar
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Palette.cardBg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.gold,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 11,
    color: Palette.textMuted,
  },

  // Source chip under each step
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Palette.goldMuted,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  sourceChipText: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 11,
    color: Palette.gold,
    letterSpacing: 0.3,
  },

  // Proofs entry button
  proofsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
    backgroundColor: 'rgba(201,168,76,0.08)',
    marginTop: 4,
    marginBottom: 16,
  },
  proofsBtnTitle: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  proofsBtnSub: {
    fontFamily: QasdFonts.body,
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },

  // Bottom sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheetBackdropTapZone: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: Palette.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 8,
    height: '88%',
    minHeight: 420,
    borderTopWidth: 1,
    borderColor: Palette.goldBorder,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.textMuted,
    opacity: 0.4,
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  sheetEyebrow: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 10,
    color: Palette.gold,
    letterSpacing: 1.4,
  },
  sheetTitle: {
    fontFamily: QasdFonts.display,
    fontSize: 24,
    color: Palette.textPrimary,
    marginTop: 3,
  },
  sheetSub: {
    fontFamily: QasdFonts.body,
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  sheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.cardBg,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  sheetScroll: {
    flex: 1,
  },
  sheetContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
  },
  sheetSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 22,
    marginBottom: 4,
  },
  sheetSectionTitle: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 13,
    color: Palette.textPrimary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
  },
  sheetSectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: Palette.goldMuted,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  sheetSectionBadgeText: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 10,
    color: Palette.gold,
    letterSpacing: 0.4,
  },
  inlineProofBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  inlineProofBackdropTapZone: {
    ...StyleSheet.absoluteFillObject,
  },
  inlineProofSheet: {
    backgroundColor: Palette.cardBg,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    borderColor: Palette.goldBorder,
    height: '55%',
    minHeight: 420,
  },
  inlineProofHandle: {
    alignSelf: 'center',
    width: 34,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.textMuted,
    opacity: 0.45,
    marginTop: 8,
    marginBottom: 10,
  },
  inlineProofHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  inlineProofTitle: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 16,
    color: Palette.textPrimary,
    marginTop: 2,
  },
  inlineProofScroll: {
    flex: 1,
  },
  inlineProofContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20,
  },
  proofCard: {
    backgroundColor: Palette.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 14,
  },
  proofTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  proofNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.goldMuted,
    borderWidth: 1,
    borderColor: Palette.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proofNumberText: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 11,
    color: Palette.gold,
  },
  proofTopic: {
    flex: 1,
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  proofQuoteWrap: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  proofQuoteBar: {
    width: 2,
    backgroundColor: Palette.gold,
    borderRadius: 1,
    opacity: 0.6,
  },
  proofNarration: {
    flex: 1,
    fontFamily: QasdFonts.displayRegular,
    fontSize: 16,
    color: Palette.textPrimary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  proofSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  proofSource: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 12,
    color: Palette.gold,
    letterSpacing: 0.3,
  },

  // Segmented control: Rituals | Roadmap
  segment: {
    flexDirection: 'row',
    backgroundColor: Palette.cardBg,
    borderRadius: 12,
    padding: 4,
    marginTop: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: Palette.goldMuted,
  },
  segmentText: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 13,
    color: Palette.textSecondary,
    letterSpacing: 0.3,
  },
  segmentTextActive: {
    color: Palette.gold,
    fontFamily: QasdFonts.bodySemiBold,
  },

  // Roadmap
  roadmapHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roadmapSub: {
    fontFamily: QasdFonts.body,
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 2,
    textTransform: 'none',
    letterSpacing: 0,
  },
  roadmapTotalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Palette.goldMuted,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  roadmapTotalText: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 11,
    color: Palette.gold,
    letterSpacing: 0.3,
  },
  legIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Palette.goldMuted,
    borderWidth: 1,
    borderColor: Palette.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
    marginBottom: 8,
  },
  legPlace: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  legMetaRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  legMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(201,168,76,0.08)',
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  legMetaText: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 11,
    color: Palette.gold,
  },
  emptyLeg: {
    alignItems: 'center',
    padding: 28,
    backgroundColor: Palette.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 18,
  },
  emptyLegTitle: {
    fontFamily: QasdFonts.displayMedium,
    fontSize: 20,
    color: Palette.textPrimary,
    marginTop: 10,
  },
  emptyLegText: {
    fontFamily: QasdFonts.body,
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  overviewCard: {
    backgroundColor: Palette.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  overviewRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  overviewDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Palette.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewRoute: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 13,
    color: Palette.textPrimary,
  },
  overviewMeta: {
    fontFamily: QasdFonts.body,
    fontSize: 11,
    color: Palette.textMuted,
    marginTop: 2,
  },
});
