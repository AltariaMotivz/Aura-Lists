# Aura List - Project README

## 1. Overview

This is the project README for the **Aura List** application (formerly Crystal Wishlist). It is a full-stack Progressive Web App (PWA) built with vanilla HTML, CSS, and JavaScript. The backend is powered by Firebase, utilizing Firestore for the database and Firebase Authentication (Phone Number) for secure, passwordless logins.

## 2. Current Features (v3.2)

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
*   **User Profiles & Social**:
    *   **Unique Usernames**: Users now identify with a unique `@username` alongside their display name.
    *   **Smart Search**: The "Add Friend" feature now supports searching by Name or Username.
    *   **Profile Management**: Users can update their display name and view their username directly from the dashboard.
    *   **User Profile Photos**: Users can upload custom profile photos via Firebase Storage. Photos appear on the dashboard and in friends' grids.
*   **Gift Claiming (Mark as Purchased)**: Friends can mark items as "purchased" to prevent duplicate gifts. Claim status is visible to all friends but hidden from the list owner.

## 3. Roadmap (Future Features)

The following features are planned for future development:

### 3.1. Image Uploads
*   **Goal**: Allow users to upload photos directly from their device instead of pasting URLs.
*   **Implementation**: Integrate Firebase Storage.

### 3.2. Gifts Received (Archive)
*   **Goal**: Allow users to mark items as "received" (purchased/gifted), removing them from the active wishlist and archiving them into a private "Gifts Received" folder.
*   **Implementation**:
    *   Add a status/flag to items to mark them as received.
    *   Filter these items from the main public/private views.
    *   Create a dedicated, private-only view for "Gifts Received".

### 3.3. Copy Wish to My Wishlist
*   **Goal**: Allow users to easily duplicate an item from a friend's wishlist to their own.
*   **Implementation**:
    *   Add a "Copy" / "Plus" button to items when viewing a friend's list.
    *   Clicking it creates a new entry in the current user's wishlist with the same details (name, link, image, notes).

### 3.4. Advanced Sorting Options
*   **Goal**: Allow users to sort wishlist items by Name, Date Added, and Price.
*   **Implementation**:
    *   Add a sorting dropdown (A-Z, Z-A, Newest, Oldest, Price: High to Low, Price: Low to High).
    *   Display the dropdown below the navigation tabs on both "My Wishlist" and "Friend's Wishlist" views.
    *   Ensure the Date Added field is tracked when creating an item.

### 3.5. Automated Price Scraping
*   **Goal**: Display prices on items by pulling the price automatically from the product URL.
*   **Implementation**:
    *   Integrate a URL scraping or metadata parsing solution to fetch price data.



### 3.7. Categories & Tags
*   **Goal**: Allow users to categorize their items (e.g., Tech, Books, Home).
*   **Implementation**:
    *   Add a category field to the wishlist item data model.
    *   Allow users to filter their views by these categories.

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
