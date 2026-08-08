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
      let userData: UserAccount | null = null;

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.user) {
            userData = data.user;
          }
        } else if (!res.ok) {
          // Server responded with an error (wrong password, not found, etc.)
          const errData = contentType.includes('application/json') ? await res.json() : null;
          throw new Error(errData?.error || (tab === 'LOGIN' ? 'Invalid email or password' : 'Registration failed'));
        }
      } catch (e: any) {
        // Re-throw server errors so they surface to the user
        if (e?.message && e.message !== 'Failed to fetch') throw e;
        // Network/fetch failure — only allow offline fallback for REGISTER (not LOGIN)
        if (tab === 'LOGIN') {
          throw new Error('Cannot reach server. Check your connection and try again.');
        }
      }

      // Offline fallback: only for REGISTER when server is unreachable
      if (!userData && tab === 'REGISTER') {
        const safeId = cleanEmail.replace(/[^a-z0-9]/g, '_') || 'user_1';
        userData = {
          accountId: `usr_${safeId}`,
          email: cleanEmail,
          name: name.trim() || cleanEmail.split('@')[0],
        };
      }

      if (!userData) throw new Error('Authentication failed. Please try again.');

      // Bind user accountId & JWT token as active session
      const authToken = `jwt_${userData.accountId}_${Date.now()}`;
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user_account', JSON.stringify(userData));
      localStorage.setItem('pitrack_expenses_initialized', 'true');
      setGuestId(userData.accountId);

      // Auto-migrate guest entries into user account if first time on this device
      const userExpKey = `pitrack_expenses_${userData.accountId}`;
      if (!localStorage.getItem(userExpKey)) {
        const guestExp = localStorage.getItem('pitrack_expenses_data') || localStorage.getItem('pitrack_expenses');
        if (guestExp) localStorage.setItem(userExpKey, guestExp);
      }

      // Use reminders_v2_ key to match storageService.getReminders()
      const userRemKey = `reminders_v2_${userData.accountId}`;
      if (!localStorage.getItem(userRemKey)) {
        const guestRem = localStorage.getItem('pitrack_reminders_data');
        if (guestRem) localStorage.setItem(userRemKey, guestRem);
      }

      const userTripsKey = `trip_folders_${userData.accountId}`;
      if (!localStorage.getItem(userTripsKey)) {
        const guestTrips = localStorage.getItem('pitrack_trips_data');
        if (guestTrips) localStorage.setItem(userTripsKey, guestTrips);
      }

      // Auto-restore full account data backup from cloud database
      try {
        const syncRes = await fetch(`/api/sync?accountId=${userData.accountId}`);
        if (syncRes.ok) {
          const contentType = syncRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const syncData = await syncRes.json();
            if (syncData && syncData.expenses) {
              localStorage.setItem(`pitrack_expenses_${userData.accountId}`, JSON.stringify(syncData.expenses));
              // Use reminders_v2_ key to match storageService.getReminders()
              if (syncData.reminders) localStorage.setItem(`reminders_v2_${userData.accountId}`, JSON.stringify(syncData.reminders));
              if (syncData.trips) localStorage.setItem(`trip_folders_${userData.accountId}`, JSON.stringify(syncData.trips));
              if (syncData.targets) localStorage.setItem(`budget_targets_${userData.accountId}`, JSON.stringify(syncData.targets));
              if (syncData.goals) localStorage.setItem(`saving_goals_${userData.accountId}`, JSON.stringify(syncData.goals));
              if (syncData.cycleHistory) localStorage.setItem(`cycle_history_${userData.accountId}`, JSON.stringify(syncData.cycleHistory));
            }
          }
        }
      } catch (e) {}

      onAuthSuccess(userData);
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err?.message || (tab === 'LOGIN' ? 'Invalid email or password' : 'Authentication error'));
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
            {/* Character Laptop Illustration Decoration */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 -4px 0' }}>
              <svg width="110" height="100" viewBox="0 0 160 145" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Headphones */}
                <path d="M 46 45 C 46 16, 114 16, 114 45" stroke="var(--text-primary)" strokeWidth="3" fill="none" />
                <rect x="42" y="42" width="7" height="18" rx="3.5" fill="var(--text-primary)" />
                <rect x="111" y="42" width="7" height="18" rx="3.5" fill="var(--text-primary)" />
                
                {/* Hair */}
                <path d="M 52 46 C 48 30, 62 20, 75 20 C 85 20, 95 18, 108 30 C 114 40, 108 50, 108 50" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M 58 35 Q 70 24 80 25 Q 92 24 102 35" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" fill="none" />
                
                {/* Head */}
                <circle cx="80" cy="50" r="22" stroke="var(--text-primary)" strokeWidth="2.5" fill="none" />
                
                {/* Glasses */}
                <circle cx="71" cy="50" r="7.5" stroke="var(--text-primary)" strokeWidth="2" fill="none" />
                <circle cx="89" cy="50" r="7.5" stroke="var(--text-primary)" strokeWidth="2" fill="none" />
                <line x1="78.5" y1="50" x2="81.5" y2="50" stroke="var(--text-primary)" strokeWidth="2" />
                <line x1="49" y1="48" x2="63.5" y2="50" stroke="var(--text-primary)" strokeWidth="1.5" />
                <line x1="96.5" y1="50" x2="111" y2="48" stroke="var(--text-primary)" strokeWidth="1.5" />

                {/* Eyes dots & Smile */}
                <circle cx="71" cy="50" r="2" fill="var(--text-primary)" />
                <circle cx="89" cy="50" r="2" fill="var(--text-primary)" />
                <path d="M 76 60 Q 80 64 84 60" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" fill="none" />

                {/* Body / Shirt */}
                <path d="M 58 72 C 58 72, 68 70, 80 70 C 92 70, 102 72, 102 72 L 112 102 L 48 102 Z" stroke="var(--text-primary)" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                <path d="M 72 70 L 72 78 M 88 70 L 88 78" stroke="var(--text-primary)" strokeWidth="1.5" />

                {/* Waving Arm */}
                <path d="M 58 76 Q 38 68 32 52" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M 32 52 Q 28 46 32 42 Q 36 46 36 50" stroke="var(--text-primary)" strokeWidth="2" fill="none" />

                {/* Laptop Base & Screen */}
                <path d="M 52 98 L 108 98 L 102 120 L 58 120 Z" fill="var(--text-primary)" />
                <circle cx="80" cy="109" r="3" fill="var(--bg-glass)" />
                <path d="M 44 120 L 116 120 C 118 120, 118 123, 114 123 L 46 123 C 42 123, 42 120, 44 120 Z" fill="var(--text-primary)" />

                {/* Crossed Legs */}
                <path d="M 36 126 Q 80 142 124 126" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>

            {/* Bold Centered Title */}
            <h2 style={{ fontSize: '22px', fontWeight: 900, textAlign: 'center', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
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
