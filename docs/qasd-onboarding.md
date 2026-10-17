# Qasd's four-screen introduction

The app owner chose an introduction followed by exploration, with refined illustration and subtle motion. No personalisation questions, account creation, permissions or travel details are required in this flow.

## Research and direction

- [Apple Human Interface Guidelines: Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding/) informed the short, optional sequence, interactive previews, postponed setup and replay from Settings.
- [Calm onboarding capture, App Fuel](https://theappfuel.com/examples/calm_onboarding) was a visual reference for one focused message and restrained pacing.
- [Endel's June 2023 screen collection, UI Pocket](https://www.ui-pocket.com/mobile/apps/endel/2023-06) was a visual reference for a clear visual anchor, minimal navigation and one primary action. This is a historical capture, not a claim about Endel's current onboarding.

Reference screenshots were researched, not copied into Qasd. The final art is original, with paper texture, cream architectural forms, forest green, navy and gold. Typography uses the existing Cormorant Garamond and DM Sans families. No mascot, emoji or new icon library was introduced.

## Sequence

1. **A clearer path to Umrah.** A custom Makkah illustration introduces the app's purpose.
2. **See the steps. Feel prepared.** Tabs switch between Qasd's Tawaf and Sa'i diagrams. The copy introduces lessons, du'a and the offline Ibn Baz booklet.
3. **Plans in place. Room to focus.** An explicitly labelled example trip and a working preview checkbox show organisation without creating bookings or changing real preparation progress.
4. **Your journey. At your pace.** A second illustration closes the sequence. Explore Qasd opens Home; Plan my Umrah opens the existing Umrah setup. If a trip already exists, the secondary action opens that trip instead.

## Behaviour

- The root entry route waits for the local welcome preference before selecting Home or the introduction, avoiding a Home-screen flash for new users.
- Skip is available throughout and saves the same completion preference as either final action. Normal cold launches then open Home.
- Settings > Welcome to Qasd replays the introduction for guests and travellers with an itinerary.
- The dedicated `@qasd_welcome_v1` key is independent of trip, checklist, learning and ritual state. Clearing a trip does not force onboarding again.
- No personal details are requested, and the example checkbox stays component-local.
- Back returns to the preceding introduction screen. Each screen has an explicit position indicator and heading; diagrams have full accessible descriptions.
- Short fade/vertical entrance transitions respect Reduce Motion. Content scrolls vertically when needed; actions remain reachable in the footer.
- Custom-font size and line height scale together. Display headings scale to 1.35×, wordmark to 1.1× and regular text to 2×. Diagram annotations retain their graphical scale with complete VoiceOver descriptions. The trip preview stacks its city names with larger text.

## Validation

Verified on the iPhone 17 Pro Max and an isolated iPhone 16e simulator. The smaller device was used for first launch, both diagram tabs, the preview checkbox, final Explore action, Skip, Settings replay and a cold restart. Home retained all 10 initial checklist items after interacting with the example. Larger Dynamic Type exposed clipped custom-font line boxes; the corrected rendering wraps and scrolls, with readable footer controls. The review device's text size was restored afterwards.

Typecheck and 43 unit tests passed. Lint has no errors and the same five existing warnings in `hajj-guide.tsx`.

This work is newer than internal TestFlight build **1.0.0 (2)**. A new binary is required to distribute the introduction through TestFlight. The public-release scholar-review requirement remains in place, and the new illustrations are included in the release content fingerprint.
