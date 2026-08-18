import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: '',
  });
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const isAdmin = selectedRole === 'admin';

  const theme = {
    primary:      isAdmin ? '#7c3aed' : '#2563eb',
    primaryLight: isAdmin ? '#f5f3ff' : '#eff6ff',
    primaryBorder:isAdmin ? '#ddd6fe' : '#dbeafe',
    primaryText:  isAdmin ? '#7c3aed' : '#2563eb',
    btn:          isAdmin ? '#7c3aed' : '#2563eb',
    btnHover:     isAdmin ? '#6d28d9' : '#1d4ed8',
    ring:         isAdmin ? '#7c3aed' : '#2563eb',
    gradient:     isAdmin
      ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
      : 'linear-gradient(135deg, #2563eb, #06b6d4)',
    shadow:       isAdmin
      ? 'rgba(124,58,237,0.35)'
      : 'rgba(37,99,235,0.35)',
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    if (role === 'citizen') {
      setFormData(prev => ({ ...prev, adminCode: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (isAdmin && !formData.adminCode.trim()) {
      setError('Admin secret code is required to register as Admin');
      setLoading(false);
      return;
    }

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      selectedRole,
      formData.adminCode
    );

    if (result.success) {
      navigate(isAdmin ? '/admin' : '/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '11px 14px 11px 42px',
    fontSize: '14px',
    color: '#0f172a',
    background: '#fff',
    outline: 'none',
    transition: 'border 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px', fontFamily: "'Inter', 'Segoe UI', sans-serif"
    }}>

      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* ── Brand Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 20,
            background: theme.gradient,
            boxShadow: `0 8px 24px ${theme.shadow}`,
            marginBottom: 16
          }}>
            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 32 }}>
              {isAdmin ? 'admin_panel_settings' : 'account_circle'}
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Create Account
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>
            Join CivicWatch to report and track infrastructure issues
          </p>
        </div>

        {/* ── Main Card ── */}
        <div style={{
          background: 'white',
          borderRadius: 24,
          boxShadow: '0 4px 40px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.06)',
          overflow: 'hidden'
        }}>

          {/* Role Selector Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #f1f5f9' }}>
            {[
              { role: 'citizen', label: '👤 Citizen',  desc: 'Report Issues' },
              { role: 'admin',   label: '🛡️ Admin',    desc: 'Manage Issues' },
            ].map(({ role, label, desc }) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelect(role)}
                style={{
                  padding: '16px 12px',
                  border: 'none',
                  borderBottom: selectedRole === role ? `3px solid ${theme.primary}` : '3px solid transparent',
                  background: selectedRole === role ? theme.primaryLight : 'white',
                  color: selectedRole === role ? theme.primaryText : '#94a3b8',
                  fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
                }}
              >
                {label}
                <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.75 }}>{desc}</span>
              </button>
            ))}
          </div>

          <div style={{ padding: '28px 28px 24px' }}>

            {/* Error */}
            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 18, color: '#94a3b8'
                  }}>person</span>
                  <input
                    type="text" name="name" required
                    placeholder="Enter your full name"
                    value={formData.name} onChange={handleChange}
                    style={inputStyle}
                    onFocus={e => { e.target.style.border = `1.5px solid ${theme.ring}`; e.target.style.boxShadow = `0 0 0 3px ${theme.primaryLight}`; }}
                    onBlur={e => { e.target.style.border = '1.5px solid #e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 18, color: '#94a3b8'
                  }}>email</span>
                  <input
                    type="email" name="email" required
                    placeholder="Enter your email"
                    value={formData.email} onChange={handleChange}
                    style={inputStyle}
                    onFocus={e => { e.target.style.border = `1.5px solid ${theme.ring}`; e.target.style.boxShadow = `0 0 0 3px ${theme.primaryLight}`; }}
                    onBlur={e => { e.target.style.border = '1.5px solid #e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 18, color: '#94a3b8'
                  }}>lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'} name="password" required
                    placeholder="Create a password (min 6 chars)"
                    value={formData.password} onChange={handleChange}
                    style={{ ...inputStyle, paddingRight: 42 }}
                    onFocus={e => { e.target.style.border = `1.5px solid ${theme.ring}`; e.target.style.boxShadow = `0 0 0 3px ${theme.primaryLight}`; }}
                    onBlur={e => { e.target.style.border = '1.5px solid #e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    color: '#94a3b8', display: 'flex'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 18, color: '#94a3b8'
                  }}>lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'} name="confirmPassword" required
                    placeholder="Confirm your password"
                    value={formData.confirmPassword} onChange={handleChange}
                    style={inputStyle}
                    onFocus={e => { e.target.style.border = `1.5px solid ${theme.ring}`; e.target.style.boxShadow = `0 0 0 3px ${theme.primaryLight}`; }}
                    onBlur={e => { e.target.style.border = '1.5px solid #e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Admin Secret Code — only when Admin tab selected */}
              {isAdmin && (
                <div style={{
                  background: '#faf5ff', border: '1.5px solid #ddd6fe',
                  borderRadius: 12, padding: 16
                }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#7c3aed', marginBottom: 4 }}>
                    🔑 Admin Secret Code <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <p style={{ color: '#6d28d9', fontSize: 11, marginBottom: 10, lineHeight: 1.5 }}>
                    Contact your system administrator to get this code. Without it, admin registration is not allowed.
                  </p>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showAdminCode ? 'text' : 'password'} name="adminCode"
                      placeholder="Enter admin secret code"
                      value={formData.adminCode} onChange={handleChange}
                      style={{
                        ...inputStyle,
                        paddingLeft: 14,
                        paddingRight: 42,
                        border: '1.5px solid #ddd6fe',
                        background: '#f5f3ff',
                        color: '#7c3aed',
                        letterSpacing: showAdminCode ? 'normal' : '3px'
                      }}
                      onFocus={e => { e.target.style.border = '1.5px solid #7c3aed'; e.target.style.boxShadow = '0 0 0 3px #f5f3ff'; }}
                      onBlur={e => { e.target.style.border = '1.5px solid #ddd6fe'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button type="button" onClick={() => setShowAdminCode(!showAdminCode)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      color: '#7c3aed', display: 'flex'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        {showAdminCode ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px',
                  background: loading ? '#94a3b8' : theme.btn,
                  border: 'none', borderRadius: 12,
                  color: '#fff', fontWeight: 700, fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: 4, transition: 'all 0.2s',
                  boxShadow: `0 4px 14px ${theme.shadow}`
                }}
                onMouseOver={e => { if (!loading) e.target.style.background = theme.btnHover; }}
                onMouseOut={e => { if (!loading) e.target.style.background = theme.btn; }}
              >
                {loading
                  ? '⏳ Creating account...'
                  : `Create ${isAdmin ? '🛡️ Admin' : '👤 Citizen'} Account`}
              </button>
            </form>

            {/* Divider + Login Link */}
            <div style={{ marginTop: 24, textAlign: 'center', position: 'relative' }}>
              <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: 16 }} />
              <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: theme.primaryText, fontWeight: 700, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
