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
  isPopover?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout,
  isPopover = false,
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

    const cleanEmail = email.trim().toLowerCase();
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Security: Zero information leakage on Login form
    if (tab === 'LOGIN') {
      if (!cleanEmail || !password) {
        setError('Invalid email or password');
        return;
      }
    } else {
      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        setError('Please enter a valid email address');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);
    const guestId = getGuestId();
    const endpoint = tab === 'REGISTER' ? '/api/auth/register' : '/api/auth/login';
    const payload = tab === 'REGISTER' ? { email: cleanEmail, password, name, guestId } : { email: cleanEmail, password };

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
          throw new Error(tab === 'LOGIN' ? 'Invalid email or password' : (data.error || 'Authentication failed'));
        }
        userData = data.user;
      } else {
        // Fallback Client-Side Database for Static Host Environments
        const regUsersRaw = localStorage.getItem('pitrack_registered_users');
        let regUsers: Array<{ email: string; passwordHash: string; accountId: string; name: string }> = [];
        try {
          if (regUsersRaw) regUsers = JSON.parse(regUsersRaw);
        } catch (e) {}

        if (tab === 'REGISTER') {
          const existing = regUsers.find(u => u.email === cleanEmail);
          if (existing) {
            throw new Error('Email is already registered. Please log in.');
          }
          const safeId = cleanEmail.replace(/[^a-z0-9]/g, '_') || 'user_1';
          const newRegUser = {
            accountId: `usr_${safeId}_${Date.now()}`,
            email: cleanEmail,
            passwordHash: password,
            name: name.trim() || cleanEmail.split('@')[0],
          };
          regUsers.push(newRegUser);
          localStorage.setItem('pitrack_registered_users', JSON.stringify(regUsers));
          userData = {
            accountId: newRegUser.accountId,
            email: newRegUser.email,
            name: newRegUser.name,
          };
        } else {
          // LOGIN TAB: Strictly verify registered user and correct password!
          const foundUser = regUsers.find(u => u.email === cleanEmail && u.passwordHash === password);
          if (!foundUser) {
            throw new Error('Invalid email or password');
          }
          userData = {
            accountId: foundUser.accountId,
            email: foundUser.email,
            name: foundUser.name,
          };
        }
      }

      if (!userData) {
        throw new Error(tab === 'LOGIN' ? 'Invalid email or password' : 'Could not complete authentication');
      }

      // Bind user accountId & JWT token as active session
      const authToken = `jwt_${userData.accountId}_${Date.now()}`;
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user_account', JSON.stringify(userData));
      setGuestId(userData.accountId);
      onAuthSuccess(userData);
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(tab === 'LOGIN' ? 'Invalid email or password' : (err.message || 'Authentication error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={
        isPopover
          ? {
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              pointerEvents: 'auto',
            }
          : {
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(12px)',
              zIndex: 110,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }
      }
      onClick={onClose}
    >
      <div
        className="glass-panel"
        onClick={e => e.stopPropagation()}
        style={
          isPopover
            ? {
                position: 'absolute',
                top: '56px',
                right: '12px',
                width: '320px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderColor: 'rgba(46, 170, 220, 0.4)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
                animation: 'popIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              }
            : {
                width: '100%',
                maxWidth: '400px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                borderColor: 'rgba(46, 170, 220, 0.4)',
              }
        }
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
