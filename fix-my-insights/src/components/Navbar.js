'use client';
import { useState, useEffect, useRef } from 'react';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Map', href: '#map' },
  { label: 'Tracking', href: '#tracking' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'FAQ', href: '#faq' },
];

const NOTIFICATIONS = [
  { id: 1, title: 'Issue #1042 Resolved', desc: 'Pothole on MG Road fixed', time: '2m ago', type: 'success', read: false },
  { id: 2, title: 'New Report Nearby', desc: 'Broken streetlight, 5th Avenue', time: '15m ago', type: 'warning', read: false },
  { id: 3, title: 'Status Update', desc: 'Water leak #987 In Progress', time: '1h ago', type: 'info', read: true },
  { id: 4, title: 'AI Alert', desc: 'High density detected in Sector 4', time: '2h ago', type: 'danger', read: true },
];

const TYPE_COLOR = { success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#2563EB' };

export default function Navbar({ theme, toggleTheme, onReportClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    transition: 'all 0.5s ease',
    background: scrolled ? 'rgba(15,23,42,0.90)' : 'transparent',
    backdropFilter: scrolled ? 'blur(24px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
  };

  const iconBtnStyle = {
    width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)', transition: 'all 0.2s',
    flexShrink: 0,
  };

  return (
    <>
      <nav style={navStyle}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#2563EB,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: 18 }}>
                <span style={{ color: '#F1F5F9' }}>Fix My</span>
                <span className="gradient-text"> Insights</span>
              </span>
            </div>

            {/* Desktop Nav Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, listStyle: 'none' }} className="desktop-nav">
              {NAV_LINKS.map(link => (
                <a key={link.label} href={link.href}
                  style={{ color: '#94A3B8', padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s', display: 'block' }}
                  onMouseEnter={e => { e.target.style.color = '#F1F5F9'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { e.target.style.color = '#94A3B8'; e.target.style.background = 'transparent'; }}>
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Theme Toggle */}
              <button onClick={toggleTheme} style={iconBtnStyle} title="Toggle theme">
                {theme === 'dark' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>

              {/* Notifications */}
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }} style={{ ...iconBtnStyle, position: 'relative' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  {unread > 0 && (
                    <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#EF4444', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>
                  )}
                </button>
                {notifOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 46, width: 320, borderRadius: 16, background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', zIndex: 200, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#F1F5F9' }}>Notifications</span>
                      <span className="tag tag-blue">{unread} new</span>
                    </div>
                    {NOTIFICATIONS.map(n => (
                      <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 12, background: n.read ? 'transparent' : 'rgba(37,99,235,0.05)', cursor: 'pointer' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: TYPE_COLOR[n.type] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLOR[n.type] }}/>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 2 }}>{n.title}</p>
                          <p style={{ fontSize: 12, color: '#94A3B8' }}>{n.desc}</p>
                          <p style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{n.time}</p>
                        </div>
                      </div>
                    ))}
                    <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <button style={{ background: 'none', border: 'none', color: '#60A5FA', fontSize: 13, cursor: 'pointer' }}>View all notifications</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div style={{ position: 'relative' }} ref={profileRef}>
                <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700 }}>V</div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#F1F5F9' }} className="hide-mobile">Vinod</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                 {profileOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 46, width: 200, borderRadius: 16, background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', zIndex: 200, overflow: 'hidden' }}>
                    {[
                      { label: 'My Reports', icon: '📋', href: 'http://localhost:3002/dashboard' },
                      { label: 'Settings', icon: '⚙️', href: 'http://localhost:3002/dashboard' },
                      { label: 'Help & Support', icon: '❓', href: '#faq' },
                      { label: 'Sign Out', icon: '🚪', href: 'http://localhost:3002/login' }
                    ].map(item => (
                      <a key={item.label} href={item.href} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', fontSize: 14, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s', textDecoration: 'none', boxSizing: 'border-box' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#F1F5F9'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94A3B8'; }}
                        onClick={() => setProfileOpen(false)}>
                        <span>{item.icon}</span>{item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button onClick={onReportClick} className="btn-primary hide-mobile" style={{ fontSize: 13, padding: '9px 18px' }}>
                Report Issue
              </button>

              {/* Hamburger */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="show-mobile"
                style={{ ...iconBtnStyle, flexDirection: 'column', gap: 4, padding: '10px' }}>
                <span style={{ display: 'block', width: 18, height: 2, background: '#94A3B8', transition: 'all 0.3s', transform: mobileOpen ? 'rotate(45deg) translate(4px,4px)' : '' }}/>
                <span style={{ display: 'block', height: 2, background: '#94A3B8', transition: 'all 0.3s', width: mobileOpen ? '0' : '18px', opacity: mobileOpen ? 0 : 1 }}/>
                <span style={{ display: 'block', width: 18, height: 2, background: '#94A3B8', transition: 'all 0.3s', transform: mobileOpen ? 'rotate(-45deg) translate(4px,-4px)' : '' }}/>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div style={{ maxHeight: mobileOpen ? 400 : 0, overflow: 'hidden', transition: 'max-height 0.5s ease', background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(24px)', borderTop: mobileOpen ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
          <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#94A3B8', textDecoration: 'none' }}>
                {link.label}
              </a>
            ))}
            <button onClick={() => { setMobileOpen(false); onReportClick?.(); }} className="btn-primary" style={{ marginTop: 8, width: '100%' }}>
              Report Issue
            </button>
          </div>
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
          .hide-mobile { display: flex !important; }
          .desktop-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}
