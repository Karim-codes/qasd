# Learning before booking

Qasd opens Home without requiring a trip, name, dates, hotel, or account. New users can open the Umrah guide in one tap or use the preparation checklist immediately. Flights and Journey have useful empty states with an optional Add trip action. Existing trips still open their contextual Home.

## Progress boundaries

- Learn is the default guide mode. Reviewed topics and reading position use the global `@qasd:learning:v1` record.
- Counters in Learn are explicitly practice counters, stored in `@qasd:practice:v1`. They do not update ritual or Journey completion.
- Perform retains the existing trip/pilgrim ritual keys and counter protections. Home counter links explicitly open Perform; opening educational guidance defaults to Learn.
- Learning and bookmarks remain available after adding a trip. The guest checklist, including custom items, is copied into the first trip without replacing any existing trip checklist.
- Existing ritual counts are preserved, not reclassified as practice or inferred complete from travel dates.

## Home and setup

Home uses DM Sans for functional headings, with a smaller city route. The permanent Flights/Guide shortcut row and ambiguous itinerary completion fraction are removed. Preparation shows outstanding tasks, or becomes the primary card before travel. Date-based completion is labeled Trip ended; partial ritual counts are labeled saved counters.

Umrah trip setup accepts unknown dates, names, and hotels. Learning does not require entering setup at all. Setup can retry after a failed save. This change does not complete the broader flight-data, religious-content review, date/time-zone, or storage-recovery work identified in the audit.

## Verification

- 29 automated domain/persistence tests pass, including learning/practice/ritual separation, restart restoration, checklist carry-over, preparation priority, and learning resume/overview order.
- TypeScript and web export pass. ESLint has no errors and retains five existing Hajj-guide warnings.
- Browser checks at 390px and 320px: immediate learning, reviewed topic, practice counter, separate Perform count, guest checklist and custom item, empty-detail trip creation, and retained preparation.
- iOS 26 simulator: refreshed native Home, genuine Guide tab navigation, separate Learn/Perform progress, practice increment, reset confirmation/cancellation, and preservation of the pre-existing Tawaf 7/7 and Sa’i 3/7 counters. The guide sheets now expose individual native accessibility controls.

Full VoiceOver/TalkBack, large-text, physical-device outdoor use, airplane-mode cold launch, and termination during a pending write remain separate release checks.

## Consistent guide reader

Timeline entries, roadmap stops, resume links and saved du’as share one full-screen `GuideReader` on the native `umrah-topic` stack route. It replaces the original content-sized bottom sheets and the subsequent modal handoff. The reader has a safe-area-aware layout, topic position, Guidance/Du’a panes and fixed previous/next navigation. Opening and navigating topics remembers reading position without marking anything reviewed or performed. Completion remains an explicit action.

Guidance, Arabic du’a and counters use the same cream surfaces and forest actions. Learning review controls are compact in the footer; save errors and retries remain visible. Arabic uses the platform font with an Arabic accessibility language. Native stack transitions respect Reduce Motion.

## Learning overview and floating navigation

Learn opens with “Umrah, made simple”: four stages introducing the existing twelve topics. The main card opens an educational overview; individual stage links scroll to their topics. Learning titles and the final topic avoid declaring a ritual completed. With no reviewed topics, Start learning begins at Ihram even if the final topic was previously browsed. Practice counters are optional disclosures beneath the guidance. Perform retains direct ritual counters and the timeline/roadmap.

The tab bar floats above the safe area with a native iOS blur, a subtle gloss gradient and a highlight around its edge. A bottom surface prevents content showing through below the bar. Scrollable tab content uses the measured tab height plus the safe area and gap. Reduce Transparency uses an opaque background; Android on this SDK uses the tinted fallback rather than experimental blur. Settings explicitly offers Plan your Umrah and Plan your Hajj.

Implementation references: [Expo SDK 54 BlurView](https://github.com/expo/expo/blob/main/docs/pages/versions/v54.0.0/sdk/blur-view.mdx), [React Navigation tab background and content insets](https://reactnavigation.org/docs/bottom-tab-navigator/#tabbarbackground), and [React Native accessibility settings](https://reactnative.dev/docs/0.81/accessibilityinfo).

## Navigation back to the learning list

The overview and topic reader are native stack pages (`umrah-overview` and `umrah-topic`). Opening a topic pushes it over the existing overview rather than dismissing one modal and presenting another. “All topics” and the native back gesture pop the reader and reveal the same overview with its scroll position intact. Next/Previous update the current reader’s parameters, so they do not create a back stack of every topic. The final topic’s return action uses the same origin. Overview Back returns to Learn; saved reading returns to Saved du’as; direct reading returns to Guide. Existing Home/Journey step links continue to work.

Navigation follows [Expo Router stack navigation](https://docs.expo.dev/router/basics/navigation/). The regression check is the real simulator round trip, including a scrolled overview and Next before Back, rather than a test that duplicates the router’s implementation.
