# Home and local progress

Implemented scope: a clearer next action on Home, reliable Tawaf and Sa’i counters, local guide completion and bookmarks, and shared journey progress. Audio, prayer/weather caching, preparation checklists, emergency contacts, and the full accessibility pass remain deferred.

## Design research

Reviewed on 5 September 2026:

- [Dribbble: app home screens](https://dribbble.com/tags/app-home-screen) and [travel apps](https://dribbble.com/tags/travel-app). Visually inspected Tino’s “Travel Planner App UI” reference from the travel gallery. Its trip grouping and short travel shortcuts were useful references; illustrations and destination discovery are less useful for Rawaf’s in-trip task. No reference artwork was copied into the app.
- [Mobbin: mobile home screens](https://mobbin.com/explore/mobile/screens/home). The public index offers examples grouped around cards, navigation, progress and contextual information. Full browsing requires login; research was limited to publicly accessible content.
- [Airbnb’s 2025 app release](https://news.airbnb.com/en-uk/2025-summer-release-now-you-can-airbnb-more-than-an-airbnb). Its arrival itinerary and check-in details informed the decision to elevate a timely action over a static dashboard.

Rawaf keeps its navy background, gold accents and existing serif/sans typography. The layout now uses a compact city route, a warm ivory next-action panel, a deep green action button, and quieter rows for flights, guidance, hotels and prayer/weather. Surface contrast makes the main action prominent. The Home entrance animation, ambient glow, decorative progress bar and repeated bordered cards were removed.

Screenshots in `previews/` show the actual exported app with a synthetic itinerary in an isolated browser profile. They are not design mockups or user trip data.

## Behavior

- Home and Journey share the same itinerary step builder and date-based next-step selection. Home additionally prioritizes today/tomorrow’s flights and saved Umrah counters during the Makkah stay. Actions open the relevant flight, stay, journey or guide screen.
- Marking a Home journey action complete updates Journey immediately. Ritual completion requires an explicit action; opening a step does not mark it complete.
- Counters maintain separate 0–7 counts. Accepted increments trigger medium haptics; the seventh triggers success feedback. Undo uses light feedback. Haptic failures do not prevent counting.
- Increments within 900 milliseconds are ignored using shared counter state. Undo stays immediately available. Reset requires an explicit confirmation and affects only the selected counter.
- Directly opened guides are protected from the hidden startup screen’s delayed redirect. Timeline expansion sizes to its content instead of clipping long counter panels.
- Both guide presentations share the counters. Home links directly to the saved counter, displayed before the explanatory text.
- Guide steps and du’a bookmarks are bundled/local. Saved du’as have a dedicated list and retain the existing bookmark keys. All three text forms remain; book icons replace speaker icons.
- The old Umrah completion sentence about waiting for Hajj was removed. This change is not a religious-content review.

## Persistence

Trip identity is stable across edits. Existing trips use the legacy journey key to preserve completion; newly created trips receive separate progress keys. Bookmarks remain global.

A shared local record hydrates once per key, prevents changes before hydration, serializes writes, and exposes loading/saving/error states. Failed writes retain the latest in-memory state and offer retry. Invalid saved counters are protected from overwrite. Itinerary writes are also ordered, and a corrupt original backup no longer hides a valid current itinerary.

## Validation

- `npm test`: 16 regression tests cover hydration races, duplicate taps, counter limits, undo/reset, restart restoration, trip separation, save failures/retry, corrupt records, bookmarks, itinerary write ordering, legacy identity, date parsing and Home decisions.
- `npx tsc --noEmit`: passes.
- `npm run lint`: no errors; five existing warnings remain in `app/hajj-guide.tsx`.
- Expo web export and iOS JavaScript bundle export: pass.
- Isolated Chrome checks at 390px and 320px: Home resume, direct counter navigation, rapid taps, undo, reset cancellation, restart restoration with remote prayer/weather URLs blocked, independent Sa’i counts, confirmed reset, saved du’a retrieval after navigation, and no horizontal page overflow. No JavaScript runtime exceptions.

Native guidance and storage do not depend on a network connection. Browser checks are not a substitute for testing haptic feel, native bottom sheets, or a cold launch in airplane mode on an iPhone. The web export does not add a service worker or promise browser offline installation.
