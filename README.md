Crystal Wishlist - Project README

1. Overview

This is the project README for the Crystal Wishlist application. It is a full-stack Progressive Web App (PWA) built with vanilla HTML, CSS, and JavaScript. The backend is powered by Firebase, utilizing Firestore for the database and Firebase Authentication (Phone Number) for secure, passwordless logins.

2. Current Features (v1.0)

The application currently supports the following features:

Secure Authentication: Passwordless phone number authentication via Firebase.

User-Specific Data: All data is tied to the authenticated user's unique uid.

Wishlist Management (CRUD): Users can create, read, and delete their own wishlist items.

Wish Creation: The "Add a Wish" modal allows users to save an item's name, an external URL, notes, and an image URL.

Social Functionality:

Each user has a unique Friend ID (their uid) to share.

Users can add other users to a "friends" list by their ID.

A central dashboard displays the user's friends and allows navigation to view their respective wishlists.

3. Roadmap (Future Features)

The following features are planned for future development:

3.1. "Claimed" Item Functionality

This is the core "surprise" feature.

Goal: Allow friends to mark a wishlist item as "purchased."

Logic: This "claimed" status must be visible to all other friends but remain hidden from the wishlist owner to prevent duplicate gifts.

Implementation:

Add a claimedBy field (e.g., claimedBy: "friend-user-id") to the wishes documents in Firestore.

Update the client-side rendering logic to conditionally show a "Claimed" status based on whether the currentUser.uid matches the ownerId of the wish.

Add "Claim" / "Unclaim" buttons and the corresponding updateDoc functions to set/unset the claimedBy field.

3.2. Usernames

Goal: Replace the long, complex uid with a simple, unique username for adding friends, improving the user experience.

Implementation:

Add a username field to the users collection.

Implement a function on user sign-up (or in a "Settings" page) to create and validate a unique username.

Update the "Add a Friend" logic to query the users collection by this new username field.

3.3. Edit Wish Functionality

Goal: Allow users to edit an existing wish.

Implementation:

Add an "Edit" button to each wish card.

On click, populate the "Add Wish" modal with the existing item data.

Change the form's submit logic to use updateDoc (to update the existing document) instead of addDoc (to create a new one).

4. Troubleshooting / Common Issues

This section documents common errors encountered during development and their solutions.

4.1. Error: Missing or insufficient permissions

Symptom: Clicking "Add a Friend" throws a Firestore permission error in the console.

Cause: The Firestore Security Rules are too restrictive and do not allow a user to look up another user's document to verify if their Friend ID exists.

Solution: Go to Firebase Console -> Firestore Database -> Rules. Update the rules to allow logged-in users to read the /users/{userId} collection (or at least check for a document's existence).

4.2. Error: addEventListener of null on Page Load

Symptom: Buttons (like "Add a Friend") are unresponsive. The console shows a ReferenceError or TypeError on page load, indicating an element was not found.

Cause: The script.js file is executing before the HTML DOM is fully built and rendered.

Solution: Wrap the main logic of script.js in a document.addEventListener("DOMContentLoaded", () => { ... }); block to ensure the script only runs after all HTML elements are available.

4.3. Error: Button click does nothing, no console errors

Symptom: Clicking a button (e.g., to open a modal) does nothing, and the console is empty (or only shows a console.log from the click).

Cause: A conflict between the JavaScript's method of showing the element and the CSS's method of hiding it. For example, the JS is setting style.display = 'flex', but the CSS is still hiding the element with opacity: 0 and pointer-events: none.

Solution: Make the JS and CSS "speak the same language." The best practice is to have the JavaScript toggle a class (e.g., modal.classList.add('active')) and let the CSS handle all styling (visibility, opacity, etc.) based on the presence of that .active class.

4.4. Error: SMS code not received (after testing)

Symptom: After logging out, a user tries to log back in. The UI confirms "code sent," but no SMS is received.

Cause: This is not a bug, but a Firebase security feature. To prevent spam, Firebase throttles SMS requests to the same phone number after repeated, rapid attempts.

Solution: Test the login flow with a new, fresh phone number (or a Google Voice number) to confirm the functionality is working for new users. The original number's throttling will expire after a cooldown period.

4.5. Error: 400 Bad Request to firebaseappcheck.googleapis.com

Symptom: A 400 error appears in the console on page load, often blocking other operations.

Cause: This was caused by the optional App Check security layer being misconfigured (e.g., localhost or the production domain not being whitelisted in the reCAPTCHA console).

Solution: We removed App Check to simplify the stack. We unregistered App Check in the Firebase Console and removed all initializeAppCheck code from index.html. The essential RecaptchaVerifier (required for SMS login) remains and functions correctly on its own.
