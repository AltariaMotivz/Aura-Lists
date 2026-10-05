# Firebase phone authentication setup

The app uses Firebase project `crystal-wishlist`. GitHub collaborator access does not grant Firebase Console access.

## Hosted SMS sign-in

In Firebase Console → Authentication:

1. Enable the Phone provider under Sign-in method.
2. Confirm the intended SMS regions are allowed under Settings → SMS region policy.
3. Confirm the actual hosted app hostname is listed under Settings → Authorized domains.

Firebase's current web phone-auth guide states that localhost is not supported as a hosted phone-auth domain. Do not assume adding localhost or 127.0.0.1 makes a local preview suitable for real SMS testing. Use an authorized hosted preview for end-to-end testing.

## “Could not connect to the reCAPTCHA service”

This message alone does not distinguish blocked Google resources, network trouble, browser embedding restrictions, or configuration problems.

- Reload the page to create a fresh verifier.
- If using an embedded preview browser, open the same address in Chrome or Safari and compare.
- If it fails there too, inspect failed Google/reCAPTCHA requests and the Firebase error code. Check the hosted hostname against Authorized domains.
- `auth/unauthorized-domain` points to domain configuration; `auth/network-request-failed` points to connectivity. `auth/invalid-app-credential` and `auth/captcha-check-failed` need inspection of the verification request and domain configuration.

The app exposes a Reload verification button when Google's reCAPTCHA error callback fires. It does not initiate a second request while the original verification might still be pending.

## Development accounts

Firebase Console → Authentication → Sign-in method → Phone → Phone numbers for testing supports configured fictional numbers and verification codes. These avoid sending real SMS. Merely adding a test number does not guarantee that the browser's reCAPTCHA resources will be skipped.

Use a separate development Firebase project or the Authentication Emulator for isolated testing. Never hardcode test phone credentials or disable verification for production. This app currently uses the configured Firebase project, not an emulator.

References:
- https://firebase.google.com/docs/auth/web/phone-auth
- https://developers.google.com/recaptcha/docs/display#render_param
