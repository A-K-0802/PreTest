'use client';

import { useState, useEffect, useMemo } from 'react';
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
  LayoutDashboard,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Question, Difficulty } from '@/types';
import ProblemFiltersModal, { FilterState } from '@/components/ProblemFiltersModal';

export default function Home() {
  const [problems, setProblems] = useState<Question[]>([]);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('LEARNER');
  const [solvedQuestionIds, setSolvedQuestionIds] = useState<Set<string>>(new Set());
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingProblems, setLoadingProblems] = useState(true);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    status: 'ALL',
    difficulty: 'ALL',
    selectedTags: [],
    matchMode: 'ALL',
  });

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

  // Fetch logged in user, role, and solved question IDs
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

        const { data: solvedSubs } = await supabase
          .from('submissions')
          .select('question_id')
          .eq('user_id', session.user.id)
          .eq('verdict', 'ACCEPTED');

        if (solvedSubs && solvedSubs.length > 0) {
          const solvedSet = new Set<string>(solvedSubs.map((s: any) => String(s.question_id)));
          setSolvedQuestionIds(solvedSet);
        }
      } else {
        setUser(null);
        setSolvedQuestionIds(new Set());
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
    setSolvedQuestionIds(new Set());
  };

  // Dynamically extract all unique topic tags across all questions in DB
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    problems.forEach((prob) => {
      if (Array.isArray(prob.tags)) {
        prob.tags.forEach((t) => {
          if (t && t.trim()) tagSet.add(t.trim());
        });
      }
    });
    return Array.from(tagSet).sort();
  }, [problems]);

  // Master Filter Engine
  const filteredProblems = useMemo(() => {
    return problems.filter((prob) => {
      // 1. Search Query Filter
      const matchesSearch = 
        prob.title.toLowerCase().includes(search.toLowerCase()) ||
        prob.title_slug.toLowerCase().includes(search.toLowerCase()) ||
        (prob.tags && prob.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

      if (!matchesSearch) return false;

      // 2. Difficulty Filter
      if (filters.difficulty !== 'ALL' && prob.difficulty !== filters.difficulty) {
        return false;
      }

      // 3. Status Filter (Solved vs Todo)
      const isSolved = solvedQuestionIds.has(String(prob.id));
      if (filters.status === 'SOLVED' && !isSolved) return false;
      if (filters.status === 'TODO' && isSolved) return false;

      // 4. Topic Tags Filter (text[] array)
      if (filters.selectedTags.length > 0) {
        const probTags = (prob.tags || []).map((t) => t.trim().toLowerCase());
        if (filters.matchMode === 'ALL') {
          const matchAll = filters.selectedTags.every((st) => probTags.includes(st.toLowerCase()));
          if (!matchAll) return false;
        } else {
          const matchAny = filters.selectedTags.some((st) => probTags.includes(st.toLowerCase()));
          if (!matchAny) return false;
        }
      }

      return true;
    });
  }, [problems, search, filters, solvedQuestionIds]);

  const handleResetFilters = () => {
    setFilters({
      status: 'ALL',
      difficulty: 'ALL',
      selectedTags: [],
      matchMode: 'ALL',
    });
    setSearch('');
  };

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
                type="button"
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

        {/* Filters & Search Toolbar — Filters Button Placed Immediately Next to Search Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-[#131b2e] p-4 rounded border border-[#1f2937]">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-[#bbcabf] absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems by title, slug, or topic..."
              className="w-full bg-[#0b1326] border border-[#3c4a42] rounded pl-9 pr-4 py-2 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/40 focus:outline-none focus:border-[#10b981] font-mono h-10"
            />
          </div>

          <ProblemFiltersModal
            availableTags={availableTags}
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Active Filter Tags Indicator Bar */}
        {(filters.selectedTags.length > 0 || filters.status !== 'ALL' || filters.difficulty !== 'ALL') && (
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs bg-[#131b2e]/60 p-3 rounded border border-[#1f2937]">
            <span className="text-[#bbcabf] text-[11px] font-bold">Active Filters:</span>

            {filters.status !== 'ALL' && (
              <span className="px-2.5 py-1 rounded bg-[#003824] text-[#10b981] border border-[#005236] text-[11px]">
                Status: {filters.status === 'SOLVED' ? 'Solved ✅' : 'Todo ⏳'}
              </span>
            )}

            {filters.difficulty !== 'ALL' && (
              <span className="px-2.5 py-1 rounded bg-[#003824] text-[#10b981] border border-[#005236] text-[11px]">
                Difficulty: {filters.difficulty}
              </span>
            )}

            {filters.selectedTags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded bg-[#0b1326] text-[#10b981] border border-[#3c4a42] text-[11px]">
                Tag: {tag}
              </span>
            ))}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[#f87171] hover:underline text-[11px] ml-2 font-bold"
            >
              Clear All
            </button>
          </div>
        )}

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
                      No problems found matching your active filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((prob) => {
                    const isSolved = solvedQuestionIds.has(String(prob.id));
                    return (
                      <tr key={prob.id} className="hover:bg-[#171f33] transition-colors">
                        <td className="py-4 px-6">
                          {isSolved ? (
                            <span className="inline-flex items-center space-x-1 text-[#10b981]" title="Solved">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-[#bbcabf]/40" title="Unsolved">
                              <Circle className="w-4 h-4" />
                            </span>
                          )}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
