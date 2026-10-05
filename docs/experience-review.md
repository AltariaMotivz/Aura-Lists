# Aura motion and button polish

Preserve Aura Lists' existing theme: its neon cyan/magenta palette, Space Grotesk/Inter typography, glass panels, animated background, particle effects and navigation. The theme tokens and existing navigation styles match the original master branch.

Interaction enhancements:
- Gentle opacity entrances for sign-in, lists and activity cards, with reduced-motion support.
- Spring-like button press feedback, action-button hover feedback and visible keyboard focus.
- Visible Edit/Delete labels and keyboard expansion for wish cards.
- Direct Add your first wish and Find a friend buttons in empty states.
- Animated add/edit wish dialog with native modal semantics, Escape dismissal and focus return.
- Phone/code input labels and a Use a different number button, plus recovery after failed SMS requests.
- Stable particle positions across rerenders so the background does not jump.
- Pass the friends loading state through the layout to the activity feed.

Validation: production build passed; lint completed without errors (existing warnings remain). Browser inspection confirmed the original background, cyan accent, typeface and sign-in layout, with the new entrance animation active. Native dialog focus return and keyboard wish expansion were checked during the preceding component review; live Firebase account flows still need an authorized test account.

Run `npm ci --legacy-peer-deps` then `npm run dev` for a local preview. Plain npm ci encounters the repository's existing React 19/react-tilt peer conflict. The build retains its existing large-bundle warning.
