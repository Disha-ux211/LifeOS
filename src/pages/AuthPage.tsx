import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { LifeBuoy, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, displayName);
      if (error) setError(error);
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-ink-800 flex items-center justify-center mb-3 shadow-soft">
            <LifeBuoy size={28} className="text-cream-50" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-ink-800">LifeOS</h1>
          <p className="text-sm text-ink-400 mt-1">Your personal life companion</p>
        </div>

        <div className="card-solid p-6 animate-slide-up">
          <div className="flex gap-1 mb-5 p-1 bg-cream-100 rounded-xl">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'signin' ? 'bg-white text-ink-800 shadow-soft' : 'text-ink-400'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'signup' ? 'bg-white text-ink-800 shadow-soft' : 'text-ink-400'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Display Name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input pl-9"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-9"
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="password"
                  required
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-blush-600 bg-blush-50 px-3 py-2.5 rounded-xl border border-blush-100">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-400 mt-5">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
            className="text-sage-600 font-medium hover:underline"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
