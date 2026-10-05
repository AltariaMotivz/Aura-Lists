# Aura Universe review

Branch: `codex/aura-universe`, based on the previously merged `master` branch.

Aura keeps its neon cyan, magenta and violet palette, existing fonts and glass surfaces. Floating iridescent bubbles, pointer light, button sparkles and a persistent Vivid/Calm preference connect the screens. System reduced-motion preferences disable effects. The login form is centered and visible before the optional portal on phone and desktop.

## Screens and interactions

- Dashboard: personalized greeting, quick wish/friend actions, recent-feed counts, friend constellation, clearer empty states and graceful partial-feed errors.
- Friends: dedicated directory, filtering by name or username, links to each list, and a native friend-search dialog. Search trims spaces and leading @; existing/new connections show Connected. Search and saving errors are visible.
- My Wishlist: search by name and notes, matching occasion filters, clearer counts and empty states, image previews, add/edit actions and success feedback.
- Friend wishlists: readable Aura styling, profile summary, search, Available/Claimed/All filters, and removal confirmation. Purchased confirmation writes to the correct current or legacy collection. Self-view uses owner controls.
- Profile: newly connected screen with name/username editing, photo upload, sharing and success/error feedback. Photos must be images under 5 MB. Names and usernames feed the existing search index; usernames are not guaranteed unique. Shared links require sign-in.
- Navigation: all four main screens are accessible. Mobile navigation becomes a compact row and hides the redundant friend sidebar. Occasion filters appear on wishlist screens.
- Dialogs: native modal semantics, keyboard focus handling, Escape dismissal, and disabled actions while saving. Wish deletion explicitly says it is permanent.

## Playground

**Explore the vibe** opens Dashboard, Friends, Wishes and Profile with sample data and the real presentation components. Try filtering friends, opening their wishes, searching wishes, adding a sample friend/wish, and editing a sample profile. Sample edits disappear when the playground closes and make no Firebase writes. Photo uploading and real sharing stay in the authenticated profile screen.

## Validation

- Production build and lint pass. The repository retains lint warnings (including context Fast Refresh exports and effect state resets) and the existing large-bundle warning.
- Browser checks cover desktop and 390px mobile layouts, compact navigation, no horizontal overflow, friend/wish search, keyboard card expansion, sample additions and profile editing.
- Escape/focus return and Calm persistence were checked in the preceding update. Calm pauses bubble animation; reduced-motion CSS and event guards remain in place.
- Actual Firebase phone sign-in, friend creation, profile/photo saving, sharing, wish add/edit/delete and purchased updates need staging tests with authorized accounts. No production data was created or deleted during these checks.

## Partner preview

Ask Antigravity to fetch the latest `codex/aura-universe`, install with `npm ci --legacy-peer-deps`, build, and redeploy only the Firebase Hosting staging preview channel for `crystal-wishlist`. Do not merge or release live before review. The install flag addresses the existing React 19/react-tilt peer conflict.

The preview uses the real Firebase backend unless a separate test project is configured. Review the playground first, then test real account workflows with clearly identified test data.
