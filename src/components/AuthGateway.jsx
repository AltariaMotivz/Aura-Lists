import React, { useState, useRef } from 'react';
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
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel aura-enter" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '3rem 2rem' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Aura List</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Enter your phone number to begin</p>

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
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Code'}
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
        {error && <p role="alert" style={{ color: '#e57373', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</p>}
      </div>
    </div>
  );
};

export default AuthGateway;
