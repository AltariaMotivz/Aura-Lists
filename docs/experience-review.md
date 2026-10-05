# Aura Universe review

Branch: `codex/aura-universe`, based on the merged `master` branch.

Aura keeps its neon cyan, magenta and violet palette, existing fonts and glass surfaces. This update adds an animated wish portal, floating iridescent bubbles on every screen, pointer-following light, button sparkles and a Vivid/Calm preference that persists on the device. System reduced-motion preferences disable the effects.

The login screen includes **Explore the vibe**, an interactive sample wishlist. It uses the real wish-card component and supports expansion, filtering and adding a sample wish without signing in or writing Firebase data. Sample wishes disappear when the playground closes.

Signed-in improvements include wish search by name and notes, clearer counts and empty states, occasion filters matching the add-wish form, image previews, responsive header controls, and success feedback after a wish is saved. Firebase authentication and database rules are unchanged.

## Validation

- Production build and lint complete successfully. Lint retains repository warnings plus the context export Fast Refresh warning; the build retains its large-bundle warning.
- Desktop layout checked at 1200 × 850; mobile layout checked at 390 × 844 with no horizontal overflow after containing the portal rings.
- Browser checks cover keyboard card expansion, category filtering, sample addition, Escape dismissal with focus return, and Calm persistence after reload. Computed bubble animation is paused in Calm mode.
- Authenticated Firebase sign-in, saving, editing and purchasing need a test account on the staging domain. No production account or wish was created during these checks.

## Partner preview

Ask Antigravity to fetch `codex/aura-universe`, install with `npm ci --legacy-peer-deps`, build, and deploy only to the Firebase Hosting staging preview channel for `crystal-wishlist`. Do not merge or release live before reviewing. The peer-dependency install flag is required by the existing React 19/react-tilt conflict.

Test the entrance with **Explore the vibe**, then use a test account to verify search, occasion filters, add/edit wishes and saved feedback. Staging uses the real Firebase backend unless a separate test project is configured.
