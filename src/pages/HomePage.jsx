import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/feed/PostCard';
import CreatePostModal from '../components/feed/CreatePostModal';
import Avatar from '../components/shared/Avatar';
import Skeleton from '../components/shared/Skeleton';
import EmptyState from '../components/shared/EmptyState';
import { getPosts, getAllUsers } from '../services/realtimeService';

// Demo data for when Firebase is not configured
const DEMO_POSTS = [
  {
    postId: 'demo-1',
    authorId: 'demo-user-1',
    authorType: 'user',
    authorName: 'Sarah Chen',
    authorAvatar: '',
    authorHeadline: 'Senior Software Engineer at Google',
    authorTrustBadge: 'HIGH_TRUST',
    content: '🎉 Excited to announce that I\'ve just been promoted to Senior Software Engineer! The journey has been incredible — from debugging my first "Hello World" program to architecting distributed systems serving millions of users.\n\nKey lessons from my journey:\n\n1. Never stop learning\n2. Mentor others — teaching deepens understanding\n3. Build meaningful relationships\n4. Trust the process\n\nThank you to everyone who believed in me! #CareerGrowth #Engineering #Nexalink',
    postType: 'achievement',
    likesCount: 142,
    commentsCount: 38,
    repostsCount: 12,
    createdAt: { toDate: () => new Date(Date.now() - 2 * 60 * 60 * 1000) }
  },
  {
    postId: 'demo-2',
    authorId: 'demo-company-1',
    authorType: 'company',
    authorName: 'TechVentures Inc.',
    authorAvatar: '',
    authorHeadline: 'Technology',
    authorTrustBadge: 'TRUSTED',
    content: '🚀 We\'re hiring! Looking for experienced engineers who are passionate about building the future of trust in technology.\n\nOpen Roles:\n• Senior Backend Engineer (5+ yrs)\n• Product Designer (3+ yrs)\n• Data Scientist (4+ yrs)\n\nGreat benefits, remote-friendly, and an incredible team. Check out our company page for details!',
    postType: 'update',
    likesCount: 89,
    commentsCount: 24,
    repostsCount: 31,
    createdAt: { toDate: () => new Date(Date.now() - 5 * 60 * 60 * 1000) }
  },
  {
    postId: 'demo-3',
    authorId: 'demo-user-2',
    authorType: 'user',
    authorName: 'Marcus Johnson',
    authorAvatar: '',
    authorHeadline: 'Product Manager | Ex-Microsoft | Building the future',
    authorTrustBadge: 'VERIFIED',
    content: '📜 Just earned my AWS Solutions Architect Professional certification! 🎓\n\nAfter 3 months of intensive studying while working full-time, I\'m thrilled to add this to my skill set. Cloud architecture is the foundation of modern products.\n\nTip for anyone studying: Use hands-on labs, not just theory. Build real projects to understand the concepts deeply.\n\n#AWS #CloudComputing #Certification #NeverStopLearning',
    postType: 'certification',
    likesCount: 67,
    commentsCount: 15,
    repostsCount: 8,
    createdAt: { toDate: () => new Date(Date.now() - 8 * 60 * 60 * 1000) }
  },
  {
    postId: 'demo-4',
    authorId: 'demo-user-3',
    authorType: 'user',
    authorName: 'Priya Sharma',
    authorAvatar: '',
    authorHeadline: 'Full Stack Developer | Open Source Contributor',
    authorTrustBadge: 'TRUSTED',
    content: '🚀 Just launched my open-source project: TrustChain — a decentralized identity verification library for Node.js!\n\nFeatures:\n• Zero-knowledge proof verification\n• Multi-factor trust scoring\n• Plugin architecture for custom validators\n• Full TypeScript support\n\nStar it on GitHub and let me know what you think! Contributions welcome 🙏\n\n#OpenSource #NodeJS #Identity #Developer',
    postType: 'project',
    likesCount: 203,
    commentsCount: 45,
    repostsCount: 67,
    createdAt: { toDate: () => new Date(Date.now() - 12 * 60 * 60 * 1000) }
  },
  {
    postId: 'demo-5',
    authorId: 'demo-user-4',
    authorType: 'user',
    authorName: 'Alex Rivera',
    authorAvatar: '',
    authorHeadline: 'CTO at InnovateLabs | Angel Investor',
    authorTrustBadge: 'HIGH_TRUST',
    content: '🎉 Milestone alert! InnovateLabs just crossed 1 million users! 🥳\n\nWhen we started 2 years ago, people said the trust verification market was too niche. Today, we\'re processing over 50,000 verification requests daily.\n\nThe secret? Listen to your users. Every feature we built came from real feedback. Every pivot was data-driven.\n\nTo my amazing team — YOU made this possible. Here\'s to the next million! 🚀',
    postType: 'milestone',
    likesCount: 456,
    commentsCount: 89,
    repostsCount: 123,
    createdAt: { toDate: () => new Date(Date.now() - 24 * 60 * 60 * 1000) }
  }
];

const DEMO_SUGGESTIONS = [
  { uid: 's1', name: 'Emily Zhang', headline: 'AI Research at DeepMind', trustBadge: 'HIGH_TRUST', avatarUrl: '' },
  { uid: 's2', name: 'David Kim', headline: 'VP Engineering at Stripe', trustBadge: 'TRUSTED', avatarUrl: '' },
  { uid: 's3', name: 'Lisa Patel', headline: 'Design Lead at Figma', trustBadge: 'VERIFIED', avatarUrl: '' },
];

export default function HomePage() {
  const { currentUser, userProfile } = useAuth();
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions] = useState(DEMO_SUGGESTIONS);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPosts(20, null, currentUser?.uid);
      if (result.posts.length > 0) {
        setPosts(result.posts);
      }
    } catch (err) {
      console.log('Using demo data — Firebase or Backend not configured');
    }
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <>
      <div className="app-content">
        {/* Create Post Box */}
        <motion.div
          className="card card-body mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <Avatar 
              src={userProfile?.avatarUrl || currentUser?.photoURL} 
              name={userProfile?.name || 'U'} 
              size="md" 
            />
            <button
              className="form-input"
              onClick={() => setShowCreatePost(true)}
              style={{ 
                textAlign: 'left', 
                color: 'var(--color-text-muted)', 
                cursor: 'pointer',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-full)'
              }}
              id="create-post-trigger"
            >
              What's on your mind, {userProfile?.name?.split(' ')[0] || 'there'}?
            </button>
          </div>
          <div className="flex gap-2" style={{ marginTop: 12, paddingLeft: 52 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowCreatePost(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Photo
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowCreatePost(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 15-5 5V5l5 5 5-5v15z"/></svg> 
              Achievement
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowCreatePost(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/><path d="M8 7h6"/><path d="M8 11h8"/><path d="M8 15h5"/></svg>
              Article
            </button>
          </div>
        </motion.div>

        {/* Feed */}
        {loading ? (
          <div className="flex flex-col gap-4">
            <Skeleton type="card" />
            <Skeleton type="card" />
            <Skeleton type="card" />
          </div>
        ) : posts.length > 0 ? (
          posts.map((post, index) => (
            <PostCard key={post.postId} post={post} onUpdate={loadPosts} />
          ))
        ) : (
          <EmptyState 
            icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg>} 
            title="No posts yet" 
            message="Be the first to share something with your network!"
            action={
              <button className="btn btn-primary" onClick={() => setShowCreatePost(true)}>
                Create a Post
              </button>
            }
          />
        )}
      </div>

      {/* Right Aside — Suggestions */}
      <aside className="app-aside">
        <div className="suggestion-panel slide-up">
          <div className="suggestion-panel-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
            People you may know
          </div>
          {suggestions.map(user => (
            <div key={user.uid} className="suggestion-item">
              <Avatar src={user.avatarUrl} name={user.name} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-sm font-semibold truncate">{user.name}</div>
                <div className="text-xs text-muted truncate">{user.headline}</div>
              </div>
              <button className="btn btn-sm btn-outline-primary">+ Connect</button>
            </div>
          ))}
          <div style={{ padding: '8px 16px', borderTop: '1px solid var(--color-border-light)' }}>
            <a href="/network" className="text-sm" style={{ fontWeight: 500 }}>View all →</a>
          </div>
        </div>

        {/* Trending */}
        <div className="suggestion-panel mt-4 slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="suggestion-panel-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-warning)' }}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            Trending on Nexalink
          </div>
          {[
            { tag: '#AIEngineering', posts: '1.2K posts' },
            { tag: '#RemoteWork', posts: '892 posts' },
            { tag: '#TrustInTech', posts: '654 posts' },
            { tag: '#StartupLife', posts: '543 posts' },
          ].map((trend, i) => (
            <div key={i} className="suggestion-item" style={{ padding: '10px 16px' }}>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{trend.tag}</div>
                <div className="text-xs text-muted">{trend.posts}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <CreatePostModal 
        isOpen={showCreatePost} 
        onClose={() => setShowCreatePost(false)} 
        onPostCreated={loadPosts}
      />
    </>
  );
}
