import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../shared/Avatar';
import TrustBadge from '../shared/TrustBadge';
import TrustScoreWidget from '../trust/TrustScoreWidget';
import ReferralCard from '../referral/ReferralCard';

export default function Sidebar() {
  const { userProfile } = useAuth();

  if (!userProfile) return null;

  const isCompany = userProfile.role === 'company';

  return (
    <aside className="app-sidebar">
      {/* Mini Profile Card */}
      <div className="card mb-4 slide-up">
        <div style={{
          height: 60,
          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
        }} />
        <div className="card-body" style={{ textAlign: 'center', marginTop: -30 }}>
          <Avatar 
            src={isCompany ? userProfile.logoUrl : userProfile.avatarUrl}
            name={userProfile.name}
            size="lg"
            className=""
          />
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginTop: 8 }}>{userProfile.name}</h3>
          <p className="text-xs text-muted" style={{ marginTop: 2 }}>
            {isCompany ? userProfile.industry : userProfile.headline || 'Professional'}
          </p>
          <div style={{ marginTop: 8 }}>
            <TrustBadge badge={userProfile.trustBadge || 'NEW'} />
          </div>

          <div className="flex justify-between" style={{ marginTop: 16, padding: '0 8px' }}>
            <div className="text-center">
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{userProfile.connectionsCount || 0}</div>
              <div className="text-xs text-muted">Connections</div>
            </div>
            <div style={{ width: 1, background: 'var(--color-border)' }} />
            <div className="text-center">
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{userProfile.postsCount || 0}</div>
              <div className="text-xs text-muted">Posts</div>
            </div>
            {isCompany && (
              <>
                <div style={{ width: 1, background: 'var(--color-border)' }} />
                <div className="text-center">
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{userProfile.jobsCount || 0}</div>
                  <div className="text-xs text-muted">Jobs</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Trust Score Widget */}
      <div className="card mb-4 slide-up" style={{ animationDelay: '0.1s' }}>
        <TrustScoreWidget score={userProfile.trustScore || 0} badge={userProfile.trustBadge || 'NEW'} />
      </div>

      {/* Referral Quick Card */}
      <div className="slide-up mb-4" style={{ animationDelay: '0.15s' }}>
        <ReferralCard />
      </div>

      {/* Quick Links */}
      <div className="card slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="card-header" style={{ fontSize: '13px', fontWeight: 600 }}>
          Quick Links
        </div>
        <div style={{ padding: '4px' }}>
          <Link to="/profile" className="dropdown-item" id="sidebar-profile" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            My Profile
          </Link>
          <Link to="/jobs" className="dropdown-item" id="sidebar-jobs" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            Browse Jobs
          </Link>
          <Link to="/events" className="dropdown-item" id="sidebar-events" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            Upcoming Events
          </Link>
          <Link to="/network" className="dropdown-item" id="sidebar-network" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            My Network
          </Link>
          <Link to="/referral" className="dropdown-item" id="sidebar-referral" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Referral Hub
          </Link>
          <Link to="/rewards" className="dropdown-item" id="sidebar-rewards" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
            Rewards Store
          </Link>
          <Link to="/leaderboard" className="dropdown-item" id="sidebar-leaderboard" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5c2 0 3 2 3 2"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5c-2 0-3 2-3 2"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            Leaderboard
          </Link>
          {isCompany && (
            <Link to="/jobs?create=true" className="dropdown-item" id="sidebar-post-job" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Post a Job
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
