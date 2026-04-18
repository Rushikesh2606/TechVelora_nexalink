import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recalculateTrustScore } from '../services/realtimeService';
import { findUserByReferralCode, recordReferral } from '../services/referralService';

export default function RegisterPage() {
  const [faceVerified, setFaceVerified] = useState(false);

  const { registerWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState('individual');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [industry, setIndustry] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refCode = searchParams.get('ref') || '';
  const [referrerName, setReferrerName] = useState('');

  useEffect(() => {
    if (!refCode) return;

    findUserByReferralCode(refCode)
      .then((user) => {
        if (user) setReferrerName(user.name || '');
      })
      .catch(() => {});
  }, [refCode]);

  useEffect(() => {
    function handleMessage(event) {
      if (event.data?.type === 'FACE_VERIFIED') {
        setFaceVerified(true);
        setError('');
        alert('Face enrollment completed');
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (role === 'individual' && !faceVerified) {
      setError('Please complete face verification before registering.');
      setLoading(false);
      return;
    }

    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (role === 'company' && (!industry || !registrationNumber)) {
      setError('Please fill in both Industry and Registration Number');
      setLoading(false);
      return;
    }

    try {
      let bizVerifyData = null;
      if (role === 'company') {
        try {
          const bizResponse = await fetch("/api/verify-company", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyName: name,
              registrationNumber: registrationNumber
            })
          });
          
          bizVerifyData = await bizResponse.json();
          
          if (!bizVerifyData.valid) {
            if (bizVerifyData.fallback) {
              // Warning but allow (limited verification mode)
              console.warn('BizVerify Fallback Mode: Continuing with manual verification status.');
              bizVerifyData.status = 'PENDING_MANUAL';
              bizVerifyData.trustScore = 20; // Lower trust for non-instant verified accounts
            } else {
              setError(bizVerifyData.message || 'Verification failed. We could not validate this organization.');
              setLoading(false);
              return;
            }
          }
        } catch (bizErr) {
          setError('Organization verification service unreachable. Please try again later.');
          setLoading(false);
          return;
        }
      }

      const user = await registerWithEmail(email, password, name, role, {
        industry,
        registrationNumber,
        bizVerifyData,
        referredByCode: refCode || null,
      });

      if (refCode && user?.uid) {
        recordReferral(refCode, user.uid, email).catch((err) => {
          console.warn('Referral attribution failed:', err?.message || err);
        });
      }

      if (user?.uid) {
        recalculateTrustScore(user.uid).catch((err) => {
          console.error('Trigger trust calc failed:', err);
        });
      }

      navigate('/');
    } catch (err) {
      setError(err?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setLoading(true);
    setError('');

    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  }

  function handleFaceEnroll() {
    if (!email.trim()) {
      setError('Please enter your email before face enrollment.');
      return;
    }

    const encodedEmail = encodeURIComponent(email.trim().toLowerCase());
    window.open(`http://localhost:3000/?mode=enroll&userId=${encodedEmail}`, '_blank');
  }

  return (
    <div className="auth-page">
      <div className="auth-split-container">
        {/* Left Panel - Explanatory */}
        <div className="auth-side-panel">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="auth-logo" style={{ justifyContent: 'flex-start', color: 'white', marginBottom: 32 }}>
              <div className="navbar-brand-icon" style={{ width: 44, height: 44, fontSize: 18, background: 'white', color: 'var(--color-primary)' }}>TL</div>
              <span style={{ fontSize: 28 }}>Nexalink</span>
            </div>
            
            <h2 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
              The World's Most <br/> Trusted Network.
            </h2>
            <p style={{ fontSize: 16, opacity: 0.9, lineHeight: 1.5, maxWidth: 440, marginBottom: 32 }}>
              Nexalink uses advanced AI face authentication and corporate verification 
              to ensure every profile is real. Connect, collaborate, and grow with 
              verified professionals and validated organizations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { title: 'Verified Identity', desc: 'Face authentication for every individual.' },
                { title: 'Corporate Validation', desc: 'Direct BizVerify integration for companies.' },
                { title: 'Trust Scoring', desc: 'Real-time metrics based on system interactions.' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{item.title}</div>
                    <div style={{ fontSize: 14, opacity: 0.8 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Form */}
        <div className="auth-form-panel no-scrollbar">
          <motion.div
            className="auth-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="auth-card">
              <p className="auth-subtitle" style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-primary)', marginBottom: 20 }}>Join the trusted professional community</p>

              {referrerName && (
                <div
                  style={{
                    background: 'rgba(37,99,235,0.05)',
                    border: '1px solid rgba(37,99,235,0.1)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-primary)' }}><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Referred by <strong>{referrerName}</strong></span>
                </div>
              )}

              <div className="role-selector">
                <div
                  className={`role-option ${role === 'individual' ? 'selected' : ''}`}
                  onClick={() => setRole('individual')}
                  id="role-individual"
                >
                  <div className="role-option-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div className="role-option-title">Individual</div>
                </div>

                <div
                  className={`role-option ${role === 'company' ? 'selected' : ''}`}
                  onClick={() => setRole('company')}
                  id="role-company"
                >
                  <div className="role-option-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/></svg>
                  </div>
                  <div className="role-option-title">Organization</div>
                </div>
              </div>

              <form onSubmit={handleRegister} className="auth-compact-fields">
                <div className="form-group">
                  <label className="form-label">{role === 'company' ? 'Organization Name' : 'Full Name'}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={role === 'company' ? 'e.g. Acme Corp' : 'John Doe'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {role === 'company' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Industry</label>
                      <select className="form-select" value={industry} onChange={(e) => setIndustry(e.target.value)} required>
                        <option value="">Select industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Registration Number (GSTIN/CIN)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">{role === 'company' ? 'HR Working Email' : 'Email Address'}</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <div className="form-error mb-4">{error}</div>}

                {role === 'individual' && (
                  <motion.button
                    type="button"
                    className={`btn btn-secondary btn-lg btn-full enroll-face-btn${faceVerified ? ' verified' : ''}`}
                    style={{
                      marginBottom: 12,
                      height: 40,
                      border: faceVerified ? '2px solid var(--color-success)' : undefined,
                      background: faceVerified ? 'var(--color-success-light)' : undefined,
                      color: faceVerified ? 'var(--color-success)' : undefined,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFaceEnroll}
                    disabled={faceVerified}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>
                    {faceVerified ? 'Identity Verified' : 'Verify Identity with Face Auth'}
                  </motion.button>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-full"
                  disabled={loading || (role === 'individual' && !faceVerified)}
                  style={{
                    opacity: (role === 'individual' && !faceVerified) ? 0.6 : 1,
                  }}
                >
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      {role === 'company' ? 'Verifying Organization...' : 'Creating Account...'}
                    </div>
                  ) : `Create ${role === 'company' ? 'Organization' : ''} Account`}
                </button>
              </form>

              <div className="auth-footer">
                Already have an account? <Link to="/login">Sign in</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}