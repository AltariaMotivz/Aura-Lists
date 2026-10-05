# DigiTimes-inspired experience

This first design pass carries DigiTimes' warm paper, navy ink, muted gold, serif headings, rounded surfaces and gentle motion into Aura Lists. The light and dark themes have separate palettes. Phone layouts use a floating navigation dock; large screens retain the sidebar.

The entry page explains the app before phone verification. Phone and code inputs have labels, autocomplete hints and validation. The reCAPTCHA verifier is scoped to the component and recreated after a failed send. Wish and friend dialogs use native modal semantics with Escape handling and explicit focus return. Wish cards expand with Enter or Space, and owner action buttons have accessible names. Wish loading and save failures have visible feedback.

## Verification

- `npm ci --legacy-peer-deps`: installation succeeded. Plain `npm ci` encounters an existing React 19 / react-tilt peer conflict.
- `npm run build`: passed. Vite reports a large bundle warning.
- `npm run lint`: completed without errors; existing warnings remain in legacy components.
- Browser: entry page inspected at desktop size and 390 × 844; no horizontal overflow on the phone layout.
- Invalid phone submission displays the validation error before Firebase is called.
- Temporary local component harness: checked Enter expansion, mobile dark theme, Escape dismissal and focus return to the dialog trigger. Harness files were removed.

Live SMS verification, authenticated Firestore reads/writes and full account journeys still need testing with an authorized test account before merging. Review the friends feed, add/edit wish, category filtering and gift claiming in both themes. Existing specialized friend-list styling and legacy profile components may need a later visual pass.

## Local preview

Run `npm ci --legacy-peer-deps` and `npm run dev`. This app continues to use the Firebase project configured in `src/firebase.js`; use test credentials when reviewing authenticated flows.
