import { Palette } from '@/constants/qasd-theme';
import { AppIcon as Ionicons } from '@/components/app-icon';
import { View } from 'react-native';

/**
 * Custom line-art glyphs for the iconic Islamic ritual sites that have no
 * clean vector equivalent in Ionicons (Kaaba, Mosque, Mina tent, Jamarat).
 * Everything else uses consistently-styled Ionicons via `RitualIcon`.
 *
 * All glyphs are drawn inside a 28×28 coordinate space and scaled by `size`.
 */

export type RitualGlyphKind = 'kaaba' | 'mosque' | 'tent' | 'jamarat';

export function RitualGlyph({
  kind,
  size = 26,
  color = Palette.gold,
}: {
  kind: RitualGlyphKind;
  size?: number;
  color?: string;
}) {
  const u = size / 28;
  const sw = Math.max(1.4, 1.7 * u);

  const box = {
    width: size,
    height: size,
    position: 'relative' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  if (kind === 'kaaba') {
    return (
      <View style={box}>
        {/* cube body */}
        <View
          style={{
            position: 'absolute',
            left: 6 * u,
            top: 6.5 * u,
            width: 16 * u,
            height: 17 * u,
            borderWidth: sw,
            borderColor: color,
            borderRadius: 2 * u,
          }}
        />
        {/* gold hizam band */}
        <View
          style={{
            position: 'absolute',
            left: 6 * u,
            top: 10.5 * u,
            width: 16 * u,
            height: 2.6 * u,
            backgroundColor: color,
          }}
        />
        {/* door */}
        <View
          style={{
            position: 'absolute',
            left: 12 * u,
            top: 16.5 * u,
            width: 4 * u,
            height: 7 * u,
            borderWidth: sw * 0.8,
            borderBottomWidth: 0,
            borderColor: color,
            borderTopLeftRadius: 1.5 * u,
            borderTopRightRadius: 1.5 * u,
          }}
        />
      </View>
    );
  }

  if (kind === 'mosque') {
    return (
      <View style={box}>
        {/* base */}
        <View
          style={{
            position: 'absolute',
            left: 5 * u,
            top: 15 * u,
            width: 18 * u,
            height: 9 * u,
            borderWidth: sw,
            borderColor: color,
            borderRadius: 2 * u,
          }}
        />
        {/* dome */}
        <View
          style={{
            position: 'absolute',
            left: 9 * u,
            top: 7 * u,
            width: 10 * u,
            height: 9 * u,
            borderWidth: sw,
            borderBottomWidth: 0,
            borderColor: color,
            borderTopLeftRadius: 5 * u,
            borderTopRightRadius: 5 * u,
          }}
        />
        {/* finial */}
        <View
          style={{
            position: 'absolute',
            top: 3.5 * u,
            width: sw,
            height: 3.5 * u,
            borderRadius: sw,
            backgroundColor: color,
          }}
        />
        {/* minarets */}
        <View
          style={{
            position: 'absolute',
            left: 3 * u,
            top: 11 * u,
            width: sw,
            height: 13 * u,
            borderRadius: sw,
            backgroundColor: color,
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: 3 * u,
            top: 11 * u,
            width: sw,
            height: 13 * u,
            borderRadius: sw,
            backgroundColor: color,
          }}
        />
        {/* arched door */}
        <View
          style={{
            position: 'absolute',
            left: 12.5 * u,
            top: 18 * u,
            width: 3 * u,
            height: 6 * u,
            borderWidth: sw * 0.7,
            borderBottomWidth: 0,
            borderColor: color,
            borderTopLeftRadius: 1.5 * u,
            borderTopRightRadius: 1.5 * u,
          }}
        />
      </View>
    );
  }

  if (kind === 'tent') {
    return (
      <View style={box}>
        {/* tent roof — filled triangle */}
        <View
          style={{
            position: 'absolute',
            top: 6 * u,
            width: 0,
            height: 0,
            borderLeftWidth: 11 * u,
            borderRightWidth: 11 * u,
            borderBottomWidth: 15 * u,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: color,
          }}
        />
        {/* ground line */}
        <View
          style={{
            position: 'absolute',
            top: 21 * u,
            left: 3 * u,
            width: 22 * u,
            height: sw,
            borderRadius: sw,
            backgroundColor: color,
          }}
        />
        {/* door notch */}
        <View
          style={{
            position: 'absolute',
            top: 13.5 * u,
            width: 0,
            height: 0,
            borderLeftWidth: 3 * u,
            borderRightWidth: 3 * u,
            borderBottomWidth: 7.5 * u,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: Palette.background,
          }}
        />
      </View>
    );
  }

  // jamarat — three pillars of varying height
  return (
    <View style={box}>
      <View
        style={{
          position: 'absolute',
          left: 5 * u,
          top: 12 * u,
          width: 4 * u,
          height: 12 * u,
          borderRadius: 2 * u,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 12 * u,
          top: 7 * u,
          width: 4 * u,
          height: 17 * u,
          borderRadius: 2 * u,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 19 * u,
          top: 12 * u,
          width: 4 * u,
          height: 12 * u,
          borderRadius: 2 * u,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

const CUSTOM_KINDS: RitualGlyphKind[] = ['kaaba', 'mosque', 'tent', 'jamarat'];

export type RitualIconName = RitualGlyphKind | keyof typeof Ionicons.glyphMap;

function isCustom(name: RitualIconName): name is RitualGlyphKind {
  return (CUSTOM_KINDS as string[]).includes(name as string);
}

/**
 * Unified renderer: pass either a custom glyph kind or an Ionicons name and get
 * a consistently-styled vector icon. This is what screens should use so the
 * icon set feels like one designed family.
 */
export function RitualIcon({
  name,
  size = 24,
  color = Palette.gold,
}: {
  name: RitualIconName;
  size?: number;
  color?: string;
}) {
  if (isCustom(name)) {
    return <RitualGlyph kind={name} size={size + 2} color={color} />;
  }
  return <Ionicons name={name} size={size} color={color} />;
}
