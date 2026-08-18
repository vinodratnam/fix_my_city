import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

const getSocketUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    // Strip /api path — socket connects to the root
    return process.env.REACT_APP_API_URL.replace('/api', '');
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  return 'https://fix-my-city-udyu.onrender.com';
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // Toast notification state
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    // Auto-remove after 5.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    // Create socket connection
    const socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket.io] Connected:', socket.id);

      // Join global room for live issue feed (admin + public dashboards)
      socket.emit('joinGlobal');

      // Join personal notification room if user is logged in
      if (user?.id) {
        socket.emit('join', user.id);
        console.log('[Socket.io] Joined personal room for user:', user.id);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('[Socket.io] Disconnected');
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.io] Connection error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  // user is intentionally excluded — we handle rejoining in a separate effect
  // eslint-disable-next-line
  }, []);

  // Re-join personal room when user logs in/out
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && socket.connected && user?.id) {
      socket.emit('join', user.id);
      console.log('[Socket.io] Rejoined personal room for user:', user.id);
    }
  }, [user]);

  // Listen for personal status-change notifications
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleStatusChanged = (data) => {
      console.log('[Socket.io] issueStatusChanged:', data);
      const statusEmoji = {
        pending: '⏳',
        in_progress: '🔧',
        resolved: '✅',
      };
      addToast({
        type: data.newStatus === 'resolved' ? 'success' : data.newStatus === 'in_progress' ? 'info' : 'warning',
        emoji: statusEmoji[data.newStatus] || '📢',
        title: 'Issue Status Updated',
        message: data.message || `"${data.issueTitle}" → ${data.newStatus.replace('_', ' ').toUpperCase()}`,
        issueId: data.issueId,
      });
    };

    socket.on('issueStatusChanged', handleStatusChanged);
    return () => socket.off('issueStatusChanged', handleStatusChanged);
  }, []);

  const value = {
    socket: socketRef.current,
    isConnected,
    toasts,
    addToast,
    removeToast,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} isConnected={isConnected} />
    </SocketContext.Provider>
  );
};

// ─── Premium Toast Container ─────────────────────────────────────────────────
const ToastContainer = ({ toasts, removeToast, isConnected }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      {/* Connection Status Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: isConnected ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${isConnected ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: '20px',
          padding: '4px 10px',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: isConnected ? '#10b981' : '#ef4444',
            boxShadow: isConnected ? '0 0 6px #10b981' : '0 0 6px #ef4444',
            animation: isConnected ? 'pulse 2s infinite' : 'none',
          }}
        />
        <span style={{ fontSize: '10px', fontWeight: 700, color: isConnected ? '#059669' : '#dc2626', letterSpacing: '0.5px' }}>
          {isConnected ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>

      {/* Toast Stack */}
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

const toastStyles = {
  success: {
    bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    border: '#6ee7b7',
    accent: '#059669',
    iconBg: 'rgba(16,185,129,0.15)',
  },
  info: {
    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    border: '#93c5fd',
    accent: '#2563eb',
    iconBg: 'rgba(37,99,235,0.12)',
  },
  warning: {
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    border: '#fcd34d',
    accent: '#d97706',
    iconBg: 'rgba(217,119,6,0.12)',
  },
  error: {
    bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    border: '#fca5a5',
    accent: '#dc2626',
    iconBg: 'rgba(220,38,38,0.12)',
  },
};

const Toast = ({ toast, onRemove }) => {
  const style = toastStyles[toast.type] || toastStyles.info;

  return (
    <div
      style={{
        background: style.bg,
        border: `1.5px solid ${style.border}`,
        borderRadius: '16px',
        padding: '14px 16px',
        minWidth: '300px',
        maxWidth: '380px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        animation: 'slideInRight 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        pointerEvents: 'all',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent left border strip */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: style.accent,
          borderRadius: '16px 0 0 16px',
        }}
      />

      {/* Emoji / Icon */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: style.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          flexShrink: 0,
          marginLeft: '4px',
        }}
      >
        {toast.emoji}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            fontWeight: 700,
            color: style.accent,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            lineHeight: 1,
            marginBottom: '4px',
          }}
        >
          {toast.title}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            fontWeight: 600,
            color: '#1f2937',
            lineHeight: 1.4,
          }}
        >
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#9ca3af',
          fontSize: '16px',
          lineHeight: 1,
          padding: '2px',
          flexShrink: 0,
          borderRadius: '4px',
        }}
      >
        ×
      </button>
    </div>
  );
};

export default SocketContext;
