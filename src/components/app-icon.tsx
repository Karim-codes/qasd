import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];
const travelIcons: Partial<Record<NonNullable<IconName>, IconName>> = {
  business: 'bed-outline', 'business-outline': 'bed-outline', bed: 'bed-outline',
  airplane: 'airplane-outline', home: 'home-outline', map: 'map-outline',
  book: 'book-outline', location: 'location-outline', calendar: 'calendar-outline',
  person: 'person-outline', people: 'people-outline', settings: 'settings-outline',
  car: 'car-outline', bus: 'bus-outline', train: 'train-outline',
  moon: 'moon-outline', sunny: 'sunny-outline', water: 'water-outline',
  flag: 'flag-outline', heart: 'heart-outline', compass: 'compass-outline',
};

// Keep functional status icons (checks, saved bookmarks) distinct from travel icons.
export const AppIcon = Object.assign(function AppIcon(props: ComponentProps<typeof Ionicons>) {
  return <Ionicons {...props} name={props.name ? travelIcons[props.name] ?? props.name : props.name} />;
}, { glyphMap: Ionicons.glyphMap });
