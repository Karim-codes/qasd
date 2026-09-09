# Qasd

A local-first companion for Hajj and Umrah, built with Expo, React Native and TypeScript.

## Development

```sh
npm install
npm start
```

Use `npm run ios`, `npm run android` or `npm run web` for the relevant platform. After moving from the old project structure, restart Metro with `npx expo start --clear` so it discovers `src/app`.

## Project structure

| Folder | Purpose |
| --- | --- |
| `src/app/` | Expo Router routes and layouts, including both onboarding flows |
| `src/features/` | Feature-specific screens and UI; flight tickets live here |
| `src/components/` | Shared UI and onboarding form components |
| `src/constants/` | Qasd theme, typography and design tokens |
| `src/context/` | Itinerary and onboarding state providers |
| `src/hooks/` | Reusable hooks and local progress subscriptions |
| `src/lib/` | Date helpers, itinerary models, persistence and parsing |
| `assets/brand/` | Supplied Qasd artwork and platform icon assets |
| `modules/` | Local native Expo modules |
| `tests/` | Focused domain and persistence tests |
| `scripts/` | Asset preparation and project tooling |
| `docs/` | Design notes, previews and archived starter material |

`@/` resolves to `src/`; `@assets/` resolves to `assets/`. Keep new shared code out of route files when it can live with its feature.

Open `Qasd.code-workspace` to display the workspace as **Qasd**. Generated folders (`node_modules`, `.expo`, `dist`, `ios`, `android`) are hidden in the editor Explorer but remain on disk. Personal itinerary exports and working notes live in ignored `.local/` and are never app assets.

## Useful commands

- `npm run typecheck` — TypeScript validation (Expo generates route types when started).
- `npm test` — focused domain and persistence tests.
- `node scripts/prepare-brand-assets.cjs` — package the supplied logo for app icons and splash images.
- `npm run build:ios` — existing EAS production build workflow.

## Branding and continuity

The visible app name is **Qasd**. The original EAS project slug, project ID, bundle identifier and local storage keys are deliberately retained so existing installs, builds and saved journeys continue to work. `qasd://` is supported alongside the original URL scheme. Provider names inside imported itinerary data are not app branding.

App icon, splash and device display-name changes appear in a new native build; Metro refresh alone cannot replace an installed app icon. The local iOS display name and image catalog are refreshed as well as Expo config. The existing Xcode target name remains stable.
