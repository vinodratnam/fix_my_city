'use client';
import { useState, useEffect } from 'react';

const STATUS_COLORS = { live: '#22C55E', progress: '#F59E0B', resolved: '#2563EB', urgent: '#EF4444' };
const STATUS_LABELS = { live: 'Live', progress: 'In Progress', resolved: 'Resolved', urgent: 'Urgent' };

const ISSUES = [
  { id: 1, title: 'Large Pothole — MG Road', type: 'pothole', status: 'urgent', priority: 'critical', x: 35, y: 38, upvotes: 89, time: '2h ago', dept: 'Roads Dept' },
  { id: 2, title: 'Broken Streetlight — 5th Ave', type: 'streetlight', status: 'progress', priority: 'high', x: 55, y: 28, upvotes: 34, time: '5h ago', dept: 'Electricity' },
  { id: 3, title: 'Water Main Leak — Park St', type: 'water', status: 'live', priority: 'critical', x: 72, y: 52, upvotes: 156, time: '45m ago', dept: 'Water Dept' },
  { id: 4, title: 'Garbage Overflow — Market', type: 'garbage', status: 'resolved', priority: 'medium', x: 25, y: 62, upvotes: 21, time: '1d ago', dept: 'Sanitation' },
  { id: 5, title: 'Damaged Pavement — Main Sq', type: 'pavement', status: 'progress', priority: 'high', x: 62, y: 70, upvotes: 67, time: '8h ago', dept: 'Roads Dept' },
  { id: 6, title: 'Sewage Overflow — Block C', type: 'sewage', status: 'urgent', priority: 'critical', x: 18, y: 42, upvotes: 112, time: '1h ago', dept: 'Water Dept' },
  { id: 7, title: 'Fallen Tree — Riverside', type: 'tree', status: 'progress', priority: 'high', x: 80, y: 35, upvotes: 44, time: '3h ago', dept: 'Parks Dept' },
  { id: 8, title: 'Traffic Light Malfunction', type: 'traffic', status: 'live', priority: 'critical', x: 48, y: 55, upvotes: 203, time: '20m ago', dept: 'Traffic Dept' },
];

const FILTERS = ['All', 'Urgent', 'Live', 'In Progress', 'Resolved'];
const TYPE_ICONS = { pothole: '🕳️', streetlight: '💡', water: '💧', garbage: '🗑️', pavement: '🛤️', sewage: '🚰', tree: '🌳', traffic: '🚦' };

function IssueMarker({ issue, selected, onClick }) {
  const [hov, setHov] = useState(false);
  const c = STATUS_COLORS[issue.status];
  return (
    <div
      onClick={() => onClick(issue)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ position: 'absolute', left: `${issue.x}%`, top: `${issue.y}%`, transform: 'translate(-50%,-50%)', cursor: 'pointer', zIndex: selected ? 10 : 5 }}>
      {/* Pulse ring */}
      {(issue.status === 'live' || issue.status === 'urgent') && (
        <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: `2px solid ${c}40`, animation: 'pulse-ring 2s ease-out infinite', transform: 'translate(0,0)' }}/>
      )}
      {/* Dot */}
      <div style={{ width: selected || hov ? 20 : 14, height: selected || hov ? 20 : 14, borderRadius: '50%', background: c, border: '3px solid rgba(255,255,255,0.9)', boxShadow: `0 0 ${selected ? 20 : 10}px ${c}${selected ? 'AA' : '60'}`, transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7 }}>
        {(selected || hov) && <span style={{ fontSize: 8 }}>{TYPE_ICONS[issue.type]}</span>}
      </div>
      {/* Tooltip on hover */}
      {hov && !selected && (
        <div style={{ position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15,23,42,0.98)', border: `1px solid ${c}50`, borderRadius: 10, padding: '8px 12px', whiteSpace: 'nowrap', fontSize: 11, color: '#F1F5F9', fontWeight: 500, zIndex: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          <div style={{ marginBottom: 2 }}>{TYPE_ICONS[issue.type]} {issue.title}</div>
          <div style={{ color: '#94A3B8', fontSize: 10 }}>{issue.time} • {issue.upvotes} upvotes</div>
          <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 8, height: 8, background: 'rgba(15,23,42,0.98)', borderRight: `1px solid ${c}50`, borderBottom: `1px solid ${c}50` }}/>
        </div>
      )}
    </div>
  );
}

export default function MapSection({ customIssues = [], apiIssues = [] }) {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [liveCount, setLiveCount] = useState(1247);
  const allIssues = [...apiIssues, ...ISSUES, ...customIssues];

  const filtered = filter === 'All' ? allIssues
    : filter === 'Urgent' ? allIssues.filter(i => i.status === 'urgent')
    : filter === 'Live' ? allIssues.filter(i => i.status === 'live')
    : filter === 'In Progress' ? allIssues.filter(i => i.status === 'progress')
    : allIssues.filter(i => i.status === 'resolved');

  // Simulate live counter
  useEffect(() => {
    const t = setInterval(() => setLiveCount(v => v + Math.floor(Math.random() * 3)), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="map" className="section" style={{ background: 'var(--bg-primary)', position: 'relative' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="tag tag-green" style={{ display: 'inline-flex', marginBottom: 16 }}>
            <span className="status-dot status-live"/>
            {liveCount.toLocaleString()} Issues Tracked Live
          </div>
          <h2 className="section-title">
            <span className="gradient-text">Real-Time</span> Issue Map
          </h2>
          <p className="section-subtitle">
            Every civic issue visualized on an interactive map. Click any marker to see details, upvote, or follow progress.
          </p>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', outline: 'none', transition: 'all 0.2s ease',
                background: filter === f ? 'linear-gradient(135deg,#2563EB,#8B5CF6)' : 'rgba(255,255,255,0.05)',
                color: filter === f ? 'white' : '#94A3B8',
                boxShadow: filter === f ? '0 4px 16px rgba(37,99,235,0.4)' : 'none',
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Map layout */}
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: 24, alignItems: 'start' }} className="map-layout">
          {/* Map container */}
          <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, overflow: 'hidden', position: 'relative', height: 500, background: '#0D1829' }}>

            {/* SVG background map */}
            <svg viewBox="0 0 1000 500" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
              {/* Grid */}
              {[...Array(10)].map((_,i) => (
                <g key={i}>
                  <line x1={i*100} y1="0" x2={i*100} y2="500" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>
                  <line x1="0" y1={i*50} x2="1000" y2={i*50} stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>
                </g>
              ))}
              {/* Major roads */}
              <line x1="0" y1="200" x2="1000" y2="175" stroke="rgba(255,255,255,0.07)" strokeWidth="5"/>
              <line x1="0" y1="340" x2="1000" y2="315" stroke="rgba(255,255,255,0.05)" strokeWidth="3"/>
              <line x1="320" y1="0" x2="295" y2="500" stroke="rgba(255,255,255,0.07)" strokeWidth="5"/>
              <line x1="680" y1="0" x2="705" y2="500" stroke="rgba(255,255,255,0.05)" strokeWidth="3"/>
              {/* City blocks */}
              {[[80,80,180,100],[400,60,240,80],[720,130,160,90],[100,280,200,120],[450,260,280,110],[750,310,150,100]].map(([x,y,w,h],i) => (
                <rect key={i} x={x} y={y} width={w} height={h} rx="8" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
              ))}
              {/* Heatmap areas */}
              <defs>
                <radialGradient id="h1"><stop offset="0%" stopColor="#EF4444" stopOpacity="0.25"/><stop offset="100%" stopColor="#EF4444" stopOpacity="0"/></radialGradient>
                <radialGradient id="h2"><stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2"/><stop offset="100%" stopColor="#F59E0B" stopOpacity="0"/></radialGradient>
                <radialGradient id="h3"><stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.18"/><stop offset="100%" stopColor="#8B5CF6" stopOpacity="0"/></radialGradient>
              </defs>
              <ellipse cx="350" cy="190" rx="130" ry="80" fill="url(#h1)"/>
              <ellipse cx="720" cy="260" rx="110" ry="70" fill="url(#h2)"/>
              <ellipse cx="180" cy="320" rx="90" ry="60" fill="url(#h3)"/>
            </svg>

            {/* Live markers */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
              {filtered.map(issue => (
                <IssueMarker key={issue.id} issue={issue} selected={selected?.id === issue.id} onClick={i => setSelected(selected?.id === i.id ? null : i)}/>
              ))}
            </div>

            {/* Legend */}
            <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: '12px 16px' }}>
              <p style={{ fontSize: 10, color: '#64748B', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status Legend</p>
              {Object.entries(STATUS_COLORS).map(([k,c]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, flexShrink: 0 }}/>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>{STATUS_LABELS[k]}</span>
                </div>
              ))}
            </div>

            {/* Count badge */}
            <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '8px 14px', fontSize: 12, color: '#94A3B8' }}>
              Showing <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{filtered.length}</span> issues
            </div>

            {/* Click hint */}
            {!selected && (
              <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 10, padding: '8px 14px', fontSize: 12, color: '#60A5FA' }}>
                Click any marker to view details
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, overflow: 'hidden', height: 500, display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: `linear-gradient(135deg, ${STATUS_COLORS[selected.status]}10, transparent)` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{TYPE_ICONS[selected.type]}</span>
                  <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#94A3B8', fontSize: 16 }}>✕</button>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F1F5F9', marginBottom: 8 }}>{selected.title}</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="tag" style={{ fontSize: 11, padding: '3px 10px', background: STATUS_COLORS[selected.status] + '20', color: STATUS_COLORS[selected.status], border: `1px solid ${STATUS_COLORS[selected.status]}40` }}>
                    {STATUS_LABELS[selected.status]}
                  </span>
                  <span className="tag tag-purple" style={{ fontSize: 11, padding: '3px 10px' }}>{selected.priority}</span>
                </div>
              </div>
              {/* Details */}
              <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
                {selected.imageUrl && (
                  <div style={{ marginBottom: 16, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
                    <img src={selected.imageUrl} alt={selected.title} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                  </div>
                )}

                {selected.status === 'resolved' && selected.afterImageUrl && (
                  <div style={{ marginBottom: 16, padding: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#4ADE80', marginBottom: 8, uppercase: 'true' }}>✅ Resolved Proof</p>
                    <div style={{ borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                      <img src={selected.afterImageUrl} alt="Resolution Proof" style={{ width: '100%', height: 110, objectFit: 'cover' }} />
                    </div>
                  </div>
                )}
                {[
                  { label: 'Department', value: selected.dept },
                  { label: 'Reported', value: selected.time },
                  { label: 'Upvotes', value: `${selected.upvotes} citizens` },
                  { label: 'Coordinates', value: `${(selected.y * 0.004 + 12.9).toFixed(4)}°N, ${(selected.x * 0.009 + 77.5).toFixed(4)}°E` },
                  { label: 'Issue ID', value: `#${String(selected.id).padStart(4,'0')}` },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13 }}>
                    <span style={{ color: '#64748B' }}>{item.label}</span>
                    <span style={{ color: '#F1F5F9', fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
                {/* Progress bar */}
                {selected.status === 'progress' && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                      <span style={{ color: '#94A3B8' }}>Resolution Progress</span>
                      <span style={{ color: '#F59E0B', fontWeight: 600 }}>65%</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '65%', background: 'linear-gradient(90deg, #F59E0B, #EF4444)', borderRadius: 3 }}/>
                    </div>
                  </div>
                )}
              </div>
              {/* Actions */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 10 }}>
                <button className="btn-primary" style={{ flex: 1, fontSize: 13, padding: '10px' }}>👍 Upvote ({selected.upvotes})</button>
                <button className="btn-secondary" style={{ flex: 1, fontSize: 13, padding: '10px' }}>🔔 Follow</button>
              </div>
            </div>
          )}
        </div>

        <style>{`
          @media (max-width: 768px) { .map-layout { grid-template-columns: 1fr !important; } }
        `}</style>

        {/* Bottom summary strip */}
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="map-stats">
          {[
            { label: 'Total Issues', value: liveCount.toLocaleString(), color: '#2563EB', icon: '📍' },
            { label: 'Resolved Today', value: '142', color: '#22C55E', icon: '✅' },
            { label: 'Avg Response', value: '72hrs', color: '#F59E0B', icon: '⚡' },
            { label: 'Departments Active', value: '14', color: '#8B5CF6', icon: '🏛️' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <style>{`
          @media (max-width: 640px) { .map-stats { grid-template-columns: repeat(2,1fr) !important; } }
        `}</style>
      </div>
    </section>
  );
}
