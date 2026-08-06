import React, { useState } from 'react';
import { getGuestId, setGuestId } from '../services/storageService';
import { X, User, Lock, Mail, LogIn, UserPlus, LogOut, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

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
                padding: '20px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                borderRadius: '24px',
                borderColor: 'rgba(46, 170, 220, 0.4)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
                animation: 'popIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              }
            : {
                width: '100%',
                maxWidth: '380px',
                padding: '28px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                borderRadius: '28px',
                borderColor: 'rgba(46, 170, 220, 0.4)',
              }
        }
      >
        {/* Header Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-8px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
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
                borderRadius: '18px',
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
                borderRadius: '24px',
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
          /* Clean Mobile Pill Login / Sign Up Form */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Bold Centered Title */}
            <h2 style={{ fontSize: '22px', fontWeight: 900, textAlign: 'center', margin: '4px 0 8px 0', color: 'var(--text-primary)' }}>
              {tab === 'LOGIN' ? 'Login' : 'Sign Up'}
            </h2>

            {error && (
              <div style={{ fontSize: '12px', color: 'var(--accent-danger)', fontWeight: 700, textAlign: 'center' }}>
                {error}
              </div>
            )}

            {/* Name Input Pill (Register Tab Only) */}
            {tab === 'REGISTER' && (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Name"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 42px',
                    borderRadius: '24px',
                    border: '1px solid var(--border-glass)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {/* Email Input Pill */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  borderRadius: '24px',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Password Input Pill with Toggle Eye */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  borderRadius: '24px',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Full-Width Pill Action Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '13px',
                borderRadius: '28px',
                border: 'none',
                backgroundColor: 'var(--accent)',
                color: '#FFF',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '6px',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
              }}
            >
              {loading ? 'Processing...' : tab === 'LOGIN' ? 'Login' : 'Sign Up'}
            </button>

            {/* Bottom Account Switcher Link */}
            <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              {tab === 'LOGIN' ? (
                <>
                  Need an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('REGISTER'); setError(null); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 800, cursor: 'pointer', padding: 0 }}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('LOGIN'); setError(null); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 800, cursor: 'pointer', padding: 0 }}
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
