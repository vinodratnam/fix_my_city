'use client';
import { useState } from 'react';

const ISSUES = [
  {
    id: 'CVW-1042',
    title: 'Severe Pothole — MG Road Junction',
    type: 'Pothole',
    priority: 'Critical',
    location: 'MG Road, Sector 4, Block A',
    reportedAt: '2024-01-15',
    resolvedAt: null,
    icon: '🕳️',
    color: '#EF4444',
    steps: [
      { label: 'Issue Submitted', time: '2 days ago', detail: 'Citizen submitted report with photo evidence.', done: true },
      { label: 'AI Categorized', time: '2 days ago', detail: 'Gemini AI classified as Critical Priority — Roads.', done: true },
      { label: 'Dept. Notified', time: '1 day ago', detail: 'Roads Department auto-notified via SMS & email.', done: true },
      { label: 'Site Inspection', time: '18h ago', detail: 'Engineer inspected site. Materials ordered.', done: true },
      { label: 'Repair In Progress', time: 'Active now', detail: 'Crew of 3 deployed. 65% complete.', done: false, active: true },
      { label: 'Quality Check', time: 'Pending', detail: 'Supervisor sign-off required before closing.', done: false },
      { label: 'Citizen Notified', time: 'Pending', detail: 'Auto-notification sent on resolution.', done: false },
    ],
  },
  {
    id: 'CVW-0987',
    title: 'Water Main Leak — Park Street',
    type: 'Water Leak',
    priority: 'High',
    location: 'Park Street, Near Post Office',
    reportedAt: '2024-01-14',
    resolvedAt: '2024-01-16',
    icon: '💧',
    color: '#06B6D4',
    steps: [
      { label: 'Issue Submitted', time: '3 days ago', detail: 'Reported with GPS coordinates.', done: true },
      { label: 'AI Categorized', time: '3 days ago', detail: 'Water emergency flagged. High priority.', done: true },
      { label: 'Dept. Notified', time: '3 days ago', detail: 'Water Department responded in 2h.', done: true },
      { label: 'Emergency Crew Sent', time: '2 days ago', detail: 'Emergency crew arrived within 4 hours.', done: true },
      { label: 'Pipe Repaired', time: '1 day ago', detail: 'Main valve replaced. Water restored.', done: true },
      { label: 'Quality Check', time: '1 day ago', detail: 'Supervisor verified no further leakage.', done: true },
      { label: 'Closed & Notified', time: '20h ago', detail: 'Citizen notified. Issue marked resolved ✓', done: true },
    ],
  },
  {
    id: 'CVW-1103',
    title: 'Broken Streetlight — 5th Avenue',
    type: 'Streetlight',
    priority: 'Medium',
    location: '5th Avenue, Between Cross Roads',
    reportedAt: '2024-01-16',
    resolvedAt: null,
    icon: '💡',
    color: '#F59E0B',
    steps: [
      { label: 'Issue Submitted', time: '12h ago', detail: 'Submitted by 3 citizens. Upvoted 34 times.', done: true },
      { label: 'AI Categorized', time: '12h ago', detail: 'Auto-tagged: Electricity / Medium priority.', done: true },
      { label: 'Dept. Notified', time: '10h ago', detail: 'Electricity board notified. Ticket #E-2934.', done: true },
      { label: 'Scheduled', time: 'Tomorrow', detail: 'Scheduled for repair on next work day.', done: false, active: true },
      { label: 'Repair', time: 'Pending', detail: 'Electrician to be assigned.', done: false },
      { label: 'Verification', time: 'Pending', detail: 'Photo evidence required.', done: false },
      { label: 'Closed', time: 'Pending', detail: '', done: false },
    ],
  },
];

export default function TrackingTimeline({ apiIssues = [] }) {
  const [activeIssue, setActiveIssue] = useState(0);

  const generateSteps = (iss) => {
    const isResolved = iss.status === 'resolved';
    const isProgress = iss.status === 'progress';
    const deptName = iss.dept || 'Sanitation';
    return [
      { label: 'Issue Submitted', time: 'Recently', detail: `Report submitted for ${iss.address || 'location'}.`, done: true },
      { label: 'AI Categorized', time: 'Recently', detail: `Gemini AI auto-assigned to ${deptName} Dept.`, done: true },
      { label: 'Dept. Notified', time: 'Recently', detail: `${deptName} dispatch agent assigned ticket.`, done: true },
      { label: 'Site Inspection', time: isProgress || isResolved ? 'Completed' : 'Pending', detail: 'Municipal inspector confirmed details on-site.', done: isProgress || isResolved, active: !isProgress && !isResolved },
      { label: 'Repair In Progress', time: isResolved ? 'Completed' : isProgress ? 'Active now' : 'Pending', detail: isResolved ? 'Public works crew finished repair.' : 'Active repair crew dispatched.', done: isResolved, active: isProgress },
      { label: 'Quality Check', time: isResolved ? 'Completed' : 'Pending', detail: 'Final verification and photo sign-off.', done: isResolved },
      { label: 'Closed & Notified', time: isResolved ? 'Completed' : 'Pending', detail: 'Citizen notified of resolution.', done: isResolved },
    ];
  };

  const formattedApiIssues = apiIssues.map(iss => {
    const colorMap = { live: '#22C55E', progress: '#F59E0B', resolved: '#2563EB', urgent: '#EF4444' };
    const issueColor = colorMap[iss.status] || '#8B5CF6';
    return {
      ...iss,
      id: `CVW-${iss.id.slice(-4).toUpperCase()}`,
      color: issueColor,
      steps: generateSteps(iss)
    };
  });

  const allIssues = [...formattedApiIssues, ...ISSUES];
  const issue = allIssues[activeIssue] || allIssues[0] || ISSUES[0];
  const completedSteps = issue.steps ? issue.steps.filter(s => s.done).length : 0;
  const progress = issue.steps ? Math.round((completedSteps / issue.steps.length) * 100) : 0;

  return (
    <section id="tracking" className="section" style={{ background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="tag tag-purple" style={{ display: 'inline-flex', marginBottom: 16 }}>
            <span>📍</span> Live Issue Tracking
          </div>
          <h2 className="section-title">
            Track Every Issue<br/><span className="gradient-text">Step by Step</span>
          </h2>
          <p className="section-subtitle">
            Full transparency from submission to resolution. Real-time status updates at every stage of the civic pipeline.
          </p>
        </div>

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 32, alignItems: 'start' }} className="tracking-layout">

          {/* Left panel — issue selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Issue to Track</p>
            {allIssues.map((iss, i) => {
              const done = iss.steps ? iss.steps.filter(s => s.done).length : 0;
              const pct = iss.steps ? Math.round((done / iss.steps.length) * 100) : 0;
              return (
                <div key={i} onClick={() => setActiveIssue(i)}
                  style={{ padding: '16px 20px', borderRadius: 16, cursor: 'pointer', transition: 'all 0.3s ease', border: activeIssue === i ? `1px solid ${iss.color}50` : '1px solid rgba(255,255,255,0.08)', background: activeIssue === i ? `${iss.color}10` : 'rgba(255,255,255,0.04)', transform: activeIssue === i ? 'translateX(4px)' : 'translateX(0)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>{iss.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iss.title}</p>
                      <p style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{iss.id}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: iss.color, fontWeight: 600 }}>{pct}% complete</span>
                    <span className="tag" style={{ fontSize: 10, padding: '2px 8px', background: iss.color + '15', color: iss.color, border: `1px solid ${iss.color}30` }}>{iss.priority}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: iss.color, borderRadius: 2, transition: 'width 0.8s ease' }}/>
                  </div>
                </div>
              );
            })}

            {/* Stats */}
            <div style={{ marginTop: 8, padding: 20, borderRadius: 16, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
              <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>Resolution Stats</p>
              {[{ label: 'This Week', value: '142', color: '#22C55E' }, { label: 'This Month', value: '1,847', color: '#2563EB' }, { label: 'Avg Days', value: '3.2', color: '#F59E0B' }].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: '#64748B' }}>{s.label}</span>
                  <span style={{ color: s.color, fontWeight: 600 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — timeline */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 24, padding: 32 }}>
            {/* Issue header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: issue.color + '15', border: `1px solid ${issue.color}30`, flexShrink: 0 }}>
                  {issue.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F1F5F9', marginBottom: 4, lineHeight: 1.3 }}>{issue.title}</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="tag tag-purple" style={{ fontSize: 11, padding: '2px 8px' }}>#{issue.id}</span>
                    <span className="tag" style={{ fontSize: 11, padding: '2px 8px', background: issue.color + '15', color: issue.color, border: `1px solid ${issue.color}30` }}>{issue.priority}</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: issue.color }}>{progress}%</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>Complete</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B', marginBottom: 8 }}>
                <span>{completedSteps} of {issue.steps.length} steps done</span>
                <span>{issue.location}</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${issue.color}, ${issue.color}AA)`, borderRadius: 4, transition: 'width 1s ease' }}/>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ position: 'relative', paddingLeft: 32 }}>
              {/* Vertical line */}
              <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <div style={{ width: '100%', background: `linear-gradient(to bottom, ${issue.color}, ${issue.color}40)`, height: `${progress}%`, borderRadius: 2, transition: 'height 1s ease' }}/>
              </div>

              {issue.steps.map((step, i) => (
                <div key={i} style={{ position: 'relative', paddingBottom: i < issue.steps.length - 1 ? 28 : 0 }}>
                  {/* Node */}
                  <div style={{ position: 'absolute', left: -32, top: 2, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s ease',
                    background: step.done ? `linear-gradient(135deg, ${issue.color}, ${issue.color}AA)` : step.active ? 'transparent' : 'var(--bg-primary)',
                    border: step.done ? 'none' : step.active ? `2px solid ${issue.color}` : '2px solid rgba(255,255,255,0.12)',
                    boxShadow: step.active ? `0 0 16px ${issue.color}60` : 'none',
                  }}>
                    {step.done ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : step.active ? (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: issue.color, animation: 'pulse-glow 2s infinite' }}/>
                    ) : (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}/>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ transition: 'all 0.2s', opacity: step.done || step.active ? 1 : 0.45 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: step.done || step.active ? 600 : 400, color: step.done ? '#F1F5F9' : step.active ? issue.color : '#64748B' }}>{step.label}</span>
                      <span style={{ fontSize: 11, color: step.active ? issue.color : '#64748B', fontWeight: step.active ? 600 : 400 }}>{step.time}</span>
                    </div>
                    {step.detail && (
                      <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>{step.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) { .tracking-layout { grid-template-columns: 1fr !important; } }
        `}</style>
      </div>
    </section>
  );
}
