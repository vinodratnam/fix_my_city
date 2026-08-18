'use client';
import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MONTHLY = [
  { month: 'Aug', reported: 2100, resolved: 1800, pending: 300 },
  { month: 'Sep', reported: 2400, resolved: 2100, pending: 300 },
  { month: 'Oct', reported: 2200, resolved: 2050, pending: 150 },
  { month: 'Nov', reported: 2900, resolved: 2600, pending: 300 },
  { month: 'Dec', reported: 3100, resolved: 2900, pending: 200 },
  { month: 'Jan', reported: 3400, resolved: 3200, pending: 200 },
];

const CATEGORY_DATA = [
  { name: 'Potholes', value: 34, color: '#EF4444' },
  { name: 'Streetlights', value: 22, color: '#F59E0B' },
  { name: 'Water Leaks', value: 18, color: '#06B6D4' },
  { name: 'Garbage', value: 14, color: '#22C55E' },
  { name: 'Others', value: 12, color: '#8B5CF6' },
];

const DEPT_DATA = [
  { dept: 'Roads', resolved: 89, pending: 23, avg: 3.1 },
  { dept: 'Water', resolved: 67, pending: 12, avg: 2.4 },
  { dept: 'Electric', resolved: 54, pending: 18, avg: 4.2 },
  { dept: 'Sanitation', resolved: 45, pending: 8, avg: 1.9 },
  { dept: 'Parks', resolved: 32, pending: 5, avg: 5.1 },
];

const KPIS = [
  { label: 'Total Issues', value: '47,291', delta: '+12%', color: '#2563EB', icon: '📍', bg: 'rgba(37,99,235,0.12)' },
  { label: 'Resolved', value: '38,540', delta: '+18%', color: '#22C55E', icon: '✅', bg: 'rgba(34,197,94,0.12)' },
  { label: 'Resolution Rate', value: '94.2%', delta: '+2.1%', color: '#8B5CF6', icon: '📈', bg: 'rgba(139,92,246,0.12)' },
  { label: 'Avg Response', value: '72hrs', delta: '-24%', color: '#F59E0B', icon: '⚡', bg: 'rgba(245,158,11,0.12)' },
];

const CustomTooltipArea = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px' }}>
      <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color, marginBottom: 4 }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsDashboard() {
  const [tab, setTab] = useState('trends');
  const [liveResolved, setLiveResolved] = useState(38540);
  const [aiInsight, setAiInsight] = useState(0);

  const INSIGHTS = [
    '🔴 Sector 7 shows 42% surge in pothole reports — schedule preventive maintenance.',
    '💧 Water leakage in Block C-12 has 156 upvotes — escalate to emergency.',
    '✅ Roads Dept performance improved by 18% this quarter — replicate strategy.',
    '⚡ Streetlight issues peak on Mondays — optimize crew scheduling.',
  ];

  useEffect(() => {
    const t1 = setInterval(() => setLiveResolved(v => v + Math.floor(Math.random() * 2)), 8000);
    const t2 = setInterval(() => setAiInsight(v => (v + 1) % INSIGHTS.length), 5000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const TABS = [
    { id: 'trends', label: '📈 Trends' },
    { id: 'categories', label: '🥧 Categories' },
    { id: 'departments', label: '🏛️ Departments' },
  ];

  return (
    <section id="analytics" className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="tag tag-blue" style={{ display: 'inline-flex', marginBottom: 16 }}>
            <span>📊</span> Live Analytics
          </div>
          <h2 className="section-title">
            <span className="gradient-text">AI-Powered</span> Civic Dashboard
          </h2>
          <p className="section-subtitle">Real-time metrics on issue resolution, department performance, and city-wide civic health.</p>
        </div>

        {/* AI Insight Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderRadius: 14, marginBottom: 32, background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>🤖</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, color: '#A78BFA', fontWeight: 600, marginBottom: 2 }}>AI Insight (Auto-updating)</p>
            <p style={{ fontSize: 13, color: '#F1F5F9', lineHeight: 1.4, transition: 'all 0.5s ease' }}>{INSIGHTS[aiInsight]}</p>
          </div>
          <span className="tag tag-purple" style={{ flexShrink: 0, fontSize: 11 }}>Live</span>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }} className="kpi-grid">
          {KPIS.map((k, i) => (
            <div key={i} style={{ background: k.bg, border: `1px solid ${k.color}25`, borderRadius: 20, padding: '20px 24px', transition: 'all 0.3s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = k.color + '60'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = k.color + '25'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{k.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: k.delta.startsWith('+') ? '#22C55E' : '#EF4444', padding: '3px 8px', borderRadius: 6, background: (k.delta.startsWith('+') ? '#22C55E' : '#EF4444') + '15' }}>{k.delta}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: k.color, marginBottom: 4, fontFamily: 'monospace' }}>
                {k.label === 'Resolved' ? liveResolved.toLocaleString() : k.value}
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>{k.label}</div>
            </div>
          ))}
        </div>
        <style>{`
          @media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(2,1fr) !important; } }
          @media (max-width: 480px) { .kpi-grid { grid-template-columns: repeat(2,1fr) !important; } }
        `}</style>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(255,255,255,0.04)', padding: 6, borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', width: 'fit-content' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', outline: 'none', transition: 'all 0.25s ease',
                background: tab === t.id ? 'linear-gradient(135deg,#2563EB,#8B5CF6)' : 'transparent',
                color: tab === t.id ? 'white' : '#94A3B8',
                boxShadow: tab === t.id ? '0 4px 16px rgba(37,99,235,0.4)' : 'none',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Chart area */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 24, padding: 32 }}>

          {/* Trends */}
          {tab === 'trends' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Monthly Issue Trends</h3>
                <span className="tag tag-green">Last 6 months</span>
              </div>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MONTHLY} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gr1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gr2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="month" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }}/>
                    <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }}/>
                    <Tooltip content={<CustomTooltipArea/>}/>
                    <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 13 }}/>
                    <Area type="monotone" dataKey="reported" name="Reported" stroke="#2563EB" strokeWidth={2.5} fill="url(#gr1)"/>
                    <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#22C55E" strokeWidth={2.5} fill="url(#gr2)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Categories */}
          {tab === 'categories' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Issue Categories Breakdown</h3>
                <span className="tag tag-blue">All time</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }} className="cat-layout">
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={4} dataKey="value" stroke="none">
                        {CATEGORY_DATA.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#F1F5F9', fontSize: 13 }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {CATEGORY_DATA.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: c.color, flexShrink: 0 }}/>
                      <span style={{ flex: 1, fontSize: 13, color: '#94A3B8' }}>{c.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: c.color }}>{c.value}%</span>
                      <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${c.value * 3}%`, background: c.color, borderRadius: 3 }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <style>{`@media (max-width: 640px) { .cat-layout { grid-template-columns: 1fr !important; } }`}</style>
            </div>
          )}

          {/* Departments */}
          {tab === 'departments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Department Performance</h3>
                <span className="tag tag-orange">This Quarter</span>
              </div>
              <div style={{ height: 280, marginBottom: 24 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEPT_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="dept" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }}/>
                    <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }}/>
                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#F1F5F9', fontSize: 13 }}/>
                    <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 13 }}/>
                    <Bar dataKey="resolved" name="Resolved" fill="#22C55E" radius={[6,6,0,0]}/>
                    <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[6,6,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Department table */}
              <div style={{ overflow: 'hidden', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '10px 16px', background: 'rgba(255,255,255,0.04)', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                  {['Department','Resolved','Pending','Avg Days'].map(h => <span key={h}>{h}</span>)}
                </div>
                {DEPT_DATA.map((d,i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                    <span style={{ color: '#F1F5F9', fontWeight: 500 }}>{d.dept}</span>
                    <span style={{ color: '#22C55E', fontWeight: 600 }}>{d.resolved}</span>
                    <span style={{ color: '#F59E0B' }}>{d.pending}</span>
                    <span style={{ color: '#94A3B8' }}>{d.avg}d</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
