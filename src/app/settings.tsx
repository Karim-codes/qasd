import { DateField } from '@/components/hajj-setup/date-time-field';
import { Field as SetupField, Input } from '@/components/hajj-setup/form-primitives';
import { FlightLegForm } from '@/components/hajj-setup/flight-leg-form';
import { HotelForm } from '@/components/hajj-setup/hotel-form';
import type { FlightLeg } from '@/context/hajj-setup-context';
import { AppIcon as Ionicons } from '@/components/app-icon';
import { Palette, QasdFonts } from '@/constants/qasd-theme';
import { TravelType } from '@/constants/travel-design';
import { useItinerary } from '@/context/itinerary-context';
import type { Itinerary } from '@/lib/types';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type InfoPageKey = 'privacy' | 'terms' | 'about' | 'help';

const INFO_PAGES: Record<
  InfoPageKey,
  { title: string; eyebrow: string; icon: IoniconName; paragraphs: string[] }
> = {
  privacy: {
    title: 'Privacy & your data',
    eyebrow: 'PRIVACY',
    icon: 'shield-checkmark-outline',
    paragraphs: [
      'Your Qasd profile and journey details are stored locally in this app on your device. Qasd does not provide cloud account syncing in this version.',
      'Qasd does not ask you to upload or store passport, visa, permit, or other identity-document images.',
      'Prayer-time and weather requests use the selected holy-city location and date. Your name and itinerary are not sent with those requests.',
      'You can remove your locally saved journey at any time from Data management in Settings.',
    ],
  },
  terms: {
    title: 'Terms & conditions',
    eyebrow: 'LEGAL',
    icon: 'document-text-outline',
    paragraphs: [
      'Qasd is a personal journey-planning and educational guide. By using it, you agree to use the information responsibly and keep your travel details accurate.',
      'Ritual guidance is provided for general assistance and is not a substitute for advice from a qualified scholar, official Hajj or Umrah authority, group leader, or service provider.',
      'Prayer times, weather, travel times, and itinerary information can change. Always verify time-sensitive information with an authoritative source.',
      'Qasd is not an emergency service and does not guarantee uninterrupted availability. In an emergency, contact local authorities or your group leader.',
    ],
  },
  about: {
    title: 'About Qasd',
    eyebrow: 'OUR PURPOSE',
    icon: 'moon-outline',
    paragraphs: [
      'Qasd is designed to keep the practical parts of Hajj and Umrah calm, clear, and close at hand.',
      'It brings your journey timeline, flights, stays, prayer times, and step-by-step ritual guidance into one private, focused experience.',
      'Built with care for pilgrims. May every journey be accepted and made easy.',
    ],
  },
  help: {
    title: 'Help centre',
    eyebrow: 'SUPPORT',
    icon: 'help-circle-outline',
    paragraphs: [
      'To change your name, open Edit profile at the top of Settings. Your Home greeting updates as soon as you save.',
      'Journey details can be edited in the Journey details section. Open any category, make your changes, then select Save journey changes.',
      'If the app contains an old or incorrect trip, use Clear journey data. This removes locally saved itinerary information and returns you to setup.',
    ],
  },
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'numbers-and-punctuation';
  autoCapitalize?: 'none' | 'words' | 'characters';
  hint?: string;
}) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={fieldStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Enter ' + label.toLowerCase()}
        placeholderTextColor={Palette.textMuted}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize || 'words'}
        autoCorrect={false}
      />
      {hint ? <Text style={fieldStyles.hint}>{hint}</Text> : null}
    </View>
  );
}

function EditorSection({
  title,
  icon,
  subtitle,
  children,
}: {
  title: string;
  icon: IoniconName;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={editorStyles.wrap}>
      <TouchableOpacity
        style={editorStyles.header}
        activeOpacity={0.72}
        onPress={() => setOpen((value) => !value)}
      >
        <View style={editorStyles.iconWrap}>
          <Ionicons name={icon} size={21} color={Palette.gold} />
        </View>
        <View style={editorStyles.headerCopy}>
          <Text style={editorStyles.title}>{title}</Text>
          {subtitle ? <Text style={editorStyles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={[editorStyles.chevron, open && editorStyles.chevronOpen]}>
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={open ? Palette.gold : Palette.textMuted}
          />
        </View>
      </TouchableOpacity>
      {open ? <View style={editorStyles.body}>{children}</View> : null}
    </View>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.settingsGroup}>
      <Text style={styles.groupLabel}>{title.charAt(0) + title.slice(1).toLowerCase()}</Text>
      <View style={styles.settingsCard}>{children}</View>
    </View>
  );
}

function SettingsDivider() {
  return <View style={styles.settingsDivider} />;
}

function SettingsRow({
  icon,
  title,
  subtitle,
  value,
  onPress,
  destructive,
}: {
  icon: IoniconName;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  const content = (
    <>
      <View style={[styles.rowIcon, destructive && styles.rowIconDanger]}>
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? Palette.red : Palette.gold}
        />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, destructive && styles.rowTitleDanger]}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress ? (
        <Ionicons name="chevron-forward" size={17} color={Palette.textMuted} />
      ) : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.settingsRow}>{content}</View>;
  }

  return (
    <TouchableOpacity style={styles.settingsRow} activeOpacity={0.72} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
}

function InfoSheet({
  page,
  onClose,
}: {
  page: (typeof INFO_PAGES)[InfoPageKey] | null;
  onClose: () => void;
}) {
  return (
    <Modal visible={!!page} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.infoSheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.sheetHandle} />
          {page ? (
            <>
              <View style={styles.infoHeader}>
                <View style={styles.infoIcon}>
                  <Ionicons name={page.icon} size={21} color={Palette.gold} />
                </View>
                <View style={styles.infoHeaderCopy}>
                  <Text style={styles.infoEyebrow}>{page.eyebrow}</Text>
                  <Text style={styles.infoTitle}>{page.title}</Text>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={8}>
                  <Ionicons name="close" size={20} color={Palette.textPrimary} />
                </TouchableOpacity>
              </View>
              <ScrollView
                contentContainerStyle={styles.infoBody}
                showsVerticalScrollIndicator={false}
              >
                {page.paragraphs.map((paragraph, index) => (
                  <View key={paragraph} style={styles.infoParagraphRow}>
                    <Text style={styles.infoParagraphNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                    <Text style={styles.infoParagraph}>{paragraph}</Text>
                  </View>
                ))}
                <Text style={styles.infoUpdated}>Last updated 31 August 2026</Text>
              </ScrollView>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { itinerary, setItinerary, clear } = useItinerary();
  const [draft, setDraft] = useState<Itinerary | null>(() =>
    itinerary ? (JSON.parse(JSON.stringify(itinerary)) as Itinerary) : null
  );
  useEffect(() => {
    if (itinerary) setDraft(previous => previous ?? JSON.parse(JSON.stringify(itinerary)) as Itinerary);
  }, [itinerary]);
  const [profileName, setProfileName] = useState(itinerary?.pilgrim.name || '');
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeInfo, setActiveInfo] = useState<InfoPageKey | null>(null);
  const [hasUnsavedJourneyChanges, setHasUnsavedJourneyChanges] = useState(false);

  const profile = draft?.pilgrim;
  const initials = useMemo(() => {
    const name = profile?.name || 'Pilgrim';
    return (
      name
        .split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'P'
    );
  }, [profile?.name]);

  const [layovers, setLayovers] = useState<Partial<Record<'outbound' | 'return', boolean>>>({});
  const isUmrah = draft?.tripType === 'umrah';
  const journeyLabel = isUmrah ? 'Umrah journey' : 'Hajj journey';
  const version = Constants.expoConfig?.version || '1.0.0';

  const leaveSettings = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  };

  const handleBack = () => {
    if (!hasUnsavedJourneyChanges) {
      leaveSettings();
      return;
    }

    Alert.alert('Discard journey changes?', 'Your unsaved journey edits will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: leaveSettings },
    ]);
  };

  const update = (path: string, value: string) => {
    setDraft((previous) => {
      if (!previous) return previous;
      const next = JSON.parse(JSON.stringify(previous)) as Itinerary;
      const keys = path.split('.');
      let target = next as unknown as Record<string, unknown>;

      for (let index = 0; index < keys.length - 1; index += 1) {
        const key = keys[index];
        if (!target[key] || typeof target[key] !== 'object') target[key] = {};
        target = target[key] as Record<string, unknown>;
      }

      target[keys[keys.length - 1]] = value;
      return next;
    });
    setHasUnsavedJourneyChanges(true);
  };

  const updateFlight = (leg: 'outbound' | 'return', patch: Partial<FlightLeg>) => {
    if (patch.hasLayover !== undefined) setLayovers(current => ({ ...current, [leg]: patch.hasLayover }));
    setDraft(previous => {
      if (!previous) return previous;
      const flight = { ...previous.flights[leg] };
      const { flightNumber, hasLayover, layoverCity, ...fields } = patch;
      Object.assign(flight, fields);
      if (flightNumber !== undefined) flight.flightNumbers = [flightNumber, ...flight.flightNumbers.slice(1)];
      if (layoverCity !== undefined) flight.stopoverCity = layoverCity;
      if (hasLayover !== undefined) {
        if (!hasLayover) { flight.stopoverCity = ''; flight.layoverDuration = ''; }
      }
      return { ...previous, flights: { ...previous.flights, [leg]: flight } };
    });
    setHasUnsavedJourneyChanges(true);
  };

  const openProfile = () => {
    setProfileName(draft?.pilgrim.name || '');
    setProfileOpen(true);
  };

  const saveProfile = async () => {
    if (!draft) return;
    const name = profileName.trim();
    if (!name) {
      Alert.alert('Name required', 'Please enter the name you want Qasd to display.');
      return;
    }

    const updatedDraft: Itinerary = {
      ...draft,
      pilgrim: { ...draft.pilgrim, name },
    };
    const persistedBase = itinerary || draft;
    const updatedProfile: Itinerary = {
      ...persistedBase,
      pilgrim: { ...persistedBase.pilgrim, name },
    };
    setDraft(updatedDraft);
    await setItinerary(updatedProfile);
    setProfileOpen(false);
  };

  const saveJourney = async () => {
    if (!draft) return;
    await setItinerary(draft);
    setHasUnsavedJourneyChanges(false);
    Alert.alert('Journey saved', 'Your journey details have been updated.');
  };

  const confirmReset = () => {
    Alert.alert(
      'Clear journey data?',
      'This permanently removes the locally saved profile and itinerary from Qasd.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear data',
          style: 'destructive',
          onPress: async () => {
            await clear();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!draft) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Ionicons name="compass-outline" size={30} color={Palette.gold} />
          </View>
          <Text style={styles.emptyTitle}>No journey yet</Text>
          <Text style={styles.emptyText}>
            Create a Hajj or Umrah journey to set up your local profile and preferences.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.replace('/choose-trip')}
            activeOpacity={0.82}
          >
            <Text style={styles.emptyButtonText}>Set up my journey</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={10} style={styles.backButton}>
          <Ionicons name="chevron-back" size={25} color={Palette.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.intro}>
            <Text style={styles.introEyebrow}>YOUR QASD</Text>
            <Text style={styles.introTitle}>Make yourself at home.</Text>
            <Text style={styles.introText}>Your profile, your plans, your preferences.</Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.profileTopRow}>
              <Text style={styles.profileEyebrow}>LOCAL PROFILE</Text>
              <View style={styles.localPill}>
                <Ionicons name="phone-portrait-outline" size={12} color="#655f52" />
                <Text style={styles.localPillText}>ON THIS DEVICE</Text>
              </View>
            </View>
            <View style={styles.profileContent}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>

              </View>
              <View style={styles.profileCopy}>
                <Text style={styles.profileName}>{draft.pilgrim.name || 'Pilgrim'}</Text>
                <View style={styles.profileMetaRow}>
                  <Ionicons
                    name={isUmrah ? 'moon-outline' : 'sparkles-outline'}
                    size={13}
                    color="#8b7955"
                  />
                  <Text style={styles.profileMeta}>{journeyLabel}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.editProfileButton} onPress={openProfile}>
                <Text style={styles.editProfileText}>Edit profile</Text>
                <Ionicons name="arrow-forward" size={16} color="#eee7d8" />
              </TouchableOpacity>
            </View>
          </View>

          <SettingsCard title="Your account">
            <SettingsRow
              icon="person-outline"
              title="Edit profile"
              subtitle="Change the name shown across Qasd"
              onPress={openProfile}
            />
            <SettingsDivider />
            <SettingsRow
              icon="shield-checkmark-outline"
              title="Data & privacy"
              subtitle="How Qasd handles your information"
              onPress={() => setActiveInfo('privacy')}
            />
          </SettingsCard>

          <View style={styles.journeyHeading}>
            <View>
              <Text style={styles.groupLabel}>Your itinerary</Text>
              <Text style={styles.journeyHeadingText}>
                Keep travel and stay information accurate
              </Text>
            </View>
            {hasUnsavedJourneyChanges ? (
              <View style={styles.unsavedPill}>
                <View style={styles.unsavedDot} />
                <Text style={styles.unsavedText}>UNSAVED</Text>
              </View>
            ) : null}
          </View>

          {!isUmrah ? (
            <EditorSection
              title="Journey profile"
              icon="id-card-outline"
              subtitle="Package and pilgrim information"
            >
              <Field
                label="Pilgrim type"
                value={draft.pilgrim.pilgrimType}
                onChangeText={(value) => update('pilgrim.pilgrimType', value)}
                placeholder="B2C"
                autoCapitalize="characters"
              />
              <Field
                label="Package number"
                value={draft.pilgrim.packageNumber}
                onChangeText={(value) => update('pilgrim.packageNumber', value)}
                placeholder="573"
                autoCapitalize="none"
              />
              <Field
                label="Package name"
                value={draft.pilgrim.packageName}
                onChangeText={(value) => update('pilgrim.packageName', value)}
                placeholder="Osturat"
              />
            </EditorSection>
          ) : null}

          {(['outbound', 'return'] as const).map(leg => {
            const flight = draft.flights[leg];
            return <EditorSection key={leg} title={leg === 'outbound' ? 'Outbound flight' : 'Return flight'}
              icon="airplane-outline" subtitle={leg === 'outbound' ? 'Home → Saudi Arabia' : 'Saudi Arabia → Home'}>
              {isUmrah ? <>
                <SetupField label={leg === 'outbound' ? 'Flying from (optional)' : 'Returning to (optional)'}>
                  <Input value={leg === 'outbound' ? flight.departureCity : flight.arrivalCity}
                    onChangeText={value => update(`flights.${leg}.${leg === 'outbound' ? 'departureCity' : 'arrivalCity'}`, value)} placeholder="e.g. London" />
                </SetupField>
                <SetupField label={leg === 'outbound' ? 'Departure date' : 'Return date'}>
                  <DateField value={flight.departureDate} onChange={value => {
                    update(`flights.${leg}.departureDate`, value);
                    // Onboarding uses one travel date per leg; retain a separately recorded arrival date.
                    if (!flight.arrivalDate || flight.arrivalDate === flight.departureDate) update(`flights.${leg}.arrivalDate`, value);
                  }} />
                </SetupField>
              </> : <FlightLegForm variant={leg} departurePlaceholder={leg === 'outbound' ? 'London' : 'Madinah'}
                arrivalPlaceholder={leg === 'outbound' ? 'Jeddah or Madinah' : 'London'}
                leg={{ ...flight, flightNumber: flight.flightNumbers[0] || '', layoverCity: flight.stopoverCity,
                  hasLayover: layovers[leg] ?? !!(flight.stopoverCity || flight.layoverDuration) }}
                update={patch => updateFlight(leg, patch)} />}
            </EditorSection>;
          })}

          {(['Makkah', 'Madinah'] as const).filter(city => city !== 'Madinah' || !isUmrah || draft.umrah?.route !== 'makkah-only').map(city => {
            const madinahFirst = isUmrah && draft.umrah?.route === 'madinah-makkah';
            const key = (city === 'Makkah') !== madinahFirst ? 'hotel1' : 'hotel2';
            return <EditorSection key={city} title={`${city} stay`} icon="bed-outline">
              <HotelForm city={city} hotel={draft.hotels[key]} update={patch => {
                Object.entries(patch).forEach(([field, value]) => update(`hotels.${key}.${field}`, value));
              }} />
            </EditorSection>;
          })}

          {!isUmrah ? (
            <>
              <EditorSection
                title="Mina camp & guide"
                icon="map-outline"
                subtitle="Support during your Hajj"
              >
                <Field
                  label="Camp name"
                  value={draft.camp.name}
                  onChangeText={(value) => update('camp.name', value)}
                  placeholder="AlMuaisim Camp"
                />
                <Field
                  label="Guide name"
                  value={draft.guide.name}
                  onChangeText={(value) => update('guide.name', value)}
                  placeholder="Guide name"
                />
                <Field
                  label="Guide phone"
                  value={draft.guide.phone}
                  onChangeText={(value) => update('guide.phone', value)}
                  placeholder="+44 7000 000000"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
                <Field
                  label="Service provider"
                  value={draft.transportation}
                  onChangeText={(value) => update('transportation', value)}
                  placeholder="Package transportation"
                />
              </EditorSection>

              <EditorSection
                title="Hajj calendar"
                icon="calendar-outline"
                subtitle="Anchors the ritual timeline"
              >
                <Field
                  label="Day of Arafah (9 Dhul-Hijjah)"
                  value={draft.hajj?.arafahDate || ''}
                  onChangeText={(value) => update('hajj.arafahDate', value)}
                  placeholder="2026-05-27"
                  hint="Format: YYYY-MM-DD. Qasd derives the surrounding Hajj days."
                  keyboardType="numbers-and-punctuation"
                  autoCapitalize="none"
                />
              </EditorSection>
            </>
          ) : null}

          {hasUnsavedJourneyChanges ? (
            <TouchableOpacity
              style={styles.saveJourneyButton}
              activeOpacity={0.84}
              onPress={saveJourney}
            >
              <Ionicons name="checkmark-circle" size={18} color="#eee7d8" />
              <Text style={styles.saveJourneyText}>Save journey changes</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.savedJourneyStatus}>
              <Ionicons name="checkmark-circle-outline" size={16} color={Palette.green} />
              <Text style={styles.savedJourneyText}>All journey details saved</Text>
            </View>
          )}

          <SettingsCard title="HELP & LEGAL">
            <SettingsRow
              icon="help-circle-outline"
              title="Help centre"
              subtitle="Using profiles, guides, and journey details"
              onPress={() => setActiveInfo('help')}
            />
            <SettingsDivider />
            <SettingsRow
              icon="lock-closed-outline"
              title="Privacy policy"
              onPress={() => setActiveInfo('privacy')}
            />
            <SettingsDivider />
            <SettingsRow
              icon="document-text-outline"
              title="Terms & conditions"
              onPress={() => setActiveInfo('terms')}
            />
            <SettingsDivider />
            <SettingsRow
              icon="information-circle-outline"
              title="About Qasd"
              onPress={() => setActiveInfo('about')}
            />
            <SettingsDivider />
            <SettingsRow icon="phone-portrait-outline" title="App version" value={version} />
          </SettingsCard>

          <SettingsCard title="Your data">
            <SettingsRow
              icon="trash-outline"
              title="Clear journey data"
              subtitle="Remove this profile and itinerary from the device"
              onPress={confirmReset}
              destructive
            />
          </SettingsCard>

          <View style={styles.footerMark}>
            <Ionicons name="moon-outline" size={15} color={Palette.gold} />
            <Text style={styles.footerText}>QASD · MADE FOR THE SACRED JOURNEY</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={profileOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setProfileOpen(false)}>
          <KeyboardAvoidingView
            style={styles.modalKeyboard}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <Pressable style={styles.profileSheet} onPress={(event) => event.stopPropagation()}>
              <View style={styles.sheetHandle} />
              <View style={styles.profileSheetHeader}>
                <View>
                  <Text style={styles.infoEyebrow}>YOUR PROFILE</Text>
                  <Text style={styles.profileSheetTitle}>How should we greet you?</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setProfileOpen(false)}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={20} color={Palette.textPrimary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.profileSheetText}>
                This name appears on Home and throughout your journey. It stays on this device.
              </Text>
              <Field
                label="Display name"
                value={profileName}
                onChangeText={setProfileName}
                placeholder="Your name"
              />
              <TouchableOpacity
                style={styles.profileSaveButton}
                activeOpacity={0.84}
                onPress={saveProfile}
              >
                <Ionicons name="checkmark" size={18} color="#eee7d8" />
                <Text style={styles.profileSaveText}>Save profile</Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      <InfoSheet
        page={activeInfo ? INFO_PAGES[activeInfo] : null}
        onClose={() => setActiveInfo(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a3341',
  },
  headerTitle: { ...TravelType.section, fontSize: 27, lineHeight: 33 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 52, maxWidth: 640, width: '100%', alignSelf: 'center' },
  intro: { paddingTop: 5, paddingBottom: 19 },
  introEyebrow: { ...TravelType.eyebrow, fontSize: 10, marginBottom: 7 },
  introTitle: { ...TravelType.title, fontSize: 34, lineHeight: 40 },
  introText: { ...TravelType.body, fontSize: 14, lineHeight: 21, marginTop: 7, maxWidth: 300 },
  profileCard: {
    borderRadius: 22,
    padding: 19,
    backgroundColor: '#eee7d8',
  },
  profileTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  profileContent: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 15 },
  localPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, backgroundColor: '#e3dac7' },
  localPillText: { fontFamily: QasdFonts.bodyBold, fontSize: 7, letterSpacing: 0.8, color: '#655f52' },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#263c36',
  },
  avatarText: { fontFamily: QasdFonts.display, fontSize: 25, color: '#eee7d8' },
  avatarStatus: { position: 'absolute', right: -3, bottom: -3, width: 14, height: 14, borderRadius: 7, backgroundColor: Palette.green, borderWidth: 2, borderColor: '#eee7d8' },
  profileCopy: { flex: 1, minWidth: 130, marginLeft: 13 },
  profileEyebrow: { fontFamily: QasdFonts.bodyBold, fontSize: 9, letterSpacing: 1.5, color: '#8b7955' },
  profileName: { fontFamily: QasdFonts.display, fontSize: 28, lineHeight: 31, color: '#202b2a' },
  profileMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  profileMeta: { fontFamily: QasdFonts.bodyMedium, fontSize: 11, color: '#655f52' },
  editProfileButton: { width: '100%', marginTop: 16, minHeight: 46, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: '#263c36' },
  editProfileText: { fontFamily: QasdFonts.bodySemiBold, fontSize: 14, color: '#eee7d8' },
  settingsGroup: { marginTop: 22, marginBottom: 16 },
  groupLabel: { ...TravelType.section, fontSize: 25, lineHeight: 31, marginBottom: 12, marginTop: 8 },
  settingsCard: {
    borderRadius: 19,
    backgroundColor: '#1b2533',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  settingsRow: {
    minHeight: 67,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252e39',
  },
  rowIconDanger: { backgroundColor: Palette.redMuted },
  rowCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
  rowTitle: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  rowTitleDanger: { color: Palette.red },
  rowSubtitle: {
    fontFamily: QasdFonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: Palette.textMuted,
    marginTop: 2,
  },
  rowValue: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 13,
    color: Palette.textSecondary,
    marginRight: 8,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.055)',
    marginLeft: 63,
  },
  journeyHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  journeyHeadingText: {
    fontFamily: QasdFonts.body,
    fontSize: 12,
    color: Palette.textMuted,
    marginLeft: 4,
    marginTop: -5,
  },
  unsavedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Palette.orangeMuted,
    marginBottom: 1,
  },
  unsavedDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Palette.orange },
  unsavedText: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 7,
    letterSpacing: 0.8,
    color: Palette.orange,
  },
  saveJourneyButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: '#263c36',
    marginTop: 7,
    marginBottom: 27,
  },
  saveJourneyText: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 13,
    color: '#eee7d8',
  },
  savedJourneyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 40,
    marginTop: 4,
    marginBottom: 24,
  },
  savedJourneyText: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 10,
    color: Palette.textMuted,
  },
  footerMark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingTop: 4,
    paddingBottom: 8,
  },
  footerText: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 7,
    letterSpacing: 1.2,
    color: Palette.textMuted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3,7,15,0.72)',
    justifyContent: 'flex-end',
  },
  modalKeyboard: { flex: 1, justifyContent: 'flex-end' },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginTop: 9,
    marginBottom: 13,
  },
  profileSheet: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 22,
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    backgroundColor: '#121b30',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(201,168,76,0.18)',
  },
  profileSheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  profileSheetTitle: {
    fontFamily: QasdFonts.display,
    fontSize: 25,
    color: Palette.textPrimary,
    marginTop: 2,
  },
  profileSheetText: {
    fontFamily: QasdFonts.body,
    fontSize: 11,
    lineHeight: 17,
    color: Palette.textSecondary,
    marginTop: 9,
    marginBottom: 3,
    paddingRight: 18,
  },
  profileSaveButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 15,
    backgroundColor: '#263c36',
    marginTop: 20,
  },
  profileSaveText: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 13,
    color: '#eee7d8',
  },
  infoSheet: {
    maxHeight: '84%',
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    backgroundColor: '#121b30',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(201,168,76,0.18)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201,168,76,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.18)',
  },
  infoHeaderCopy: { flex: 1, marginLeft: 12 },
  infoEyebrow: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 8,
    letterSpacing: 1.5,
    color: Palette.gold,
  },
  infoTitle: {
    fontFamily: QasdFonts.display,
    fontSize: 23,
    color: Palette.textPrimary,
    marginTop: 1,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  infoBody: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 34 : 26,
  },
  infoParagraphRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  infoParagraphNumber: {
    width: 30,
    fontFamily: QasdFonts.display,
    fontSize: 16,
    color: Palette.gold,
  },
  infoParagraph: {
    flex: 1,
    fontFamily: QasdFonts.body,
    fontSize: 13,
    lineHeight: 21,
    color: Palette.textSecondary,
  },
  infoUpdated: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 9,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.goldMuted,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  emptyTitle: {
    fontFamily: QasdFonts.display,
    fontSize: 28,
    color: Palette.textPrimary,
    marginTop: 16,
  },
  emptyText: {
    fontFamily: QasdFonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyButton: {
    minHeight: 49,
    paddingHorizontal: 23,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#263c36',
    marginTop: 20,
  },
  emptyButtonText: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 13,
    color: '#eee7d8',
  },
});

const editorStyles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    backgroundColor: '#1b2533',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 10,
    overflow: 'hidden',
  },
  header: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252e39',
  },
  headerCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
  title: {
    fontFamily: QasdFonts.bodySemiBold,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  subtitle: {
    fontFamily: QasdFonts.body,
    fontSize: 9,
    color: Palette.textMuted,
    marginTop: 2,
  },
  chevron: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  chevronOpen: { backgroundColor: 'rgba(201,168,76,0.08)' },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
});

const fieldStyles = StyleSheet.create({
  wrap: { marginTop: 14 },
  label: {
    fontFamily: QasdFonts.bodyBold,
    fontSize: 8,
    color: Palette.textSecondary,
    letterSpacing: 1.1,
    marginBottom: 7,
  },
  input: {
    fontFamily: QasdFonts.bodyMedium,
    fontSize: 14,
    color: Palette.textPrimary,
    backgroundColor: '#1b2533',
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  hint: {
    fontFamily: QasdFonts.body,
    fontSize: 9,
    lineHeight: 14,
    color: Palette.textMuted,
    marginTop: 6,
  },
});
