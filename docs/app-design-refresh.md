# Rawaf design refresh — 6 September 2026

Home’s navy, ivory and forest-green palette now extends through Journey, Stays, Settings and onboarding. Shared travel typography lives in `constants/travel-design.ts`; `AppIcon` gives travel objects a consistent outline treatment, including the same bed icon across hotel-related screens. Existing functional status symbols retain their meaning.

## Research and direction

The user’s supplied travel-planner reference informed the soft surfaces and clear trip groupings. [Dribbble’s itinerary gallery](https://dribbble.com/tags/itinerary-app) provided further itinerary references. [Tripsy’s itinerary preferences](https://tripsy.help/article/59-itinerary-preferences) describes compact itinerary views and current-stay context; these supported the decision to group stops into readable destination sections rather than give every stop a separate oversized card. Rawaf uses its own native layouts; no reference artwork was copied.

## Changes

- Journey: compact ivory route summary, quiet progress bar, destination filters, grouped itinerary stops, expandable details and relevant links. Completed text remains readable instead of crossed out. Completion still uses the existing shared local store.
- Stays: full-width hotel cards, an ivory current-stay card, clear check-in/check-out dates, night counts and the shared bed icon. Scheduled stays are not described as confirmed check-ins.
- Settings: ivory profile card, forest-green actions, larger row text, serif section headings and slate groups. Draft hydration now handles directly opening Settings before the saved itinerary has loaded without overwriting existing edits.
- Onboarding: redesigned welcome, trip selection and Hajj introduction; shared headers, progress markers, form styling and buttons across both setup flows; matching completion screens. Existing routes, validation and draft updates remain in place. Returning users no longer wait through the long welcome animation.
- Flights and other screens: shared palette and outline icons, with matching heading typography on Flights. Custom ritual glyphs are retained.

## Lightweight review

TypeScript passes. A web export was used for one focused visual review at 390px across Journey, Stays, Settings, trip selection, Umrah destination and Hajj introduction. Screenshots in `previews/` use a synthetic itinerary. All six screens fit the page width, and the browser reported no runtime exceptions. No regression suite or native build was run for this design pass.

## Guide and itinerary editors

- Umrah Timeline now groups the 12 existing steps into four chapters, with a cream introduction, resume action and readable completion markers.
- Road Map offers four selectable chapters, native illustrated landmarks, numbered stops and chapter navigation. It represents ritual order, not geographic navigation. Opening a step does not complete it; existing completion controls, saved counters and haptics remain connected.
- Both standalone saved du’as and inline Road Map du’as have fixed Copy/Save actions outside their scrolling content. Sheets reserve `max(bottom safe-area inset, 16)` beneath the toolbar and allow the reading body to shrink and scroll.
- Umrah Settings asks for the same basic home city and travel dates as onboarding. Hajj uses the existing `FlightLegForm`, including optional layover fields. Unedited airline, airport, booking and connecting-flight data are preserved.
- `HotelForm` is shared between Settings and both onboarding flows. Dates use the existing picker and full-width fields. Settings maps Makkah/Madinah correctly for Madinah-first trips and hides Madinah for Makkah-only trips.

Focused validation: TypeScript and web export passed. The 390px browser review checked both guide modes, inline and standalone du’a controls, bookmark save/reopen, and expanded flight/stay forms with synthetic data. Both inline toolbar buttons measured 48px high and ended 22px above the 844px viewport bottom. No browser runtime exceptions. Native safe-area behavior is implemented but still needs an on-device visual check; no native build or regression suite was run. Final captures: `previews/guide-timeline.png`, `guide-roadmap.png`, `guide-dua-actions.png`, `guide-saved-dua.png`, `settings-flight-form.png`, `settings-stay-form.png`.

## Road Map refinement

Road Map now has a compact resume button instead of the Timeline hero. All 12 stops appear on a single winding road with centre markings, chapter landmarks, tappable stops and chapter jump shortcuts. Completed connections use a darker green. The Timeline retains its existing presentation. Step completion now uses a filled, bordered button with a checkmark, explicit undo caption and undo icon. Existing counter requirements and completion rules are unchanged.

TypeScript and web export passed. A focused 390px browser check verified chapter jumping, opening a stop, completing it and undoing completion, with no runtime exceptions. Updated previews: `guide-roadmap-v2.png`, `guide-roadmap-path.png`, `guide-completion-button.png`.
