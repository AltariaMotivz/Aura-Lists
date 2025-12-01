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

### 3.1. Usernames
*   **Goal**: Replace the phone number display with a custom `@username`.
*   **Implementation**:
    *   Add a `username` field to the `users` collection.
    *   Implement a function on user sign-up to create and validate a unique username.

### 3.2. Image Uploads
*   **Goal**: Allow users to upload photos directly from their device instead of pasting URLs.
*   **Implementation**: Integrate Firebase Storage.

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
