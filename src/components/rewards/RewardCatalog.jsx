import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function RewardCatalog({ rewards = [], onRedeem, userBalance = 0 }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [redeeming, setRedeeming] = useState(null);

  const filters = [
    { key: 'all', label: 'All', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, color: '#22c55e' },
    { key: 'quick_win', label: 'Quick Wins', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>, color: '#3b82f6' },
    { key: 'premium', label: 'Premium', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l3 12 3-12-3-6z"/><path d="M2 9h20"/></svg>, color: '#a855f7' },
    { key: 'physical', label: 'Physical', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H4v4"/><path d="M2 12h20"/><path d="M7 12V3h10v9"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M12 12V7"/></svg>, color: '#f59e0b' },
    { key: 'mega', label: 'Mega', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5c2 0 3 2 3 2"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5c-2 0-3 2-3 2"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>, color: '#ef4444' },
  ];

  const filteredRewards = activeFilter === 'all'
    ? rewards
    : rewards.filter(r => r.category === activeFilter);

  const handleRedeem = async (reward) => {
    if (userBalance < reward.nexaCoinsCost) return;
    setRedeeming(reward.id);
    try {
      await onRedeem(reward.id);
    } catch { /* handled in parent */ }
    setRedeeming(null);
  };

  return (
    <div className="reward-catalog">
      {/* Filter Tabs */}
      <div className="reward-filters">
        {filters.map(f => (
          <button
            key={f.key}
            className={`reward-filter-btn ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="reward-grid">
        {filteredRewards.map(reward => {
          const canAfford = userBalance >= reward.nexaCoinsCost;
          const outOfStock = reward.stock === 0;
          const isRedeeming = redeeming === reward.id;

          return (
            <div key={reward.id} className={`reward-card ${!canAfford ? 'locked' : ''} ${outOfStock ? 'sold-out' : ''}`}>
              <div className="reward-card-icon">{reward.icon}</div>
              <h4 className="reward-card-name">{reward.name}</h4>
              <p className="reward-card-desc">{reward.description}</p>
              <div className="reward-card-cost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: 'var(--color-warning)' }}><circle cx="12" cy="12" r="8"/><path d="M12 16V8"/><path d="M15 11l-3-3-3 3"/></svg>
                <span>{reward.nexaCoinsCost.toLocaleString()}</span>
              </div>
              {reward.stock > 0 && reward.stock < 20 && (
                <div className="reward-card-stock">Only {reward.stock} left</div>
              )}
              <button
                className={`btn btn-sm btn-full ${canAfford && !outOfStock ? 'btn-primary' : 'btn-disabled'}`}
                onClick={() => handleRedeem(reward)}
                disabled={!canAfford || outOfStock || isRedeeming}
                style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
              >
                {isRedeeming ? (
                  <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Redeeming...</>
                ) : outOfStock ? 'Sold Out' : canAfford ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Redeem</>
                ) : `Need ${(reward.nexaCoinsCost - userBalance).toLocaleString()} more`}
              </button>
            </div>
          );
        })}
      </div>

      {filteredRewards.length === 0 && (
        <div className="empty-state" style={{ padding: 40 }}>
          <div className="empty-state-icon" style={{ marginBottom: 16 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M20 12V8H4v4"/><path d="M2 12h20"/><path d="M7 12V3h10v9"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M12 12V7"/></svg>
          </div>
          <h3 className="empty-state-title">No rewards in this category</h3>
          <p className="empty-state-text">Check back soon for new rewards!</p>
        </div>
      )}
    </div>
  );
}
