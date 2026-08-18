'use client';
import { useState } from 'react';

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Ward Councillor, Mumbai', avatar: '👩‍💼', rating: 5, text: 'Fix My Insights transformed how we handle citizen complaints. Response time dropped from 14 days to just 3. Our satisfaction scores went up 40% in the first month.', badge: 'Verified Official', color: '#2563EB' },
  { name: 'Rajesh Kumar', role: 'Resident, Bengaluru', avatar: '👨', rating: 5, text: 'I reported a dangerous pothole on my street and it was fixed in 4 days! The real-time tracking kept me informed at every step. This is what digital governance should look like.', badge: 'Top Reporter', color: '#22C55E' },
  { name: 'Dr. Anita Patel', role: 'Smart City Director, Pune', avatar: '👩‍🔬', rating: 5, text: 'The AI analytics helped us identify systemic infrastructure failures before they became crises. We prevented 3 major water main failures using predictive insights alone.', badge: 'Government Partner', color: '#8B5CF6' },
  { name: 'Mohammed Ali', role: 'Civil Engineer, Chennai', avatar: '👷', rating: 5, text: 'As a civil engineer, the data quality is exceptional. The GPS accuracy, photo evidence, and issue categorization make fieldwork so much more efficient for our team.', badge: 'Technical Expert', color: '#06B6D4' },
  { name: 'Sunita Reddy', role: 'Community Leader, Hyderabad', avatar: '👩', rating: 5, text: 'We organized our neighborhood to use the app together. Collective reporting got our entire street resurfaced in 2 weeks. Community power amplified by technology!', badge: 'Community Hero', color: '#F59E0B' },
  { name: 'Karthik Nair', role: 'IT Professional, Kochi', avatar: '👨‍💻', rating: 5, text: 'The UX is incredibly intuitive. Reported 12 issues in my area — 10 resolved already. The blockchain verification makes the system tamper-proof and accountable.', badge: 'Power User', color: '#EF4444' },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);

  return (
    <section id="testimonials" className="section" style={{ background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}/>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="section-header">
          <div className="tag tag-purple" style={{ display: 'inline-flex', marginBottom: 16 }}>
            <span>⭐</span> Testimonials
          </div>
          <h2 className="section-title">
            Trusted by Citizens &<br/><span className="gradient-text">Government Alike</span>
          </h2>
          <p className="section-subtitle">
            Real stories from citizens, officials, and engineers using Fix My Insights across India.
          </p>
        </div>

        {/* Featured testimonial */}
        <div style={{ maxWidth: 800, margin: '0 auto 48px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${TESTIMONIALS[active].color}30`, borderRadius: 28, padding: '40px 48px', transition: 'all 0.5s ease', position: 'relative', overflow: 'hidden' }} className="featured-card">
          {/* Glow */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: `radial-gradient(circle at top right, ${TESTIMONIALS[active].color}12, transparent)`, pointerEvents: 'none' }}/>
          {/* Stars */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
            {[...Array(5)].map((_,i) => <span key={i} style={{ color: '#F59E0B', fontSize: 18 }}>★</span>)}
          </div>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#F1F5F9', lineHeight: 1.7, marginBottom: 28, fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
            &ldquo;{TESTIMONIALS[active].text}&rdquo;
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: TESTIMONIALS[active].color + '20', border: `2px solid ${TESTIMONIALS[active].color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {TESTIMONIALS[active].avatar}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#F1F5F9', fontSize: 15 }}>{TESTIMONIALS[active].name}</p>
              <p style={{ fontSize: 13, color: '#94A3B8' }}>{TESTIMONIALS[active].role}</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: TESTIMONIALS[active].color + '15', color: TESTIMONIALS[active].color, border: `1px solid ${TESTIMONIALS[active].color}30` }}>
                ✓ {TESTIMONIALS[active].badge}
              </span>
            </div>
          </div>

          <style>{`@media (max-width: 640px) { .featured-card { padding: 24px !important; } }`}</style>
        </div>

        {/* Selector cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, maxWidth: 800, margin: '0 auto' }} className="testimonial-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} onClick={() => setActive(i)}
              style={{ padding: '14px 10px', borderRadius: 16, cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease', border: active === i ? `1px solid ${t.color}50` : '1px solid rgba(255,255,255,0.07)', background: active === i ? `${t.color}10` : 'rgba(255,255,255,0.03)', transform: active === i ? 'translateY(-4px)' : 'translateY(0)' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{t.avatar}</div>
              <p style={{ fontSize: 10, fontWeight: 600, color: active === i ? '#F1F5F9' : '#64748B', lineHeight: 1.3 }}>{t.name.split(' ')[0]}</p>
            </div>
          ))}
        </div>
        <style>{`
          @media (max-width: 640px) { .testimonial-grid { grid-template-columns: repeat(3,1fr) !important; } }
        `}</style>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 56, flexWrap: 'wrap' }}>
          {[{ v:'128+', l:'Cities' }, { v:'4.9/5', l:'App Rating' }, { v:'92%', l:'Would Recommend' }, { v:'47K+', l:'Issues Reported' }].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#F1F5F9', marginBottom: 4 }}>{s.v}</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
