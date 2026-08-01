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

// Baseline problem dataset with fixed static timestamps for SSR hydration safety
const INITIAL_PROBLEMS: Question[] = [
  {
    id: '1',
    title: 'Two Sum',
    title_slug: 'two-sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'EASY',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
    input_format: 'Line 1: Array of integers `nums`\nLine 2: Integer `target`',
    output_format: 'Array of two indices',
    sample_cases: [],
    tags: ['Array', 'Hash Table'],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Add Two Numbers',
    title_slug: 'add-two-numbers',
    description: 'You are given two non-empty linked lists representing two non-negative integers. Add the two numbers and return the sum as a linked list.',
    difficulty: 'MEDIUM',
    constraints: ['The number of nodes in each linked list is in range [1, 100].'],
    input_format: 'Two linked list head nodes.',
    output_format: 'Sum linked list head.',
    sample_cases: [],
    tags: ['Linked List', 'Math', 'Two Pointers'],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '3',
    title: 'Longest Substring Without Repeating Characters',
    title_slug: 'longest-substring-without-repeating-characters',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    difficulty: 'MEDIUM',
    constraints: ['0 <= s.length <= 5 * 10^4'],
    input_format: 'String s',
    output_format: 'Integer representing maximum length',
    sample_cases: [],
    tags: ['Hash Table', 'String', 'Sliding Window'],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '4',
    title: 'Trapping Rain Water',
    title_slug: 'trapping-rain-water',
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    difficulty: 'HARD',
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4'],
    input_format: 'Array of heights',
    output_format: 'Integer volume',
    sample_cases: [],
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '5',
    title: 'Valid Parentheses',
    title_slug: 'valid-parentheses',
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    difficulty: 'EASY',
    constraints: ['1 <= s.length <= 10^4'],
    input_format: 'String s',
    output_format: 'Boolean (true/false)',
    sample_cases: [],
    tags: ['String', 'Stack'],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '6',
    title: 'Merge K Sorted Lists',
    title_slug: 'merge-k-sorted-lists',
    description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    difficulty: 'HARD',
    constraints: ['k == lists.length', '0 <= k <= 10^4'],
    input_format: 'Array of k linked lists',
    output_format: 'Merged sorted linked list',
    sample_cases: [],
    tags: ['Linked List', 'Divide and Conquer', 'Heap'],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
];

export default function Home() {
  const [problems, setProblems] = useState<Question[]>(INITIAL_PROBLEMS);
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('LEARNER');
  const [loadingUser, setLoadingUser] = useState(true);

  const supabase = createClient();

  // Dynamically load active questions from Supabase + custom_questions, filtering out deleted ones
  useEffect(() => {
    const loadDynamicQuestions = async () => {
      const deletedIds: string[] = JSON.parse(localStorage.getItem('deleted_question_ids') || '[]');
      const customQuestions: any[] = JSON.parse(localStorage.getItem('custom_questions') || '[]');

      let baseList = [...INITIAL_PROBLEMS];

      // Query Supabase questions table
      const { data: dbData, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && dbData && dbData.length > 0) {
        const dbSlugs = new Set(dbData.map((q: any) => q.title_slug));
        baseList = [...dbData, ...baseList.filter((q) => !dbSlugs.has(q.title_slug))];
      }

      // Merge custom created questions
      if (customQuestions.length > 0) {
        const existingIds = new Set(baseList.map((q) => q.id));
        customQuestions.forEach((cq) => {
          if (!existingIds.has(cq.id)) {
            baseList.push(cq);
          }
        });
      }

      // Exclude deleted questions
      const active = baseList.filter((q) => !deletedIds.includes(q.id));
      setProblems(active);
    };

    loadDynamicQuestions();
  }, []);

  useEffect(() => {
    const fetchUserAndRole = async (session: any) => {
      if (session?.user) {
        setUser(session.user);
        
        // Query public.profiles table to get the user's role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role) {
          setUserRole(profile.role);
        }
      } else {
        setUser(null);
        setUserRole('LEARNER');
      }
      setLoadingUser(false);
    };

    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserAndRole(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserAndRole(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole('LEARNER');
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase()) ||
      (problem.tags && problem.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())));
    const matchesDifficulty = selectedDifficulty === 'ALL' || problem.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyBadge = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-[#003824] text-[#10b981] border-[#005236]';
      case 'MEDIUM':
        return 'bg-[#3d2a00] text-[#f59e0b] border-[#78350f]';
      case 'HARD':
        return 'bg-[#450a0a] text-[#f87171] border-[#991b1b]';
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dbe2fd] flex flex-col font-sans selection:bg-[#10b981] selection:text-[#0b1326]">
      {/* Top Navbar */}
      <header className="border-b border-[#1f2937] bg-[#0b1326] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center font-bold shadow-lg shadow-[#10b981]/20">
              <Terminal className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#10b981]">
              TestPrep <span className="text-xs text-[#dbe2fd] font-mono font-normal">DSA Platform</span>
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {loadingUser ? (
              <div className="text-xs font-mono text-[#bbcabf] animate-pulse">Checking Auth...</div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono text-[#bbcabf] bg-[#131b2e] px-3 py-1.5 rounded border border-[#3c4a42]">
                  {user.email}
                </span>

                {userRole === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="bg-[#10b981] hover:bg-[#4edea3] text-[#0b1326] text-xs font-mono font-bold px-3.5 py-1.5 rounded shadow-md shadow-[#10b981]/20 transition-all flex items-center space-x-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Portal</span>
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="text-xs font-mono text-[#bbcabf] hover:text-[#f87171] bg-[#131b2e] hover:bg-[#450a0a]/40 border border-[#3c4a42] hover:border-[#991b1b] px-3 py-1.5 rounded transition-all flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-xs font-mono font-semibold text-[#dbe2fd] hover:text-[#10b981] px-3 py-1.5 transition-colors flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  className="bg-[#10b981] hover:bg-[#4edea3] text-[#0b1326] text-xs font-mono font-bold px-3.5 py-1.5 rounded shadow-md shadow-[#10b981]/20 transition-all flex items-center space-x-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded bg-[#131b2e] border border-[#1f2937] p-8 md:p-10 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-[#003824] border border-[#005236] text-[#10b981] text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Production DSA Platform Active</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#dbe2fd] tracking-tight">
              Master Technical Interviews & Algorithms
            </h1>
            <p className="text-sm text-[#bbcabf] font-mono leading-relaxed">
              Execute Python, C++, Java, and JavaScript solutions live inside our sandboxed Judge0 engine.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#131b2e] p-4 rounded border border-[#1f2937]">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#bbcabf] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems by title or topic..."
              className="w-full bg-[#0b1326] border border-[#3c4a42] rounded px-3.5 pl-10 py-2 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#10b981] font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase text-[#bbcabf] mr-2">Difficulty:</span>
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-[#10b981] text-[#0b1326]'
                    : 'bg-[#0b1326] text-[#bbcabf] border border-[#3c4a42] hover:text-[#dbe2fd]'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Problems List Table */}
        <div className="bg-[#131b2e] border border-[#1f2937] rounded overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#dbe2fd]">
              <thead className="bg-[#171f33] border-b border-[#1f2937] font-mono text-[11px] text-[#bbcabf] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Title</th>
                  <th className="py-3.5 px-6">Difficulty</th>
                  <th className="py-3.5 px-6">Tags</th>
                  <th className="py-3.5 px-6 text-right">Solve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/60 font-mono">
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#bbcabf]">
                      No problems found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((problem) => (
                    <tr key={problem.id} className="hover:bg-[#171f33] transition-colors">
                      <td className="py-4 px-6">
                        <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block" title="Available"></span>
                      </td>
                      <td className="py-4 px-6">
                        <Link
                          href={`/problems/${problem.title_slug}`}
                          className="font-bold text-[#dbe2fd] hover:text-[#10b981] transition-colors"
                        >
                          {problem.title}
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-bold ${getDifficultyBadge(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {problem.tags && problem.tags.map((tag) => (
                            <span key={tag} className="px-1.5 py-0.5 rounded bg-[#0b1326] text-[#bbcabf] border border-[#3c4a42] text-[10px]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/problems/${problem.title_slug}`}
                          className="bg-[#10b981] hover:bg-[#4edea3] text-[#0b1326] font-bold text-[11px] px-3 py-1.5 rounded transition-all inline-flex items-center space-x-1"
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
