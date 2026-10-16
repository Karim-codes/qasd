import { AppIcon } from '@/components/app-icon';
import { QasdFonts as F } from '@/constants/qasd-theme';
import { TravelColors as C } from '@/constants/travel-design';
import { OFFICIAL_UMRAH_PAGES, OFFICIAL_UMRAH_TEXT, officialGuidePage } from '@/lib/official-umrah-guide';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OfficialUmrahGuide() {
  const router = useRouter();
  const params = useLocalSearchParams<{ page?: string }>();
  const [page, setPage] = useState(() => officialGuidePage(params.page));
  const [textMode, setTextMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);
  const total = OFFICIAL_UMRAH_PAGES.length;
  const pageWidth = Math.max(1, width - 24) * zoom;
  const navigate = (next: number) => { setPage(next); setZoom(1); };
  const text = OFFICIAL_UMRAH_TEXT[page - 1] || (page === 1 ? 'Cover of Manner of Performing Umrah, published by the Presidency of Religious Affairs.' : 'Publisher page. Use Page view to see the original design.');

  return <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
    <View style={s.frame}>
      <View style={s.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to guide" style={s.iconButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/guide')}><AppIcon name="chevron-back" size={23} color={C.cream} /></TouchableOpacity>
        <View style={s.flex}><Text accessibilityRole="header" style={s.title}>Ibn Baz’s Umrah guide</Text><Text style={s.publisher}>Presidency of Religious Affairs · English</Text></View>
      </View>
      <View style={s.toolbar}>
        <Text style={s.offline}>Available offline</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={textMode ? 'Show original page' : 'Read accessible text'} onPress={() => setTextMode(value => !value)} style={s.toolButton}><Text style={s.toolText}>{textMode ? 'Page view' : 'Text view'}</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Zoom out" accessibilityState={{ disabled: zoom === 1 }} disabled={zoom === 1} onPress={() => setZoom(value => Math.max(1, value - 0.5))} style={[s.iconButton, zoom === 1 && s.disabled]}><AppIcon name="remove" size={20} color={C.gold} /></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Zoom in" accessibilityState={{ disabled: zoom === 2.5 }} disabled={zoom === 2.5} onPress={() => setZoom(value => Math.min(2.5, value + 0.5))} style={[s.iconButton, zoom === 2.5 && s.disabled]}><AppIcon name="add" size={20} color={C.gold} /></TouchableOpacity>
      </View>
      <View style={s.reader} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
        {textMode ? <ScrollView key={`text:${page}`} contentContainerStyle={s.textPage}>
          <Text selectable style={[s.pageText, { fontSize: 17 * zoom, lineHeight: 28 * zoom }]}>{text}</Text>
        </ScrollView> : width > 0 && <ScrollView key={`page:${page}:${zoom}`} horizontal contentContainerStyle={s.horizontalPage}>
          <ScrollView style={{ width: Math.max(width, pageWidth + 24) }} contentContainerStyle={s.page}>
            <Image source={OFFICIAL_UMRAH_PAGES[page - 1]} accessible accessibilityLabel={`Original publication, page ${page} of ${total}. Switch to Text view to read the page with a screen reader.`} contentFit="contain" style={{ width: pageWidth, height: pageWidth * 467.76 / 340.2 }} />
          </ScrollView>
        </ScrollView>}
      </View>
      <View style={s.pagination}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Previous page" accessibilityState={{ disabled: page === 1 }} disabled={page === 1} style={[s.pageButton, page === 1 && s.disabled]} onPress={() => navigate(page - 1)}><AppIcon name="chevron-back" size={20} color={C.gold} /><Text style={s.toolText}>Previous</Text></TouchableOpacity>
        <Text accessibilityLiveRegion="polite" style={s.pageNumber}>Page {page} / {total}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Next page" accessibilityState={{ disabled: page === total }} disabled={page === total} style={[s.pageButton, page === total && s.disabled]} onPress={() => navigate(page + 1)}><Text style={s.toolText}>Next</Text><AppIcon name="chevron-forward" size={20} color={C.gold} /></TouchableOpacity>
      </View>
    </View>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background },
  frame: { flex: 1, width: '100%', maxWidth: 800, alignSelf: 'center' },
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
  horizontalPage: { flexGrow: 1 },
  page: { alignItems: 'center', padding: 12 },
  textPage: { padding: 24, flexGrow: 1, backgroundColor: '#fff' },
  pageText: { color: '#202b2a', fontFamily: F.body },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6 },
  pageButton: { minHeight: 44, flexDirection: 'row', gap: 4, alignItems: 'center', paddingHorizontal: 4 },
  pageNumber: { fontFamily: F.bodyMedium, fontSize: 12, color: C.cream },
  disabled: { opacity: 0.35 },
});
