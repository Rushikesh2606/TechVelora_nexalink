import React from 'react';

export default function EventCard({ event, onRegister, onView, isRegistered = false }) {
  function formatDate(timestamp) {
    if (!timestamp) return 'TBD';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
    });
  }

  function getTypeIcon(type) {
    switch (type) {
      case 'hackathon': return <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg>;
      case 'workshop': return <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a2 2 0 0 1-2.83-2.83l-3.94 3.6Z"/><path d="m14.7 6.3 3 3"/><path d="M15.5 14a2 2 0 1 0-3.48-1.47"/><path d="m10.6 19 .35.35a2 2 0 0 0 2.83 0l3.77-3.77a2 2 0 0 0 0-2.83L16 11.2a2 2 0 0 0-2.83 0l-3.77 3.77a2 2 0 0 0 0 2.83l.2.2"/><path d="m8.6 14.3.4.4"/><path d="m9 9 2 2"/></svg>;
      case 'networking': return <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
      case 'hiring_drive': return <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
      default: return <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    }
  }

  function getTypeBanner(type) {
    switch (type) {
      case 'hackathon': return 'linear-gradient(135deg, #7C3AED, #EC4899)';
      case 'workshop': return 'linear-gradient(135deg, #2563EB, #06B6D4)';
      case 'networking': return 'linear-gradient(135deg, #16A34A, #2563EB)';
      case 'hiring_drive': return 'linear-gradient(135deg, #F59E0B, #EF4444)';
      default: return 'linear-gradient(135deg, #2563EB, #7C3AED)';
    }
  }

  return (
    <div className="event-card" onClick={onView} id={`event-card-${event.eventId}`}>
      <div className="event-card-banner" style={{ background: getTypeBanner(event.type), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: 64, height: 64, color: 'white' }}>{getTypeIcon(event.type)}</div>
      </div>
      <div className="event-card-body">
        <span className="event-card-type" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 14 }}>{getTypeIcon(event.type)}</div> {(event.type || 'event').replace('_', ' ')}
        </span>
        <h3 className="event-card-title">{event.title}</h3>
        <div className="event-card-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> {formatDate(event.date)}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> {event.location || 'Online'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> {event.attendeesCount || 0}{event.maxAttendees ? ` / ${event.maxAttendees}` : ''} attendees</span>
        </div>
        <div style={{ marginTop: 12 }}>
          <button
            className={`btn btn-sm ${isRegistered ? 'btn-secondary' : 'btn-primary'} btn-full`}
            onClick={(e) => { e.stopPropagation(); onRegister && onRegister(event); }}
            disabled={isRegistered}
            id={`register-btn-${event.eventId}`}
          >
            {isRegistered ? '✓ Registered' : 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
