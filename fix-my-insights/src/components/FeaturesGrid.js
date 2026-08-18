'use client';
import { useState } from 'react';

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Real-Time Issue Mapping',
    description: 'Live geospatial visualization of reported issues across your city using OpenStreetMap integration. See density heatmaps and cluster analysis updated every 30 seconds.',
    color: '#2563EB',
    tag: 'Live',
    tagColor: 'tag-blue',
    stats: '12K+ active pins',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Analysis',
    description: 'Machine learning models predict issue hotspots before they escalate. Gemini AI automatically categorizes, prioritizes, and routes reports to the right department.',
    color: '#8B5CF6',
    tag: 'AI Enhanced',
    tagColor: 'tag-purple',
    stats: '94% accuracy',
  },
  {
    icon: '⚡',
    title: 'Instant Civic Dispatch',
    description: 'Auto-assigns issues to municipal departments based on category, priority, and workload. Average response time cut from 14 days to 72 hours.',
    color: '#F59E0B',
    tag: 'Automated',
    tagColor: 'tag-orange',
    stats: '72h avg response',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    description: 'Comprehensive data visualization with trend analysis, resolution rates, department performance scores, and citizen satisfaction metrics.',
    color: '#06B6D4',
    tag: 'Insights',
    tagColor: 'tag-cyan',
    stats: '50+ chart types',
  },
  {
    icon: '🔔',
    title: 'Smart Notifications',
    description: 'Citizens receive real-time SMS, email, and push alerts as their issues progress. Custom thresholds for administrators and instant escalation alerts.',
    color: '#22C55E',
    tag: 'Real-Time',
    tagColor: 'tag-green',
    stats: '99.9% delivery',
  },
  {
    icon: '🛡️',
    title: 'Secure & Transparent',
    description: 'Blockchain-verified issue records, end-to-end encrypted submissions, and public accountability dashboard for full government transparency.',
    color: '#EF4444',
    tag: 'Secure',
    tagColor: 'tag-red',
    stats: 'SOC2 compliant',
  },
];

export default function FeaturesGrid() {
  const [hovered, setHovered] = useState(null);

  return (
    <section id="features" className="section" style={{ background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)', position: 'relative' }}>

      {/* Background glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}/>

      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="tag tag-blue" style={{ display: 'inline-flex', marginBottom: 16 }}>
            <span>⚡</span> Platform Features
          </div>
          <h2 className="section-title">
            Everything your city needs to<br/>
            <span className="gradient-text">resolve issues faster</span>
          </h2>
          <p className="section-subtitle">
            A unified platform combining AI, real-time data, and civic participation to create measurably better cities.
          </p>
        </div>

        {/* Features grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === i ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${hovered === i ? f.color + '60' : 'rgba(255,255,255,0.10)'}`,
                borderRadius: 24,
                padding: 32,
                cursor: 'default',
                transition: 'all 0.35s ease',
                transform: hovered === i ? 'translateY(-8px)' : 'translateY(0)',
                boxShadow: hovered === i ? `0 24px 60px ${f.color}18` : 'none',
                position: 'relative',
                overflow: 'hidden',
              }}>

              {/* Corner glow */}
              {hovered === i && (
                <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, borderRadius: '0 24px 0 100%', background: `radial-gradient(circle at top right, ${f.color}15, transparent)`, pointerEvents: 'none' }}/>
              )}

              {/* Icon & tag row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, background: f.color + '15', border: `1px solid ${f.color}25`, flexShrink: 0 }}>
                  {f.icon}
                </div>
                <span className={`tag ${f.tagColor}`}>{f.tag}</span>
              </div>

              {/* Content */}
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', marginBottom: 12, lineHeight: 1.3 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, marginBottom: 20 }}>{f.description}</p>

              {/* Footer stat */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: f.color }}>{f.stats}</span>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: f.color + '15', transition: 'all 0.2s' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 1024px) { .features-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 640px) { .features-grid { grid-template-columns: 1fr !important; } }
        `}</style>

        {/* Bottom CTA strip */}
        <div style={{ marginTop: 60, borderRadius: 24, padding: '40px 48px', background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(139,92,246,0.12) 100%)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#F1F5F9', marginBottom: 8 }}>Ready to transform your city?</h3>
            <p style={{ color: '#94A3B8', fontSize: 14 }}>Join 128+ cities already using Fix My Insights to serve citizens better.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-primary">Get Started Free</button>
            <button className="btn-secondary">Schedule Demo</button>
          </div>
        </div>
      </div>
    </section>
  );
}
