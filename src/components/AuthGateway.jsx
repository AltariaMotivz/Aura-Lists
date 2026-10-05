import React, { useState, useRef } from 'react';
import { Sparkles, Gift, Heart, ArrowRight } from 'lucide-react';
import { auth, db } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthGateway = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        verifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      }
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier.current);
      setConfirmationResult(confirmation);
    } catch (err) {
      setError(err.message || 'Failed to send verification code.');
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
    <div className="aura-auth">
      <div className="aura-brand"><Sparkles size={24} aria-hidden="true" /> Aura Lists</div>
      <main className="aura-auth-main">
        <section className="aura-auth-story" aria-labelledby="welcome-title">
          <span className="aura-kicker">Little wishes. Thoughtful gifts.</span>
          <h1 id="welcome-title">The things you love.<br /><em>The people who know.</em></h1>
          <p>A place for your wishes, big and small. Save what catches your eye and find a little inspiration in the people you care about.</p>
          <div className="aura-auth-features">
            <span><Gift size={17} aria-hidden="true" /> Collect your wishes</span>
            <span><Heart size={17} aria-hidden="true" /> Give with meaning</span>
          </div>
        </section>
        <section className="glass-panel aura-auth-card" aria-labelledby="signin-title">
          <span className="aura-kicker">Your list starts here</span>
          <h2 id="signin-title">{confirmationResult ? 'Check your messages' : 'Make room for a little joy.'}</h2>
          <p>{confirmationResult ? `Enter the six-digit code sent to ${phoneNumber}.` : 'Sign in or create your account with your phone number.'}</p>
          {!confirmationResult ? (
            <form className="aura-auth-form" onSubmit={handleSendCode} aria-busy={loading}>
              <label htmlFor="phone-number">Phone number</label>
              <input id="phone-number" type="tel" autoComplete="tel" className="input-field" placeholder="+1 (201) 555-0123" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required disabled={loading} aria-describedby="phone-help" />
              <p id="phone-help" className="aura-auth-note">Outside the US? Include your country code.</p>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Sending your code…' : 'Continue with phone'}{!loading && <ArrowRight size={18} aria-hidden="true" />}</button>
            </form>
          ) : (
            <form className="aura-auth-form" onSubmit={handleVerifyCode} aria-busy={loading}>
              <label htmlFor="verification-code">Verification code</label>
              <input id="verification-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} className="input-field" placeholder="123456" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} required disabled={loading} autoFocus />
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Verifying…' : 'Open my lists'}<ArrowRight size={18} aria-hidden="true" /></button>
              <button type="button" className="btn-glossy" disabled={loading} onClick={() => { setConfirmationResult(null); setVerificationCode(''); setError(''); resetVerifier(); }}>Use a different number</button>
            </form>
          )}
          <div id="recaptcha-container" />
          {error && <p className="aura-error" role="alert" style={{ marginTop: 16 }}>{error}</p>}
          <p className="aura-auth-note">We’ll send an SMS to verify your number. Message and data rates may apply.</p>
        </section>
      </main>
      <footer className="aura-auth-footer">A little thought goes a long way.</footer>
    </div>
  );
};

export default AuthGateway;
