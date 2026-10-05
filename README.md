# ✨ Aura Lists

Aura Lists (a.k.a. **Crystal Wishlist**) is a social wishlist app with a dark, magical "astral" look. Create a wishlist, add friends, browse their wishes, and claim gifts through a checkout drawer. Wishlists update in real time.

## Features

- **Authentication**: sign in through the `AuthGateway` login screen, backed by Firebase Auth (including phone sign-in).
- **My Wishlist**: add, edit, and remove wishes with images, using the `AddWishModal` and `WishCard` components.
- **Friends**: a dashboard with friend cards and an activity feed (`ActivityItem`).
- **Friend Wishlists**: view a friend's list at `/friend/:friendId` and claim items using the `CheckoutDrawer`.
- **Immersive UI**: a particle canvas background, floating "anomalies", an astral sidebar, liquid-glass surfaces, and 3D tilt cards (`react-tilt`).
- **Themes**: theme switching through `ThemeContext`.
- **PWA basics**: web manifest and service worker in `public/`.

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | React 19, React Router 7 |
| Build | Vite 8 (`@vitejs/plugin-react`) |
| Backend | Firebase (Auth, Firestore, Storage, Analytics, Hosting) |
| UI | CSS Modules, design tokens (`src/styles/tokens.css`), `lucide-react`, `react-tilt` |
| Linting | Oxlint |

## Routes

| Path | Description |
| --- | --- |
| `/login` | Sign in (redirects home when already signed in) |
| `/` | Dashboard: friends and activity |
| `/my-wishlist` | Manage your own wishes |
| `/friend/:friendId` | View and claim from a friend's wishlist |

All routes except `/login` require authentication.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Firebase project (the app is configured for `crystal-wishlist`)

### Install and run

```bash
npm install
npm run dev
```

The dev server runs at the URL Vite prints (usually http://localhost:5173).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Build the production bundle into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

## Firebase Setup

Firebase config lives in [`src/firebase.js`](src/firebase.js). Firebase web API keys identify your project and are not secret. Access is enforced by the security rules in [`firestore.rules`](firestore.rules) and [`storage.rules`](storage.rules).

To use your own Firebase project, replace the config values in `src/firebase.js` and update [`.firebaserc`](.firebaserc).

If phone sign-in fails locally with `auth/invalid-app-credential`, see [FIREBASE_SETUP.md](FIREBASE_SETUP.md).

## Deployment

The app is deployed with Firebase Hosting from the `dist/` folder (see [`firebase.json`](firebase.json)). All routes rewrite to `index.html` so client-side routing works.

```bash
npm run build
npx firebase-tools deploy
```

To deploy only parts of the project, use `--only hosting`, `--only firestore:rules`, or `--only storage`.

## Project Structure

```
├── public/              # Static assets, manifest, service worker
├── src/
│   ├── components/      # UI components (WishCard, AddWishModal, CheckoutDrawer, sidebar, ...)
│   ├── contexts/        # AuthContext, ThemeContext
│   ├── pages/           # Dashboard, MyWishlist, FriendWishlist
│   ├── styles/          # Design tokens
│   ├── App.jsx          # Routes and layout
│   ├── firebase.js      # Firebase initialisation
│   └── main.jsx         # Entry point
├── firebase.json        # Hosting, Firestore, and Storage config
├── firestore.rules      # Firestore security rules
└── storage.rules        # Storage security rules
```
