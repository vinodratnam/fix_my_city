import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

/* ─── Colour Palettes ─────────────────────────────────────── */
const STATUS_COLORS   = { pending: '#F59E0B', in_progress: '#3B82F6', resolved: '#10B981' };
const PRIORITY_COLORS = { low: '#94A3B8', medium: '#F59E0B', high: '#F97316', urgent: '#EF4444' };
const DEPT_COLORS     = ['#6366F1', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#22D3EE'];
const TYPE_COLORS     = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

/* ─── Helpers ─────────────────────────────────────────────── */
const fmtType = (t) =>
  t ? t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Unknown';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1e293b', border: '1px solid #334155',
        borderRadius: 10, padding: '10px 16px',
      }}>
        <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#fff', fontWeight: 700, fontSize: 13, margin: '2px 0' }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ─── KPI Stat Card ───────────────────────────────────────── */
const StatCard = ({ label, value, icon, gradient, sub }) => (
  <div style={{
    background: gradient, borderRadius: 16, padding: '20px 22px',
    color: '#fff', position: 'relative', overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
  }}>
    <div style={{ position: 'absolute', top: -14, right: -14, fontSize: 64, opacity: 0.15 }}>{icon}</div>
    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.85, margin: 0 }}>{label}</p>
    <h2 style={{ fontSize: 38, fontWeight: 800, margin: '6px 0 4px', lineHeight: 1 }}>{value}</h2>
    {sub && <p style={{ fontSize: 11, opacity: 0.8, margin: 0 }}>{sub}</p>}
  </div>
);

/* ─── Chart Card Wrapper ──────────────────────────────────── */
const ChartCard = ({ title, subtitle, children, style = {} }) => (
  <div style={{
    background: '#ffffff',
    borderRadius: 16,
    padding: '22px 24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    ...style
  }}>
    <h3 style={{ color: '#0f172a', fontWeight: 700, fontSize: 15, margin: '0 0 2px' }}>{title}</h3>
    {subtitle && <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 18px' }}>{subtitle}</p>}
    {children}
  </div>
);

/* ─── Main Component ──────────────────────────────────────── */
const AnalyticsDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slaReport, setSlaReport] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/issues'),
      api.get('/issues/sla-report').catch(() => ({ data: { report: [] } }))
    ]).then(([issRes, slaRes]) => {
      setIssues(issRes.data.issues || []);
      setSlaReport(slaRes.data.report || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16
    }}>
      <div style={{
        width: 44, height: 44, border: '4px solid #e2e8f0', borderTop: '4px solid #6366F1',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading analytics…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ── Derived data ───────────────────────────────────────── */
  const total      = issues.length;
  const pending    = issues.filter(i => i.status === 'pending').length;
  const inProgress = issues.filter(i => i.status === 'in_progress').length;
  const resolved   = issues.filter(i => i.status === 'resolved').length;
  const escalated  = slaReport.filter(i => i.escalated).length;
  const overdue    = slaReport.filter(i => i.isOverdue).length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  /* Status pie */
  const statusData = [
    { name: 'Pending',     value: pending,    color: STATUS_COLORS.pending },
    { name: 'In Progress', value: inProgress, color: STATUS_COLORS.in_progress },
    { name: 'Resolved',    value: resolved,   color: STATUS_COLORS.resolved },
  ].filter(d => d.value > 0);

  /* Priority bar */
  const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };
  issues.forEach(i => { if (priorityCounts[i.priority] !== undefined) priorityCounts[i.priority]++; });
  const priorityData = Object.entries(priorityCounts).map(([name, value]) => ({
    name: fmtType(name), value, fill: PRIORITY_COLORS[name]
  }));

  /* Issue type bar */
  const typeCounts = {};
  issues.forEach(i => { typeCounts[i.type] = (typeCounts[i.type] || 0) + 1; });
  const typeData = Object.entries(typeCounts)
    .map(([type, value]) => ({ name: fmtType(type), value }))
    .sort((a, b) => b.value - a.value);

  /* Department pie */
  const deptCounts = {};
  issues.forEach(i => { const d = i.department || 'general'; deptCounts[d] = (deptCounts[d] || 0) + 1; });
  const deptData = Object.entries(deptCounts).map(([name, value]) => ({ name: fmtType(name), value }));

  /* Monthly trend */
  const monthlyCounts = {};
  issues.forEach(i => {
    const d = new Date(i.createdAt);
    const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
    monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
  });
  const monthlyData = Object.entries(monthlyCounts).map(([month, count]) => ({ month, count }));

  /* Radar data */
  const radarData = deptData.map(d => ({
    dept: d.name,
    Issues: d.value,
    Resolved: issues.filter(i => (i.department || 'general') === d.name.toLowerCase() && i.status === 'resolved').length,
  }));

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '36px 32px',
      fontFamily: "'Inter', 'Segoe UI', sans-serif"
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          boxShadow: '0 4px 16px rgba(99,102,241,0.3)'
        }}>📊</div>
        <div>
          <h1 style={{ color: '#0f172a', fontWeight: 800, fontSize: 26, margin: 0 }}>
            Analytics Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            Real-time insights — {total} total issues tracked
          </p>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Issues"  value={total}      icon="📋" gradient="linear-gradient(135deg,#6366F1,#4F46E5)" sub="All reported issues" />
        <StatCard label="Pending"       value={pending}    icon="⏳" gradient="linear-gradient(135deg,#F59E0B,#D97706)" sub="Awaiting action" />
        <StatCard label="In Progress"   value={inProgress} icon="🔧" gradient="linear-gradient(135deg,#3B82F6,#2563EB)" sub="Being repaired" />
        <StatCard label="Resolved"      value={resolved}   icon="✅" gradient="linear-gradient(135deg,#10B981,#059669)" sub={`${resolutionRate}% resolution rate`} />
        <StatCard label="SLA Breached"  value={overdue}    icon="⚠️"
          gradient={overdue > 0 ? "linear-gradient(135deg,#EF4444,#DC2626)" : "linear-gradient(135deg,#94A3B8,#64748B)"}
          sub="Overdue issues" />
        <StatCard label="Escalated"     value={escalated}  icon="🚨"
          gradient={escalated > 0 ? "linear-gradient(135deg,#F97316,#EA580C)" : "linear-gradient(135deg,#94A3B8,#64748B)"}
          sub="Auto-escalated" />
      </div>

      {/* ── Row 1: Status Donut + Priority Bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20, marginBottom: 20 }}>

        {/* Status Donut */}
        <ChartCard title="Issue Status Breakdown" subtitle="Distribution by current status">
          {statusData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    dataKey="value" paddingAngle={4} stroke="none">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {statusData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <div>
                      <p style={{ color: '#475569', fontSize: 12, fontWeight: 600, margin: 0 }}>{d.name}</p>
                      <p style={{ color: d.color, fontSize: 20, fontWeight: 800, margin: 0 }}>{d.value}</p>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10, marginTop: 4 }}>
                  <p style={{ color: '#94a3b8', fontSize: 11, margin: 0 }}>Resolution Rate</p>
                  <p style={{ color: '#10B981', fontSize: 22, fontWeight: 800, margin: 0 }}>{resolutionRate}%</p>
                </div>
              </div>
            </div>
          ) : <p style={{ color: '#94a3b8', textAlign: 'center', padding: 32 }}>No data yet</p>}
        </ChartCard>

        {/* Priority Bar */}
        <ChartCard title="Issues by Priority" subtitle="How many issues per priority level">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={priorityData} barSize={36} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Issues" radius={[6, 6, 0, 0]}>
                {priorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 2: Issue Type Bar (full width) ── */}
      <ChartCard title="Issues by Category" subtitle="Breakdown of reported issue types" style={{ marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={typeData} barSize={40} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Issues" radius={[8, 8, 0, 0]}>
              {typeData.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Row 3: Monthly Trend + Department Pie ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 20 }}>

        <ChartCard title="Issues Over Time" subtitle="Monthly issue reporting trend">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Issues" stroke="#6366F1"
                  strokeWidth={3} fill="url(#areaGrad)" dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p style={{ color: '#94a3b8', textAlign: 'center', padding: 32 }}>Not enough data yet</p>}
        </ChartCard>

        <ChartCard title="Issues by Department" subtitle="Department-wise load">
          {deptData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" outerRadius={65}
                    dataKey="value" paddingAngle={3} stroke="none">
                    {deptData.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 8 }}>
                {deptData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                    <span style={{ color: '#64748b', fontSize: 11 }}>{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p style={{ color: '#94a3b8', textAlign: 'center', padding: 32 }}>No data yet</p>}
        </ChartCard>
      </div>

      {/* ── Row 4: Radar ── */}
      {radarData.length > 0 && (
        <ChartCard title="Department Performance Radar" subtitle="Total issues vs. resolved per department" style={{ marginBottom: 20 }}>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="dept" tick={{ fill: '#64748b', fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
              <Radar name="Total Issues" dataKey="Issues"  stroke="#6366F1" fill="#6366F1" fillOpacity={0.25} />
              <Radar name="Resolved"    dataKey="Resolved" stroke="#10B981" fill="#10B981" fillOpacity={0.25} />
              <Legend wrapperStyle={{ color: '#64748b', fontSize: 12, paddingTop: 10 }} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* ── Row 5: SLA Summary ── */}
      <ChartCard title="SLA Summary" subtitle="Service Level Agreement compliance overview">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
          {[
            { label: 'Total Tracked', value: slaReport.length, color: '#6366F1', bg: '#eef2ff' },
            { label: 'Within SLA',    value: slaReport.filter(i => !i.isOverdue).length, color: '#10B981', bg: '#ecfdf5' },
            { label: 'Overdue',       value: overdue,  color: '#EF4444', bg: '#fef2f2' },
            { label: 'Due Soon',      value: slaReport.filter(i => !i.isOverdue && i.daysRemaining <= 1).length, color: '#F97316', bg: '#fff7ed' },
            { label: 'Escalated',     value: escalated, color: '#F59E0B', bg: '#fffbeb' },
          ].map((s, i) => (
            <div key={i} style={{
              background: s.bg, borderRadius: 12, padding: '16px 18px',
              border: `1px solid ${s.color}30`, textAlign: 'center'
            }}>
              <p style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 30, fontWeight: 800, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
        {slaReport.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>SLA Compliance Rate</p>
              <strong style={{ color: '#10B981', fontSize: 13 }}>
                {Math.round(((slaReport.length - overdue) / slaReport.length) * 100)}%
              </strong>
            </div>
            <div style={{ background: '#f1f5f9', borderRadius: 999, height: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 999,
                width: `${((slaReport.length - overdue) / slaReport.length) * 100}%`,
                background: 'linear-gradient(90deg,#10B981,#34D399)',
                transition: 'width 0.8s ease'
              }} />
            </div>
          </div>
        )}
      </ChartCard>

      {/* Footer */}
      <p style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 28 }}>
        CivicWatch Analytics · Refreshes on page load · {new Date().toLocaleString()}
      </p>
    </div>
  );
};

export default AnalyticsDashboard;
