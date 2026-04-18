import { ref, get, set, push, update, remove, query, orderByChild, equalTo, limitToLast, serverTimestamp } from 'firebase/database';
import { rtdb as db } from '../config/firebase';

// ========== USERS & COMPANIES ==========

export async function getUser(uid) {
  const snap = await get(ref(db, `users/${uid}`));
  return snap.exists() ? { uid, ...snap.val() } : null;
}

export async function getCompany(companyId) {
  const snap = await get(ref(db, `companies/${companyId}`));
  return snap.exists() ? { companyId, ...snap.val() } : null;
}

export async function updateUserProfile(uid, data, role) {
  const collection = role === 'company' ? 'companies' : 'users';
  await update(ref(db, `${collection}/${uid}`), { ...data, updatedAt: serverTimestamp() });
}

// ========== POSTS ==========

export async function createPost(postData) {
  const newPostRef = push(ref(db, 'posts'));
  const postId = newPostRef.key;
  
  await set(newPostRef, {
    ...postData,
    likesCount: 0,
    commentsCount: 0,
    repostsCount: 0,
    createdAt: Date.now() // RTDB doesn't sort well with serverTimestamp() objects natively in JS without conversion
  });
  
  // Increment author's post count
  const authorCollection = postData.authorType === 'company' ? 'companies' : 'users';
  const authorRef = ref(db, `${authorCollection}/${postData.authorId}`);
  const authorSnap = await get(authorRef);
  if (authorSnap.exists()) {
    const currentCount = authorSnap.val().postsCount || 0;
    await update(authorRef, { postsCount: currentCount + 1 });
  }
  
  return postId;
}

export async function getPosts(pageSize = 20, lastTimestamp = null, userId = null) {
  // Try backend ranking first if we have a userId
  if (userId && !lastTimestamp) {
    try {
      const response = await fetch(`/api/feed/ranked?uid=${userId}&limit=${pageSize}`);
      if (response.ok) {
        const posts = await response.json();
        return { posts, lastDoc: null, isRanked: true };
      }
    } catch (err) {
      console.warn("Backend ranked feed unavailable, falling back to RTDB:", err.message);
    }
  }

  // Basic RTDB fallback (latest posts)
  const postsRef = query(ref(db, 'posts'), orderByChild('createdAt'), limitToLast(pageSize));
  const snap = await get(postsRef);
  
  const posts = [];
  if (snap.exists()) {
    snap.forEach((child) => {
      posts.push({ postId: child.key, ...child.val() });
    });
    // Reverse to get newest first since limitToLast returns ascending locally
    posts.reverse();
  }
  
  return {
    posts,
    lastDoc: null, // Basic RTDB pagination omitted for simplicity in this fallback
    isRanked: false
  };
}

export async function recalculateTrustScore(uid) {
  try {
    const response = await fetch(`/api/trust/calculate/${uid}`, { method: 'POST' });
    if (response.ok) return await response.json();
  } catch (err) {
    console.error("Backend trust engine error:", err.message);
  }
}

// ========== JOBS ==========

export async function getJobs() {
  const snap = await get(ref(db, 'jobs'));
  const jobs = [];
  if (snap.exists()) {
    snap.forEach((child) => {
      jobs.push({ jobId: child.key, ...child.val() });
    });
  }
  return jobs.reverse();
}

export async function createJob(jobData) {
  const newJobRef = push(ref(db, 'jobs'));
  await set(newJobRef, { ...jobData, createdAt: Date.now() });
  return newJobRef.key;
}

// ========== EVENTS ==========

export async function getEvents() {
  const snap = await get(ref(db, 'events'));
  const events = [];
  if (snap.exists()) {
    snap.forEach((child) => {
      events.push({ eventId: child.key, ...child.val() });
    });
  }
  return events.reverse();
}

// ========== CONNECTIONS ==========

export async function getConnections(userId) {
  // Stubbed for brevity. 
  return [];
}

export async function getAllUsers(pageSize = 50) {
  const snap = await get(query(ref(db, 'users'), limitToLast(pageSize)));
  const users = [];
  if (snap.exists()) {
    snap.forEach((child) => {
      users.push({ uid: child.key, ...child.val() });
    });
  }
  return users.reverse();
}

export async function getPendingRequests(userId) {
  return []; // Stubbed
}

export async function sendConnectionRequest(fromUserId, toUserId) {
  return "stub_id";
}

export async function acceptConnection(connectionId, userId) {
}

export async function rejectConnection(connectionId, userId) {
}

// ========== EVENTS EXTRA ==========
export async function createEvent(eventData) {
  const newRef = push(ref(db, 'events'));
  await set(newRef, { ...eventData, createdAt: Date.now(), attendeesCount: 0 });
  return newRef.key;
}

export async function registerForEvent(eventId, userId) {
  const regRef = ref(db, `event_registrations/${eventId}_${userId}`);
  await set(regRef, { eventId, userId, createdAt: Date.now() });
  
  // Increment count
  const eventRef = ref(db, `events/${eventId}`);
  const snap = await get(eventRef);
  if (snap.exists()) {
    await update(eventRef, { attendeesCount: (snap.val().attendeesCount || 0) + 1 });
  }
}

// ========== POST ACTIONS ==========
export async function likePost(postId, userId) {
  const likeRef = ref(db, `posts_likes/${postId}_${userId}`);
  const snap = await get(likeRef);
  
  const postRef = ref(db, `posts/${postId}`);
  const postSnap = await get(postRef);
  const currentLikes = postSnap.exists() ? (postSnap.val().likesCount || 0) : 0;

  if (snap.exists()) {
    await remove(likeRef);
    if (postSnap.exists()) await update(postRef, { likesCount: Math.max(0, currentLikes - 1) });
    return false;
  } else {
    await set(likeRef, { postId, userId, createdAt: Date.now() });
    if (postSnap.exists()) await update(postRef, { likesCount: currentLikes + 1 });
    return true;
  }
}

export async function addComment(postId, commentData) {
  const newRef = push(ref(db, 'posts_comments'));
  await set(newRef, { postId, ...commentData, createdAt: Date.now() });
  
  const postRef = ref(db, `posts/${postId}`);
  const postSnap = await get(postRef);
  if (postSnap.exists()) {
    await update(postRef, { commentsCount: (postSnap.val().commentsCount || 0) + 1 });
  }
  return newRef.key;
}

export async function getComments(postId) {
  const snap = await get(query(ref(db, 'posts_comments'), orderByChild('postId'), equalTo(postId)));
  const comments = [];
  if (snap.exists()) {
    snap.forEach((child) => {
      comments.push({ commentId: child.key, ...child.val() });
    });
  }
  return comments.sort((a, b) => a.createdAt - b.createdAt);
}
