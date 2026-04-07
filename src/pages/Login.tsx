import { useState } from 'react';
import { Zap, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('sarah@company.com');
  const [password, setPassword] = useState('password');
  const [showPw, setShowPw] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0" style={{background:'radial-gradient(circle at 25% 35%, rgba(99,102,241,0.15) 0%, transparent 55%), radial-gradient(circle at 75% 75%, rgba(124,58,237,0.1) 0%, transparent 55%)'}} />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color:"var(--text)" }}>ProspectIQ</span>
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <blockquote className="text-2xl font-semibold text-white leading-relaxed mb-5">
              "ProspectIQ cut our time-to-first-meeting from 3 weeks to 4 days."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">JK</div>
              <div>
                <p className="font-semibold text-sm" style={{ color:"var(--text)" }}>Jordan Kim</p>
                <p className="text-slate-400 text-sm">VP Marketing, Rippling</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{ v:'2,400+', l:'Teams' }, { v:'18K+', l:'Meetings Booked' }, { v:'$240M+', l:'Pipeline Created' }].map(s => (
              <div key={s.l} className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                <p className="text-xl font-bold" style={{ color:"var(--text)" }}>{s.v}</p>
                <p className="text-slate-400 text-xs mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><Zap size={15} className="text-white" /></div>
            <span className="font-bold" style={{ color:"var(--text)" }}>ProspectIQ</span>
          </div>
          <h2 className="text-2xl font-bold  mb-1" style={{ color:"var(--text)" }}>{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
          <p className="text-slate-400 text-sm mb-7">{isSignUp ? 'Start free — no credit card required.' : 'Sign in to your workspace.'}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <input type="text" placeholder="Sarah Miller" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 pr-10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-1">
              {loading ? 'Signing in…' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center space-y-3">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up free"}
            </button>
            {!isSignUp && <p className="text-xs text-slate-600">Demo credentials are pre-filled. Just click Sign In.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
