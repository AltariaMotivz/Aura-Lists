# Aura List - Project README

## 1. Overview

This is the project README for the **Aura List** application (formerly Crystal Wishlist). It is a full-stack Progressive Web App (PWA) built with vanilla HTML, CSS, and JavaScript. The backend is powered by Firebase, utilizing Firestore for the database and Firebase Authentication (Phone Number) for secure, passwordless logins.

## 2. Current Features (v2.9)

The application currently supports the following features:

*   **Secure Authentication**: Passwordless phone number authentication via Firebase.
*   **User-Specific Data**: All data is tied to the authenticated user's unique `uid`.
*   **Wishlist Management (CRUD)**: Users can create, read, update, and delete their own wishlist items.
*   **Wish Creation**: The "Add a Wish" modal allows users to save an item's name, an external URL, notes, and an image URL.
*   **Image Optimization**: Images are lazy-loaded and decoded asynchronously for smooth scrolling performance.
*   **Public Share Links**: Users can generate a unique link to share their wishlist with anyone (Guest Mode), allowing view-only access without an account.
*   **Social Functionality**:
    *   **Add Friends by Phone**: Users can add friends using their phone number.
    *   **Dedicated Friend View**: Clicking a friend's name opens a full-page view of their wishlist, optimized for mobile scrolling.
    *   **Clickable Thumbnails**: Users can click item images to visit the external product link.
    *   **Aesthetics**:
    *   **Mystery Gift Thumbnail**: Items without a photo display a custom, minimalist gift box illustration.
    *   **Dense Grid**: Desktop view shows 4-5 items per row for a compact collection view.

## 3. Roadmap (Future Features)

The following features are planned for future development:

### 3.1. User Profiles (Display Names & Usernames)

Goal: Replace phone number identification with a dual-profile system: a public "Display Name" (e.g., Jane Doe) and a unique "@username" (e.g., @jane_doe_88). Users should be able to search for friends by their Display Name and select the correct person from a list of results using the unique username as an identifier.

Implementation:
- Database: Add displayName and username fields to the users collection. 
- Validation: Implement a function on user sign-up to create and validate the uniqueness of the @username (using a separate `usernames` registry collection).
- Search UI: Update the "Add Friend" modal to accept text input. Display a results list showing the user's avatar, Display Name, and @username so the searcher can confidently select the right friend.

### 3.2. Image Uploads
*   **Goal**: Allow users to upload photos directly from their device instead of pasting URLs.
*   **Implementation**: Integrate Firebase Storage.

### 3.3. Gifts Received (Archive)
*   **Goal**: Allow users to mark items as "received" (purchased/gifted), removing them from the active wishlist and archiving them into a private "Gifts Received" folder.
*   **Implementation**:
    *   Add a status/flag to items to mark them as received.
    *   Filter these items from the main public/private views.
    *   Create a dedicated, private-only view for "Gifts Received".

### 3.4. Optional "Mark as Purchased" Toggle
*   **Goal**: Give users control over whether friends can mark items as purchased/claimed on their wishlist.
*   **Implementation**:
    *   Add a user preference setting (toggle) in the user's profile.
    *   If enabled: Display a notice to friends explaining they can claim items secretly.
    *   If disabled: Hide the "Mark as Purchased" / Claim buttons for friends.

### 3.5. Copy Wish to My Wishlist
*   **Goal**: Allow users to easily duplicate an item from a friend's wishlist to their own.
*   **Implementation**:
    *   Add a "Copy" / "Plus" button to items when viewing a friend's list.
    *   Clicking it creates a new entry in the current user's wishlist with the same details (name, link, image, notes).

## 4. Troubleshooting / Common Issues

This section documents common errors encountered during development and their solutions.

### 4.1. Error: Missing or insufficient permissions
*   **Symptom**: Clicking "Add a Friend" throws a Firestore permission error.
*   **Solution**: Ensure Firestore Security Rules allow authenticated users to read the `/users/{userId}` collection to verify if a user exists.

### 4.2. Error: SMS code not received
*   **Symptom**: UI confirms "code sent," but no SMS is received.
*   **Cause**: Firebase throttles SMS requests to the same phone number after repeated attempts.
*   **Solution**: Test with a new phone number or wait for the cooldown period.

### 4.3. Browser Caching Issues
*   **Symptom**: New features (like the Claim button) don't appear after deployment.
*   **Solution**: We use a version query parameter (e.g., `script.js?v=2.7`) to force the browser to fetch the latest script.
