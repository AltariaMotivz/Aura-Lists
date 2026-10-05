import React, { useState, useRef, lazy, Suspense } from 'react';
import WishPortal from './WishPortal';
const ExperiencePreview = lazy(() => import('./ExperiencePreview'));
import { EnergyToggle } from './AuraExperience';
import { Sparkles, ArrowRight } from 'lucide-react';
import { auth, db } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthGateway = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsReload, setNeedsReload] = useState(false);

  const verifier = useRef(null);
  const resetVerifier = () => {
    verifier.current?.clear();
    verifier.current = null;
  };
  React.useEffect(() => () => {
    verifier.current?.clear();
    verifier.current = null;
  }, []);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const digits = phoneNumber.replace(/\D/g, '');
      const formattedPhone = phoneNumber.trim().startsWith('+') ? `+${digits}` : `+1${digits}`;
      if (!/^\+[1-9]\d{6,14}$/.test(formattedPhone)) {
        throw new Error('Enter a valid phone number, including the country code outside the US.');
      }
      if (!verifier.current) {
        verifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          'error-callback': () => {
            // reCAPTCHA can fail without rejecting Firebase's pending verification.
            // Require a fresh page instead of starting a second SMS request.
            setError('Google verification could not connect. Reload this page, or open this same address in Chrome or Safari and try again.');
            setNeedsReload(true);
          }
        });
      }
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier.current);
      setConfirmationResult(confirmation);
    } catch (err) {
      const messages = {
        'auth/network-request-failed': 'Could not reach the sign-in service. Check your connection and try again.',
        'auth/unauthorized-domain': 'Phone sign-in is not enabled for this website address. Please use the hosted Aura Lists app.',
        'auth/captcha-check-failed': 'Google verification failed. Reload the page and try again. If this keeps happening, try Chrome or Safari.',
        'auth/invalid-app-credential': 'Google could not verify this app. If you are using a local preview, try the hosted Aura Lists app.',
        'auth/too-many-requests': 'Too many sign-in attempts. Please wait before trying again.'
      };
      setError(messages[err.code] || err.message || 'Failed to send verification code.');
      resetVerifier();
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(verificationCode);
      const user = result.user;

      // Check if user document exists, if not create a basic one
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          phoneNumber: user.phoneNumber,
          createdAt: new Date().toISOString(),
          displayName: '',
          username: '',
          searchableArray: []
        });
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code.');
    }
    setLoading(false);
  };

  return (
    <div className="aura-gateway">
      <header className="aura-gateway-header"><div className="aura-gateway-brand"><Sparkles size={24} aria-hidden="true" /> Aura Lists</div><EnergyToggle /></header>
      <main className="aura-gateway-main">
      <section className="aura-auth-stage" aria-label="Sign in">
      <div className="glass-panel aura-enter aura-auth-panel">
        <span className="aura-eyebrow">Your universe awaits</span>
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Make it yours.</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Sign in with your phone to start collecting wishes.</p>

        {!confirmationResult ? (
          <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              aria-label="Phone number"
              autoComplete="tel"
              type="tel"
              className="input-field"
              placeholder="+12015550123"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              style={{ textAlign: 'center' }}
            />
            <button type="submit" className="btn-primary" disabled={loading || needsReload}>
              {needsReload ? 'Verification unavailable' : loading ? 'Opening your universe…' : 'Let’s get started'} {!loading && !needsReload && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              aria-label="Verification code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              type="text"
              className="input-field"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              style={{ textAlign: 'center' }}
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button type="button" className="btn-glossy" disabled={loading} onClick={() => { setConfirmationResult(null); setVerificationCode(''); setError(''); resetVerifier(); }}>Use a different number</button>
          </form>
        )}

        <div id="recaptcha-container"></div>
        {needsReload && <button type="button" className="btn-glossy" style={{ marginTop: '1rem' }} onClick={() => window.location.reload()}>Reload verification</button>}
        {error && <p role="alert" style={{ color: '#e57373', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</p>}
        <p className="aura-auth-caption">One code. Your whole universe.<br />SMS verification · Message and data rates may apply.</p>
      </div>
      </section>
      <WishPortal onExplore={() => setShowPreview(true)} />
      </main>
      <footer className="aura-gateway-footer">Good things start with a little wish.</footer>
      {showPreview && <Suspense fallback={<p role="status">Opening the playground…</p>}><ExperiencePreview onClose={() => setShowPreview(false)} /></Suspense>}
    </div>
  );
};

export default AuthGateway;
