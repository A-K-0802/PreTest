'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Terminal, ShieldCheck, CheckCircle2, Code2, Award, Bookmark, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Redirect unauthenticated guest to login
        router.push('/login?redirectedFrom=/dashboard');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1326] text-[#dbe2fd] flex items-center justify-center font-mono text-xs">
        <div className="flex items-center space-x-2 text-[#10b981] animate-pulse">
          <Terminal className="w-5 h-5" />
          <span>Verifying user session...</span>
        </div>
      </div>
    );
  }

  const userStats = {
    username: user?.user_metadata?.username || user?.email?.split('@')[0] || 'Engineer',
    email: user?.email || '',
    role: user?.user_metadata?.role || 'LEARNER',
    solvedCount: 0,
    totalSubmissions: 0,
    accuracy: '0.0%',
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dbe2fd] flex flex-col font-sans selection:bg-[#10b981] selection:text-[#0b1326]">
      {/* Top Header */}
      <header className="border-b border-[#1f2937] bg-[#0b1326] px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center font-bold">
            <Terminal className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-bold text-xl text-[#dbe2fd]">
            TestPrep <span className="text-xs text-[#10b981] font-mono">Dashboard</span>
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xs font-mono text-[#bbcabf] hover:text-[#10b981] transition-colors">
            Problemset
          </Link>
          <Link href="/submissions" className="text-xs font-mono text-[#bbcabf] hover:text-[#10b981] transition-colors">
            Submissions
          </Link>
          <button
            onClick={handleSignOut}
            className="text-xs font-mono text-[#bbcabf] hover:text-rose-400 p-1.5 transition-colors flex items-center gap-1"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto w-full px-6 py-8">
        {/* Profile Card */}
        <div className="bg-[#131b2e] border border-[#1f2937] p-8 rounded-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center text-2xl font-extrabold shadow-lg shadow-[#10b981]/20 font-mono">
              {userStats.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-[#dbe2fd] tracking-tight">{userStats.username}</h1>
                <span className="px-2.5 py-0.5 rounded bg-[#003824] text-[#10b981] border border-[#005236] text-[10px] font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {userStats.role}
                </span>
              </div>
              <p className="text-xs text-[#bbcabf] font-mono mt-1">{userStats.email}</p>
            </div>
          </div>

          <Link
            href="/"
            className="bg-[#10b981] hover:bg-[#4edea3] text-[#0b1326] font-mono font-bold text-xs px-5 py-2.5 rounded shadow-md shadow-[#10b981]/20 transition-all text-center w-full md:w-auto"
          >
            Solve Problems →
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#171f33] border border-[#1f2937] p-5 rounded">
            <span className="text-[11px] font-mono text-[#10b981] uppercase tracking-widest block mb-1">Solved</span>
            <div className="text-3xl font-extrabold text-[#dbe2fd]">{userStats.solvedCount}</div>
            <p className="text-xs text-[#bbcabf] font-mono mt-1">Completed Challenges</p>
          </div>

          <div className="bg-[#171f33] border border-[#1f2937] p-5 rounded">
            <span className="text-[11px] font-mono text-[#10b981] uppercase tracking-widest block mb-1">Submissions</span>
            <div className="text-3xl font-extrabold text-[#dbe2fd]">{userStats.totalSubmissions}</div>
            <p className="text-xs text-[#bbcabf] font-mono mt-1">Total Code Submits</p>
          </div>

          <div className="bg-[#171f33] border border-[#1f2937] p-5 rounded">
            <span className="text-[11px] font-mono text-[#10b981] uppercase tracking-widest block mb-1">Accuracy</span>
            <div className="text-3xl font-extrabold text-[#dbe2fd]">{userStats.accuracy}</div>
            <p className="text-xs text-[#bbcabf] font-mono mt-1">Acceptance Rate</p>
          </div>

          <div className="bg-[#171f33] border border-[#1f2937] p-5 rounded">
            <span className="text-[11px] font-mono text-[#10b981] uppercase tracking-widest block mb-1">Bookmarks</span>
            <div className="text-3xl font-extrabold text-[#dbe2fd]">0</div>
            <p className="text-xs text-[#bbcabf] font-mono mt-1">Saved Problems</p>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-[#131b2e] border border-[#1f2937] p-6 rounded">
          <h3 className="text-sm font-bold text-[#dbe2fd] font-mono uppercase tracking-wider mb-4">Difficulty Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded bg-[#0b1326] border border-[#1f2937] flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Easy</span>
              <span className="text-lg font-mono font-extrabold text-[#dbe2fd]">{userStats.easySolved}</span>
            </div>

            <div className="p-4 rounded bg-[#0b1326] border border-[#1f2937] flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">Medium</span>
              <span className="text-lg font-mono font-extrabold text-[#dbe2fd]">{userStats.mediumSolved}</span>
            </div>

            <div className="p-4 rounded bg-[#0b1326] border border-[#1f2937] flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase">Hard</span>
              <span className="text-lg font-mono font-extrabold text-[#dbe2fd]">{userStats.hardSolved}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
