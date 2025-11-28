# Firebase Authentication Setup Guide

The error `auth/invalid-app-credential` usually happens when running locally because Firebase doesn't recognize your local environment as secure or authorized.

## Fix 1: Add Localhost to Authorized Domains (Recommended)

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project **"Crystal Wishlist"**.
3.  Go to **Authentication** > **Settings** > **Authorized Domains**.
4.  Click **Add Domain**.
5.  Add `localhost` and `127.0.0.1`.

## Fix 2: Add a Test Phone Number (Best for Development)

This allows you to bypass the SMS code and reCAPTCHA entirely while testing.

1.  Go to **Authentication** > **Sign-in method**.
2.  Find **Phone** provider and click the **Edit** (pencil) icon.
3.  Look for the **"Phone numbers for testing"** section (usually an accordion menu).
4.  Add a phone number: `+1 555 555 5555` (or any dummy number).
5.  Add a verification code: `123456`.
6.  **Save**.

Now, when you test your app:
- Enter `+1 555 555 5555` as the phone number.
- The reCAPTCHA will be skipped (or instant).
- Enter `123456` as the code.
