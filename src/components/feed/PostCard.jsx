import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Avatar from '../shared/Avatar';
import TrustBadge from '../shared/TrustBadge';
import { useAuth } from '../../contexts/AuthContext';
import { likePost, addComment, getComments } from '../../services/realtimeService';

function timeAgo(timestamp) {
  if (!timestamp) return 'Just now';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function PostCard({ post, onUpdate }) {
  const { currentUser } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  async function handleLike() {
    if (!currentUser) return;
    try {
      const isLiked = await likePost(post.postId, currentUser.uid, post.authorId);
      setLiked(isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
    } catch (err) {
      console.error('Error liking post:', err);
    }
  }

  async function handleToggleComments() {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const data = await getComments(post.postId, post.authorId);
        setComments(data);
      } catch (err) {
        console.error('Error loading comments:', err);
      }
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  }

  async function handleAddComment() {
    if (!commentText.trim() || !currentUser) return;
    try {
      await addComment(post.postId, {
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'User',
        content: commentText.trim()
      }, post.authorId);
      setComments(prev => [...prev, {
        commentId: Date.now().toString(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'User',
        content: commentText.trim(),
        createdAt: { toDate: () => new Date() }
      }]);
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  }

  return (
    <motion.div
      className="post-card fade-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="post-header">
        <Avatar 
          src={post.authorAvatar} 
          name={post.authorName || 'User'} 
          size="md" 
        />
        <div className="post-author-info">
          <div className="post-author-name">
            {post.authorName || 'Anonymous'}
            {post.authorTrustBadge && (
              <TrustBadge badge={post.authorTrustBadge} />
            )}
          </div>
          <div className="post-author-headline">{post.authorHeadline || ''}</div>
          <div className="post-timestamp">{timeAgo(post.createdAt)}</div>
        </div>
        {post.postType && (
          <span className="badge badge-verified" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: 4 }}>
            {post.postType === 'achievement' ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 15-5 5V5l5 5 5-5v15z"/></svg> : 
             post.postType === 'project' ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4-4-4"/><path d="M3 3.5c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5"/><path d="M15 13.5c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5"/><path d="M18.4 12H12"/></svg> :
             post.postType === 'certification' ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 20H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"/><path d="M8 6h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg> :
             post.postType === 'milestone' ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8Z"/></svg>} 
            {post.postType}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="post-content">
        {post.content}
      </div>

      {/* Media */}
      {post.mediaUrl && (
        <img src={post.mediaUrl} alt="Post media" className="post-media" />
      )}

      {/* Stats */}
      <div className="post-stats">
        <span>{likesCount > 0 ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
            {likesCount} likes
          </span>
        ) : ''}</span>
        <span>
          {(post.commentsCount || 0) > 0 ? `${post.commentsCount} comments` : ''}
          {(post.repostsCount || 0) > 0 ? ` · ${post.repostsCount} reposts` : ''}
        </span>
      </div>

      {/* Actions */}
      <div className="post-actions">
        <button 
          className={`post-action-btn ${liked ? 'liked' : ''}`} 
          onClick={handleLike}
          id={`like-btn-${post.postId}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          Like
        </button>
        <button 
          className="post-action-btn" 
          onClick={handleToggleComments}
          id={`comment-btn-${post.postId}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Comment
        </button>
        <button className="post-action-btn" id={`repost-btn-${post.postId}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
          Repost
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comment-section fade-in">
          <div className="comment-input-row">
            <Avatar name={currentUser?.displayName || 'U'} size="xs" />
            <input
              className="comment-input"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button 
              className="btn btn-sm btn-primary" 
              onClick={handleAddComment}
              disabled={!commentText.trim()}
            >
              Post
            </button>
          </div>
          {loadingComments ? (
            <div className="text-sm text-muted text-center p-4">Loading comments...</div>
          ) : (
            comments.map(comment => (
              <div className="comment-item" key={comment.commentId}>
                <Avatar name={comment.authorName} size="xs" />
                <div className="comment-bubble">
                  <div className="comment-author">{comment.authorName}</div>
                  <div className="comment-text">{comment.content}</div>
                  <div className="comment-time">{timeAgo(comment.createdAt)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}
