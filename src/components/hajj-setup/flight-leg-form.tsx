import { DateField, TimeField } from '@/components/hajj-setup/date-time-field';
import { Field, Input, Row, Section } from '@/components/hajj-setup/form-primitives';
import { ToggleCard } from '@/components/hajj-setup/toggle-card';
import { Palette } from '@/constants/qasd-theme';
import type { FlightLeg } from '@/context/hajj-setup-context';

interface Props {
  leg: FlightLeg;
  update: (partial: Partial<FlightLeg>) => void;
  /** Suggested arrival city placeholder (e.g. 'Jeddah (JED) or Madinah (MED)'). */
  arrivalPlaceholder: string;
  /** Suggested departure city placeholder. */
  departurePlaceholder: string;
  /** Section icon/title flavour. */
  variant: 'outbound' | 'return';
}

export function FlightLegForm({
  leg,
  update,
  arrivalPlaceholder,
  departurePlaceholder,
  variant,
}: Props) {
  const isOutbound = variant === 'outbound';
  return (
    <>
      <Section
        icon={isOutbound ? 'airplane' : 'airplane-outline'}
        tint={Palette.gold}
        title={isOutbound ? 'Flight details' : 'Return details'}
      >
        <Row>
          <Field label="Airline" flex={1.2}>
            <Input
              value={leg.airline}
              onChangeText={(v) => update({ airline: v })}
              placeholder="Saudia"
            />
          </Field>
          <Field label="Flight #" flex={1}>
            <Input
              value={leg.flightNumber}
              onChangeText={(v) => update({ flightNumber: v })}
              placeholder="SV124"
              autoCapitalize="characters"
            />
          </Field>
        </Row>

        <Field label="From">
          <Input
            value={leg.departureCity}
            onChangeText={(v) => update({ departureCity: v })}
            placeholder={departurePlaceholder}
          />
        </Field>
        <Row>
          <Field label="Departure date" flex={1.3}>
            <DateField
              value={leg.departureDate}
              onChange={(v) => update({ departureDate: v })}
            />
          </Field>
          <Field label="Time" flex={1}>
            <TimeField
              value={leg.departureTime}
              onChange={(v) => update({ departureTime: v })}
            />
          </Field>
        </Row>

        <Field label="To">
          <Input
            value={leg.arrivalCity}
            onChangeText={(v) => update({ arrivalCity: v })}
            placeholder={arrivalPlaceholder}
          />
        </Field>
        <Row>
          <Field label="Arrival date" flex={1.3}>
            <DateField
              value={leg.arrivalDate}
              onChange={(v) => update({ arrivalDate: v })}
            />
          </Field>
          <Field label="Time" flex={1}>
            <TimeField
              value={leg.arrivalTime}
              onChange={(v) => update({ arrivalTime: v })}
            />
          </Field>
        </Row>

        {isOutbound && (
          <Field label="Booking reference (optional)">
            <Input
              value={leg.bookingRef}
              onChangeText={(v) => update({ bookingRef: v })}
              placeholder="ABC123"
              autoCapitalize="characters"
            />
          </Field>
        )}
      </Section>

      <ToggleCard
        title="Layover on this leg?"
        subtitle="Add the stopover city and duration"
        value={leg.hasLayover}
        onValueChange={(v) => update({ hasLayover: v })}
      />

      {leg.hasLayover && (
        <Section icon="git-branch" tint={Palette.orange} title="Layover">
          <Field label="Stopover city">
            <Input
              value={leg.layoverCity}
              onChangeText={(v) => update({ layoverCity: v })}
              placeholder="Dubai"
            />
          </Field>
          <Field label="Layover duration">
            <Input
              value={leg.layoverDuration}
              onChangeText={(v) => update({ layoverDuration: v })}
              placeholder="2h 30m"
              autoCapitalize="none"
            />
          </Field>
        </Section>
      )}
    </>
  );
}
