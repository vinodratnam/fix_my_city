'use client';
import { useState } from 'react';

const FAQS = [
  { q: 'How does the AI categorization work?', a: 'Our Gemini AI model analyzes submitted text and images to automatically categorize issues by type (pothole, water leak, etc.), assign priority levels, and route them to the appropriate municipal department — all within seconds of submission.' },
  { q: 'Is my location data kept private?', a: 'Yes. Location data is used only for mapping and routing issues to the correct department. It is stored encrypted and never sold. You can opt for approximate location if exact GPS makes you uncomfortable.' },
  { q: 'What happens after I report an issue?', a: 'You\'ll receive an email/SMS confirmation instantly. The AI categorizes it, the relevant department is notified, and you can track real-time progress via your dashboard. Average first response is 6 hours.' },
  { q: 'Can I report anonymously?', a: 'Yes! Anonymous reporting is fully supported. However, creating an account lets you track your reports, receive status notifications, and earn civic contribution badges.' },
  { q: 'How are issues prioritized?', a: 'Issues are scored on severity (safety risk), recency, upvote count, and location-based urgency. Critical safety issues like flooded roads or downed power lines get instant escalation.' },
  { q: 'Is Fix My Insights available for all Indian cities?', a: 'Currently live in 128 cities across 18 states. We onboard new cities monthly. Contact us if you want your city added — municipal partnership applications take 2–4 weeks.' },
  { q: 'Can government officials use this for their ward?', a: 'Absolutely! Officials get a dedicated admin panel with bulk management tools, department assignment, performance dashboards, and direct citizen messaging. Apply for official access on our website.' },
  { q: 'What is the blockchain verification feature?', a: 'Every issue submission, status update, and resolution is recorded on a tamper-proof blockchain ledger. This ensures government accountability — no issue can be secretly deleted or manipulated.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="tag tag-cyan" style={{ display: 'inline-flex', marginBottom: 16 }}>
            <span>❓</span> FAQ
          </div>
          <h2 className="section-title">
            Frequently Asked<br/><span className="gradient-text">Questions</span>
          </h2>
          <p className="section-subtitle">
            Everything you need to know about Fix My Insights. Can't find your answer? <a href="mailto:support@fixmyinsights.gov.in" style={{ color: '#60A5FA', textDecoration: 'none' }}>Contact support →</a>
          </p>
        </div>

        {/* FAQ layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }} className="faq-layout">

          {/* FAQ list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((faq, i) => (
              <div key={i}
                style={{ border: open === i ? '1px solid rgba(37,99,235,0.4)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', background: open === i ? 'rgba(37,99,235,0.05)' : 'rgba(255,255,255,0.03)', transition: 'all 0.3s ease' }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer', gap: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', textAlign: 'left', flex: 1 }}>{faq.q}</span>
                  <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: open === i ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.06)', transition: 'all 0.3s ease' }}>
                    <span style={{ fontSize: 16, color: open === i ? '#60A5FA' : '#64748B', transform: open === i ? 'rotate(45deg)' : 'none', display: 'block', transition: 'transform 0.3s ease', lineHeight: 1 }}>+</span>
                  </div>
                </button>
                <div style={{ maxHeight: open === i ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
                  <p style={{ padding: '0 24px 20px', fontSize: 14, color: '#94A3B8', lineHeight: 1.7 }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Side contact card */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 24, padding: 32, marginBottom: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🤝</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', marginBottom: 12 }}>Still have questions?</h3>
              <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24, lineHeight: 1.6 }}>Our civic support team is available 24/7 to help citizens, officials, and partners.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href="mailto:support@fixmyinsights.gov.in" className="btn-primary" style={{ width: '100%', textAlign: 'center', justifyContent: 'center', textDecoration: 'none', padding: '12px' }}>
                  📧 Email Support
                </a>
                <a href="tel:+911800CIVIC" className="btn-secondary" style={{ width: '100%', textAlign: 'center', justifyContent: 'center', textDecoration: 'none', padding: '12px' }}>
                  📞 Call 1800-CIVIC
                </a>
                <button className="btn-secondary" style={{ width: '100%', padding: '12px' }}>
                  💬 Live Chat
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(139,92,246,0.12))', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, padding: 24 }}>
              <p style={{ fontSize: 12, color: '#64748B', marginBottom: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Support Stats</p>
              {[{ l: 'Avg Response Time', v: '< 2 hours' }, { l: 'Satisfaction Rate', v: '98.4%' }, { l: 'Issues Resolved', v: '47K+' }].map(s => (
                <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
                  <span style={{ color: '#94A3B8' }}>{s.l}</span>
                  <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) { .faq-layout { grid-template-columns: 1fr !important; } }
        `}</style>
      </div>
    </section>
  );
}
