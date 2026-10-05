# Themes, mobile navigation and wish-feed fixes

Branch: `codex/aura-theme-fixes-v2`, based on merged `master` (`2ad51dc`).

## What changed

- Light/dark mode now has distinct background, text, surface and accent tokens. Theme settings offer Prism, Aurora and Sunset, each in both modes. The palette button in the header and Appearance section on My Profile apply choices immediately. Preferences persist on the device and also work in the playground.
- Mobile screens use fixed bottom navigation for Home, Wishes, Friends and Profile. Content and success messages reserve space for the bar and the phone safe area. Desktop keeps its sidebar; mobile wishlist occasion filters remain available above the list.
- The repository's Firestore rules allow `wishes` but contain no `wishlist` rule. The optional legacy collection therefore returns permission-denied on deployments using those rules. This used to trigger the feed warning even when current wishes loaded. The shared subscription now treats only legacy permission-denied as an unavailable optional source, preserves readable legacy data, and still reports current-collection and network failures with a retry action.
- Friends are batched in groups of ten to reduce listener overhead: 24 unique owners need six listeners rather than 48. Single-owner lists use the same helper. ISO dates and Firestore timestamps sort consistently and invalid dates no longer show NaNd.
- Page components and the sample playground load on demand. Firebase Storage code loads only when uploading a profile photo. Mobile background blur covers a smaller area, and spark bursts have a strict 48-particle cap.

## Validation

- `node --test tests/wishSubscriptions.test.js`: five passing tests for optional legacy denial, real failures, mixed timestamp sorting, batching/cleanup and empty friend lists.
- `npm run build` and `npm run lint` pass. Existing repository lint warnings and the large Firebase bundle warning remain.
- Browser checks cover all six mode/palette combinations, the header mode button, preference persistence after reload, and 390px bottom-navigation positioning/active state without horizontal overflow.
- UI inspection uses isolated sample data. Production Firebase sign-in and the live feed still need staging verification; no database rules or production data were changed.

## Partner staging handoff

Fetch `codex/aura-theme-fixes-v2`, run `npm ci --legacy-peer-deps`, run the tests and build, then deploy to the Firebase staging preview channel for `crystal-wishlist`. Review modes, palette persistence, bottom navigation, current wishes and a profile photo upload with an authorized test account. If a current-wishes error remains, use the browser console to identify that specific Firebase error. Merge and release after review; a GitHub merge alone does not deploy Hosting.
