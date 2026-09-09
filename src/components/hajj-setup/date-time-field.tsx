import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { AppIcon as Ionicons } from '@/components/app-icon';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ─── Helpers ───────────────────────────────────────────────────────────────

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Format an ISO 'YYYY-MM-DD' to 'Mon, 17 Jun 2026'. */
export function formatDateLabel(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Format an 'HH:MM' (24h) string to '2:35 PM'. */
export function formatTimeLabel(hhmm: string): string {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(m)} ${period}`;
}

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toHHMM(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── Modal wrapper ─────────────────────────────────────────────────────────

function PickerModal({
  visible,
  onClose,
  title,
  children,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.sheetHead}>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Text style={s.cancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={s.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={onConfirm} hitSlop={10}>
              <Text style={s.confirm}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={s.pickerWrap}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── DateField ─────────────────────────────────────────────────────────────

export function DateField({
  value,
  onChange,
  placeholder = 'Tap to choose',
  minimumDate,
  maximumDate,
}: {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const initial = useMemo(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      if (y && m && d) return new Date(y, m - 1, d);
    }
    return new Date();
  }, [value]);
  const [temp, setTemp] = useState<Date>(initial);

  const handleChange = (_: DateTimePickerEvent, d?: Date) => {
    if (d) setTemp(d);
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          setTemp(initial);
          setOpen(true);
        }}
        style={s.pill}
      >
        <Ionicons name="calendar" size={16} color={Palette.gold} />
        <Text style={[s.pillText, !value && { color: Palette.textMuted }]} numberOfLines={1}>
          {value ? formatDateLabel(value) : placeholder}
        </Text>
      </TouchableOpacity>

      <PickerModal
        visible={open}
        title="Pick a date"
        onClose={() => setOpen(false)}
        onConfirm={() => {
          onChange(toIsoDate(temp));
          setOpen(false);
        }}
      >
        <DateTimePicker
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          value={temp}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          themeVariant="dark"
          textColor={Palette.textPrimary}
        />
      </PickerModal>
    </>
  );
}

// ─── TimeField ─────────────────────────────────────────────────────────────

export function TimeField({
  value,
  onChange,
  placeholder = 'Tap to choose',
}: {
  value: string;
  onChange: (hhmm: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const initial = useMemo(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      if (!Number.isNaN(h) && !Number.isNaN(m)) {
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
      }
    }
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, [value]);
  const [temp, setTemp] = useState<Date>(initial);

  const handleChange = (_: DateTimePickerEvent, d?: Date) => {
    if (d) setTemp(d);
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          setTemp(initial);
          setOpen(true);
        }}
        style={s.pill}
      >
        <Ionicons name="time" size={16} color={Palette.gold} />
        <Text style={[s.pillText, !value && { color: Palette.textMuted }]} numberOfLines={1}>
          {value ? formatTimeLabel(value) : placeholder}
        </Text>
      </TouchableOpacity>

      <PickerModal
        visible={open}
        title="Pick a time"
        onClose={() => setOpen(false)}
        onConfirm={() => {
          onChange(toHHMM(temp));
          setOpen(false);
        }}
      >
        <DateTimePicker
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          value={temp}
          onChange={handleChange}
          themeVariant="dark"
          textColor={Palette.textPrimary}
        />
      </PickerModal>
    </>
  );
}

const s = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.cardBgLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  pillText: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 14,
    color: Palette.textPrimary,
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8,12,24,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Palette.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: Palette.goldBorder,
  },
  sheetHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  sheetTitle: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 14,
    color: Palette.textPrimary,
    letterSpacing: 0.5,
  },
  cancel: {
    fontFamily: QasdFonts.body,
    fontSize: 14,
    color: Palette.textSecondary,
  },
  confirm: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 14,
    color: Palette.gold,
  },
  pickerWrap: {
    paddingTop: 8,
    alignItems: 'center',
  },
});
