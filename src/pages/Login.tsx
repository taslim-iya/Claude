import { useState } from 'react';
import { Zap } from 'lucide-react';

type Mode = 'signin' | 'signup';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');

  const clearData = () => {
    ['piq_accounts','piq_contacts','piq_campaigns','piq_opportunities','piq_tasks','piq_lists','piq_integrations','piq_plan','piq_profile','piq_demo'].forEach(k => localStorage.removeItem(k));
  };

  const handleSignIn = () => {
    if (!email || !password) { setMsg('Email and password required'); return; }
    clearData();
    localStorage.setItem('piq_auth', 'true');
    onLogin();
  };

  const handleSignUp = () => {
    if (!name.trim()) { setMsg('Full name is required'); return; }
    if (!email) { setMsg('Email is required'); return; }
    if (password.length < 6) { setMsg('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setMsg('Passwords do not match'); return; }
    clearData();
    localStorage.setItem('piq_profile', JSON.stringify({ name: name.trim(), email, title: '', phone: '', company: '' }));
    localStorage.setItem('piq_auth', 'true');
    onLogin();
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setMsg('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const inputStyle = {
    width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)',
    color: 'var(--text)', borderRadius: 8, padding: '10px 12px', fontSize: 14,
    outline: 'none', boxSizing: 'border-box' as const,
  };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 400, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 12, background: 'linear-gradient(135deg,#5b6ef9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--text)' }}>ProspectIQ</span>
        </div>

        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>Sales intelligence for modern teams</p>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 10, background: 'var(--surface-2)', marginBottom: 24 }}>
          {(['signin','signup'] as Mode[]).map(m => (
            <button key={m} onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 7, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: mode === m ? 'var(--surface)' : 'transparent',
                color: mode === m ? 'var(--text)' : 'var(--text-3)',
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
              }}>
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {mode === 'signup' && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSignUp()}
              placeholder="Jane Smith"
              style={inputStyle}
            />
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (mode === 'signin' ? handleSignIn() : handleSignUp())}
            placeholder="you@company.com"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: mode === 'signup' ? 16 : 8 }}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (mode === 'signin' ? handleSignIn() : handleSignUp())}
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>

        {mode === 'signup' && (
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSignUp()}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>
        )}

        {mode === 'signin' && (
          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <button
              onClick={() => setMsg('Check your email for reset instructions')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#5b6ef9', padding: 0 }}>
              Forgot password?
            </button>
          </div>
        )}

        <button
          onClick={mode === 'signin' ? handleSignIn : handleSignUp}
          style={{ background: '#5b6ef9', color: '#fff', width: '100%', padding: '11px', borderRadius: 8, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', marginTop: mode === 'signup' ? 20 : 0, marginBottom: 10 }}>
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>

        {msg && (
          <p style={{ fontSize: 12, color: msg.includes('Check') ? '#10b981' : '#ef4444', marginBottom: 10, textAlign: 'center' }}>{msg}</p>
        )}

        <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 4 }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#5b6ef9', padding: 0, fontWeight: 600 }}>
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
