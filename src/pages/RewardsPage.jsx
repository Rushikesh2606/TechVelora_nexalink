import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRewardsCatalog, redeemReward, getUserRedemptions, getWalletBalance } from '../services/rewardService';
import { getCoinTransactions } from '../services/referralService';
import RewardCatalog from '../components/rewards/RewardCatalog';

export default function RewardsPage() {
  const { currentUser, userProfile, fetchUserProfile } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState({ base: 0, promo: 0, total: 0 });
  const [activeTab, setActiveTab] = useState('catalog');
  const [loading, setLoading] = useState(true);
  const [redeemSuccess, setRedeemSuccess] = useState(null);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  async function loadData() {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [rewardsCatalog, userRedemptions, userTxs, walletData] = await Promise.all([
        getRewardsCatalog(),
        getUserRedemptions(currentUser.uid),
        getCoinTransactions(currentUser.uid),
        getWalletBalance(currentUser.uid)
      ]);
      setRewards(rewardsCatalog);
      setRedemptions(userRedemptions);
      setTransactions(userTxs);
      setWallet(walletData);
    } catch (err) {
      console.error('Error loading rewards:', err);
    }
    setLoading(false);
  }

  async function handleRedeem(rewardId) {
    try {
      const result = await redeemReward(currentUser.uid, rewardId);
      setRedeemSuccess(result);
      await fetchUserProfile(currentUser.uid);
      await loadData();
      setTimeout(() => setRedeemSuccess(null), 4000);
    } catch (err) {
      alert(err.message);
    }
  }

  const formatDate = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="page-full">
        <div className="empty-state">
          <div className="empty-state-icon" style={{ animation: 'pulse 1.5s infinite' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M20 12V8H4v4"/><path d="M2 12h20"/><path d="M7 12V3h10v9"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M12 12V7"/></svg>
          </div>
          <h3 className="empty-state-title">Loading rewards...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="page-full">
      <div className="rewards-page">
        {/* Success Toast */}
        {redeemSuccess && (
          <div className="redeem-toast slide-up" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Redeemed successfully! {redeemSuccess.status === 'pending_review' ? 'Pending admin review.' : 'Enjoy!'} 
            Balance: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: 'var(--color-warning)' }}><circle cx="12" cy="12" r="8"/><path d="M12 16V8"/><path d="M15 11l-3-3-3 3"/></svg> {redeemSuccess.newBalance}
          </div>
        )}

        {/* Wallet Hero */}
        <div className="wallet-hero slide-up">
          <div className="wallet-hero-left">
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><path d="M20 12V8H4v4"/><path d="M2 12h20"/><path d="M7 12V3h10v9"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M12 12V7"/></svg>
              Rewards Store
            </h1>
            <p className="text-muted" style={{ marginTop: 4, fontSize: 13 }}>Redeem your NexaCoins for amazing rewards</p>
          </div>
          <div className="wallet-hero-balance">
            <div className="wallet-balance-card">
              <div className="wallet-balance-label">Total Balance</div>
              <div className="wallet-balance-amount" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: 'var(--color-warning)' }}><circle cx="12" cy="12" r="8"/><path d="M12 16V8"/><path d="M15 11l-3-3-3 3"/></svg>
                {wallet.total.toLocaleString()}
              </div>
              {wallet.promo > 0 && (
                <div className="wallet-promo-info">
                  <span>Base: {wallet.base.toLocaleString()}</span>
                  <span className="wallet-promo-badge">Promo: {wallet.promo.toLocaleString()} (expires {wallet.promoExpiry})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="rewards-tabs slide-up" style={{ animationDelay: '0.1s' }}>
          <button
            className={`rewards-tab ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Catalog
          </button>
          <button
            className={`rewards-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            Redemptions ({redemptions.length})
          </button>
          <button
            className={`rewards-tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
            Transactions
          </button>
        </div>

        {/* Tab Content */}
        <div className="slide-up" style={{ animationDelay: '0.15s' }}>
          {activeTab === 'catalog' && (
            <RewardCatalog
              rewards={rewards}
              onRedeem={handleRedeem}
              userBalance={wallet.total}
            />
          )}

          {activeTab === 'history' && (
            <div className="card">
              <div className="card-body" style={{ padding: redemptions.length ? 0 : undefined }}>
                {redemptions.length === 0 ? (
                  <div className="empty-state" style={{ padding: 32 }}>
                    <div className="empty-state-icon" style={{ marginBottom: 16 }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                    </div>
                    <h3 className="empty-state-title">No redemptions yet</h3>
                    <p className="empty-state-text">Browse the catalog and redeem your first reward!</p>
                  </div>
                ) : (
                  <div className="redemption-list">
                    {redemptions.map(r => (
                      <div key={r.id} className="redemption-item">
                       <span className="redemption-icon">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H4v4"/><path d="M2 12h20"/><path d="M7 12V3h10v9"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M12 12V7"/></svg>
                       </span>
                        <div className="redemption-info">
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{r.rewardName}</div>
                          <div className="text-xs text-muted">{formatDate(r.redeemedAt)}</div>
                        </div>
                        <div className="redemption-cost" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          -{r.nexaCoinsSpent} <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: 'var(--color-warning)' }}><circle cx="12" cy="12" r="8"/><path d="M12 16V8"/><path d="M15 11l-3-3-3 3"/></svg>
                        </div>
                        <span className={`badge ${r.status === 'fulfilled' ? 'badge-success' : 'badge-warning'}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {r.status === 'fulfilled' ? (
                            <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Delivered</>
                          ) : (
                            <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Pending</>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="card">
              <div className="card-body" style={{ padding: transactions.length ? 0 : undefined }}>
                {transactions.length === 0 ? (
                  <div className="empty-state" style={{ padding: 32 }}>
                    <div className="empty-state-icon" style={{ marginBottom: 16 }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                    </div>
                    <h3 className="empty-state-title">No transactions yet</h3>
                    <p className="empty-state-text">Start earning by referring friends!</p>
                  </div>
                ) : (
                  <div className="transaction-list">
                    {transactions.slice(0, 30).map(tx => (
                      <div key={tx.id} className="transaction-item">
                        <span className={`transaction-type ${tx.type}`}>
                          {tx.type === 'earn' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="17" x2="7" y2="7"/><polyline points="7 17 7 7 17 7"/></svg>
                          )}
                        </span>
                        <div className="transaction-info">
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{tx.description}</div>
                          <div className="text-xs text-muted">{formatDate(tx.createdAt)}</div>
                        </div>
                        <div className={`transaction-amount ${tx.type}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {tx.type === 'earn' ? '+' : '-'}{tx.amount} <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: 'var(--color-warning)' }}><circle cx="12" cy="12" r="8"/><path d="M12 16V8"/><path d="M15 11l-3-3-3 3"/></svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
