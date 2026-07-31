'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Terminal, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.trim(),
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleGoogleSignup = async () => {
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#0b1326] text-[#dbe2fd] font-sans selection:bg-[#10b981] selection:text-[#0b1326]">
      {/* Brand Narrative Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0b1326] items-center justify-center border-r border-[#1f2937] p-12">
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center font-bold shadow-lg shadow-[#10b981]/20">
              <Terminal className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#10b981] tracking-tight">TestPrep</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-[#dbe2fd] tracking-tight">Join the technical platform.</h2>
            <p className="text-[#bbcabf] text-base leading-relaxed">
              Create your account to start solving algorithmic challenges, tracking performance metrics, and preparing for top-tier software engineering interviews.
            </p>
          </div>

          {/* Micro Bento Grid */}
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="border border-[#1f2937] bg-[#171f33] p-5 rounded">
              <span className="font-mono text-xs text-[#10b981] uppercase tracking-widest block mb-1">Sandbox</span>
              <div className="text-2xl font-bold text-[#dbe2fd]">4 Languages</div>
              <p className="text-xs text-[#bbcabf] font-mono mt-0.5">Python, C++, Java, JS</p>
            </div>
            <div className="border border-[#1f2937] bg-[#171f33] p-5 rounded">
              <span className="font-mono text-xs text-[#10b981] uppercase tracking-widest block mb-1">Evaluation</span>
              <div className="text-2xl font-bold text-[#dbe2fd]">Judge0 CE</div>
              <p className="text-xs text-[#bbcabf] font-mono mt-0.5">CPU & Memory Limits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#0b1326] p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center space-x-2.5 mb-6">
            <div className="w-8 h-8 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center font-bold">
              <Terminal className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-bold text-xl text-[#10b981]">TestPrep</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#dbe2fd] tracking-tight">Create Account</h2>
            <p className="text-xs text-[#bbcabf] font-mono mt-1">Start practicing DSA problems and tracking your progress.</p>
          </div>

          {error && (
            <div className="p-4 rounded bg-[#93000a]/20 border border-[#ffb4ab]/30 flex items-start space-x-3 text-[#ffb4ab] text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#bbcabf] uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#bbcabf] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="algorithmist"
                  className="w-full bg-[#131b2e] border border-[#3c4a42] rounded pl-10 pr-4 py-3 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#10b981] font-mono transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#bbcabf] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#bbcabf] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full bg-[#131b2e] border border-[#3c4a42] rounded pl-10 pr-4 py-3 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#10b981] font-mono transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#bbcabf] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#bbcabf] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#131b2e] border border-[#3c4a42] rounded pl-10 pr-4 py-3 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#10b981] font-mono transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10b981] hover:bg-[#4edea3] text-[#0b1326] font-mono font-bold py-3.5 rounded shadow-md shadow-[#10b981]/20 transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-wider disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="my-6 flex items-center justify-between">
            <span className="w-full border-t border-[#1f2937]" />
            <span className="px-3 text-[11px] font-mono text-[#bbcabf] uppercase shrink-0">or social sign-up</span>
            <span className="w-full border-t border-[#1f2937]" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full bg-[#131b2e] hover:bg-[#171f33] border border-[#3c4a42] text-[#dbe2fd] font-mono text-xs font-semibold py-3 rounded transition-all flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="mt-8 text-center text-xs font-mono text-[#bbcabf]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#10b981] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
