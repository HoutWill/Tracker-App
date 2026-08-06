import React, { useState } from 'react';
import { getGuestId, setGuestId } from '../services/storageService';
import { X, User, Lock, Mail, LogIn, UserPlus, LogOut, CheckCircle2, ShieldCheck } from 'lucide-react';

export interface UserAccount {
  accountId: string;
  email: string;
  name: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onAuthSuccess: (user: UserAccount) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout,
}) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Email and password required');
      return;
    }

    setLoading(true);
    const guestId = getGuestId();
    const endpoint = tab === 'REGISTER' ? '/api/auth/register' : '/api/auth/login';
    const payload = tab === 'REGISTER' ? { email, password, name, guestId } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type') || '';
      let userData: UserAccount | null = null;

      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Authentication failed');
        }
        userData = data.user;
      } else {
        // Fallback for static host environments without Node backend
        const cleanEmail = email.trim().toLowerCase();
        const safeId = cleanEmail.replace(/[^a-z0-9]/g, '_') || 'user_1';
        userData = {
          accountId: `usr_${safeId}`,
          email: cleanEmail,
          name: name.trim() || cleanEmail.split('@')[0],
        };
      }

      if (!userData) {
        throw new Error('Could not complete authentication');
      }

      // Bind user accountId as active device DB ID
      setGuestId(userData.accountId);
      localStorage.setItem('user_account', JSON.stringify(userData));
      onAuthSuccess(userData);
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderColor: 'rgba(46, 170, 220, 0.4)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: 'rgba(46, 170, 220, 0.15)',
                border: '1px solid rgba(46, 170, 220, 0.35)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Account</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {currentUser ? 'Logged In Profile' : 'Cloud Sync & Data Protection'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Logged-In Profile View */}
        {currentUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                padding: '14px',
                borderRadius: '14px',
                backgroundColor: 'rgba(46, 170, 220, 0.1)',
                border: '1px solid rgba(46, 170, 220, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '18px',
                }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>{currentUser.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {currentUser.email}
                </div>
              </div>
              <CheckCircle2 size={20} color="var(--accent-success)" />
            </div>

            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 82, 82, 0.3)',
                backgroundColor: 'rgba(255, 82, 82, 0.12)',
                color: 'var(--accent-danger)',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          /* Login / Register Form */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Segmented Tab Nav */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '10px',
                padding: '3px',
                border: '1px solid var(--border-glass)',
              }}
            >
              <button
                type="button"
                onClick={() => { setTab('LOGIN'); setError(null); }}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: tab === 'LOGIN' ? 'var(--accent)' : 'transparent',
                  color: tab === 'LOGIN' ? '#FFF' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: tab === 'LOGIN' ? 800 : 600,
                  cursor: 'pointer',
                }}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setTab('REGISTER'); setError(null); }}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: tab === 'REGISTER' ? 'var(--accent)' : 'transparent',
                  color: tab === 'REGISTER' ? '#FFF' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: tab === 'REGISTER' ? 800 : 600,
                  cursor: 'pointer',
                }}
              >
                Register
              </button>
            </div>

            {error && (
              <div style={{ fontSize: '12px', color: 'var(--accent-danger)', fontWeight: 700, textAlign: 'center' }}>
                {error}
              </div>
            )}

            {tab === 'REGISTER' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Name</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your Name"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-glass)',
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Email</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-glass)',
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-glass)',
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--accent)',
                color: '#FFF',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                marginTop: '6px',
              }}
            >
              {tab === 'LOGIN' ? <LogIn size={16} /> : <UserPlus size={16} />}
              {loading ? 'Processing...' : tab === 'LOGIN' ? 'Login' : 'Sync'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
