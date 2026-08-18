'use client';
import { useState, useEffect } from 'react';

const CATEGORIES = [
  { id: 'pothole', label: 'Pothole', icon: '🕳️', color: '#EF4444' },
  { id: 'streetlight', label: 'Streetlight', icon: '💡', color: '#F59E0B' },
  { id: 'water_leakage', label: 'Water Leak', icon: '💧', color: '#06B6D4' },
  { id: 'garbage_overflow', label: 'Garbage', icon: '🗑️', color: '#22C55E' },
  { id: 'public_property', label: 'Public Property', icon: '🏛️', color: '#8B5CF6' },
  { id: 'road_damage', label: 'Road Damage', icon: '🛤️', color: '#F59E0B' },
  { id: 'tree_fallen', label: 'Fallen Tree', icon: '🌳', color: '#22C55E' },
  { id: 'traffic_signal', label: 'Traffic Signal', icon: '🚦', color: '#EF4444' },
  { id: 'other', label: 'Other Issue', icon: '⚠️', color: '#94A3B8' },
];

const PRIORITIES = [
  { id: 'low', label: 'Low', desc: 'Minor inconvenience', color: '#22C55E' },
  { id: 'medium', label: 'Medium', desc: 'Affects daily life', color: '#F59E0B' },
  { id: 'high', label: 'High', desc: 'Safety concern', color: '#EF4444' },
  { id: 'critical', label: 'Critical', desc: 'Immediate danger', color: '#DC2626' },
];

const STEPS = ['Category', 'Details', 'Location', 'Review'];

export default function ReportModal({ isOpen, onClose, onSubmit }) {
  const [step, setStep] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    priority: 'medium',
    title: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    image: null,
    imagePreview: '',
    anonymous: false,
  });
  const [errors, setErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(0); setScanning(false); setSuccess(false);
        setFormData({ category: '', priority: 'medium', title: '', description: '', address: '', latitude: '', longitude: '', image: null, imagePreview: '', anonymous: false });
        setErrors({});
      }, 400);
    }
  }, [isOpen]);

  const detectLocation = () => {
    setLocationLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({ ...prev, latitude: pos.coords.latitude.toFixed(5), longitude: pos.coords.longitude.toFixed(5) }));
        setLocationLoading(false);
      },
      () => {
        setFormData(prev => ({ ...prev, latitude: '13.08268', longitude: '80.27068' }));
        setLocationLoading(false);
      },
      { timeout: 6000 }
    );
  };

  const validate = () => {
    const e = {};
    if (step === 0 && !formData.category) e.category = 'Please select a category';
    if (step === 1) {
      if (!formData.title.trim()) e.title = 'Title is required';
      if (!formData.description.trim()) e.description = 'Description is required';
    }
    if (step === 2 && !formData.address.trim()) e.address = 'Address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setScanning(true);
    await new Promise(r => setTimeout(r, 2800));
    setScanning(false);
    setSuccess(true);
    const catObj = CATEGORIES.find(c => c.id === formData.category);
    onSubmit?.({
      id: Math.floor(Math.random() * 9000) + 1000,
      title: formData.title,
      type: formData.category,
      icon: catObj?.icon || '📍',
      status: 'live',
      priority: formData.priority,
      description: formData.description,
      address: formData.address,
      latitude: parseFloat(formData.latitude) || 13.08268,
      longitude: parseFloat(formData.longitude) || 80.27068,
      x: 40 + Math.random() * 30,
      y: 30 + Math.random() * 40,
      upvotes: 1,
      time: 'Just now',
      dept: 'Auto-assigned',
    });
    setTimeout(() => onClose(), 3500);
  };

  if (!isOpen) return null;

  const selectedCat = CATEGORIES.find(c => c.id === formData.category);

  // Overlay
  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
    animation: 'fadeIn 0.2s ease',
  };

  const modalStyle = {
    width: '100%', maxWidth: 560,
    background: 'rgba(15,23,42,0.98)',
    backdropFilter: 'blur(40px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 28,
    overflow: 'hidden',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
    animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes successPop { 0% { transform: scale(0) } 60% { transform: scale(1.15) } 100% { transform: scale(1) } }
        @keyframes spinSvg { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>

      <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={modalStyle}>

          {/* ===== SCANNING STATE ===== */}
          {scanning && (
            <div style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: 28 }}>
                <svg style={{ animation: 'spinSvg 0.9s linear infinite' }} width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
                  <path d="M32 4 A28 28 0 0 1 60 32" stroke="#2563EB" strokeWidth="6" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', marginBottom: 10 }}>Processing Your Report</h3>
              <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 28 }}>AI is categorizing and routing your issue to the correct department...</p>
              {['Analyzing report with Gemini AI...', 'Assigning priority score...', 'Routing to Roads Department...', 'Sending notifications...'].map((msg, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, opacity: 0.7 + i * 0.075, padding: '8px 20px', borderRadius: 10, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', width: '100%', maxWidth: 340 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB', flexShrink: 0 }}/>
                  <span style={{ fontSize: 13, color: '#94A3B8' }}>{msg}</span>
                </div>
              ))}
            </div>
          )}

          {/* ===== SUCCESS STATE ===== */}
          {success && !scanning && (
            <div style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, animation: 'successPop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#F1F5F9', marginBottom: 12 }}>Issue Reported! 🎉</h3>
              <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 20, lineHeight: 1.6 }}>
                Your report <strong style={{ color: '#F1F5F9' }}>#{Math.floor(Math.random()*9000)+1000}</strong> has been submitted and is now live on the map. The Roads Department has been notified.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ padding: '4px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: 'rgba(34,197,94,0.15)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.3)' }}>✓ Live on Map</span>
                <span style={{ padding: '4px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: 'rgba(37,99,235,0.15)', color: '#60A5FA', border: '1px solid rgba(37,99,235,0.3)' }}>📧 Email Sent</span>
                <span style={{ padding: '4px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: 'rgba(139,92,246,0.15)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)' }}>🤖 AI Routed</span>
              </div>
              <p style={{ fontSize: 12, color: '#64748B', marginTop: 20 }}>Closing automatically...</p>
            </div>
          )}

          {/* ===== NORMAL FORM ===== */}
          {!scanning && !success && (
            <>
              {/* Header */}
              <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#F1F5F9' }}>Report Civic Issue</h2>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
                  </div>
                  <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', color: '#94A3B8', fontSize: 18 }}>✕</button>
                </div>

                {/* Progress */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {STEPS.map((s, i) => (
                    <div key={i} style={{ flex: 1 }}>
                      <div style={{ height: 4, borderRadius: 2, background: i <= step ? 'linear-gradient(90deg,#2563EB,#8B5CF6)' : 'rgba(255,255,255,0.08)', transition: 'all 0.4s ease' }}/>
                      <p style={{ fontSize: 10, color: i === step ? '#60A5FA' : '#64748B', marginTop: 4, fontWeight: i === step ? 600 : 400, textAlign: 'center' }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

                {/* STEP 0 — Category */}
                {step === 0 && (
                  <div>
                    <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 20 }}>What type of civic issue are you reporting?</p>
                    {errors.category && <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>⚠ {errors.category}</p>}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      {CATEGORIES.map(cat => (
                        <button key={cat.id} onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                          style={{ padding: '16px 12px', borderRadius: 14, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease', border: formData.category === cat.id ? `2px solid ${cat.color}` : '1px solid rgba(255,255,255,0.10)', background: formData.category === cat.id ? `${cat.color}15` : 'rgba(255,255,255,0.03)', transform: formData.category === cat.id ? 'scale(1.04)' : 'scale(1)' }}>
                          <div style={{ fontSize: 28, marginBottom: 6 }}>{cat.icon}</div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: formData.category === cat.id ? '#F1F5F9' : '#94A3B8', lineHeight: 1.3 }}>{cat.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 1 — Details */}
                {step === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', display: 'block', marginBottom: 8 }}>Issue Title <span style={{ color: '#EF4444' }}>*</span></label>
                      <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder={`e.g. Large ${selectedCat?.label || 'pothole'} near main gate`}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: errors.title ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#F1F5F9', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
                      {errors.title && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.title}</p>}
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', display: 'block', marginBottom: 8 }}>Description <span style={{ color: '#EF4444' }}>*</span></label>
                      <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Describe the issue in detail — severity, duration, and any safety concerns..."
                        style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: errors.description ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#F1F5F9', fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }}/>
                      {errors.description && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.description}</p>}
                    </div>
                    {/* Priority */}
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', display: 'block', marginBottom: 8 }}>Priority Level</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                        {PRIORITIES.map(p => (
                          <button key={p.id} onClick={() => setFormData(prev => ({ ...prev, priority: p.id }))}
                            style={{ padding: '10px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center', border: formData.priority === p.id ? `1px solid ${p.color}` : '1px solid rgba(255,255,255,0.08)', background: formData.priority === p.id ? `${p.color}15` : 'rgba(255,255,255,0.03)', transition: 'all 0.2s' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: p.color, marginBottom: 2 }}>{p.label}</div>
                            <div style={{ fontSize: 10, color: '#64748B' }}>{p.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Image */}
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', display: 'block', marginBottom: 8 }}>Photo Evidence <span style={{ fontSize: 11, color: '#64748B', fontWeight: 400 }}>(Optional)</span></label>
                      {formData.imagePreview ? (
                        <div style={{ position: 'relative' }}>
                          <img src={formData.imagePreview} alt="preview" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12 }}/>
                          <button onClick={() => setFormData(p => ({ ...p, image: null, imagePreview: '' }))} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 6, background: 'rgba(239,68,68,0.9)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14 }}>✕</button>
                        </div>
                      ) : (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 100, borderRadius: 12, border: '2px dashed rgba(255,255,255,0.12)', cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(255,255,255,0.02)' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.4)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}>
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setFormData(p => ({ ...p, image: file, imagePreview: reader.result }));
                              reader.readAsDataURL(file);
                            }
                          }}/>
                          <span style={{ fontSize: 28, marginBottom: 6 }}>📸</span>
                          <span style={{ fontSize: 12, color: '#94A3B8' }}>Click to upload photo</span>
                        </label>
                      )}
                    </div>
                    {/* Anonymous */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.anonymous} onChange={e => setFormData(p => ({ ...p, anonymous: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#2563EB' }}/>
                      <span style={{ fontSize: 13, color: '#94A3B8' }}>Submit anonymously</span>
                    </label>
                  </div>
                )}

                {/* STEP 2 — Location */}
                {step === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <button onClick={detectLocation} disabled={locationLoading}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px', borderRadius: 14, border: '1px solid rgba(37,99,235,0.4)', background: 'rgba(37,99,235,0.1)', cursor: 'pointer', color: '#60A5FA', fontWeight: 600, fontSize: 14, transition: 'all 0.2s' }}>
                      {locationLoading ? (
                        <>
                          <svg style={{ animation: 'spinSvg 0.8s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                          Detecting location...
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>
                          📍 Detect My Location
                        </>
                      )}
                    </button>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', display: 'block', marginBottom: 8 }}>Street Address <span style={{ color: '#EF4444' }}>*</span></label>
                      <input value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} placeholder="Enter the exact address or nearby landmark"
                        style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: errors.address ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#F1F5F9', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
                      {errors.address && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.address}</p>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[{ key: 'latitude', label: 'Latitude', ph: '13.08268' }, { key: 'longitude', label: 'Longitude', ph: '80.27068' }].map(f => (
                        <div key={f.key}>
                          <label style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', display: 'block', marginBottom: 8 }}>{f.label}</label>
                          <input type="number" step="any" value={formData[f.key]} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#F1F5F9', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
                        </div>
                      ))}
                    </div>
                    {formData.latitude && (
                      <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 13, color: '#4ADE80' }}>
                        ✓ Location set: {formData.latitude}°N, {formData.longitude}°E
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3 — Review */}
                {step === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 8 }}>Review your report before submitting.</p>
                    {/* Category */}
                    <div style={{ padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p style={{ fontSize: 11, color: '#64748B', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Category</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{selectedCat?.icon}</span>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9' }}>{selectedCat?.label}</span>
                        <span style={{ marginLeft: 'auto', padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: PRIORITIES.find(p => p.id === formData.priority)?.color + '20', color: PRIORITIES.find(p => p.id === formData.priority)?.color }}>{formData.priority}</span>
                      </div>
                    </div>
                    {/* Title & Desc */}
                    <div style={{ padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p style={{ fontSize: 11, color: '#64748B', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Details</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', marginBottom: 6 }}>{formData.title}</p>
                      <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>{formData.description}</p>
                    </div>
                    {/* Location */}
                    <div style={{ padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p style={{ fontSize: 11, color: '#64748B', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Location</p>
                      <p style={{ fontSize: 14, color: '#F1F5F9', marginBottom: 4 }}>{formData.address}</p>
                      {formData.latitude && <p style={{ fontSize: 12, color: '#94A3B8' }}>{formData.latitude}°N, {formData.longitude}°E</p>}
                    </div>
                    {formData.imagePreview && (
                      <img src={formData.imagePreview} alt="preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12 }}/>
                    )}
                    <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', fontSize: 13, color: '#60A5FA', display: 'flex', alignItems: 'center', gap: 8 }}>
                      🤖 AI will auto-route to the appropriate department after submission.
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 28px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 10 }}>
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    ← Back
                  </button>
                )}
                <button onClick={next} style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#2563EB,#8B5CF6)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(37,99,235,0.4)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 8px 24px rgba(37,99,235,0.5)'; }}
                  onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(37,99,235,0.4)'; }}>
                  {step === 3 ? '🚀 Submit Report' : `Next: ${STEPS[step + 1]} →`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
