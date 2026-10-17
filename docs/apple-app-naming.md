# Qasd on Apple platforms

The application name is **Qasd**. Expo's `app.json` already supplies this name for future native prebuilds, and the iOS CI pipeline uses the Qasd workspace and scheme.

The app targets iPhone only (`platforms: ["ios"]`, `ios.supportsTablet: false`). Signing uses Apple team `T3FWDMWBP8` in `ios.appleTeamId`. The existing local Xcode target also has this team, automatic signing and device family `1` in both Debug and Release, so the local fix survives future Expo prebuilds through the committed app configuration.

The existing local native project was renamed from RawafHajj to Qasd on 17 October 2026: workspace, Xcode project, target, product, shared scheme, source directory, bridging header, entitlements and CocoaPods target references. CocoaPods was reintegrated and `xcodebuild -list` recognises the Qasd workspace and scheme. The brand asset preparation script uses `ios/Qasd/Images.xcassets`.

Open `ios/Qasd.xcworkspace` in Xcode. The native directory is generated and ignored by Git; a clean Expo iOS prebuild regenerates the project from `app.json` with the Qasd name. Existing archives retain the name from the build that created them.

Keep the existing bundle identifier `com.kemo1999.rawafapp`, App Store Connect app ID `6765889732` and linked Expo project identity. These identify the existing app independently of its display name. Legacy URL schemes and local storage keys preserve compatibility with existing links and saved data.

App Store Connect's English (U.K.) app name was changed to Qasd and verified after refreshing the App Information page. The app remains in Prepare for Submission; this metadata change did not submit or release the app.
