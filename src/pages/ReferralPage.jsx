import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserReferralData, getUserReferrals, assignReferralCode, getTierLabel, buildReferralLink } from '../services/referralService';
import { getNextMilestone } from '../services/rewardService';
import ShareModal from '../components/referral/ShareModal';
import MilestoneTracker from '../components/rewards/MilestoneTracker';

export default function ReferralPage() {
  const { currentUser, userProfile, fetchUserProfile } = useAuth();
  const [referralData, setReferralData] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [showShare, setShowShare] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, [currentUser]);

  async function loadReferralData() {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Ensure user has a referral code
      if (!userProfile?.referralCode) {
        await assignReferralCode(currentUser.uid, userProfile?.name);
        await fetchUserProfile(currentUser.uid);
      }

      const data = await getUserReferralData(currentUser.uid);
      setReferralData(data);

      const refs = await getUserReferrals(currentUser.uid);
      setReferrals(refs);
    } catch (err) {
      console.error('Error loading referral data:', err);
    }
    setLoading(false);
  }

  const handleCopy = async () => {
    if (!referralData?.referralCode) return;
    try {
      await navigator.clipboard.writeText(buildReferralLink(referralData.referralCode));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="page-full">
        <div className="empty-state">
          <div className="empty-state-icon" style={{ animation: 'pulse 1.5s infinite' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </div>
          <h3 className="empty-state-title">Loading your referral hub...</h3>
        </div>
      </div>
    );
  }

  const code = referralData?.referralCode || userProfile?.referralCode || '---';
  const verified = referralData?.verifiedReferralCount || 0;
  const total = referralData?.referralCount || 0;
  const coins = referralData?.nexaCoins || 0;
  const tier = referralData?.referralTier || 'none';
  const nextMilestone = getNextMilestone(verified);

  return (
    <div className="page-full">
      <div className="referral-page">
        {/* Hero Section */}
        <div className="referral-hero slide-up">
          <div className="referral-hero-content">
            <h1 className="referral-hero-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              Your Referral Hub
            </h1>
            <p className="referral-hero-subtitle">
              Invite professionals, grow the network, and earn NexaCoins for every verified signup!
            </p>
          </div>
          <div className="referral-hero-stats">
            <div className="referral-stat-card">
              <div className="referral-stat-value">{total}</div>
              <div className="referral-stat-label">Invited</div>
            </div>
            <div className="referral-stat-card referral-stat-highlight">
              <div className="referral-stat-value">{verified}</div>
              <div className="referral-stat-label">Verified</div>
            </div>
            <div className="referral-stat-card">
              <div className="referral-stat-value">{getTierLabel(tier).split(' ')[0]}</div>
              <div className="referral-stat-label">{getTierLabel(tier).split(' ')[1] || 'Tier'}</div>
            </div>
            <div className="referral-stat-card">
              <div className="referral-stat-value" style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: 'var(--color-warning)' }}><circle cx="12" cy="12" r="8"/><path d="M12 16V8"/><path d="M15 11l-3-3-3 3"/></svg>
                {coins.toLocaleString()}
              </div>
              <div className="referral-stat-label">NexaCoins</div>
            </div>
          </div>
        </div>

        {/* Referral Code Card */}
        <div className="card slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              Your Referral Code
            </span>
            <span className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              +50 <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: 'var(--color-warning)' }}><circle cx="12" cy="12" r="8"/><path d="M12 16V8"/><path d="M15 11l-3-3-3 3"/></svg> per verified referral
            </span>
          </div>
          <div className="card-body">
            <div className="referral-code-big">
              <span className="referral-code-big-value">{code}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                className={`btn ${copied ? 'btn-success' : 'btn-outline'} flex-1`}
                onClick={handleCopy}
                style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
              >
                {copied ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>}
                {copied ? 'Link Copied!' : 'Copy Link'}
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={() => setShowShare(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                Share Code
              </button>
            </div>
          </div>
        </div>

        {/* Milestone Tracker */}
        <div className="card slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="card-body">
            <MilestoneTracker verifiedReferrals={verified} />
          </div>
        </div>

        {/* How It Works */}
        <div className="card slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="card-header" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            How It Works
          </div>
          <div className="card-body">
            <div className="referral-steps">
              <div className="referral-step">
                <div className="referral-step-num">1</div>
                <div>
                  <strong>Share Your Code</strong>
                  <p className="text-xs text-muted">Send your referral link via WhatsApp, LinkedIn, or any channel</p>
                </div>
              </div>
              <div className="referral-step">
                <div className="referral-step-num">2</div>
                <div>
                  <strong>Friend Joins & Verifies</strong>
                  <p className="text-xs text-muted">They sign up, verify email, and complete their profile</p>
                </div>
              </div>
              <div className="referral-step">
                <div className="referral-step-num">3</div>
                <div>
                  <strong>You Earn 50 NexaCoins</strong>
                  <p className="text-xs text-muted">NexaCoins are credited instantly + milestone bonuses</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="card slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="card-header" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>
            Recent Referrals ({referrals.length})
          </div>
          <div className="card-body" style={{ padding: referrals.length ? 0 : undefined }}>
            {referrals.length === 0 ? (
              <div className="empty-state" style={{ padding: 24 }}>
                <div className="empty-state-icon" style={{ marginBottom: 16 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <h3 className="empty-state-title" style={{ fontSize: 14 }}>No referrals yet</h3>
                <p className="empty-state-text">Share your code to start earning!</p>
              </div>
            ) : (
              <div className="referral-list">
                {referrals.slice(0, 10).map(r => (
                  <div key={r.id} className="referral-list-item">
                    <div className="referral-list-avatar">
                      {r.referredUserAvatar ? (
                        <img src={r.referredUserAvatar} alt="" />
                      ) : (
                        <div className="referral-list-avatar-fallback">
                          {(r.referredUserName || 'U')[0]}
                        </div>
                      )}
                    </div>
                    <div className="referral-list-info">
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{r.referredUserName}</div>
                      <div className="text-xs text-muted">{formatTimeAgo(r.signupAt)}</div>
                    </div>
                    <div className="referral-list-status">
                      {r.status === 'verified' ? (
                        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Verified
                        </span>
                      ) : r.flagged ? (
                        <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          Review
                        </span>
                      ) : (
                        <span className="badge badge-outline" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="referral-list-coins" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {r.status === 'verified' ? (
                        <>
                          +50 <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: 'var(--color-warning)' }}><circle cx="12" cy="12" r="8"/><path d="M12 16V8"/><path d="M15 11l-3-3-3 3"/></svg>
                        </>
                      ) : '---'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showShare && (
        <ShareModal
          referralCode={code}
          userName={userProfile?.name}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
