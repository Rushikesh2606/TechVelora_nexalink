import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import ConnectionCard from '../components/connections/ConnectionCard';
import EmptyState from '../components/shared/EmptyState';
import { getAllUsers, getConnections, getPendingRequests, sendConnectionRequest, acceptConnection, rejectConnection } from '../services/realtimeService';

const DEMO_PEOPLE = [
  { uid: 'p1', name: 'Sarah Chen', headline: 'Senior Software Engineer at Google', trustBadge: 'HIGH_TRUST', avatarUrl: '', skills: ['Python', 'Go', 'Kubernetes'] },
  { uid: 'p2', name: 'Marcus Johnson', headline: 'Product Manager | Ex-Microsoft', trustBadge: 'VERIFIED', avatarUrl: '', skills: ['Product Strategy', 'Agile', 'Data Analysis'] },
  { uid: 'p3', name: 'Priya Sharma', headline: 'Full Stack Developer | Open Source', trustBadge: 'TRUSTED', avatarUrl: '', skills: ['React', 'Node.js', 'TypeScript'] },
  { uid: 'p4', name: 'Alex Rivera', headline: 'CTO at InnovateLabs', trustBadge: 'HIGH_TRUST', avatarUrl: '', skills: ['Architecture', 'Leadership', 'Cloud'] },
  { uid: 'p5', name: 'Emily Zhang', headline: 'AI Research at DeepMind', trustBadge: 'HIGH_TRUST', avatarUrl: '', skills: ['Machine Learning', 'Python', 'Research'] },
  { uid: 'p6', name: 'David Kim', headline: 'VP Engineering at Stripe', trustBadge: 'TRUSTED', avatarUrl: '', skills: ['Engineering Management', 'Payments', 'Scale'] },
  { uid: 'p7', name: 'Lisa Patel', headline: 'Design Lead at Figma', trustBadge: 'VERIFIED', avatarUrl: '', skills: ['UI/UX', 'Design Systems', 'Figma'] },
  { uid: 'p8', name: 'James Wilson', headline: 'Data Scientist at Netflix', trustBadge: 'TRUSTED', avatarUrl: '', skills: ['ML', 'Statistics', 'Recommendation Systems'] },
];

const DEMO_REQUESTS = [
  { connectionId: 'req1', fromUserId: 'p1', toUserId: 'me', status: 'pending', user: { uid: 'p1', name: 'Sarah Chen', headline: 'Senior Software Engineer at Google', trustBadge: 'HIGH_TRUST' } },
  { connectionId: 'req2', fromUserId: 'p4', toUserId: 'me', status: 'pending', user: { uid: 'p4', name: 'Alex Rivera', headline: 'CTO at InnovateLabs', trustBadge: 'HIGH_TRUST' } },
];

export default function NetworkPage() {
  const { currentUser, fetchUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('discover');
  const [people, setPeople] = useState(DEMO_PEOPLE);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(DEMO_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequests, setSentRequests] = useState(new Set());

  useEffect(() => {
    async function loadData() {
      try {
        const users = await getAllUsers();
        if (currentUser) {
          if (users.length > 0) {
            setPeople(users.filter(u => u.uid !== currentUser.uid));
          }
          const conns = await getConnections(currentUser.uid);
          setConnections(conns);
          const pending = await getPendingRequests(currentUser.uid);
          if (pending.length > 0) setPendingRequests(pending);
        } else {
          if (users.length > 0) setPeople(users);
        }
      } catch (err) {
        console.log('Using demo network data');
      }
    }
    loadData();
  }, [currentUser]);

  async function handleConnect(user) {
    if (!currentUser) return;
    try {
      await sendConnectionRequest(currentUser.uid, user.uid);
      setSentRequests(prev => new Set([...prev, user.uid]));
    } catch (err) {
      // Demo mode
      setSentRequests(prev => new Set([...prev, user.uid]));
    }
  }

  async function handleAccept(request) {
    try {
      await acceptConnection(request.connectionId, currentUser.uid);
      setPendingRequests(prev => prev.filter(r => r.connectionId !== request.connectionId));
      
      // Pull fresh profile data so the UI header instantly shows +1 connection count
      if (fetchUserProfile && currentUser) {
        await fetchUserProfile(currentUser.uid);
      }
    } catch (err) {
      setPendingRequests(prev => prev.filter(r => r.connectionId !== request.connectionId));
    }
  }

  async function handleReject(request) {
    try {
      await rejectConnection(request.connectionId, currentUser.uid);
      setPendingRequests(prev => prev.filter(r => r.connectionId !== request.connectionId));
    } catch (err) {
      setPendingRequests(prev => prev.filter(r => r.connectionId !== request.connectionId));
    }
  }

  // Quick lookup for active connections
  const connectedUserIds = new Set(connections.map(c => c.uid));

  const filteredPeople = people.filter(p => {
    // Hide if they are already connected
    if (connectedUserIds.has(p.uid)) return false;
    
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.headline || '').toLowerCase().includes(q);
  });

  return (
    <div className="page-full" style={{ maxWidth: 800, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 4 }}>👥 My Network</h1>
        <p className="text-sm text-secondary mb-4">Grow your professional connections</p>
      </motion.div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => setActiveTab('discover')}>
          Discover People
        </button>
        <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          Invitations {pendingRequests.length > 0 && <span className="badge badge-verified" style={{ marginLeft: 4, fontSize: 10 }}>{pendingRequests.length}</span>}
        </button>
        <button className={`tab ${activeTab === 'connections' ? 'active' : ''}`} onClick={() => setActiveTab('connections')}>
          Connections
        </button>
      </div>

      {/* Pending Requests */}
      {activeTab === 'pending' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {pendingRequests.length > 0 ? (
            <div className="card">
              {pendingRequests.map(req => (
                <ConnectionCard
                  key={req.connectionId}
                  user={req.user || { uid: req.fromUserId, name: 'User', headline: 'Professional' }}
                  isPending={true}
                  onAccept={() => handleAccept(req)}
                  onReject={() => handleReject(req)}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>} 
              title="No pending invitations" 
              message="New connection requests will appear here." 
            />
          )}
        </motion.div>
      )}

      {/* Discover */}
      {activeTab === 'discover' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input
              className="form-input mb-4"
              placeholder="Search people by name or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="network-search"
              style={{ paddingLeft: 38 }}
            />
          </div>
          <div className="card">
            {filteredPeople.map(person => (
              <ConnectionCard
                key={person.uid}
                user={person}
                connectionStatus={sentRequests.has(person.uid) ? 'pending' : null}
                onConnect={() => handleConnect(person)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* My Connections */}
      {activeTab === 'connections' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {connections.length > 0 ? (
            <div className="card">
              {connections.map(conn => (
                <ConnectionCard
                  key={conn.connectionId}
                  user={conn}
                  connectionStatus="accepted"
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} 
              title="No connections yet" 
              message="Start discovering and connecting with professionals!"
              action={
                <button className="btn btn-primary" onClick={() => setActiveTab('discover')}>
                  Discover People
                </button>
              }
            />
          )}
        </motion.div>
      )}
    </div>
  );
}
