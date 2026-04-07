import { useState } from 'react';
import { Zap } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleSignIn = () => {
    if (!email || !password) { setMsg('Email and password required'); return; }
    localStorage.setItem('piq_auth', 'true');
    localStorage.setItem('piq_demo', email === 'demo@prospectiq.com' ? 'true' : 'false');
    onLogin();
  };

  const tryDemo = () => {
    setEmail('demo@prospectiq.com');
    setPassword('demo');
    localStorage.setItem('piq_auth', 'true');
    localStorage.setItem('piq_demo', 'true');
    onLogin();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 400, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 12, background: 'linear-gradient(135deg,#5b6ef9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--text)' }}>ProspectIQ</span>
        </div>

        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 28 }}>Sales intelligence for modern teams</p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSignIn()}
            placeholder="you@company.com"
            style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSignIn()}
            placeholder="••••••••"
            style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ textAlign: 'right', marginBottom: 20 }}>
          <button
            onClick={() => setMsg('Check your email for reset instructions')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#5b6ef9', padding: 0 }}>
            Forgot password?
          </button>
        </div>

        <button
          onClick={handleSignIn}
          style={{ background: '#5b6ef9', color: '#fff', width: '100%', padding: '11px', borderRadius: 8, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', marginBottom: 10 }}>
          Sign In
        </button>

        {msg && (
          <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 10, textAlign: 'center' }}>{msg}</p>
        )}

        <button
          onClick={tryDemo}
          style={{ border: '1px solid var(--border)', color: 'var(--text-2)', width: '100%', padding: '10px', borderRadius: 8, background: 'transparent', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          ✨ Try Demo Mode
        </button>
      </div>
    </div>
  );
}
