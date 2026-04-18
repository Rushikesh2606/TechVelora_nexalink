import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Avatar from '../shared/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { createPost } from '../../services/realtimeService';
import { uploadPostMedia } from '../../services/storageService';

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const { currentUser, userProfile } = useAuth();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('update');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const postTypes = [
    { value: 'update', label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8Z"/><path d="M10 12h.01"/><path d="M14 12h.01"/><path d="M6 12h.01"/></svg> Update</span>, desc: 'Share a general update' },
    { value: 'achievement', label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 15-5 5V5l5 5 5-5v15z"/></svg> Achievement</span>, desc: 'Celebrate a win' },
    { value: 'project', label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4-4-4"/><path d="M3 3.5c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5"/><path d="M15 13.5c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5"/><path d="M18.4 12H12"/></svg> Project</span>, desc: 'Showcase your work' },
    { value: 'certification', label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 20H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"/><path d="M8 6h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg> Certification</span>, desc: 'New credential' },
    { value: 'milestone', label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Milestone</span>, desc: 'Mark a milestone' }
  ];

  function handleMediaSelect(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be under 5MB');
        return;
      }
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  }

  function removeMedia() {
    setMediaFile(null);
    setMediaPreview(null);
  }

  async function handleSubmit() {
    if (!content.trim()) {
      setError('Post content is required');
      return;
    }
    if (content.length > 3000) {
      setError('Post content is too long (max 3000 characters)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let mediaUrl = '';
      if (mediaFile) {
        mediaUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(mediaFile);
        });
      }

      const isCompany = userProfile?.role === 'company';
      await createPost({
        authorId: currentUser.uid,
        authorType: isCompany ? 'company' : 'user',
        authorName: userProfile?.name || currentUser.displayName || 'User',
        authorAvatar: isCompany ? userProfile?.logoUrl : (userProfile?.avatarUrl || currentUser.photoURL || ''),
        authorHeadline: isCompany ? userProfile?.industry : (userProfile?.headline || ''),
        authorTrustBadge: userProfile?.trustBadge || 'NEW',
        content: content.trim(),
        mediaUrl,
        postType
      });

      setContent('');
      setPostType('update');
      setMediaFile(null);
      setMediaPreview(null);
      onClose();
      if (onPostCreated) onPostCreated();
    } catch (err) {
      setError(err.message || 'Failed to create post');
    }
    setLoading(false);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Post"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit} 
            disabled={loading || !content.trim()}
            id="submit-post-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {loading ? (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            )}
            {loading ? 'Posting...' : 'Post'}
          </button>
        </>
      }
    >
      {/* Author Preview */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar 
          src={userProfile?.avatarUrl || currentUser?.photoURL} 
          name={userProfile?.name || 'U'} 
          size="md" 
        />
        <div>
          <div className="font-semibold text-sm">{userProfile?.name || 'User'}</div>
          <div className="text-xs text-muted">{userProfile?.headline || 'Professional'}</div>
        </div>
      </div>

      {/* Post Type Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {postTypes.map(type => (
          <button
            key={type.value}
            className={`badge ${postType === type.value ? 'badge-verified' : 'badge-skill'}`}
            onClick={() => setPostType(type.value)}
            style={{ cursor: 'pointer', padding: '4px 10px' }}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Content Input */}
      <textarea
        className="form-textarea"
        placeholder="What do you want to talk about?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ minHeight: 150 }}
        id="post-content-input"
      />
      <div className="text-xs text-muted mt-2" style={{ textAlign: 'right' }}>
        {content.length}/3000
      </div>

      {/* Media Preview */}
      {mediaPreview && (
        <div style={{ position: 'relative', marginTop: 12 }}>
          <img 
            src={mediaPreview} 
            alt="Preview" 
            style={{ 
              width: '100%', 
              maxHeight: 200, 
              objectFit: 'cover', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }} 
          />
          <button 
            onClick={removeMedia}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}

      {/* Media Upload Button */}
      <div className="flex items-center gap-2 mt-3">
        <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          Photo
          <input type="file" accept="image/*" onChange={handleMediaSelect} style={{ display: 'none' }} />
        </label>
      </div>

      {/* Error */}
      {error && <div className="form-error mt-2">{error}</div>}
    </Modal>
  );
}
