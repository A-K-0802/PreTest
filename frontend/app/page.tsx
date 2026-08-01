'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { 
  Terminal, 
  Search, 
  Code2, 
  LogOut,
  Sparkles,
  Flame,
  Award,
  LogIn,
  UserPlus,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import { Question, Difficulty } from '@/types';

export default function Home() {
  const [problems, setProblems] = useState<Question[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('LEARNER');
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingProblems, setLoadingProblems] = useState(true);

  const supabase = createClient();

  // Dynamically load active questions exclusively from Supabase DB
  useEffect(() => {
    const loadDynamicQuestions = async () => {
      setLoadingProblems(true);
      const { data: dbData, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && dbData) {
        setProblems(dbData);
      } else {
        setProblems([]);
      }
      setLoadingProblems(false);
    };

    loadDynamicQuestions();
  }, []);

  useEffect(() => {
    const fetchUserAndRole = async (session: any) => {
      if (session?.user) {
        setUser(session.user);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role) {
          setUserRole(profile.role);
        }
      }
      setLoadingUser(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserAndRole(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserAndRole(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole('LEARNER');
  };

  const filteredProblems = problems.filter((prob) => {
    const matchesSearch = 
      prob.title.toLowerCase().includes(search.toLowerCase()) ||
      prob.title_slug.toLowerCase().includes(search.toLowerCase()) ||
      (prob.tags && prob.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    const matchesDifficulty = selectedDifficulty === 'ALL' || prob.difficulty === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'EASY':
        return 'bg-[#003824] text-[#10b981] border-[#005236]';
      case 'MEDIUM':
        return 'bg-[#3d2a00] text-[#f59e0b] border-[#78350f]';
      case 'HARD':
        return 'bg-[#3b0914] text-[#f87171] border-[#7f1d1d]';
      default:
        return 'bg-[#1f2937] text-[#bbcabf] border-[#3c4a42]';
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dbe2fd] flex flex-col font-sans selection:bg-[#10b981] selection:text-[#0b1326]">
      {/* Top Header Navbar */}
      <header className="h-16 border-b border-[#1f2937] bg-[#0b1326]/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center font-mono font-bold text-base shadow-md shadow-[#10b981]/20">
            &gt;_
          </div>
          <span className="font-bold text-lg text-[#dbe2fd] tracking-tight">
            TestPrep <span className="text-[#10b981] text-xs font-mono font-normal ml-1">DSA Platform</span>
          </span>
        </div>

        {/* User Auth Controls */}
        <div className="flex items-center space-x-3">
          {loadingUser ? (
            <div className="w-24 h-8 bg-[#131b2e] rounded animate-pulse border border-[#1f2937]"></div>
          ) : user ? (
            <div className="flex items-center space-x-3 font-mono text-xs">
              <span className="text-[#bbcabf] bg-[#131b2e] px-3 py-1.5 rounded border border-[#1f2937] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                {user.email}
              </span>

              {userRole === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="bg-[#003824] hover:bg-[#005236] text-[#10b981] border border-[#005236] px-3 py-1.5 rounded font-bold transition-all flex items-center space-x-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <button
                onClick={handleSignOut}
                className="bg-[#131b2e] hover:bg-[#171f33] border border-[#3c4a42] text-[#bbcabf] hover:text-[#f87171] px-3 py-1.5 rounded transition-all flex items-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 font-mono text-xs">
              <Link
                href="/login"
                className="text-[#bbcabf] hover:text-[#dbe2fd] px-3.5 py-1.5 rounded transition-all flex items-center space-x-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="bg-[#10b981] hover:bg-[#4edea3] text-[#0b1326] font-bold px-3.5 py-1.5 rounded shadow-md shadow-[#10b981]/20 transition-all flex items-center space-x-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Banner Hero */}
        <div className="bg-[#131b2e] border border-[#1f2937] p-8 rounded-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-[#003824] text-[#10b981] border border-[#005236] text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>JUDGE0 SANDBOX POWERED</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#dbe2fd] tracking-tight">
              Master Technical Interviews with Live Execution
            </h1>
            <p className="text-xs font-mono text-[#bbcabf] leading-relaxed">
              Solve algorithm problems, test against public sample cases, and submit to the Judge0 evaluation engine for instant verdict scoring.
            </p>
          </div>
        </div>

        {/* Filters & Search Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#131b2e] p-4 rounded border border-[#1f2937]">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-[#bbcabf] absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems by title or topic..."
              className="w-full bg-[#0b1326] border border-[#3c4a42] rounded pl-9 pr-4 py-2 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/40 focus:outline-none focus:border-[#10b981] font-mono"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto font-mono text-xs">
            <span className="text-[#bbcabf]">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-[#0b1326] border border-[#3c4a42] rounded px-3 py-2 text-xs text-[#dbe2fd] focus:outline-none focus:border-[#10b981]"
            >
              <option value="ALL">All Problems</option>
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
            </select>
          </div>
        </div>

        {/* Problems Table */}
        <div className="bg-[#131b2e] border border-[#1f2937] rounded overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#dbe2fd]">
              <thead className="bg-[#171f33] border-b border-[#1f2937] font-mono text-[11px] text-[#bbcabf] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Title</th>
                  <th className="py-3.5 px-6">Difficulty</th>
                  <th className="py-3.5 px-6">Tags</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/60 font-mono">
                {loadingProblems ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#bbcabf] animate-pulse">
                      Loading live problems from database...
                    </td>
                  </tr>
                ) : filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#bbcabf]">
                      No problems found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((prob) => (
                    <tr key={prob.id} className="hover:bg-[#171f33] transition-colors">
                      <td className="py-4 px-6">
                        <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block"></span>
                      </td>
                      <td className="py-4 px-6 font-bold text-[#dbe2fd]">
                        <Link href={`/problems/${prob.title_slug}`} className="hover:text-[#10b981] transition-colors">
                          {prob.title}
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-bold ${getDifficultyBadge(prob.difficulty)}`}>
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {prob.tags && prob.tags.map((t) => (
                            <span key={t} className="px-1.5 py-0.5 rounded bg-[#0b1326] text-[#bbcabf] border border-[#3c4a42] text-[10px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/problems/${prob.title_slug}`}
                          className="bg-[#0b1326] hover:bg-[#171f33] border border-[#3c4a42] text-[#10b981] font-bold px-3.5 py-1.5 rounded transition-all inline-flex items-center space-x-1"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>Solve</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
