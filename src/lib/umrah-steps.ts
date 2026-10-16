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
      'At the Miqat, bathe if able and put on suitable clothing. Enter Ihram with the intention in your heart to perform Umrah, saying "Labbayka Umrah", then recite the Talbiyah. Continue the Talbiyah until you reach the Ka\'bah to begin Tawaf. Ihram is a sacred state, not just clothing.',
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
      'Enter al-Masjid al-Haram through an open entrance, following the signs and staff guidance. Step in with your right foot and recite the du\'a for entering.',
    dua: {
      arabic: 'بِسْمِ ٱللَّهِ، وَٱلصَّلَاةُ وَٱلسَّلَامُ عَلَىٰ رَسُولِ ٱللَّهِ، أَعُوذُ بِٱللَّهِ ٱلْعَظِيمِ وَبِوَجْهِهِ ٱلْكَرِيمِ وَسُلْطَانِهِ ٱلْقَدِيمِ مِنَ ٱلشَّيْطَانِ ٱلرَّجِيمِ، ٱللَّهُمَّ ٱفْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
      transliteration:
        'Bismillaah, was-salaatu was-salaamu \'alaa Rasoolillaah. A\'oodhu billaahil-\'azeem, wa biwajhihil-kareem, wa sultaanihil-qadeem, minash-shaytaanir-rajeem. Allaahumma iftah lee abwaaba rahmatik',
      translation:
        'In the name of Allah, and peace and blessings be upon the Messenger of Allah. I seek refuge in Allah the Magnificent, His noble Face and His eternal authority, from the accursed Satan. O Allah, open for me the doors of Your mercy.',
    },
    icon: 'enter',
    important: true,
  },
  {
    id: 'first-sight',
    phase: 'First Sight',
    title: 'See the Ka\'bah',
    detail:
      'Orient yourself towards the Ka\'bah and locate the Black Stone corner before beginning Tawaf. Keep entrances and walking routes clear. Seeing the Ka\'bah is not an additional ritual step; no special first-sight du\'a or promise of acceptance is prescribed here.',
    icon: 'eye',
  },
  {
    id: 'tawaf-start',
    phase: 'Tawaf',
    title: 'Black Stone Start',
    arabicTitle: 'ٱلطَّوَاف',
    glyph: 'kaaba',
    detail:
      'Be in a state of ritual purity before Tawaf, as explained in Ibn Baz\'s guide. Begin in line with the Black Stone corner; the green wall light helps identify that alignment. Keep the Ka\'bah on your left and go around it seven times, outside the semicircular Hijr enclosure. Touch and kiss the Black Stone only if possible without harming anyone. Otherwise, point towards it with your right hand and say "Allahu Akbar"; do not kiss your hand when pointing.',
    dua: {
      arabic: 'ٱللَّهُ أَكْبَرُ',
      transliteration: 'Allahu Akbar',
      translation: 'Allah is the Greatest.',
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
      'For men, Raml is recommended in the first three circuits of this Umrah Tawaf: brisk, short steps when space allows. Walk normally in circuits 4–7. If crowded, walk normally without pushing. Idtiba (uncovering the right shoulder) is recommended for men throughout all seven circuits of this Tawaf; cover both shoulders afterwards, before prayer. Women walk normally throughout and remain covered. The du\'a shown is recited between the Yemeni Corner and Black Stone in every circuit.',
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
      'After Tawaf, cover both shoulders and offer two rak\'ahs behind Maqam Ibrahim if space allows; otherwise, pray elsewhere in the mosque without blocking pilgrims. After al-Fatihah, al-Kafirun in the first rak\'ah and al-Ikhlas in the second are recommended; other surahs may also be recited.',
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
      'Drinking Zamzam is recommended when it is available. Use a marked drinking point and leave room for others. This is not a required step for completing Umrah; no fixed number of sips, direction or special formula is required by this guide.',
    icon: 'water',
  },
  {
    id: 'sai-start',
    phase: 'Sa\'i Begins',
    title: 'Mount Safa',
    arabicTitle: 'ٱلسَّعْي',
    detail:
      'Begin Sa\'i at Safa. On first approaching it, recite the verse shown. Stand on or by Safa, face the Qiblah, praise Allah and recite the remembrance shown, raising your hands in personal du\'a. Repeat the remembrance and supplication three times. At Marwa, do likewise, without repeating the verse for approaching Safa.',
    dua: {
      arabic: 'إِنَّ ٱلصَّفَا وَٱلْمَرْوَةَ مِن شَعَائِرِ ٱللَّهِ\n\nلَا إِلَٰهَ إِلَّا ٱللَّهُ وَٱللَّهُ أَكْبَرُ، لَا إِلَٰهَ إِلَّا ٱللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ ٱلْمُلْكُ وَلَهُ ٱلْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَٰهَ إِلَّا ٱللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ وَنَصَرَ عَبْدَهُ وَهَزَمَ ٱلْأَحْزَابَ وَحْدَهُ',
      transliteration: 'On first approaching Safa: Innas-Safaa wal-Marwata min sha\'aa\'irillaah.\n\nAt Safa and Marwa: Laa ilaaha illallaahu wallaahu akbar. Laa ilaaha illallaahu wahdahu laa shareeka lah, lahul-mulku wa lahul-hamdu wa huwa \'alaa kulli shay\'in qadeer. Laa ilaaha illallaahu wahdah, anjaza wa\'dah, wa nasara \'abdah, wa hazamal-ahzaaba wahdah.',
      translation: 'On first approaching Safa: Indeed, Safa and Marwa are among the symbols of Allah. (Quran 2:158)\n\nAt Safa and Marwa: There is no god but Allah, and Allah is the Greatest. There is no god but Allah alone, without partner. To Him belongs sovereignty and praise, and He has power over all things. There is no god but Allah alone; He fulfilled His promise, aided His servant and defeated the confederates alone. Make personal du\'a between repetitions.',
    },
    icon: 'flag',
    important: true,
  },
  {
    id: 'sai-laps',
    phase: '7 Laps',
    title: 'Safa ↔ Marwa',
    detail:
      'Walk Safa→Marwa (1), Marwa→Safa (2), until seven lengths end at Marwa. Men may move faster between the green markers when able; women walk throughout. Make personal du\'a along the way.',
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
      'After completing Sa\'i, men shave the head or shorten the hair across the whole head. Shaving is generally preferred; Ibn Baz recommends shortening when Hajj is close so the head can be shaved for Hajj. Women gather their hair and cut a fingertip\'s length or less from the ends; they do not shave. Completing this after Tawaf and Sa\'i ends the restrictions of Ihram.',
    icon: 'cut',
    important: true,
  },
  {
    id: 'complete',
    phase: 'Alhamdulillah',
    title: 'Umrah Complete!',
    detail:
      'After completing Tawaf, Sa\'i and shaving or trimming, the restrictions of Ihram end. May Allah accept your worship. Checking off items in Qasd records your progress; it does not determine whether a ritual is valid.',
    icon: 'checkmark-circle',
    important: true,
  },
];

