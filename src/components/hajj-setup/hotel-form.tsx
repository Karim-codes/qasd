import { View } from 'react-native';
import { DateField } from './date-time-field';
import { Field, Input } from './form-primitives';

type Stay = { name: string; checkIn: string; checkOut: string };
export function HotelForm({ hotel, update, required = false, datesRequired = false, minimumDate, city }: {
  hotel: Stay; update: (patch: Partial<Stay>) => void; required?: boolean;
  datesRequired?: boolean; minimumDate?: Date; city: 'Makkah' | 'Madinah';
}) {
  return <>
    <Field label="Hotel or place name" required={required}>
      <Input value={hotel.name} onChangeText={name => update({ name })}
        placeholder={city === 'Makkah' ? 'e.g. Swissotel Al Maqam' : 'e.g. Dar Al Taqwa'} />
    </Field>
    <View style={{ gap: 12 }}>
      <Field label="Check-in" required={datesRequired}>
        <DateField value={hotel.checkIn} onChange={checkIn => update({ checkIn })} minimumDate={minimumDate} />
      </Field>
      <Field label="Check-out" required={datesRequired}>
        <DateField value={hotel.checkOut} onChange={checkOut => update({ checkOut })} minimumDate={minimumDate} />
      </Field>
    </View>
  </>;
}
