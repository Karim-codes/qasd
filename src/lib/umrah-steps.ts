import type { RitualGlyphKind } from '@/components/ritual-glyph';
import type { Ionicons } from '@expo/vector-icons';

export type UmrahStep = {
  id: string;
  phase: string;
  title: string;
  arabicTitle?: string;
  detail: string;
  dua?: { arabic: string; transliteration: string; translation: string };
  laps?: LapInfo;
  icon: keyof typeof Ionicons.glyphMap;
  important?: boolean;
  glyph?: RitualGlyphKind;
};

export type LapInfo = {
  total: number;
  fastWalkLaps: number;
  perLapAction?: string;
};

export const UMRAH_STEPS: UmrahStep[] = [
  {
    id: 'ihram',
    phase: 'Preparation',
    title: 'Enter Ihram',
    arabicTitle: 'ٱلْإِحْرَام',
    detail:
      'Before reaching the Miqat, perform Ghusl (full body wash), wear your Ihram garments (two white unstitched cloths for men), and make the intention (niyyah) for Umrah. Then recite the Talbiyah.',
    dua: {
      arabic: 'لَبَّيْكَ ٱللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ ٱلْحَمْدَ وَٱلنِّعْمَةَ لَكَ وَٱلْمُلْكَ، لَا شَرِيكَ لَكَ',
      transliteration:
        'Labbayk Allaahumma labbayk, labbayk laa shareeka laka labbayk, innal-hamda wan-ni\'mata laka wal-mulk, laa shareeka lak',
      translation:
        'Here I am O Allah, here I am. Here I am, You have no partner, here I am. Verily all praise, grace, and sovereignty belong to You. You have no partner.',
    },
    icon: 'shirt',
  },
  {
    id: 'enter-masjid',
    phase: 'Al-Masjid al-Haram',
    title: 'Enter the Mosque',
    arabicTitle: 'دُخُول ٱلْمَسْجِد',
    glyph: 'mosque',
    detail:
      'Enter al-Masjid al-Haram through Bab as-Salam or any door. Step in with your right foot first and recite the du\'a for entering.',
    dua: {
      arabic: 'بِسْمِ ٱللَّهِ، وَٱلصَّلَاةُ وَٱلسَّلَامُ عَلَىٰ رَسُولِ ٱللَّهِ، ٱللَّهُمَّ ٱفْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
      transliteration:
        'Bismillaah, was-salaatu was-salaamu \'alaa Rasoolillaah. Allaahumma iftah lee abwaaba rahmatik',
      translation:
        'In the name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, open for me the doors of Your mercy.',
    },
    icon: 'enter',
    important: true,
  },
  {
    id: 'first-sight',
    phase: 'First Sight',
    title: 'See the Ka\'bah',
    detail:
      'When you first see the Ka\'bah, stop and raise your hands in du\'a. This is a moment when supplications are accepted — ask Allah for whatever you wish.',
    icon: 'eye',
    important: true,
  },
  {
    id: 'tawaf-start',
    phase: 'Tawaf',
    title: 'Black Stone Start',
    arabicTitle: 'ٱلطَّوَاف',
    glyph: 'kaaba',
    detail:
      'Start at the Black Stone corner (green light marks it). If possible, touch or kiss it. If crowded, point with your right hand and say "Allahu Akbar". Keep the Ka\'bah on your left.',
    dua: {
      arabic: 'بِسْمِ ٱللَّهِ، ٱللَّهُ أَكْبَرُ',
      transliteration: 'Bismillaah, Allahu Akbar',
      translation: 'In the name of Allah, Allah is the Greatest.',
    },
    laps: {
      total: 7,
      fastWalkLaps: 3,
      perLapAction: 'Each time you pass the Black Stone, face it, point with your right hand, and say "Allahu Akbar".',
    },
    icon: 'refresh-circle',
    important: true,
  },
  {
    id: 'tawaf-raml',
    phase: 'Laps 1–3',
    title: 'Fast Walk (Raml)',
    arabicTitle: 'ٱلرَّمَل',
    detail:
      'First three rounds: men walk briskly with short steps. Practice Idtiba (uncover right shoulder). Recite du\'a between the Yemeni Corner and Black Stone.',
    dua: {
      arabic: 'رَبَّنَا آتِنَا فِي ٱلدُّنْيَا حَسَنَةً وَفِي ٱلْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ',
      transliteration: 'Rabbanaa aatinaa fid-dunyaa hasanatan wa fil-aakhirati hasanatan wa qinaa \'adhaab an-naar',
      translation: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
    },
    icon: 'speedometer',
  },
  {
    id: 'tawaf-normal',
    phase: 'Laps 4–7',
    title: 'Walk Normally',
    detail:
      'Rounds 4–7: walk at a normal pace. Continue du\'a, dhikr, and Quran. Say "Allahu Akbar" each time you pass the Black Stone.',
    icon: 'walk',
  },
  {
    id: 'tawaf-prayer',
    phase: 'After Tawaf',
    title: '2 Rak\'ah Prayer',
    arabicTitle: 'صَلَاة ٱلْمَقَام',
    detail:
      'Pray 2 rak\'ah behind Maqam Ibrahim. Recite Surah al-Kafirun in the first, Surah al-Ikhlas in the second. If crowded, pray anywhere in the mosque.',
    dua: {
      arabic: 'وَٱتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى',
      transliteration: 'Wat-takhidhoo min maqaami Ibraaheema musalla',
      translation: 'And take the station of Ibrahim as a place of prayer. (Quran 2:125)',
    },
    icon: 'book',
    important: true,
  },
  {
    id: 'zamzam',
    phase: 'Zamzam',
    title: 'Drink Zamzam',
    detail:
      'Face the Qiblah, say "Bismillah", drink in three sips. "Zamzam water is for whatever it is drunk for." Ask for knowledge, provision, and cure.',
    icon: 'water',
  },
  {
    id: 'sai-start',
    phase: 'Sa\'i Begins',
    title: 'Mount Safa',
    arabicTitle: 'ٱلسَّعْي',
    detail:
      'Go to Mount Safa. Face the Ka\'bah, raise your hands, say "Allahu Akbar" three times and make du\'a.',
    dua: {
      arabic: 'إِنَّ ٱلصَّفَا وَٱلْمَرْوَةَ مِن شَعَائِرِ ٱللَّهِ',
      transliteration: 'Innas-Safaa wal-Marwata min sha\'aa\'irillaah',
      translation: 'Indeed, Safa and Marwa are among the symbols of Allah. (Quran 2:158)',
    },
    icon: 'flag',
    important: true,
  },
  {
    id: 'sai-laps',
    phase: '7 Laps',
    title: 'Safa ↔ Marwa',
    detail:
      'Walk Safa→Marwa (1), Marwa→Safa (2)… 7 laps ending at Marwa. Men jog between the green lights. Make personal du\'a throughout.',
    laps: {
      total: 7,
      fastWalkLaps: 0,
      perLapAction: 'At each mountain, face the Ka\'bah, raise your hands, and make du\'a.',
    },
    icon: 'repeat',
  },
  {
    id: 'halq',
    phase: 'Completion',
    title: 'Shave / Trim',
    arabicTitle: 'ٱلْحَلْق',
    detail:
      'Men: shaving (Halq) is preferred. Women: trim a fingertip\'s length. After this, all Ihram restrictions are lifted.',
    icon: 'cut',
    important: true,
  },
  {
    id: 'complete',
    phase: 'Alhamdulillah',
    title: 'Umrah Complete!',
    detail:
      'Your Umrah is complete! You are free from Ihram. May Allah accept your worship.',
    icon: 'checkmark-circle',
    important: true,
  },
];

