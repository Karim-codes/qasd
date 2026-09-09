import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { AppIcon as Ionicons } from '@/components/app-icon';
import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { useItinerary } from '@/context/itinerary-context';

interface Props {
  label?: string;
  value?: string;
  path?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function EditableField({ label, value, path, style, textStyle }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value || '');
  const { updateField } = useItinerary();
  const inputRef = useRef<TextInput>(null);

  const startEdit = () => {
    setText(value || '');
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const saveEdit = () => {
    setEditing(false);
    if (path) updateField(path, text);
  };

  const cancelEdit = () => {
    setText(value || '');
    setEditing(false);
  };

  if (editing) {
    return (
      <View style={style}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={[styles.input, textStyle]}
            value={text}
            onChangeText={setText}
            placeholderTextColor={Palette.textMuted}
            placeholder={label || 'Enter value...'}
            autoFocus
          />
          <TouchableOpacity onPress={saveEdit} style={styles.iconBtn}>
            <Ionicons name="checkmark-circle" size={22} color={Palette.green} />
          </TouchableOpacity>
          <TouchableOpacity onPress={cancelEdit} style={styles.iconBtn}>
            <Ionicons name="close-circle" size={22} color={Palette.red} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={style} onLongPress={startEdit} activeOpacity={0.7}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.valueRow}>
        <Text style={[styles.value, textStyle]} numberOfLines={2}>
          {value || '—'}
        </Text>
        <TouchableOpacity
          onPress={startEdit}
          style={styles.editIcon}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="pencil" size={14} color={Palette.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: QasdFonts.body,
    fontSize: 11,
    color: Palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 15,
    color: Palette.textPrimary,
    flex: 1,
  },
  editIcon: {
    padding: 4,
    marginLeft: 8,
    opacity: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 15,
    color: Palette.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Palette.gold,
    paddingVertical: 4,
  },
  iconBtn: {
    padding: 6,
    marginLeft: 4,
  },
});
