import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { uploadGovernmentId, recalculateTrustScore, verifyEmailOTP, sendEmailOTP } from '../services/trustService';
import TrustScoreWidget from '../components/trust/TrustScoreWidget';

export default function VerificationPage() {
  const { currentUser, userProfile, fetchUserProfile } = useAuth();
  
  const [activeUpload, setActiveUpload] = useState(null); // 'gov', 'email', or null
  
  // Gov upload states
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('aadhaar');
  const [uploadingGov, setUploadingGov] = useState(false);
  
  // Email states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  const [message, setMessage] = useState('');

  // Initialization: recalculate triggers auto-verifications if data is missing
  useEffect(() => {
    if (currentUser) {
      recalculateTrustScore(currentUser.uid).then(() => {
        if (fetchUserProfile) fetchUserProfile(currentUser.uid);
      });
    }
  }, [currentUser]);

  const breakdown = userProfile?.trustBreakdown || {
    email: false, profile: false, education: false, skills: false, gov: false
  };

  const points = userProfile?.verificationPoints || {
    email: 10, profile: 10, education: 15, skills: 15, gov: 50
  };

  const handleGovUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploadingGov(true);
    setMessage('');
    try {
      await uploadGovernmentId(currentUser.uid, file, docType);
      setMessage(
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Document verified automatically!
        </span>
      );
      setFile(null);
      if (fetchUserProfile) await fetchUserProfile(currentUser.uid);
      setTimeout(() => { setActiveUpload(null); setMessage(''); }, 2000);
    } catch (err) {
      setMessage(
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          Error: {err.message}
        </span>
      );
    }
    setUploadingGov(false);
  };

  const [cooldown, setCooldown] = useState(0);

  const handleSendEmailOtp = async () => {
    try {
      setVerifyingEmail(true);
      setMessage('');
      
      const email = currentUser?.email || userProfile?.email;
      if (!email) throw new Error("No email found on your profile.");

      await sendEmailOTP(currentUser.uid, email);
      
      setOtpSent(true);
      setMessage(
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          6-Digit code sent securely to {email.substring(0, 2)}****@{email.split('@')[1]}
        </span>
      );
      
      // Start 60-second cooldown
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown(c => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);

    } catch (err) {
      setMessage(
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          Error details: {err.message}
        </span>
      );
    }
    setVerifyingEmail(false);
  };

  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    setVerifyingEmail(true);
    setMessage('');
    try {
      await verifyEmailOTP(currentUser.uid, otp);
      setMessage(
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Email Verified Successfully!
        </span>
      );
      if (fetchUserProfile) await fetchUserProfile(currentUser.uid);
      setTimeout(() => { setActiveUpload(null); setOtpSent(false); setMessage(''); }, 2000);
    } catch (err) {
      setMessage(
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          Error: {err.message}
        </span>
      );
    }
    setVerifyingEmail(false);
  };

  const handleActionClick = (key) => {
    setMessage('');
    if (key === 'email') {
      setActiveUpload(activeUpload === 'email' ? null : 'email');
    } else if (key === 'gov') {
      setActiveUpload(activeUpload === 'gov' ? null : 'gov');
    } else {
      // Profile, Education, Skills are read-only (based on user profile)
      setMessage(
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          Please complete this section in your Profile page to auto-verify.
        </span>
      );
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const ChecklistItem = ({ id, title, pointValue, isVerified, onClick }) => (
    <motion.div 
      className="card mb-3" 
      whileHover={{ scale: 1.01 }}
      onClick={() => onClick(id)}
      style={{ 
        padding: '20px 24px', 
        cursor: 'pointer',
        borderLeft: isVerified ? '4px solid var(--color-success)' : '4px solid transparent',
        background: 'var(--color-surface)'
      }}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-lg">{title}</div>
          <div className="text-secondary text-sm">+{pointValue} Trust Points</div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`badge ${isVerified ? 'badge-verified' : 'badge-new'}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isVerified ? (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Verified</>
            ) : (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Pending</>
            )}
          </span>
          <span className="text-secondary" style={{ fontSize: '20px' }}>→</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="page-full" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> 
          Get Verified
        </h1>
        <p className="text-secondary">Verify your identity and background to reach HIGH TRUST status.</p>
        {message && (
          <div className="mt-4 p-3 rounded" style={{ background: (typeof message === 'string' && message.includes('Error')) || (React.isValidElement(message) && JSON.stringify(message).includes('circle')) ? 'var(--color-danger-light)' : 'var(--color-success-light)' }}>
            {message}
          </div>
        )}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
        
        {/* Left Panel: Checklist */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="section-title mb-4">Verification Checklist</h3>

          <ChecklistItem 
            id="email" title="Email Verification" 
            pointValue={points.email} isVerified={breakdown.email} 
            onClick={handleActionClick} 
          />

          <AnimatePresence>
            {activeUpload === 'email' && !breakdown.email && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="card card-body mb-4"
              >
                {!otpSent ? (
                  <div className="text-center p-4">
                    <p className="mb-4">Verify your email address to strengthen your account.</p>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleSendEmailOtp}
                      disabled={cooldown > 0 || verifyingEmail}
                    >
                      {verifyingEmail ? "Generating..." : cooldown > 0 ? `Resend down in ${cooldown}s` : "Send OTP Code"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyEmailOtp} className="p-2">
                    <label className="form-label">Enter 6-Digit OTP</label>
                    <input 
                      type="text" 
                      className="form-input mb-4" 
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                    />
                    <div className="flex gap-2">
                      <button className="btn btn-secondary flex-1" onClick={() => setOtpSent(false)} type="button">Cancel</button>
                      <button className="btn btn-primary flex-1" disabled={verifyingEmail || otp.length !== 6}>
                        {verifyingEmail ? 'Verifying...' : 'Verify Email'}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <ChecklistItem 
            id="profile" title="Profile Details" 
            pointValue={points.profile} isVerified={breakdown.profile} 
            onClick={handleActionClick} 
          />
          <ChecklistItem 
            id="education" title="Education Details" 
            pointValue={points.education} isVerified={breakdown.education} 
            onClick={handleActionClick} 
          />
          <ChecklistItem 
            id="skills" title="Skills & Endorsements" 
            pointValue={points.skills} isVerified={breakdown.skills} 
            onClick={handleActionClick} 
          />

          <div className="my-6"></div>

          <ChecklistItem 
            id="gov" title="Government ID" 
            pointValue={points.gov} isVerified={breakdown.gov} 
            onClick={handleActionClick} 
          />

          <AnimatePresence>
            {activeUpload === 'gov' && !breakdown.gov && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="card card-body mb-4"
                style={{ overflow: 'hidden' }}
              >
                <form onSubmit={handleGovUpload}>
                  <div className="flex gap-2 mb-4">
                    {['aadhaar', 'pan', 'dl'].map(type => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setDocType(type)}
                        className={`flex-1 ${docType === type ? 'btn-primary' : 'btn-secondary'} rounded py-2 text-sm font-semibold uppercase`}
                        style={{ border: '1px solid var(--color-border)' }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="form-group">
                    <input type="file" className="form-input" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files[0])} />
                    <small className="text-secondary">Upload a clear photo or PDF (Max 5MB)</small>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button className="btn btn-secondary flex-1" onClick={() => setActiveUpload(null)} type="button">Cancel</button>
                    <button className="btn btn-primary flex-1" disabled={uploadingGov || !file}>
                      {uploadingGov ? "Uploading..." : "Upload & Verify"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>

        {/* Right Panel: Trust Score */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ position: 'sticky', top: '24px' }}>
            <TrustScoreWidget 
              score={userProfile?.trustScore || 0} 
              badge={userProfile?.trustBadge || 'NEW'} 
            />
          </div>
        </motion.div>

      </div>
    </div>
  );
}
