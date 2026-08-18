'use client';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };

  const links = {
    Platform: [
      { label: 'Report Issue', href: 'http://localhost:3002/report-issue' },
      { label: 'Live Map', href: '#map' },
      { label: 'Dashboard', href: 'http://localhost:3002/dashboard' },
      { label: 'Track Issue', href: '#tracking' },
      { label: 'AI Analytics', href: '#analytics' },
    ],
    Government: [
      { label: 'Official Portal', href: 'http://localhost:3002/' },
      { label: 'Admin Dashboard', href: 'http://localhost:3002/admin' },
      { label: 'Department Login', href: 'http://localhost:3002/login' },
      { label: 'API Documentation', href: 'http://localhost:3001/' },
      { label: 'Partnership', href: '#' },
    ],
    Resources: [
      { label: 'Help Centre', href: '#faq' },
      { label: 'Blog', href: '#' },
      { label: 'Press Kit', href: '#' },
      { label: 'Status Page', href: '#' },
      { label: 'Security', href: '#' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'RTI Act', href: '#' },
      { label: 'Data Requests', href: '#' },
    ],
  };

  return (
    <footer style={{ background: '#07111D', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      {/* CTA Band */}
      <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(139,92,246,0.15) 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#F1F5F9', marginBottom: 12, lineHeight: 1.2 }}>
              Make Your City Smarter.<br/>
              <span style={{ background: 'linear-gradient(135deg,#2563EB,#8B5CF6,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Start Reporting Today.</span>
            </h2>
            <p style={{ color: '#94A3B8', fontSize: 15 }}>Join 500,000+ citizens creating measurably better cities.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 280 }}>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8 }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required
                style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#F1F5F9', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                onFocus={e => { e.target.style.borderColor = '#2563EB'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              />
              <button type="submit" style={{ padding: '12px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#2563EB,#8B5CF6)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap' }}>
                Get Updates
              </button>
            </form>
            {subscribed && (
              <p style={{ fontSize: 12, color: '#4ADE80', marginTop: 4 }}>✓ Subscribed! Welcome to the Civic Intelligence Network.</p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', width: 'fit-content' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', animation: 'pulse-glow 2s infinite', flexShrink: 0 }}/>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#4ADE80' }}>All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 1.5rem 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 40, marginBottom: 56 }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#2563EB,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: 18 }}>
                <span style={{ color: '#F1F5F9' }}>Fix My</span>
                <span style={{ background: 'linear-gradient(135deg,#2563EB,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}> Insights</span>
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7, marginBottom: 24, maxWidth: 260 }}>
              Next-generation crowd-sourced civic intelligence platform empowering citizens to track, resolve, and predict municipal development.
            </p>
            {/* Social links */}
            <div style={{ display: 'flex', gap: 10 }}>
              {['𝕏', '📘', '💼', '📱'].map((s, i) => (
                <a key={i} href="#" style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: 14, transition: 'all 0.2s', color: '#94A3B8' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.2)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}>
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([cat, items]) => (
            <div key={cat}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#F1F5F9', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{cat}</p>
              <ul style={{ listStyle: 'none' }}>
                {items.map(item => (
                  <li key={item.label} style={{ marginBottom: 10 }}>
                    <a href={item.href} style={{ fontSize: 13, color: '#64748B', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => { e.target.style.color = '#F1F5F9'; }}
                      onMouseLeave={e => { e.target.style.color = '#64748B'; }}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 1024px) { .footer-grid { grid-template-columns: 1fr 1fr 1fr !important; } }
          @media (max-width: 640px) { .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 24px !important; } }
        `}</style>

        {/* Bottom bar */}
        <div style={{ paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 13, color: '#4B5563' }}>
            © 2024 Fix My Insights. Made with ❤️ for India. <span style={{ color: '#374151' }}>A Digital India Initiative.</span>
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Security'].map(link => (
              <a key={link} href="#" style={{ fontSize: 13, color: '#4B5563', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => { e.target.style.color = '#94A3B8'; }}
                onMouseLeave={e => { e.target.style.color = '#4B5563'; }}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
