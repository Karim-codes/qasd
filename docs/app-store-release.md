# Qasd: TestFlight and App Store release

Updated 18 October 2026 for the English (U.K.) listing. Bundle ID: `com.kemo1999.rawafapp`. Apple ID: `6765889732`. Apple team: `T3FWDMWBP8`.

## Current beta and launch requirement

The current candidate is **1.0.0 (3)**, for iPhone, including the illustrated four-screen introduction. Hajj planning is labelled Coming soon and does not open from Settings. This beta is for internal review. Religious content has not received the independent qualified-scholar approval requested by the app owner; see [the review record](religious-content-review.md). Complete that review before public launch.

Local archive validation succeeded with Xcode 26.0.1: the bundled application reports version 1.0.0, build 3 and device family `[1]` (iPhone), and contains the Release JavaScript bundle and both onboarding illustrations. The bundled illustrations' SHA-256 hashes match the source assets. Typecheck and all 43 unit tests passed. Archive: `/tmp/Qasd-TestFlight-1.0.0-3.xcarchive`. Using the owner's existing approval for signing/provisioning refresh, Xcode successfully uploaded the internal-only build to Apple on 18 October 2026 (`Uploaded Qasd`, `EXPORT SUCCEEDED`). Upload log: `/tmp/qasd-testflight-3-upload.log`.

Apple processing completed. App Store Connect was visually verified to show **build 3, Internal, Testing**, assigned automatically to the existing **Early access internal** group, with four invites shown. [Build details](https://appstoreconnect.apple.com/teams/1a1d5638-a859-446f-831d-934a3b6b9675/apps/6765889732/testflight/ios/21e93cf2-45ae-4c08-a2f8-0d939eb7ee55). Screenshot: `/tmp/qasd-testflight-build-3.png`.

Xcode reported missing upstream framework dSYMs for React, ReactNativeDependencies and Hermes. These were warnings and did not block upload. App symbols were included; crash symbolication inside the affected prebuilt dependencies may be limited.

`scripts/ios/TestFlightExportOptions.plist` requests **TestFlight Internal Only**. Apple will not allow a build uploaded with that flag to be released on the App Store or shared with external testers. After review approval, produce a new build with a higher build number through the checked production path. Do not select this internal-only beta as the eventual App Store release build.

The EAS production build and submit commands retain their scholar-review checks. Native Xcode distribution does not run those JavaScript checks automatically: the owner must run `npm run check:religious-review` and obtain a passing result before preparing a public release.

## App information

| Field | Suggested entry |
| --- | --- |
| Name | Qasd |
| Subtitle | Your Umrah companion |
| Primary language | English (U.K.) |
| Primary category | Travel |
| Secondary category | Education, if desired |
| Content rights | Confirm permissions for the booklet and all assets; photo attributions are in the app and `src/lib/umrah-photo-credits.ts`. Do not certify rights without checking. |

Complete the age-rating questionnaire against the actual app. It has no chat, user-generated-content feed, advertising, gambling, or purchases. Source links open external websites, rather than an unrestricted browser provided by Qasd. Let Apple's questionnaire determine the rating.

## iOS version page

The currently saved version form is **1.0**, with empty copy fields. Set its Version field to **1.0.0** to match the binary before selecting the eventual release build. The form currently has Sign-in required checked and automatic release selected: uncheck Sign-in required and choose Manually release this version.

Promotional Text:

```text
Prepare for Umrah with visual lessons, an offline Ibn Baz guide, a practical checklist and your travel plans together in Qasd.
```

Description:

```text
Prepare for Umrah with a clear guide and your journey details close at hand.

LEARN BEFORE YOU TRAVEL
Explore the stages of Umrah through concise lessons, photographs and practical diagrams. Learn where Tawaf begins and how to count the seven lengths of Sa'i.

READ THE ORIGINAL GUIDE
Read Ibn Baz's Manner of Performing Umrah inside the app, available offline. View the original publication or switch to text that wraps as you enlarge it.

KEEP YOUR PREPARATION TOGETHER
Use a preparation checklist, save du'as and track the topics you have reviewed. Reading progress is separate from completing the actual rituals.

PLAN YOUR UMRAH
Keep your itinerary, flights and stays together. Check prayer times and weather for the selected holy city when connected to the internet. Qasd organises the travel details you enter; it does not book flights or hotels.

START AT YOUR OWN PACE
Explore the guide before adding a trip. No account is required. Your profile, journey and learning progress are saved on your device.

Hajj planning is coming soon.

Qasd provides educational and practical assistance. Ask a qualified scholar about your personal circumstances and follow official instructions during your journey. Qasd is an independent app and is not an official government service.
```

Keywords:

```text
umrah,pilgrimage,makkah,mecca,madinah,tawaf,sai,ihram,dua,prayer,checklist,itinerary
```

Other fields:

| Field | What to enter |
| --- | --- |
| Support URL | A live public HTTPS support page with your real support contact. The field is currently blank. |
| Marketing URL | Optional live product website; leave blank if you do not have one. |
| Copyright | `2026` followed by the actual rights holder's legal name. |
| Privacy Policy URL | A live public HTTPS policy explaining local storage, deletion, prayer/weather providers and support contact. An in-app sheet alone does not supply this URL. |
| Build | Select a new public-release build after scholar approval, not an internal-only beta. |
| Game Center | Off. |
| Release | Manually release this version. |

Upload genuine iPhone screenshots showing Home, visual Umrah lessons, the original booklet/text reader, preparation and trip planning. Use Apple's current size requirements. No iPad screenshots are needed for this iPhone-only binary. Do not show Hajj planning as available.

## App Review information

Uncheck Sign-in required. Enter the app owner's real first name, last name, phone number with country code and monitored email address. No demo account is needed.

Suggested Notes, after the release is actually ready:

```text
Qasd is an independent Umrah education and trip-planning app for iPhone. It does not require an account, offer purchases, or book travel.

From Home, open Guide to explore Learn and Perform. Learn includes visual lessons and the attributed original Ibn Baz Umrah booklet, which is available offline. In the booklet, Text view and A+ provide wrapping, enlarged text. Marking a topic reviewed records learning only.

Preparation and the guide can be used before adding a trip. Use Settings > Plan your Umrah to create a local itinerary with travel details. Journey and Flights provide prompts when those details have not yet been entered. Hajj planning is marked Coming soon and is not available in this version.

Prayer times and weather use an internet connection and the selected holy-city coordinates. The app does not request the user's live location. Profile, itinerary and progress are stored locally. Settings includes data management and privacy information.
```

## App Privacy and other release forms

The inspected app stores name, itinerary, checklist, saved du'as and progress locally. Its live requests go to `api.aladhan.com` and `api.open-meteo.com` using fixed holy-city coordinates and date, not the profile or itinerary. No advertising or tracking SDK was found. Apple does not require disclosure of data that stays entirely on device, but does require retained data collected by relevant third parties. Verify both providers' retention/usage practices before choosing Data Not Collected; do not infer that answer from local storage alone. The final privacy answers and published policy must agree.

The app declares `ITSAppUsesNonExemptEncryption: false`; it uses standard HTTPS and no custom encryption implementation was found. Answer Apple's export-compliance questions against the final binary. Complete the EU trader-status form using the owner's real legal status. Confirm pricing, territories and any agreements shown by Apple; no price or legal status has been chosen through this task.

## TestFlight testing notes

```text
Please test the new four-screen introduction: first launch, Skip, the Tawaf/Sa'i preview tabs, example checklist, Explore Qasd and Plan my Umrah. Existing trips should remain intact. Replay it from Settings > Welcome to Qasd; completing or skipping it should prevent it appearing on the next normal launch.

Also test the visual Umrah lessons, the offline Ibn Baz booklet (cover, original pages, closing pages and wrapping text size across page changes), learning versus ritual progress, preparation checklist, guest Journey/Flights prompts and saving/editing an Umrah trip. Hajj planning should say Coming soon and not open. Religious wording is pending independent scholar review; report content issues as well as crashes.
```

## References

- [Apple: platform version fields and review information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/)
- [Apple: App Privacy](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple: TestFlight internal testers and internal-only builds](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers)
- [Expo: iOS submission](https://docs.expo.dev/submit/ios/)
