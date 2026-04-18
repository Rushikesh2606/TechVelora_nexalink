import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { uploadGovernmentId, getUserVerificationDocs, recalculateTrustScore } from '../services/trustService';
import TrustScoreWidget from '../components/trust/TrustScoreWidget';

export default function VerificationPage() {
  const { currentUser, userProfile, fetchUserProfile } = useAuth();

  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('aadhaar');
  const [file, setFile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadDocs();
      recalculateTrustScore(currentUser.uid).then(() => {
        fetchUserProfile && fetchUserProfile(currentUser.uid);
      });
    }
  }, [currentUser]);

  async function loadDocs() {
    try {
      const data = await getUserVerificationDocs(currentUser.uid);
      setDocs(data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      await uploadGovernmentId(currentUser.uid, file, docType);

      // ✅ FIXED MESSAGE
      setMessage('⏳ Document uploaded. Waiting for admin verification.');

      setFile(null);
      await loadDocs();

      fetchUserProfile && await fetchUserProfile(currentUser.uid);

      setTimeout(() => setShowUpload(false), 2000);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }

    setUploading(false);
  };

  // 🔥 Status Logic
  const getGovStatus = () => {
    if (!docs.length) return 'none';

    const latest = docs[0];

    return latest.status; // pending / verified / rejected
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="badge badge-verified">Verified ✅</span>;
      case 'pending':
        return <span className="badge badge-new">Pending ⏳</span>;
      case 'rejected':
        return <span className="badge badge-danger">Rejected ❌</span>;
      default:
        return null;
    }
  };

  return (
    <div className="page-full" style={{ maxWidth: 800, margin: '0 auto' }}>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>🛡️ Trust & Verification</h1>
        <p className="text-secondary mb-4">
          Complete your profile and verify your identity to increase trust score.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>

        {/* LEFT SIDE */}
        <div>

          {/* 🔐 GOV VERIFICATION */}
          <h3 className="mb-2">Identity Verification</h3>

          {!showUpload ? (
            <motion.div
              className="card"
              whileHover={{ scale: 1.01 }}
              onClick={() => setShowUpload(true)}
              style={{
                padding: 24,
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>Government ID</div>
                  <div style={{ fontSize: 13 }}>Aadhaar / PAN / DL (+50 pts)</div>
                </div>

                {getStatusBadge(getGovStatus())}
              </div>
            </motion.div>
          ) : (
            <motion.div className="card card-body">

              <div className="flex justify-between mb-3">
                <h3>Upload Document</h3>
                <button onClick={() => setShowUpload(false)}>Cancel</button>
              </div>

              <form onSubmit={handleUpload}>

                {/* DOC TYPE */}
                <div className="flex gap-2 mb-3">
                  {['aadhaar', 'pan', 'dl'].map(type => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setDocType(type)}
                      className={docType === type ? 'btn btn-primary' : 'btn'}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* FILE INPUT */}
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                />

                {/* MESSAGE */}
                {message && <p style={{ marginTop: 10 }}>{message}</p>}

                <button
                  className="btn btn-primary mt-2"
                  disabled={uploading || !file}
                >
                  {uploading ? "Uploading..." : "Upload Document"}
                </button>
              </form>
            </motion.div>
          )}

          {/* 📄 DOCUMENT LIST */}
          <div style={{ marginTop: 20 }}>
            <h4>Your Documents</h4>

            {docs.length === 0 ? (
              <p>No documents uploaded</p>
            ) : (
              docs.map((doc, index) => (
                <div key={index} className="card" style={{ padding: 12, marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{doc.docType}</strong>
                      <div style={{ fontSize: 12 }}>{doc.status}</div>
                    </div>

                    {getStatusBadge(doc.status)}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div>
          <TrustScoreWidget
            score={userProfile?.trustScore || 0}
            badge={userProfile?.trustBadge || 'NEW'}
          />
        </div>

      </div>
    </div>
  );
}