import { AppIcon } from '@/components/app-icon';
import { LocalSaveStatus } from '@/components/local-save-status';
import { QasdFonts } from '@/constants/qasd-theme';
import { TravelColors as C, TravelType as T } from '@/constants/travel-design';
import { usePreparationChecklist } from '@/hooks/use-local-progress';
import { checklistItems, checklistSummary } from '@/lib/checklist';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChecklistScreen() {
  const router = useRouter();
  const record = usePreparationChecklist();
  const [title, setTitle] = useState('');
  const items = checklistItems(record.value);
  const summary = checklistSummary(record.value);
  const toggle = (id: string) => {
    void record.update(previous => ({ ...previous, completed: { ...previous.completed, [id]: !previous.completed[id] } }));
    void Haptics.selectionAsync().catch(() => {});
  };
  const add = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    void record.update(previous => ({
      ...previous,
      customItems: [...previous.customItems, { id, title: trimmed, source: 'pilgrim' }],
    }));
    setTitle('');
  };
  const remove = (id: string) => {
    void record.update(previous => {
      const completed = { ...previous.completed };
      delete completed[id];
      return { completed, customItems: previous.customItems.filter(item => item.id !== id) };
    });
  };

  return <SafeAreaView style={s.container} edges={['top']}>
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={s.back}><AppIcon name="chevron-back" size={24} color={C.cream} /></TouchableOpacity>
          <View style={s.headerCopy}><Text style={T.eyebrow}>BEFORE YOU TRAVEL</Text><Text style={T.title}>Preparation</Text></View>
          <View style={s.headerIcon}><AppIcon name="checkmark-done-outline" size={24} color={C.gold} /></View>
        </View>

        <View style={s.progressCard}>
          <Text style={s.progressLabel}>{summary.remaining === 0 ? 'READY FOR YOUR JOURNEY' : 'YOUR PROGRESS'}</Text>
          <Text style={s.progressTitle}>{summary.completed} of {summary.total} ready</Text>
          <View style={s.track}><View style={[s.fill, { width: `${summary.total ? summary.completed / summary.total * 100 : 0}%` }]} /></View>
          <Text style={s.progressHint}>{summary.remaining === 0 ? 'Everything on your list is complete.' : `${summary.remaining} ${summary.remaining === 1 ? 'item' : 'items'} left. Take it one step at a time.`}</Text>
        </View>

        <Text style={[T.section, s.sectionTitle]}>Your essentials</Text>
        <View style={s.list}>{items.map((item, index) => {
          const done = !!record.value.completed[item.id];
          return <View key={item.id} style={[s.item, index < items.length - 1 && s.itemBorder]}>
            <TouchableOpacity disabled={!record.ready} accessibilityRole="checkbox" accessibilityState={{ checked: done, disabled: !record.ready }} accessibilityLabel={item.title} onPress={() => toggle(item.id)} style={s.itemMain}>
              <View style={[s.check, done && s.checked]}>{done && <AppIcon name="checkmark" size={16} color={C.paper} />}</View>
              <Text style={[s.itemTitle, done && s.itemDone]}>{item.title}</Text>
            </TouchableOpacity>
            {item.source === 'pilgrim' && <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remove ${item.title}`} onPress={() => remove(item.id)} style={s.remove}><AppIcon name="close" size={18} color={C.muted} /></TouchableOpacity>}
          </View>;
        })}</View>

        <Text style={[T.section, s.sectionTitle]}>Add your own</Text>
        <View style={s.addRow}>
          <TextInput value={title} onChangeText={setTitle} onSubmitEditing={add} returnKeyType="done" placeholder="Something else to remember" placeholderTextColor={C.muted} accessibilityLabel="New checklist item" style={s.input} />
          <TouchableOpacity disabled={!title.trim() || !record.ready} accessibilityRole="button" accessibilityLabel="Add checklist item" onPress={add} style={[s.addButton, (!title.trim() || !record.ready) && s.disabled]}><AppIcon name="add" size={23} color={C.paper} /></TouchableOpacity>
        </View>
        <Text style={s.privacy}>Qasd saves checklist ticks and item names on this device. It does not store copies of your documents.</Text>
        {(record.error || !record.ready || record.saving) && <LocalSaveStatus record={record} />}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 48, width: '100%', maxWidth: 640, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  headerCopy: { flex: 1 },
  back: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: -10 },
  headerIcon: { width: 48, height: 48, borderRadius: 17, borderWidth: 1, borderColor: C.line, justifyContent: 'center', alignItems: 'center' },
  progressCard: { padding: 22, borderRadius: 22, backgroundColor: C.paper },
  progressLabel: { ...T.eyebrow, color: C.paperMuted },
  progressTitle: { fontFamily: QasdFonts.displayMedium, fontSize: 35, color: C.ink, marginTop: 10 },
  track: { height: 5, borderRadius: 3, backgroundColor: '#d3ccbd', overflow: 'hidden', marginTop: 18 },
  fill: { height: 5, borderRadius: 3, backgroundColor: C.forest },
  progressHint: { fontFamily: QasdFonts.body, fontSize: 13, lineHeight: 20, color: C.paperMuted, marginTop: 12 },
  sectionTitle: { marginTop: 28, marginBottom: 14 },
  list: { backgroundColor: C.surface, borderRadius: 20, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', minHeight: 64, paddingHorizontal: 16 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  itemMain: { flex: 1, minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 13 },
  check: { width: 25, height: 25, borderRadius: 9, borderWidth: 1, borderColor: '#758176', alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: C.forest, borderColor: '#607966' },
  itemTitle: { flex: 1, fontFamily: QasdFonts.bodyMedium, fontSize: 15, color: C.cream },
  itemDone: { color: C.muted, textDecorationLine: 'line-through' },
  remove: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  addRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, minHeight: 54, borderRadius: 14, paddingHorizontal: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.cream, fontFamily: QasdFonts.body, fontSize: 15 },
  addButton: { width: 54, height: 54, borderRadius: 14, backgroundColor: C.forest, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.4 },
  privacy: { ...T.label, lineHeight: 19, marginTop: 12 },
});
