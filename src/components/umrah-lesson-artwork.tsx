import { AppIcon } from '@/components/app-icon';
import { RitualIcon } from '@/components/ritual-glyph';
import { QasdFonts as F } from '@/constants/qasd-theme';
import { TravelColors as C } from '@/constants/travel-design';
import type { LessonArtwork } from '@/lib/umrah-lesson-content';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

export const HARAM_PHOTO = require('../../assets/learning/haram-kaaba.jpg');
const IHRAM_ILLUSTRATION = require('../../assets/learning/ihram-pilgrims.jpg');
const TRIM_ILLUSTRATION = require('../../assets/learning/hair-trim.jpg');
const MEN_SHAVING_ILLUSTRATION = require('../../assets/learning/men-hair-shaving.jpg');
const COMPLETION_ILLUSTRATION = require('../../assets/learning/completion-dua.jpg');
const ENTRANCE_PHOTO = require('../../assets/learning/haram-entry-pov.jpg');
const KAABA_CLOSE_PHOTO = require('../../assets/learning/kaaba-close-pov.jpg');
const BLACK_STONE_PHOTO = require('../../assets/learning/black-stone.jpg');
const GREEN_MARKER_ILLUSTRATION = require('../../assets/learning/tawaf-green-marker.jpg');
const MAQAM_PHOTO = require('../../assets/learning/maqam-ibrahim.jpg');
const ZAMZAM_PHOTO = require('../../assets/learning/zamzam-drinking-point.jpg');
const SAFA_PHOTO = require('../../assets/learning/mount-safa.jpg');
const SAFA_SIGN_PHOTO = require('../../assets/learning/safa-start-sign.jpg');

function TawafStartGuide() {
  return <View accessible accessibilityRole="image" accessibilityLabel="Tawaf alignment diagram, not to scale. The Black Stone is at one corner of the Ka’bah. The green light on the opposite mosque wall marks the same line. Begin on that line, walk anticlockwise, and return to the same line to complete one circuit." style={s.startGuide}>
    <Text style={s.eyebrow}>FIND YOUR STARTING LINE</Text>
    <View style={s.startPlanRow}>
      <View style={s.startPlan}>
        <View style={s.startRoute} />
        <View style={s.hijrPlan} />
        <View style={s.kaabaPlan}><View style={s.kaabaBand} /><Text style={s.kaabaLabel}>Ka’bah</Text><View style={s.stoneDot} /></View>
        <AppIcon name="arrow-back" size={20} color={C.forest} style={s.planNorth} />
        <AppIcon name="arrow-down" size={20} color={C.forest} style={s.planWest} />
        <AppIcon name="arrow-forward" size={20} color={C.forest} style={s.planSouth} />
        <AppIcon name="arrow-up" size={20} color={C.forest} style={s.planEast} />
        {Array.from({ length: 10 }, (_, i) => <View key={i} style={[s.alignmentDot, { left: 128 + i * 5, top: 138 + i * 4 }]} />)}
        <View style={s.greenLight} />
      </View>
    </View>
    <View style={s.startKey}><View style={s.blackKey} /><Text style={s.routeText}>Black Stone corner</Text></View>
    <View style={s.startKey}><View style={s.greenKey} /><Text style={s.routeText}>Green light on the opposite wall</Text></View>
    <Text style={s.startDirection}>Begin here → anticlockwise</Text>
    <Text style={s.diagramNote}>Return to the same line for one circuit. Complete seven.</Text>
    <Text style={s.schematicNote}>Alignment diagram · not to scale</Text>
  </View>;
}

export function UmrahLessonArtwork({ kind, compact = false }: { kind: LessonArtwork; compact?: boolean }) {
  if (kind === 'raml') return <View accessible accessibilityRole="image" accessibilityLabel="Seven Tawaf circuits. Circuits 1, 2 and 3 are highlighted for men’s Raml when space allows. Circuits 4, 5, 6 and 7 are normal walking. Women walk normally in all seven circuits." style={[s.diagram, compact && s.compactDiagram]}>
    <Text style={s.eyebrow}>SEVEN CIRCUITS · TWO PACES</Text>
    <View style={s.lengths}>{Array.from({ length: 7 }, (_, index) => <View key={index} style={[s.length, index < 3 && s.ramlLength]}><Text style={[s.lengthNumber, index < 3 && s.ramlNumber]}>{index + 1}</Text></View>)}</View>
    <View style={s.paceKey}><View style={s.paceDot} /><Text style={s.paceText}>1–3 · Raml for men, when space allows</Text></View>
    <View style={s.paceKey}><View style={[s.paceDot, s.normalPaceDot]} /><Text style={s.paceText}>4–7 · Walk normally</Text></View>
    <Text style={s.diagramNote}>Women: normal walking throughout.{ '\n' }Keep the Ka’bah on your left.</Text>
  </View>;

  if (kind === 'trim') return <View style={[s.trimPair, compact && s.compactTrimPair]}>
    <View style={s.trimExample}>
      <Image source={MEN_SHAVING_ILLUSTRATION} accessible accessibilityLabel="Illustration of a male pilgrim having his whole head shaved with clippers, with his beard left untouched." contentFit="cover" style={[s.trimImage, compact && s.compactTrimImage]} />
      {!compact && <><Text style={s.exampleTitle}>For men</Text><Text style={s.exampleDetail}>Shave or shorten</Text></>}
    </View>
    <View style={s.trimExample}>
      <Image source={TRIM_ILLUSTRATION} accessible accessibilityLabel="Illustration of a woman’s hands trimming a small amount from the ends of gathered hair." contentFit="cover" style={[s.trimImage, compact && s.compactTrimImage]} />
      {!compact && <><Text style={s.exampleTitle}>For women</Text><Text style={s.exampleDetail}>Trim the ends</Text></>}
    </View>
  </View>;

  if (kind === 'tawaf-start') return <View style={s.artworkStack}>
    <View style={[s.trimPair, compact && s.compactTrimPair]}>
      <View style={s.trimExample}>
        <Image source={BLACK_STONE_PHOTO} accessible accessibilityLabel="Actual close-up photograph of the Black Stone, set into its silver frame at the corner of the Ka’bah." contentFit="cover" style={[s.trimImage, compact && s.compactTrimImage]} />
        {!compact && <><Text style={s.exampleTitle}>Black Stone</Text><Text style={s.exampleDetail}>In its silver frame</Text></>}
      </View>
      <View style={s.trimExample}>
        <Image source={GREEN_MARKER_ILLUSTRATION} accessible accessibilityLabel="Illustrated reference of a bright green vertical Tawaf marker on the mosque wall. This is an illustration, not a documentary photograph." contentFit="cover" style={[s.trimImage, compact && s.compactTrimImage]} />
        {!compact && <><Text style={s.exampleTitle}>Green wall light</Text><Text style={s.exampleDetail}>Illustrated reference</Text></>}
      </View>
    </View>
    {!compact && <TawafStartGuide />}
  </View>;

  if (kind === 'safa') return <View style={s.artworkStack}>
    <Image source={SAFA_PHOTO} accessible accessibilityLabel="Actual photograph of the exposed rock of Mount Safa inside the mosque, beside the walking area." contentFit="cover" style={[s.image, { aspectRatio: 1.4 }, compact && s.compactImage]} />
    {!compact && <>
      <Text style={s.photoNote}>Safa is a rock formation inside the mosque.</Text>
      <Image source={SAFA_SIGN_PHOTO} accessible accessibilityLabel="Actual photograph of pilgrims approaching the sign reading Safa Start in Arabic, English and Urdu." contentFit="cover" contentPosition={{ left: '50%', top: '30%' }} style={[s.image, { aspectRatio: 2.1 }]} />
      <Text style={s.photoNote}>Look for the Safa Start sign before your first length.</Text>
    </>}
  </View>;

  if (kind === 'sai') return <View accessible accessibilityRole="image" accessibilityLabel="Sa’i counting diagram. Safa to Marwa is one length, back to Safa is two. Complete seven lengths, ending at Marwa." style={[s.diagram, compact && s.compactDiagram]}>
    {!compact && <Text style={s.eyebrow}>COUNT ONE WAY AT A TIME</Text>}
    <View style={s.hills}><Text style={s.place}>Safa</Text><Text style={s.place}>Marwa</Text></View>
    <View style={s.route}><View style={s.hill} /><View style={s.routeLine} /><AppIcon name="arrow-forward" size={compact ? 15 : 22} color={C.forest} /><View style={s.hill} /></View>
    {!compact && <>
      <View style={s.routeLabels}><Text style={s.routeText}>1st length →</Text><Text style={s.routeText}>← 2nd length</Text></View>
      <View style={s.lengths}>{Array.from({ length: 7 }, (_, index) => <View key={index} style={[s.length, index === 6 && s.lastLength]}><Text style={[s.lengthNumber, index === 6 && { color: C.paper }]}>{index + 1}</Text></View>)}</View>
      <Text style={s.diagramNote}>Start at Safa · Finish at Marwa</Text>
    </>}
  </View>;

  if (kind === 'tawaf') return <View accessible accessibilityRole="image" accessibilityLabel="Tawaf diagram. Travel anticlockwise around the Ka’bah for seven circuits, keeping it on your left." style={[s.diagram, s.tawaf, compact && s.compactDiagram]}>
    <View style={[s.circle, compact && s.smallCircle]}>
      <RitualIcon name="kaaba" size={compact ? 27 : 48} color={C.forest} />
      <AppIcon name="arrow-back" size={compact ? 12 : 20} color={C.forest} style={s.north} />
      <AppIcon name="arrow-down" size={compact ? 12 : 20} color={C.forest} style={s.west} />
      <AppIcon name="arrow-forward" size={compact ? 12 : 20} color={C.forest} style={s.south} />
      <AppIcon name="arrow-up" size={compact ? 12 : 20} color={C.forest} style={s.east} />
    </View>
    {!compact && <View style={s.tawafCopy}><Text style={s.circuitCount}>7</Text><Text style={s.place}>circuits</Text><Text style={s.diagramNote}>Ka’bah on your left</Text></View>}
  </View>;

  const photos = {
    entrance: { source: ENTRANCE_PHOTO, label: 'Actual ground-level photograph of pilgrims walking towards the open doors of an entrance to al-Masjid al-Haram.' },
    'kaaba-close': { source: KAABA_CLOSE_PHOTO, label: 'Actual close-up photograph of the Ka’bah from a pilgrim’s eye level, showing the black kiswah and gold embroidery.' },
    maqam: { source: MAQAM_PHOTO, label: 'Actual photograph of Maqam Ibrahim: the gold-coloured domed enclosure with glass and decorative latticework.' },
    zamzam: { source: ZAMZAM_PHOTO, label: 'Actual first-person photograph of filling a cup at a Zamzam drinking-water tap inside the Haram, beside stacks of cups.' },
    completion: { source: COMPLETION_ILLUSTRATION, label: 'Original illustration of two hands raised in du’a, with the Ka’bah and the mosque in the background.' },
    ihram: { source: IHRAM_ILLUSTRATION, label: 'Illustration of a man in two white Ihram cloths with both shoulders covered and a woman in loose clothing and a hijab.' },
    haram: { source: HARAM_PHOTO, label: 'Photograph of the Ka’bah and pilgrims inside al-Masjid al-Haram.' },
  };
  const photo = photos[kind];
  return <Image source={photo.source} accessibilityLabel={photo.label} accessible contentFit={kind === 'ihram' ? 'contain' : 'cover'} style={[s.image, ['entrance', 'kaaba-close', 'maqam', 'zamzam'].includes(kind) && s.recognitionImage, compact && s.compactImage]} />;
}

const s = StyleSheet.create({
  image: { width: '100%', aspectRatio: 1.65, borderRadius: 18, backgroundColor: C.paper },
  recognitionImage: { aspectRatio: 1.3 },
  compactImage: { width: 104, height: 86, aspectRatio: undefined, borderRadius: 12 },
  artworkStack: { gap: 10 },
  photoNote: { fontFamily: F.body, fontSize: 12, lineHeight: 19, color: C.muted },
  trimPair: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  compactTrimPair: { width: 104, height: 86, gap: 3 },
  trimExample: { flex: 1, minWidth: 0 },
  trimImage: { width: '100%', aspectRatio: 1, borderRadius: 14, backgroundColor: C.paper },
  compactTrimImage: { height: 86, aspectRatio: undefined, borderRadius: 8 },
  exampleTitle: { fontFamily: F.bodySemiBold, fontSize: 14, color: C.cream, marginTop: 9 },
  exampleDetail: { fontFamily: F.body, fontSize: 12, lineHeight: 18, color: C.muted, marginTop: 3 },
  startGuide: { backgroundColor: '#dfe5d8', padding: 20, borderRadius: 18, marginTop: 8 },
  startPlanRow: { alignItems: 'center', marginBottom: 16 },
  startPlan: { width: 194, height: 202 },
  startRoute: { position: 'absolute', left: 6, top: 6, width: 172, height: 182, borderRadius: 90, borderWidth: 2, borderColor: '#a1af93' },
  kaabaPlan: { position: 'absolute', left: 60, top: 65, width: 68, height: 74, borderRadius: 3, backgroundColor: '#28312f', justifyContent: 'center', alignItems: 'center' },
  kaabaBand: { position: 'absolute', left: 0, right: 0, top: 12, height: 5, backgroundColor: '#c9a84c' },
  kaabaLabel: { fontFamily: F.bodyMedium, fontSize: 11, color: C.paper, marginTop: 12 },
  hijrPlan: { position: 'absolute', left: 64, top: 35, width: 60, height: 29, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 3, borderBottomWidth: 0, borderColor: '#a1af93' },
  stoneDot: { position: 'absolute', right: -5, bottom: -5, width: 11, height: 11, borderRadius: 6, backgroundColor: '#202b2a', borderWidth: 2, borderColor: '#eee7d8' },
  alignmentDot: { position: 'absolute', width: 3, height: 3, borderRadius: 2, backgroundColor: '#489f51' },
  greenLight: { position: 'absolute', right: 8, bottom: 3, width: 8, height: 34, borderRadius: 3, backgroundColor: '#4fde60', borderWidth: 2, borderColor: '#239e3b', shadowColor: '#24ce47', shadowOpacity: 0.65, shadowRadius: 5, shadowOffset: { width: 0, height: 0 } },
  planNorth: { position: 'absolute', top: -3, left: 80, backgroundColor: '#dfe5d8' },
  planWest: { position: 'absolute', top: 85, left: -3, backgroundColor: '#dfe5d8' },
  planSouth: { position: 'absolute', bottom: 5, left: 80, backgroundColor: '#dfe5d8' },
  planEast: { position: 'absolute', top: 85, right: 7, backgroundColor: '#dfe5d8' },
  startKey: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  blackKey: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#202b2a' },
  greenKey: { width: 7, height: 12, borderRadius: 2, backgroundColor: '#35bd4d' },
  startDirection: { fontFamily: F.bodySemiBold, fontSize: 14, lineHeight: 21, color: C.forest, marginTop: 16 },
  schematicNote: { fontFamily: F.body, fontSize: 10, color: C.paperMuted, marginTop: 14 },
  diagram: { minHeight: 205, padding: 22, borderRadius: 18, backgroundColor: '#dfe5d8', justifyContent: 'center' },
  compactDiagram: { width: 104, height: 86, minHeight: 86, padding: 10, borderRadius: 12 },
  eyebrow: { fontFamily: F.bodySemiBold, fontSize: 10, letterSpacing: 1.2, color: C.paperMuted, marginBottom: 22 },
  hills: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  place: { fontFamily: F.bodySemiBold, fontSize: 13, color: C.forest },
  route: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hill: { width: 15, height: 10, borderTopLeftRadius: 12, borderTopRightRadius: 12, backgroundColor: '#869477' },
  routeLine: { flex: 1, height: 2, backgroundColor: '#869477' },
  routeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  routeText: { fontFamily: F.body, fontSize: 12, color: C.paperMuted },
  lengths: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, gap: 6 },
  length: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#cbd5c3' },
  lastLength: { backgroundColor: C.forest },
  lengthNumber: { fontFamily: F.bodySemiBold, fontSize: 12, color: C.forest },
  ramlLength: { backgroundColor: C.forest, borderWidth: 2, borderColor: '#b38a32' },
  ramlNumber: { color: C.paper },
  paceKey: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 15 },
  paceDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.forest },
  normalPaceDot: { backgroundColor: '#cbd5c3', borderWidth: 1, borderColor: '#869477' },
  paceText: { flex: 1, fontFamily: F.bodyMedium, fontSize: 12, lineHeight: 19, color: C.forest },
  diagramNote: { fontFamily: F.body, fontSize: 12, lineHeight: 18, color: C.paperMuted, marginTop: 12 },
  tawaf: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  circle: { width: 146, height: 146, borderRadius: 73, borderWidth: 2, borderColor: '#a1af93', alignItems: 'center', justifyContent: 'center' },
  smallCircle: { width: 62, height: 62, borderRadius: 31 },
  north: { position: 'absolute', top: -7, backgroundColor: '#dfe5d8' },
  west: { position: 'absolute', left: -7, backgroundColor: '#dfe5d8' },
  south: { position: 'absolute', bottom: -7, backgroundColor: '#dfe5d8' },
  east: { position: 'absolute', right: -7, backgroundColor: '#dfe5d8' },
  tawafCopy: { flex: 1 },
  circuitCount: { fontFamily: F.displayMedium, fontSize: 52, lineHeight: 56, color: C.forest },
});
