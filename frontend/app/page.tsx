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
  UserPlus
} from 'lucide-react';
import { Question, Difficulty } from '@/types';

// Baseline problem dataset present on the website
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function Home() {
  const [problems, setProblems] = useState<Question[]>(INITIAL_PROBLEMS);
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoadingUser(false);
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Compute exact real-time problem metrics dynamically from current dataset
  const totalCount = problems.length;
  const easyCount = problems.filter((p) => p.difficulty === 'EASY').length;
  const mediumCount = problems.filter((p) => p.difficulty === 'MEDIUM').length;
  const hardCount = problems.filter((p) => p.difficulty === 'HARD').length;

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase()) ||
      problem.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesDifficulty = selectedDifficulty === 'ALL' || problem.difficulty === selectedDifficulty;
    const matchesTag = selectedTag === 'ALL' || problem.tags.includes(selectedTag);

    return matchesSearch && matchesDifficulty && matchesTag;
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
      {/* Top Header */}
      <header className="border-b border-[#1f2937] bg-[#0b1326]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center font-bold shadow-lg shadow-[#10b981]/20 group-hover:bg-[#4edea3] transition-all">
                <Terminal className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-bold text-xl tracking-tight text-[#dbe2fd]">
                TestPrep <span className="text-xs px-2 py-0.5 rounded bg-[#171f33] text-[#10b981] border border-[#3c4a42] font-mono">v1.0</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-[#bbcabf]">
              <Link href="/" className="text-[#10b981] font-semibold flex items-center gap-1.5">
                <span>Problemset</span>
              </Link>
              {user && (
                <>
                  <Link href="/dashboard" className="hover:text-[#10b981] transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/submissions" className="hover:text-[#10b981] transition-colors">
                    Submissions
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {loadingUser ? (
              <div className="h-9 w-24 bg-[#171f33] rounded animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2.5 bg-[#171f33] border border-[#3c4a42] hover:border-[#10b981] px-3.5 py-1.5 rounded text-xs font-medium transition-all"
                >
                  <div className="w-6 h-6 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center font-bold font-mono">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-[#dbe2fd] font-mono">{user.email?.split('@')[0]}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-xs font-semibold text-[#bbcabf] hover:text-rose-400 p-2 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-[#dbe2fd] hover:text-[#10b981] px-3.5 py-2 transition-colors flex items-center gap-1.5 font-mono"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  className="text-xs font-bold text-[#0b1326] bg-[#10b981] hover:bg-[#4edea3] px-4 py-2 rounded shadow-md shadow-[#10b981]/20 transition-all flex items-center gap-1.5 font-mono"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-[1440px] mx-auto px-6 py-8 w-full">
        {/* Guest Notification Banner */}
        {!user && (
          <div className="mb-6 p-4 rounded bg-[#131b2e] border border-[#3c4a42] flex items-center justify-between text-xs text-[#bbcabf]">
            <div className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
              <span>
                <strong className="text-[#dbe2fd]">Guest Mode Active:</strong> You can explore problems and test code in the IDE. <Link href="/signup" className="text-[#10b981] hover:underline font-semibold">Create an account</Link> to submit solutions and track progress.
              </span>
            </div>
            <Link
              href="/login"
              className="text-[#10b981] hover:text-[#4edea3] font-bold underline shrink-0 ml-4 font-mono"
            >
              Sign In →
            </Link>
          </div>
        )}

        {/* Dynamic Header Stats Bar (Computed directly from dataset) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#171f33] border border-[#1f2937] p-5 rounded flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#10b981]">Total Problems</span>
              <div className="text-3xl font-extrabold text-[#dbe2fd] font-mono mt-1">{totalCount}</div>
              <p className="text-xs text-[#bbcabf] font-mono mt-0.5">Active Questions</p>
            </div>
            <Code2 className="w-8 h-8 text-[#10b981]/40" />
          </div>

          <div className="bg-[#171f33] border border-[#1f2937] p-5 rounded flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">Easy</span>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">{easyCount}</div>
              <p className="text-xs text-[#bbcabf] font-mono mt-0.5">Fundamentals</p>
            </div>
            <Sparkles className="w-8 h-8 text-emerald-400/40" />
          </div>

          <div className="bg-[#171f33] border border-[#1f2937] p-5 rounded flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400">Medium</span>
              <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">{mediumCount}</div>
              <p className="text-xs text-[#bbcabf] font-mono mt-0.5">Core Practice</p>
            </div>
            <Flame className="w-8 h-8 text-amber-400/40" />
          </div>

          <div className="bg-[#171f33] border border-[#1f2937] p-5 rounded flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-rose-400">Hard</span>
              <div className="text-3xl font-extrabold text-rose-400 font-mono mt-1">{hardCount}</div>
              <p className="text-xs text-[#bbcabf] font-mono mt-0.5">Advanced DSA</p>
            </div>
            <Award className="w-8 h-8 text-rose-400/40" />
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#131b2e] border border-[#1f2937] p-4 rounded mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#bbcabf] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems by title or topic..."
              className="w-full bg-[#0b1326] border border-[#3c4a42] rounded px-3.5 pl-10 py-2 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/60 focus:outline-none focus:border-[#10b981] transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-[11px] font-mono uppercase text-[#bbcabf] tracking-widest mr-2 shrink-0">
              Filter:
            </span>
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded text-xs font-semibold font-mono transition-all shrink-0 ${
                  selectedDifficulty === diff
                    ? 'bg-[#10b981] text-[#0b1326]'
                    : 'bg-[#0b1326] text-[#bbcabf] border border-[#3c4a42] hover:text-[#dbe2fd] hover:border-[#10b981]'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* High-Density Problem Set Table */}
        <div className="bg-[#131b2e] border border-[#1f2937] rounded overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#dbe2fd]">
              <thead className="bg-[#171f33] border-b border-[#1f2937] font-mono text-[11px] text-[#bbcabf] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Title</th>
                  <th className="py-3.5 px-6">Difficulty</th>
                  <th className="py-3.5 px-6">Topics / Tags</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/60">
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#bbcabf] font-mono">
                      No problems found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((problem) => (
                    <tr key={problem.id} className="hover:bg-[#171f33] transition-colors group">
                      <td className="py-4 px-6 font-mono text-[#bbcabf]">
                        ⚪ Unsolved
                      </td>
                      <td className="py-4 px-6 font-semibold text-[#dbe2fd] group-hover:text-[#10b981] transition-colors">
                        <Link href={`/problems/${problem.title_slug}`} className="flex items-center gap-2">
                          <span>{problem.title}</span>
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded border text-[11px] font-mono font-bold ${getDifficultyBadge(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1.5">
                          {problem.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-[#0b1326] text-[#bbcabf] border border-[#3c4a42] text-[10px] font-mono">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/problems/${problem.title_slug}`}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-[#10b981] hover:text-[#0b1326] hover:bg-[#10b981] border border-[#3c4a42] px-3.5 py-1.5 rounded transition-all font-mono"
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
