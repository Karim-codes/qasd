import { GuideJourney } from '@/components/umrah-guide-journey';
import { TravelColors as C } from '@/constants/travel-design';
import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { AppIcon as Ionicons } from '@/components/app-icon';
import { LapCounter } from '@/components/lap-counter';
import { GuideStepCompletion } from '@/components/guide-step-completion';
import { LocalSaveStatus } from '@/components/local-save-status';
import { useBookmarks, useGuideProgress } from '@/hooks/use-local-progress';
import { UMRAH_STEPS, type UmrahStep } from '@/lib/umrah-steps';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';




// ─── TYPES & DATA ────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── LAP COUNTER ─────────────────────────────────────────────────────────────

// ─── DU'A INLINE CARD (no nested Modal — fixes crash) ───────────────────────

function DuaInlineCard({ dua }: { dua: NonNullable<UmrahStep['dua']> }) {
  return (
    <View style={s.duaCard}>
      <Text style={s.duaArabic}>{dua.arabic}</Text>
      <View style={s.duaDivider} />
      <Text style={s.duaTranslit}>{dua.transliteration}</Text>
      <Text style={s.duaTranslation}>{dua.translation}</Text>
    </View>
  );
}

type ViewMode = 'linear' | 'roadmap';

export default function UmrahGuideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<ViewMode>('linear');

  // Roadmap state
  const progress = useGuideProgress();
  const params = useLocalSearchParams<{ step?: string }>();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const activeIdx = selectedIdx ?? Math.max(0, UMRAH_STEPS.findIndex(step => step.id === progress.value.lastStep));
  const setActiveIdx = (idx: number) => {
    setSelectedIdx(idx);
    void progress.update(previous => ({ ...previous, lastStep: UMRAH_STEPS[idx].id }));
  };

  // Detail bottom sheet (used by roadmap view)
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailStep, setDetailStep] = useState<UmrahStep | null>(null);
  const [showDuaInSheet, setShowDuaInSheet] = useState(false);

  // Du'a bottom sheet (used by linear view — single modal, no nesting)
  const [duaModal, setDuaModal] = useState<{
    visible: boolean;
    dua: NonNullable<UmrahStep['dua']> | null;
    title: string;
  }>({ visible: false, dua: null, title: '' });

  const openDuaSheet = (dua: NonNullable<UmrahStep['dua']>, title: string) => {
    setDuaModal({ visible: true, dua, title });
  };

  // Bookmarks + copy state for the Du'a sheet
  const bookmarkRecord = useBookmarks();
  const bookmarks = bookmarkRecord.value;
  const [copied, setCopied] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const toggleBookmark = (title: string) => {
    void bookmarkRecord.update(previous => ({ ...previous, [title]: !previous[title] }));
    Haptics.selectionAsync().catch(() => {});
  };

  useEffect(() => {
    if (!progress.ready || !params.step) return;
    const idx = UMRAH_STEPS.findIndex(step => step.id === params.step);
    if (idx < 0) return;
    setSelectedIdx(idx);
    setDetailStep(UMRAH_STEPS[idx]);
    setDetailOpen(true);
  }, [params.step, progress.ready]);

  const copyDua = useCallback(async (dua: NonNullable<UmrahStep['dua']>) => {
    const text = `${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}`;
    try {
      // Lazy-load so a dev client without the native module doesn't crash on startup.
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
  }, []);

  const openDetail = (step: UmrahStep, idx: number) => {
    setActiveIdx(idx);
    setDetailStep(step);
    setShowDuaInSheet(false);
    setDetailOpen(true);
  };

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }, [router]);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={handleBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={Palette.textPrimary} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Umrah Guide</Text>
          <Text style={s.headerSub}>ٱلْعُمْرَة</Text>
        </View>
        <View style={{ width: 26 }} />
      </View>

      <View style={{ paddingHorizontal: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: C.muted, fontFamily: QasdFonts.body, fontSize: 12 }}>Guidance for every step</Text>
        <TouchableOpacity accessibilityRole="button" style={{ minHeight: 48, flexDirection: 'row', gap: 6, alignItems: 'center' }} onPress={() => setShowSaved(value => !value)}>
          <Ionicons name={showSaved ? 'book-outline' : 'bookmark-outline'} size={16} color={C.paper} />
          <Text style={{ color: C.paper, fontFamily: QasdFonts.bodyMedium, fontSize: 12 }}>{showSaved ? 'All guidance' : `Saved (${UMRAH_STEPS.filter(step => step.dua && bookmarks[step.title]).length})`}</Text>
        </TouchableOpacity>
      </View>
      {(!progress.ready || progress.error || progress.saving) && <View style={{ paddingHorizontal: 22 }}><LocalSaveStatus record={progress} /></View>}
      {/* View mode toggle */}
      <View style={s.toggleWrap}>
        <TouchableOpacity
          style={[s.toggleBtn, viewMode === 'linear' && s.toggleBtnActive]}
          accessibilityRole="tab" accessibilityState={{ selected: viewMode === 'linear' && !showSaved }}
          onPress={() => { setViewMode('linear'); setShowSaved(false); }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="list"
            size={16}
            color={viewMode === 'linear' ? '#0f1628' : Palette.textSecondary}
          />
          <Text style={[s.toggleText, viewMode === 'linear' && s.toggleTextActive]}>
            Timeline
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.toggleBtn, viewMode === 'roadmap' && s.toggleBtnActive]}
          accessibilityRole="tab" accessibilityState={{ selected: viewMode === 'roadmap' && !showSaved }}
          onPress={() => { setViewMode('roadmap'); setShowSaved(false); }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="map"
            size={16}
            color={viewMode === 'roadmap' ? '#0f1628' : Palette.textSecondary}
          />
          <Text style={[s.toggleText, viewMode === 'roadmap' && s.toggleTextActive]}>
            Road Map
          </Text>
        </TouchableOpacity>
      </View>

      {/* Render active view */}
      {showSaved ? (
        <ScrollView contentContainerStyle={{ padding: 22 }}>
          <LocalSaveStatus record={bookmarkRecord} />
          {UMRAH_STEPS.filter(step => step.dua && bookmarks[step.title]).map(step => (
            <TouchableOpacity key={step.id} accessibilityRole="button" onPress={() => openDuaSheet(step.dua!, step.title)} style={{ minHeight: 56, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: Palette.border }}>
              <Text style={{ color: Palette.textPrimary, fontSize: 17 }}>{step.title}</Text>
            </TouchableOpacity>
          ))}
          {!Object.values(bookmarks).some(Boolean) && <Text style={{ color: Palette.textSecondary, fontSize: 16 }}>Save a du’a from its reading panel to find it here, even offline.</Text>}
        </ScrollView>
      ) : <GuideJourney mode={viewMode} activeIdx={activeIdx} onStep={openDetail} />}

      {/* ── Du'a sheet (linear view) — SINGLE modal, no nesting ────────── */}
      <Modal
        visible={duaModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setDuaModal((prev) => ({ ...prev, visible: false }))}
      >
        <Pressable
          style={s.sheetBackdrop}
          onPress={() => setDuaModal((prev) => ({ ...prev, visible: false }))}
        >
          <Pressable style={[s.sheet, { maxHeight: '90%', paddingBottom: Math.max(insets.bottom, 16) }]} onPress={(e) => e.stopPropagation()}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.sheetEyebrow}>DU&apos;A</Text>
                <Text style={s.sheetTitle}>{duaModal.title}</Text>
              </View>
              <TouchableOpacity
                disabled={!bookmarkRecord.ready}
                accessibilityRole="button"
                accessibilityLabel={bookmarks[duaModal.title] ? "Remove saved du’a" : "Save du’a"}
                onPress={() => toggleBookmark(duaModal.title)}
                style={s.sheetIconBtn}
                hitSlop={8}
              >
                <Ionicons
                  name={bookmarks[duaModal.title] ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={bookmarks[duaModal.title] ? Palette.gold : Palette.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDuaModal((prev) => ({ ...prev, visible: false }))}
                style={s.sheetClose}
                hitSlop={10}
              >
                <Ionicons name="close" size={20} color={Palette.textPrimary} />
              </TouchableOpacity>
            </View>
            {duaModal.dua && (
              <>
                <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={s.sheetDuaBody} showsVerticalScrollIndicator={false}>
                  <Text style={s.sheetDuaArabic}>{duaModal.dua.arabic}</Text>
                  <View style={s.sheetDuaDivider} />
                  <Text style={s.sheetDuaTranslit}>{duaModal.dua.transliteration}</Text>
                  <Text style={s.sheetDuaTranslation}>{duaModal.dua.translation}</Text>
                </ScrollView>
                {(!bookmarkRecord.ready || bookmarkRecord.saving || bookmarkRecord.error) && <View style={{ paddingHorizontal: 22 }}><LocalSaveStatus record={bookmarkRecord} /></View>}
                <View style={[s.duaActionBar, { flexShrink: 0 }]}>
                  <TouchableOpacity
                    onPress={() => copyDua(duaModal.dua!)}
                    style={s.duaActionBtn}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={copied ? 'checkmark' : 'copy-outline'}
                      size={16}
                      color={C.paper}
                    />
                    <Text style={s.duaActionText}>{copied ? 'Copied' : 'Copy'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={!bookmarkRecord.ready}
                accessibilityRole="button"
                accessibilityLabel={bookmarks[duaModal.title] ? "Remove saved du’a" : "Save du’a"}
                onPress={() => toggleBookmark(duaModal.title)}
                    style={s.duaActionBtn}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={bookmarks[duaModal.title] ? 'bookmark' : 'bookmark-outline'}
                      size={16}
                      color={C.paper}
                    />
                    <Text style={s.duaActionText}>
                      {bookmarks[duaModal.title] ? 'Saved' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Detail sheet (roadmap view) — du'a shown INLINE, no 2nd modal */}
      <Modal
        visible={detailOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailOpen(false)}
      >
        <Pressable style={s.sheetBackdrop} onPress={() => setDetailOpen(false)}>
          <Pressable style={[s.sheet, { maxHeight: '90%', paddingBottom: Math.max(insets.bottom, 16) }]} onPress={(e) => e.stopPropagation()}>
            <View style={s.sheetHandle} />

            {detailStep && (
              <>
                <View style={s.sheetHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={s.sheetPhaseRow}>
                      <Text style={s.sheetEyebrow}>{detailStep.phase.toUpperCase()}</Text>
                      <View style={s.sheetStepBadge}>
                        <Text style={s.sheetStepBadgeText}>
                          STEP {activeIdx + 1}/{UMRAH_STEPS.length}
                        </Text>
                      </View>
                    </View>
                    <Text style={s.sheetTitle}>{detailStep.title}</Text>
                    {detailStep.arabicTitle && (
                      <Text style={s.sheetArabicTitle}>{detailStep.arabicTitle}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => setDetailOpen(false)}
                    style={s.sheetClose}
                    hitSlop={10}
                  >
                    <Ionicons name="close" size={20} color={Palette.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={{ flexShrink: 1 }}
                  contentContainerStyle={s.sheetBody} key={detailStep.id}
                  showsVerticalScrollIndicator={false}
                >
                  {detailStep.laps && <LapCounter id={detailStep.id === 'tawaf-start' ? 'tawaf' : 'sai'} />}

                  <Text style={[s.sheetDetail, { marginTop: detailStep.laps ? 18 : 0 }]}>{detailStep.detail}</Text>

                  {/* Du'a — toggle inline instead of opening another modal */}
                  {detailStep.dua && !showDuaInSheet && (
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Read du’a"
                      onPress={() => setShowDuaInSheet(true)}
                      activeOpacity={0.7}
                      style={s.duaEntryBtn}
                    >
                      <LinearGradient
                        colors={['rgba(201,168,76,0.18)', 'rgba(201,168,76,0.06)']}
                        style={s.duaEntryInner}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <View style={s.duaEntryIcon}>
                          <Ionicons name="book-outline" size={18} color={Palette.gold} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.duaEntryTitle}>View Du&apos;a</Text>
                          <Text style={s.duaEntrySub}>
                            Arabic · Transliteration · Translation
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Palette.gold} />
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  {detailStep.dua && showDuaInSheet && (
                    <View style={{ marginTop: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={[s.sheetEyebrow, { letterSpacing: 1.2 }]}>DU&apos;A</Text>
                        <TouchableOpacity onPress={() => setShowDuaInSheet(false)} hitSlop={8}>
                          <Ionicons name="chevron-up" size={18} color={Palette.textMuted} />
                        </TouchableOpacity>
                      </View>
                      <DuaInlineCard dua={detailStep.dua} />
                    </View>
                  )}


                  <GuideStepCompletion id={detailStep.id} />

                  {/* Navigation buttons */}
                  <View style={s.navRow}>
                    <TouchableOpacity
                      disabled={activeIdx === 0}
                      onPress={() => {
                        const prev = activeIdx - 1;
                        setActiveIdx(prev);
                        setDetailStep(UMRAH_STEPS[prev]);
                        setShowDuaInSheet(false);
                      }}
                      style={[s.navBtn, activeIdx === 0 && s.navBtnDisabled]}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="chevron-back" size={16} color={Palette.textPrimary} />
                      <Text style={s.navBtnText}>Previous</Text>
                    </TouchableOpacity>

                    {activeIdx < UMRAH_STEPS.length - 1 ? (
                      <TouchableOpacity
                        onPress={() => {
                          const next = activeIdx + 1;
                          setActiveIdx(next);
                          setDetailStep(UMRAH_STEPS[next]);
                          setShowDuaInSheet(false);
                        }}
                        style={[s.navBtn, s.navBtnPrimary]}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.navBtnText, { color: C.paper }]}>Next Step</Text>
                        <Ionicons name="chevron-forward" size={16} color={C.paper} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setDetailOpen(false)}
                        style={[s.navBtn, s.navBtnPrimary]}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="checkmark-circle" size={16} color={C.paper} />
                        <Text style={[s.navBtnText, { color: C.paper }]}>Close guide</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={{ height: 24 }} />
                </ScrollView>
                {detailStep.dua && showDuaInSheet && <>
                  {(bookmarkRecord.error || bookmarkRecord.saving) && <View style={{ paddingHorizontal: 22 }}><LocalSaveStatus record={bookmarkRecord} /></View>}
                  <View style={[s.duaActionBar, { flexShrink: 0 }]}>
                    <TouchableOpacity accessibilityRole="button" onPress={() => copyDua(detailStep.dua!)} style={s.duaActionBtn}>
                      <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={C.paper} /><Text style={s.duaActionText}>{copied ? 'Copied' : 'Copy'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={bookmarks[detailStep.title] ? 'Remove saved du’a' : 'Save du’a'} disabled={!bookmarkRecord.ready} onPress={() => toggleBookmark(detailStep.title)} style={s.duaActionBtn}>
                      <Ionicons name={bookmarks[detailStep.title] ? 'bookmark' : 'bookmark-outline'} size={18} color={C.paper} /><Text style={s.duaActionText}>{bookmarks[detailStep.title] ? 'Saved' : 'Save'}</Text>
                    </TouchableOpacity>
                  </View>
                </>}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
  },
  backBtn: { padding: 4 },
  headerCenter: { alignItems: 'center' },
  headerTitle: {
    fontFamily: QasdFonts.displayMedium,
    fontSize: 30,
    color: Palette.textPrimary,
  },
  headerSub: {
    fontFamily: QasdFonts.displayRegular,
    fontSize: 14,
    color: Palette.gold,
    marginTop: -1,
  },

  // Toggle
  toggleWrap: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: Palette.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 15,
  },
  toggleBtnActive: {
    backgroundColor: C.paper,
  },
  toggleText: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 13,
    color: Palette.textSecondary,
  },
  toggleTextActive: {
    color: '#0f1628',
  },

  // Du'a inline card
  duaCard: {
    backgroundColor: 'rgba(201,168,76,0.06)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  duaArabic: {
    fontFamily: QasdFonts.displayRegular,
    fontSize: 22,
    color: Palette.textPrimary,
    textAlign: 'right',
    lineHeight: 34,
  },
  duaDivider: {
    height: 1,
    backgroundColor: Palette.goldBorder,
    marginVertical: 12,
  },
  duaTranslit: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 14,
    color: Palette.gold,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  duaTranslation: {
    fontFamily: QasdFonts.body,
    fontSize: 13,
    color: Palette.textSecondary,
    lineHeight: 19,
    marginTop: 8,
  },

  // ── SHARED BOTTOM SHEET ────────────────────────────────────────────
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Palette.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 8,
    maxHeight: '78%',
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
  sheetPhaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetEyebrow: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 10,
    color: Palette.gold,
    letterSpacing: 1.4,
  },
  sheetStepBadge: {
    backgroundColor: Palette.goldMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sheetStepBadgeText: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 9,
    color: Palette.gold,
    letterSpacing: 0.5,
  },
  sheetTitle: {
    fontFamily: QasdFonts.displayMedium,
    fontSize: 26,
    color: Palette.textPrimary,
    marginTop: 4,
    lineHeight: 30,
  },
  sheetArabicTitle: {
    fontFamily: QasdFonts.displayRegular,
    fontSize: 20,
    color: Palette.gold,
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
  sheetIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.cardBg,
    borderWidth: 1,
    borderColor: Palette.border,
    marginRight: 8,
  },
  duaActionBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  duaActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.forest,
    minHeight: 48,
    borderWidth: 1,
    borderColor: C.forest,
  },
  duaActionText: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 14,
    color: C.paper,
  },
  sheetBody: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 12,
  },
  sheetDetail: {
    fontFamily: QasdFonts.body,
    fontSize: 15,
    color: Palette.textSecondary,
    lineHeight: 23,
  },

  // Du'a sheet body (linear view)
  sheetDuaBody: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sheetDuaArabic: {
    fontFamily: QasdFonts.displayRegular,
    fontSize: 28,
    color: Palette.textPrimary,
    textAlign: 'right',
    lineHeight: 44,
  },
  sheetDuaDivider: {
    height: 1,
    backgroundColor: Palette.goldBorder,
    marginVertical: 20,
  },
  sheetDuaTranslit: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 16,
    color: Palette.gold,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  sheetDuaTranslation: {
    fontFamily: QasdFonts.body,
    fontSize: 15,
    color: Palette.textSecondary,
    lineHeight: 22,
    marginTop: 12,
  },

  // Du'a entry button (roadmap detail sheet)
  duaEntryBtn: { marginTop: 16 },
  duaEntryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
  },
  duaEntryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duaEntryTitle: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  duaEntrySub: {
    fontFamily: QasdFonts.body,
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 1,
  },

  // Nav row (roadmap detail sheet)
  navRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
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
  navBtnPrimary: {
    backgroundColor: C.forest,
    borderColor: C.forest,
  },
  navBtnDisabled: { opacity: 0.35 },
  navBtnText: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 14,
    color: Palette.textPrimary,
  },
});
