import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Login = () => {
  const [viewState, setViewState] = useState('login'); // 'login' | 'forgot' | 'otp'
  const [selectedRole, setSelectedRole] = useState('citizen'); // 'citizen' | 'admin'
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpVal, setOtpVal] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  // For demo mode — shows OTP on screen when email isn't configured
  const [demoOtp, setDemoOtp] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfoMessage('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Get user from localStorage (set by AuthContext login)
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message || 'Invalid email or password');
    }
    setLoading(false);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfoMessage('');
    setDemoOtp('');

    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setInfoMessage(res.data.message || 'OTP sent to your email!');
      // If backend returns demo OTP (for local dev without SMTP), show it on screen
      if (res.data.otp) {
        setDemoOtp(res.data.otp);
      }
      setViewState('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send OTP. Please check the email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfoMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/verify-otp', {
        email: forgotEmail,
        otp: otpVal,
        newPassword,
      });
      setInfoMessage('Password reset successfully! Redirecting to login...');
      setDemoOtp('');
      setTimeout(() => {
        setViewState('login');
        setFormData({ email: forgotEmail, password: '' });
        setForgotEmail('');
        setOtpVal('');
        setNewPassword('');
        setConfirmPassword('');
        setInfoMessage('');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = selectedRole === 'admin';

  // Color theme based on selected role
  const theme = {
    primary: isAdmin ? '#7c3aed' : '#2563eb',
    primaryHover: isAdmin ? '#6d28d9' : '#1d4ed8',
    primaryLight: isAdmin ? '#f5f3ff' : '#eff6ff',
    primaryBorder: isAdmin ? '#ddd6fe' : '#dbeafe',
    primaryText: isAdmin ? '#7c3aed' : '#2563eb',
    ring: isAdmin ? 'focus:ring-purple-500' : 'focus:ring-blue-500',
    btn: isAdmin
      ? 'bg-purple-700 hover:bg-purple-800 focus:ring-purple-500'
      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    tab: isAdmin
      ? 'border-purple-600 text-purple-700 bg-purple-50'
      : 'border-blue-600 text-blue-700 bg-blue-50',
    icon: isAdmin ? '🏛️' : '👤',
    label: isAdmin ? 'Municipal Admin' : 'Citizen',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: isAdmin ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'linear-gradient(135deg, #2563eb, #06b6d4)', boxShadow: `0 8px 24px ${isAdmin ? 'rgba(124,58,237,0.35)' : 'rgba(37,99,235,0.35)'}`, marginBottom: '16px' }}>
            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '32px' }}>
              {viewState === 'login' ? (isAdmin ? 'admin_panel_settings' : 'account_circle') : viewState === 'forgot' ? 'lock_reset' : 'verified_user'}
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {viewState === 'login' && 'Sign In to CivicWatch'}
            {viewState === 'forgot' && 'Reset Your Password'}
            {viewState === 'otp' && 'Verify OTP Code'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>
            {viewState === 'login' && 'Community Infrastructure Monitoring Platform'}
            {viewState === 'forgot' && 'Enter your email to receive a secure OTP'}
            {viewState === 'otp' && `OTP sent to ${forgotEmail}`}
          </p>
        </div>

        {/* Main Card */}
        <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 40px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>

          {/* Role Selector Tabs — only on Login view */}
          {viewState === 'login' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #f1f5f9' }}>
              {[
                { role: 'citizen', icon: '👤', label: 'Citizen Login', desc: 'Report & track issues' },
                { role: 'admin', icon: '🏛️', label: 'Admin Login', desc: 'Manage & resolve issues' },
              ].map(({ role, icon, label, desc }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setSelectedRole(role); setError(''); }}
                  style={{
                    padding: '18px 12px',
                    border: 'none',
                    background: selectedRole === role
                      ? (role === 'admin' ? '#f5f3ff' : '#eff6ff')
                      : 'white',
                    cursor: 'pointer',
                    borderBottom: selectedRole === role
                      ? `3px solid ${role === 'admin' ? '#7c3aed' : '#2563eb'}`
                      : '3px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '22px', marginBottom: '4px' }}>{icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: selectedRole === role ? (role === 'admin' ? '#7c3aed' : '#2563eb') : '#64748b' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', fontWeight: 500 }}>{desc}</div>
                </button>
              ))}
            </div>
          )}

          <div style={{ padding: '32px' }}>

            {/* Admin info banner */}
            {viewState === 'login' && isAdmin && (
              <div style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ color: '#7c3aed', fontSize: '20px' }}>info</span>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#5b21b6' }}>Municipal Authority Access</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#7c3aed' }}>Use your official admin credentials to access the control panel</p>
                </div>
              </div>
            )}

            {/* Alerts */}
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#dc2626', fontSize: '18px' }}>error</span>
                <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>{error}</span>
              </div>
            )}

            {infoMessage && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: '18px' }}>check_circle</span>
                <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>{infoMessage}</span>
              </div>
            )}

            {/* Demo OTP display box — shown when no SMTP configured */}
            {demoOtp && (
              <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '2px dashed #f59e0b', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '1px' }}>⚠️ Dev Mode — Your OTP</p>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '8px', color: '#b45309' }}>{demoOtp}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#92400e' }}>Email not configured — OTP shown here for testing</p>
              </div>
            )}

            {/* ── LOGIN FORM ── */}
            {viewState === 'login' && (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '20px' }}>email</span>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={isAdmin ? 'admin@civicwatch.com' : 'your@email.com'}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '12px 12px 12px 42px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#1e293b', outline: 'none', background: '#f8fafc', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = theme.primary}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '20px' }}>lock</span>
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '12px 44px 12px 42px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#1e293b', outline: 'none', background: '#f8fafc', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = theme.primary}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => { setViewState('forgot'); setError(''); setInfoMessage(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: theme.primary, padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '12px', background: `linear-gradient(135deg, ${theme.primary}, ${isAdmin ? '#4f46e5' : '#06b6d4'})`, color: 'white', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: `0 4px 16px ${isAdmin ? 'rgba(124,58,237,0.4)' : 'rgba(37,99,235,0.4)'}`, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>refresh</span>
                      Signing in...
                    </>
                  ) : (
                    <>{theme.icon} Sign in as {theme.label}</>
                  )}
                </button>

                <div style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', padding: '8px 0' }}>
                  Don't have an account?{' '}
                  <Link to="/register" style={{ color: theme.primary, fontWeight: 700, textDecoration: 'none' }}>
                    Create account
                  </Link>
                </div>
              </form>
            )}

            {/* ── FORGOT PASSWORD FORM ── */}
            {viewState === 'forgot' && (
              <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span className="material-symbols-outlined" style={{ color: '#0284c7', fontSize: '20px', marginTop: '1px' }}>info</span>
                  <p style={{ margin: 0, fontSize: '12px', color: '#0369a1', lineHeight: 1.5 }}>
                    Enter your registered email. We'll send a 6-digit OTP valid for <strong>10 minutes</strong>.
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Registered Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '20px' }}>email</span>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your email address"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '12px 12px 12px 42px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#1e293b', outline: 'none', background: '#f8fafc' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', color: 'white', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}
                >
                  {loading ? 'Sending OTP...' : '📧 Send OTP to Email'}
                </button>

                <button
                  type="button"
                  onClick={() => { setViewState('login'); setError(''); setInfoMessage(''); setDemoOtp(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#64748b', padding: '4px', textAlign: 'center' }}
                >
                  ← Back to Sign In
                </button>
              </form>
            )}

            {/* ── OTP VERIFY + RESET FORM ── */}
            {viewState === 'otp' && (
              <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    6-Digit OTP Code
                  </label>
                  <input
                    id="otp-input"
                    type="text"
                    required
                    maxLength={6}
                    value={otpVal}
                    onChange={(e) => setOtpVal(e.target.value.replace(/\D/g, ''))}
                    placeholder="— — — — — —"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '16px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '24px', fontWeight: 800, textAlign: 'center', letterSpacing: '10px', color: '#1e293b', outline: 'none', background: '#f8fafc', fontFamily: 'monospace' }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '20px' }}>lock</span>
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (min 6 chars)"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '12px 44px 12px 42px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#1e293b', outline: 'none', background: '#f8fafc' }}
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{showNewPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: confirmPassword && confirmPassword === newPassword ? '#16a34a' : '#9ca3af', fontSize: '20px' }}>
                      {confirmPassword && confirmPassword === newPassword ? 'check_circle' : 'lock'}
                    </span>
                    <input
                      id="confirm-password"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '12px 12px 12px 42px', border: `1.5px solid ${confirmPassword && confirmPassword !== newPassword ? '#fca5a5' : '#e2e8f0'}`, borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#1e293b', outline: 'none', background: '#f8fafc' }}
                    />
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #16a34a, #059669)', color: 'white', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 16px rgba(22,163,74,0.35)' }}
                >
                  {loading ? 'Resetting...' : '✓ Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={() => { setViewState('forgot'); setError(''); setDemoOtp(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#64748b', padding: '4px', textAlign: 'center' }}
                >
                  ← Request New OTP
                </button>
              </form>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#94a3b8' }}>
          By signing in, you agree to our{' '}
          <a href="#" style={{ color: '#64748b', fontWeight: 600 }}>Terms</a> &amp;{' '}
          <a href="#" style={{ color: '#64748b', fontWeight: 600 }}>Privacy Policy</a>
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;
