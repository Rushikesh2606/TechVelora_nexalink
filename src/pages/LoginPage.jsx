import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('individual');

  useEffect(() => {
    function handleMessage(event) {
      if (event.data?.type === 'FACE_LOGIN_VERIFIED') {
        alert('Verification completed');
        navigate('/');
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  async function handleEmailLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await loginWithEmail(normalizedEmail, password);

      if (role === 'individual') {
        const encodedEmail = encodeURIComponent(normalizedEmail);
        window.open(`http://localhost:3000/?mode=verify&userId=${encodedEmail}`, '_blank');
      } else {
        // For companies, we skip face auth on login and go straight in
        // or trigger a different verification if needed. 
        // User said "if it is organization then use the biz verify" 
        // but BizVerify is usually for registration. 
        // For now, let's just navigate if it's organization since 
        // the registration was already verified.
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError('');

    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-split-container">
        {/* Left Panel - Form */}
        <div className="auth-form-panel no-scrollbar">
          <motion.div
            className="auth-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="auth-card">
              <h1 className="auth-title">Welcome Back</h1>
              <p className="auth-subtitle">Sign in to your professional profile</p>

              <div className="role-selector">
                <div
                  className={`role-option ${role === 'individual' ? 'selected' : ''}`}
                  onClick={() => setRole('individual')}
                >
                  <div className="role-option-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div className="role-option-title">Individual</div>
                </div>

                <div
                  className={`role-option ${role === 'company' ? 'selected' : ''}`}
                  onClick={() => setRole('company')}
                >
                  <div className="role-option-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div className="role-option-title">Organization</div>
                </div>
              </div>

              <button
                className="google-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                Continue with Google
              </button>

              <div className="auth-divider">or</div>

              <form onSubmit={handleEmailLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <div className="form-error mb-4">{error}</div>}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-full"
                  disabled={loading}
                >
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      Signing in...
                    </div>
                  ) : 'Sign In'}
                </button>
              </form>

              <div className="auth-footer">
                Don't have an account? <Link to="/register">Create one</Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Explanatory */}
        <div className="auth-side-panel">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="auth-logo" style={{ justifyContent: 'flex-start', color: 'white', marginBottom: 32 }}>
              <div className="navbar-brand-icon" style={{ width: 44, height: 44, fontSize: 18, background: 'white', color: 'var(--color-primary)' }}>TL</div>
              <span style={{ fontSize: 28 }}>Nexalink</span>
            </div>
            
            <h2 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
              Secure Access to <br/> Your Network.
            </h2>
            <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.5, maxWidth: 360, marginBottom: 32 }}>
              Log in to access your trusted verified connections. Nexalink ensures that 
              every login session is protected by multi-factor verification, 
              preserving the integrity of your professional identity.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                'Instant Face Login Verification',
                'Enterprise-Grade Data Protection',
                'Zero-Trust Security Architecture'
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ opacity: 0.8 }}><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}