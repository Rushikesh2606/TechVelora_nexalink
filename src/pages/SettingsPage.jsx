import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { userProfile, currentUser } = useAuth();

  return (
    <div className="page-full" style={{ maxWidth: 700, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings
        </h1>
        <p className="text-sm text-secondary mb-6">Manage your account preferences</p>
      </motion.div>

      {/* Account Info */}
      <motion.div className="card card-body mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 16 }}>Account Information</h3>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" value={currentUser?.email || ''} disabled style={{ opacity: 0.7 }} />
        </div>
        <div className="form-group">
          <label className="form-label">Account Type</label>
          <input className="form-input" value={userProfile?.role === 'company' ? 'Company' : 'Individual'} disabled style={{ opacity: 0.7 }} />
        </div>
        <div className="form-group">
          <label className="form-label">Member Since</label>
          <input 
            className="form-input" 
            value={userProfile?.createdAt?.toDate ? userProfile.createdAt.toDate().toLocaleDateString() : 'N/A'} 
            disabled 
            style={{ opacity: 0.7 }} 
          />
        </div>
      </motion.div>

      {/* Privacy */}
      <motion.div className="card card-body mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 16 }}>Privacy & Security</h3>
        <div className="flex justify-between items-center mb-3" style={{ padding: '8px 0' }}>
          <div>
            <div className="text-sm font-semibold">Profile Visibility</div>
            <div className="text-xs text-muted">Control who can see your profile</div>
          </div>
          <select className="form-select" style={{ width: 140 }}>
            <option>Everyone</option>
            <option>Connections</option>
            <option>Private</option>
          </select>
        </div>
        <div className="flex justify-between items-center mb-3" style={{ padding: '8px 0', borderTop: '1px solid var(--color-border-light)' }}>
          <div>
            <div className="text-sm font-semibold">Email Notifications</div>
            <div className="text-xs text-muted">Receive email updates</div>
          </div>
          <select className="form-select" style={{ width: 140 }}>
            <option>All</option>
            <option>Important</option>
            <option>None</option>
          </select>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div className="card card-body" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ borderColor: 'var(--color-danger-light)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 8, color: 'var(--color-danger)' }}>Danger Zone</h3>
        <p className="text-sm text-muted mb-4">These actions are irreversible.</p>
        <button className="btn btn-danger">Delete Account</button>
      </motion.div>
    </div>
  );
}
