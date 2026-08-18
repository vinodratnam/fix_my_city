'use client';
import { useState, useEffect } from 'react';

const STATS = [
  { value: 47291, label: 'Issues Reported', suffix: '+', color: '#2563EB' },
  { value: 38540, label: 'Issues Resolved', suffix: '+', color: '#22C55E' },
  { value: 94, label: 'Resolution Rate', suffix: '%', color: '#8B5CF6' },
  { value: 128, label: 'Cities Connected', suffix: '+', color: '#06B6D4' },
];

function useCountUp(target, duration = 2000, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, started]);
  return count;
}

function StatCard({ stat, started }) {
  const count = useCountUp(stat.value, 2000, started);
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '24px 20px', textAlign: 'center', transition: 'all 0.3s ease', cursor: 'default' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = stat.color + '60'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
      <div style={{ fontSize: 36, fontWeight: 900, fontFamily: 'monospace', color: stat.color, marginBottom: 4 }}>
        {count.toLocaleString()}{stat.suffix}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#94A3B8' }}>{stat.label}</div>
      <div style={{ height: 3, marginTop: 12, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 2, background: stat.color, width: started ? '100%' : '0%', transition: 'width 2s ease' }}/>
      </div>
    </div>
  );
}

export default function HeroSection({ onReportClick }) {
  const [started, setStarted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setStarted(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>

      {/* Background blobs */}
      <div className="blob blob-1"/>
      <div className="blob blob-2"/>
      <div className="blob blob-3"/>
      {/* Grid overlay */}
      <div className="grid-overlay" style={{ position: 'absolute', inset: 0, opacity: 0.4 }}/>
      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, #0F172A 100%)' }}/>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 1280, margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>

        {/* Live badge */}
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.7s ease', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, marginBottom: 32, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)' }}>
          <span className="status-dot status-live"/>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#60A5FA' }}>Live · 1,247 issues tracked right now</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(32px)', transition: 'all 0.7s 0.1s ease' }}>
          <span style={{ color: '#F1F5F9' }}>Empowering Citizens</span><br/>
          <span className="gradient-text">Through Smart</span><br/>
          <span style={{ color: '#F1F5F9' }}>Civic Intelligence</span>
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#94A3B8', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.7s 0.2s ease' }}>
          AI-powered civic tech platform connecting citizens, government, and data — tracking, resolving, and predicting infrastructure issues in real-time.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 64, opacity: mounted ? 1 : 0, transition: 'all 0.7s 0.3s ease' }}>
          <button onClick={onReportClick} className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Report an Issue
          </button>
          <a href="#map" className="btn-secondary" style={{ fontSize: 16, padding: '14px 32px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            Explore Live Map
          </a>
          <a href="#analytics" className="btn-secondary" style={{ fontSize: 16, padding: '14px 32px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            View Dashboard
          </a>
        </div>

        {/* Dashboard Preview */}
        <div style={{ maxWidth: 900, margin: '0 auto 80px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(48px)', transition: 'all 0.7s 0.4s ease', position: 'relative' }}>
          {/* Main card */}
          <div className="neon-border" style={{ borderRadius: 24, padding: 24, background: 'rgba(255,255,255,0.04)' }}>
            {/* Browser chrome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }}/>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }}/>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22C55E' }}/>
              <div style={{ flex: 1, height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
                <span style={{ fontSize: 11, color: '#64748B' }}>fixmyinsights.gov.in/dashboard</span>
              </div>
            </div>
            {/* Mini stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
              {[{ v:'47.2K', l:'Reports', c:'#2563EB' }, { v:'38.5K', l:'Resolved', c:'#22C55E' }, { v:'94%', l:'Rate', c:'#8B5CF6' }, { v:'128', l:'Cities', c:'#06B6D4' }].map(s => (
                <div key={s.l} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
            {/* Mini chart */}
            <div style={{ height: 100, background: 'rgba(255,255,255,0.02)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              <svg viewBox="0 0 800 100" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="hg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563EB" stopOpacity="0.5"/><stop offset="100%" stopColor="#2563EB" stopOpacity="0"/></linearGradient>
                  <linearGradient id="hg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4"/><stop offset="100%" stopColor="#8B5CF6" stopOpacity="0"/></linearGradient>
                </defs>
                <path d="M0 85 Q100 60 200 45 Q300 30 400 25 Q500 20 600 22 Q700 24 800 8" stroke="#2563EB" strokeWidth="2.5" fill="none"/>
                <path d="M0 85 Q100 60 200 45 Q300 30 400 25 Q500 20 600 22 Q700 24 800 8 L800 100 L0 100 Z" fill="url(#hg1)"/>
                <path d="M0 95 Q100 85 200 75 Q300 65 400 58 Q500 50 600 62 Q700 75 800 52" stroke="#8B5CF6" strokeWidth="2" fill="none" strokeDasharray="5,4" opacity="0.7"/>
              </svg>
            </div>
          </div>

          {/* Floating left card */}
          <div className="floating" style={{ position: 'absolute', left: -60, top: 20, width: 170, background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16, padding: 16, display: 'none' }} id="float-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div className="status-dot status-live"/>
              <span style={{ fontSize: 11, color: '#4ADE80', fontWeight: 600 }}>Live Issue</span>
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>Pothole #1042</p>
            <p style={{ fontSize: 11, color: '#94A3B8' }}>MG Road, Sector 4</p>
            <div style={{ height: 4, background: 'rgba(34,197,94,0.15)', borderRadius: 2, marginTop: 10 }}>
              <div style={{ width: '72%', height: '100%', background: '#22C55E', borderRadius: 2 }}/>
            </div>
            <p style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>72% complete</p>
          </div>

          {/* Floating right card */}
          <div className="floating-delayed" style={{ position: 'absolute', right: -60, top: 40, width: 170, background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 16, padding: 16, display: 'none' }} id="float-right">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: '#A78BFA', fontWeight: 600 }}>🤖 AI Insight</span>
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>Surge Detected</p>
            <p style={{ fontSize: 11, color: '#94A3B8' }}>+42% reports in Sector 7</p>
            <p style={{ fontSize: 10, color: '#64748B', marginTop: 6 }}>Confidence: 96%</p>
          </div>

          <style>{`
            @media (min-width: 900px) {
              #float-left { display: block !important; }
              #float-right { display: block !important; }
            }
          `}</style>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 800, margin: '0 auto' }} className="stats-grid">
          {STATS.map(s => <StatCard key={s.label} stat={s} started={started}/>)}
        </div>
        <style>{`
          @media (max-width: 640px) { .stats-grid { grid-template-columns: repeat(2,1fr) !important; } }
        `}</style>

        {/* Scroll indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 48, gap: 6, opacity: 0.5 }}>
          <span style={{ fontSize: 11, color: '#64748B' }}>Scroll to explore</span>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 2, height: 8, borderRadius: 2, background: '#2563EB', opacity: 0.3 + i * 0.3, animation: 'scroll-bounce 1.5s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}/>
          ))}
        </div>
      </div>
    </section>
  );
}
