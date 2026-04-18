import React from 'react';
import TrustBadge from '../shared/TrustBadge';

export default function JobCard({ job, onApply, onView }) {
  function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="job-card" onClick={onView} id={`job-card-${job.jobId}`}>
      <div className="job-card-header">
        <div className="job-card-logo">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.companyName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
          ) : (
            job.companyName ? job.companyName[0].toUpperCase() : '?'
          )}
        </div>
        <div>
          <h3 className="job-card-title">{job.title}</h3>
          <div className="job-card-company flex items-center gap-2">
            {job.companyName}
            {job.companyTrustBadge && <TrustBadge badge={job.companyTrustBadge} />}
          </div>
        </div>
      </div>

      <div className="job-card-meta">
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> {job.location || 'Remote'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> {job.type || 'Full-time'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> {job.requiredExperienceYears}+ yrs required</span>
        {job.salary && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg> {job.salary}</span>}
      </div>

      {job.requiredSkills && job.requiredSkills.length > 0 && (
        <div className="job-card-skills">
          {job.requiredSkills.slice(0, 5).map((skill, i) => (
            <span key={i} className="badge badge-skill">{skill}</span>
          ))}
          {job.requiredSkills.length > 5 && (
            <span className="badge badge-skill">+{job.requiredSkills.length - 5}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">
          {job.applicantsCount || 0} applicants · Posted {formatDate(job.createdAt)}
        </span>
        <button 
          className="btn btn-primary btn-sm"
          onClick={(e) => { e.stopPropagation(); onApply && onApply(job); }}
          id={`apply-btn-${job.jobId}`}
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}
