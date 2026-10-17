import { AppIcon } from '@/components/app-icon';
import { QasdFonts as F } from '@/constants/qasd-theme';
import { TravelColors as C } from '@/constants/travel-design';
import { OFFICIAL_UMRAH_PAGES, OFFICIAL_UMRAH_TEXT } from '@/lib/official-umrah-guide';
import { guideTextParagraphs, initialGuideReaderState, isGuideArtwork, OFFICIAL_UMRAH_PAGE_NUMBERS, officialGuideReaderReducer, type OfficialUmrahPageNumber } from '@/lib/official-umrah-reader';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useReducer, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function OriginalPage({ page }: { page: OfficialUmrahPageNumber }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  if (failed) return <View style={s.loadError}>
    <Text style={s.errorText}>This page couldn’t be displayed.</Text>
    <TouchableOpacity accessibilityRole="button" onPress={() => { setFailed(false); setLoading(true); setAttempt(value => value + 1); }} style={s.toolButton}><Text style={s.toolText}>Try again</Text></TouchableOpacity>
  </View>;
  return <View style={s.imageWrapper}>
    <Image key={attempt} source={OFFICIAL_UMRAH_PAGES[page]} resizeMode="contain" style={s.image}
      accessible accessibilityLabel={page === 1 ? 'Cover: Manner of Performing Umrah. Author: Abdul-Aziz ibn Abdullah ibn Baz. Presidency of Religious Affairs.' : page === 13 ? 'Publisher’s back cover: Presidency of Religious Affairs at the Grand Mosque and the Prophet’s Mosque.' : `Original publication, page ${page}. Text view is available for reading and larger text.`}
      onLoadStart={() => setLoading(true)} onLoadEnd={() => setLoading(false)} onError={() => setFailed(true)} />
    {loading && <View pointerEvents="none" style={s.loading}><ActivityIndicator accessibilityLabel="Loading page" color={C.forest} /></View>}
  </View>;
}

export default function OfficialUmrahGuide() {
  const router = useRouter();
  const params = useLocalSearchParams<{ page?: string }>();
  const [{ page, textMode, textScale }, dispatch] = useReducer(officialGuideReaderReducer, params.page, initialGuideReaderState);
  const total = OFFICIAL_UMRAH_PAGE_NUMBERS.length;
  const index = OFFICIAL_UMRAH_PAGE_NUMBERS.indexOf(page);
  const artwork = isGuideArtwork(page);
  const readingText = textMode && !artwork;
  const paragraphs = guideTextParagraphs(OFFICIAL_UMRAH_TEXT[page - 1], page);
  const canDecrease = !artwork && textScale > 1;
  const canIncrease = !artwork && textScale < 2.5;

  return <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
    <View style={s.frame}>
      <View style={s.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to guide" style={s.iconButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/guide')}><AppIcon name="chevron-back" size={23} color={C.cream} /></TouchableOpacity>
        <View style={s.flex}><Text accessibilityRole="header" style={s.title}>Ibn Baz’s Umrah guide</Text><Text style={s.publisher}>Presidency of Religious Affairs · English</Text></View>
      </View>
      <View style={s.toolbar}>
        <Text style={s.offline}>Available offline</Text>
        {!artwork && <TouchableOpacity accessibilityRole="button" accessibilityLabel={textMode ? 'Show original page' : 'Read accessible text'} onPress={() => dispatch({ type: 'toggle-view' })} style={s.toolButton}><Text style={s.toolText}>{textMode ? 'Original page' : 'Text view'}</Text></TouchableOpacity>}
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Decrease text size" accessibilityState={{ disabled: !canDecrease }} disabled={!canDecrease} onPress={() => dispatch({ type: 'decrease-text' })} style={[s.iconButton, !canDecrease && s.disabled]}><AppIcon name="remove" size={20} color={C.gold} /></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Increase text size" accessibilityState={{ disabled: !canIncrease }} disabled={!canIncrease} onPress={() => dispatch({ type: 'increase-text' })} style={[s.iconButton, !canIncrease && s.disabled]}><AppIcon name="add" size={20} color={C.gold} /></TouchableOpacity>
      </View>
      <View style={s.reader}>
        <ScrollView key={`${page}:${readingText}`} style={s.scroll} contentContainerStyle={[s.page, readingText ? s.textPage : s.originalPage]} alwaysBounceHorizontal={false} directionalLockEnabled>
          {readingText ? paragraphs.map((paragraph, paragraphIndex) => {
            const arabic = /[\u0600-\u06ff]/.test(paragraph) && !/[A-Za-z]/.test(paragraph);
            return <Text key={paragraphIndex} selectable style={[s.pageText, { fontSize: 17 * textScale, lineHeight: 28 * textScale }, arabic && s.arabic]}>{paragraph}</Text>;
          }) : <OriginalPage key={page} page={page} />}
        </ScrollView>
      </View>
      <View style={s.pagination}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Previous page" accessibilityState={{ disabled: index === 0 }} disabled={index === 0} style={[s.pageButton, index === 0 && s.disabled]} onPress={() => dispatch({ type: 'previous' })}><AppIcon name="chevron-back" size={20} color={C.gold} /><Text style={s.toolText}>Previous</Text></TouchableOpacity>
        <View accessible accessibilityLiveRegion="polite" style={s.pagePosition}><Text style={s.pageNumber}>Page {index + 1} / {total}</Text><Text style={s.sourcePage}>{page === 1 ? 'Cover' : page === 13 ? 'Back cover' : `Original p. ${page}`}</Text></View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Next page" accessibilityState={{ disabled: index === total - 1 }} disabled={index === total - 1} style={[s.pageButton, index === total - 1 && s.disabled]} onPress={() => dispatch({ type: 'next' })}><Text style={s.toolText}>Next</Text><AppIcon name="chevron-forward" size={20} color={C.gold} /></TouchableOpacity>
      </View>
    </View>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background },
  frame: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingTop: 4 },
  title: { fontFamily: F.bodySemiBold, fontSize: 19, lineHeight: 26, color: C.cream },
  publisher: { fontFamily: F.body, fontSize: 11, lineHeight: 18, color: C.muted, marginTop: 3 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 18, paddingVertical: 6 },
  offline: { flex: 1, fontFamily: F.body, fontSize: 11, color: C.muted },
  iconButton: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  toolButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  toolText: { fontFamily: F.bodyMedium, fontSize: 12, color: C.gold },
  reader: { flex: 1, backgroundColor: '#d8d5cd' },
  scroll: { flex: 1, width: '100%' },
  page: { flexGrow: 1, width: '100%' },
  originalPage: { padding: 12 },
  imageWrapper: { width: '100%' },
  image: { width: '100%', aspectRatio: 340.2 / 467.76, backgroundColor: '#fff' },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  loadError: { minHeight: 180, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  errorText: { fontFamily: F.body, fontSize: 15, color: '#202b2a', textAlign: 'center' },
  textPage: { padding: 24, backgroundColor: '#fff' },
  pageText: { alignSelf: 'stretch', color: '#202b2a', fontFamily: F.body, marginBottom: 18 },
  arabic: { writingDirection: 'rtl', textAlign: 'right', fontFamily: undefined },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6 },
  pageButton: { minHeight: 44, flexDirection: 'row', gap: 4, alignItems: 'center', paddingHorizontal: 4 },
  pageNumber: { fontFamily: F.bodyMedium, fontSize: 12, color: C.cream },
  pagePosition: { alignItems: 'center', gap: 3 },
  sourcePage: { fontFamily: F.body, fontSize: 10, color: C.muted },
  disabled: { opacity: 0.35 },
});
