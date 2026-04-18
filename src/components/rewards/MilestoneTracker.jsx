import React from 'react';
import { getNextMilestone, getMilestones } from '../../services/rewardService';

export default function MilestoneTracker({ verifiedReferrals = 0 }) {
  const next = getNextMilestone(verifiedReferrals);
  const allMilestones = getMilestones();

  return (
    <div className="milestone-tracker">
      <div className="milestone-header">
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          Milestone Progress
        </h3>
        {next.completed ? (
          <span className="badge badge-success" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            All Complete! <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5c2 0 3 2 3 2"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5c-2 0-3 2-3 2"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          </span>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            Next: {next.threshold} referrals
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {!next.completed && (
        <div className="milestone-progress-section">
          <div className="milestone-progress-bar">
            <div
              className="milestone-progress-fill"
              style={{ width: `${next.progress}%` }}
            />
          </div>
          <div className="milestone-progress-label">
            <span>{verifiedReferrals} / {next.threshold}</span>
            <span>{Math.round(next.progress)}%</span>
          </div>
          <div className="milestone-reward-preview" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><path d="M20 12V8H4v4"/><path d="M2 12h20"/><path d="M7 12V3h10v9"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M12 12V7"/></svg>
            {next.reward}
          </div>
        </div>
      )}

      {/* Milestone List */}
      <div className="milestone-list">
        {allMilestones.map((m, idx) => {
          const achieved = verifiedReferrals >= m.threshold;
          const isCurrent = !achieved && (idx === 0 || verifiedReferrals >= allMilestones[idx - 1].threshold);

          return (
            <div
              key={m.threshold}
              className={`milestone-item ${achieved ? 'achieved' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="milestone-item-marker">
                {achieved ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-success)' }}><polyline points="20 6 9 17 4 12"/></svg>
                ) : isCurrent ? (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} />
                ) : (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid var(--color-border)' }} />
                )}
              </div>
              <div className="milestone-item-info">
                <div className="milestone-item-threshold">{m.threshold} verified referrals</div>
                <div className="milestone-item-reward">{m.reward}</div>
              </div>
              {achieved && (
                <span className="badge badge-success" style={{ fontSize: 10, marginLeft: 'auto' }}>Claimed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
