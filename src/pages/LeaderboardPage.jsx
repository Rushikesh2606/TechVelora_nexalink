import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getLeaderboard, getUserReferralData, getTierLabel } from '../services/referralService';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';

export default function LeaderboardPage() {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState([]);
  const [myData, setMyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [currentUser]);

  async function loadLeaderboard() {
    setLoading(true);
    try {
      const [leaderboard, myRef] = await Promise.all([
        getLeaderboard(50),
        currentUser ? getUserReferralData(currentUser.uid) : null
      ]);
      setEntries(leaderboard);
      setMyData(myRef);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="page-full">
        <div className="empty-state">
          <div className="empty-state-icon" style={{ animation: 'pulse 1.5s infinite' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <h3 className="empty-state-title">Loading leaderboard...</h3>
        </div>
      </div>
    );
  }

  // Find current user's rank
  const myRank = entries.findIndex(e => e.uid === currentUser?.uid) + 1;

  return (
    <div className="page-full">
      <div className="leaderboard-page">
        {/* Hero */}
        <div className="leaderboard-hero slide-up">
          <div className="leaderboard-hero-content">
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-warning)' }}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5c2 0 3 2 3 2"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5c-2 0-3 2-3 2"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              Referral Leaderboard
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 4, fontSize: 14 }}>
              Top referrers compete for flagship smartphone prizes!
            </p>
          </div>
          <div className="leaderboard-hero-prizes">
            <div className="prize-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#FFD700' }}><circle cx="12" cy="8" r="7"/><path d="M12 11h.01"/><path d="M7 22l5-3 5 3v-7a9 9 0 0 0-10 0z"/></svg> iPhone / Galaxy</div>
            <div className="prize-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#C0C0C0' }}><circle cx="12" cy="8" r="7"/><path d="M12 11h.01"/><path d="M7 22l5-3 5 3v-7a9 9 0 0 0-10 0z"/></svg> iPhone / Galaxy</div>
            <div className="prize-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#CD7F32' }}><circle cx="12" cy="8" r="7"/><path d="M12 11h.01"/><path d="M7 22l5-3 5 3v-7a9 9 0 0 0-10 0z"/></svg> iPhone / Galaxy</div>
          </div>
        </div>

        {/* My Position Card */}
        {myData && (
          <div className="card slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="card-body">
              <div className="my-leaderboard-position">
                <div className="my-lb-rank">
                  <span className="my-lb-rank-label">Your Rank</span>
                  <span className="my-lb-rank-value">{myRank > 0 ? `#${myRank}` : 'Unranked'}</span>
                </div>
                <div className="my-lb-stat">
                  <span className="my-lb-stat-value">{myData.verifiedReferralCount || 0}</span>
                  <span className="my-lb-stat-label">Verified Referrals</span>
                </div>
                <div className="my-lb-stat">
                  <span className="my-lb-stat-value">{getTierLabel(myData.referralTier || 'none')}</span>
                  <span className="my-lb-stat-label">Current Tier</span>
                </div>
                <Link to="/referral" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg> Share & Climb
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="card slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="card-body" style={{ padding: 0 }}>
            <LeaderboardTable
              entries={entries}
              currentUserId={currentUser?.uid}
            />
          </div>
        </div>

        {/* Prize Info */}
        <div className="card slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="card-header" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            Mega Gift Prizes
          </div>
          <div className="card-body">
            <div className="prize-info-grid">
              <div className="prize-info-card">
                <div className="prize-info-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5c2 0 3 2 3 2"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5c-2 0-3 2-3 2"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></div>
                <h4>First to 1,000</h4>
                <p className="text-xs text-muted">The first three users to reach 1,000 verified referrals win a latest flagship smartphone each</p>
              </div>
              <div className="prize-info-card">
                <div className="prize-info-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                <h4>Verified Only</h4>
                <p className="text-xs text-muted">Only email-verified users with complete profiles count toward your referral total</p>
              </div>
              <div className="prize-info-card">
                <div className="prize-info-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <h4>Fraud Protected</h4>
                <p className="text-xs text-muted">All mega prize referrals undergo admin review to ensure authentic signups</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
