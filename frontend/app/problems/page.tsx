'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Search, Code2, ChevronLeft, CheckCircle2, Circle } from 'lucide-react';
import { Question, Difficulty } from '@/types';
import ProblemFiltersModal, { FilterState } from '@/components/ProblemFiltersModal';

export default function ProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [solvedQuestionIds, setSolvedQuestionIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    status: 'ALL',
    difficulty: 'ALL',
    selectedTags: [],
    matchMode: 'ALL',
  });

  const supabase = createClient();

  useEffect(() => {
    const loadDynamicQuestions = async () => {
      setLoading(true);
      const { data: dbData, error } = await supabase
        .from('questions')
        .select('*, submissions(question_id, verdict)')
        .order('created_at', { ascending: true });

      if (!error && dbData) {
        const processed = dbData.map((q: any) => {
          const totalSubs = q.submissions ? q.submissions.length : 0;
          const acceptedSubs = q.submissions ? q.submissions.filter((s: any) => s.verdict === 'ACCEPTED').length : 0;
          const accRate = totalSubs > 0 ? ((acceptedSubs / totalSubs) * 100).toFixed(1) + '%' : 'N/A';
          return {
            ...q,
            total_submissions: totalSubs,
            accepted_submissions: acceptedSubs,
            acceptance_rate: accRate,
          };
        });
        setProblems(processed);
      } else {
        setProblems([]);
      }
      setLoading(false);
    };

    loadDynamicQuestions();
  }, []);

  // Fetch solved question IDs for logged in user
  useEffect(() => {
    const fetchSolved = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: solvedSubs } = await supabase
          .from('submissions')
          .select('question_id')
          .eq('user_id', session.user.id)
          .eq('verdict', 'ACCEPTED');

        if (solvedSubs && solvedSubs.length > 0) {
          const solvedSet = new Set<string>(solvedSubs.map((s: any) => String(s.question_id)));
          setSolvedQuestionIds(solvedSet);
        }
      }
    };
    fetchSolved();
  }, []);

  // Dynamically extract all unique topic tags across all questions in DB
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    problems.forEach((prob) => {
      if (Array.isArray(prob.tags)) {
        prob.tags.forEach((t: string) => {
          if (t && t.trim()) tagSet.add(t.trim());
        });
      }
    });
    return Array.from(tagSet).sort();
  }, [problems]);

  // Master Filter Engine
  const filteredProblems = useMemo(() => {
    return problems.filter((prob) => {
      const matchesSearch = 
        prob.title.toLowerCase().includes(search.toLowerCase()) ||
        prob.title_slug.toLowerCase().includes(search.toLowerCase()) ||
        (prob.tags && prob.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase())));

      if (!matchesSearch) return false;

      if (filters.difficulty !== 'ALL' && prob.difficulty !== filters.difficulty) {
        return false;
      }

      const isSolved = solvedQuestionIds.has(String(prob.id));
      if (filters.status === 'SOLVED' && !isSolved) return false;
      if (filters.status === 'TODO' && isSolved) return false;

      if (filters.selectedTags.length > 0) {
        const probTags = (prob.tags || []).map((t: string) => t.trim().toLowerCase());
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
    <div className="min-h-screen bg-[#0b1326] text-[#dbe2fd] flex flex-col font-sans">
      <header className="h-16 border-b border-[#1f2937] bg-[#0b1326] px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-[#bbcabf] hover:text-[#10b981] flex items-center space-x-1 text-xs font-mono font-semibold">
            <ChevronLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <span className="text-[#3c4a42]">|</span>
          <h1 className="text-base font-bold text-[#dbe2fd]">Problemset Catalog</h1>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Inline Toolbar with Search & Filters placed side-by-side */}
        <div className="flex flex-wrap items-center gap-3 bg-[#131b2e] p-4 rounded border border-[#1f2937]">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-[#bbcabf] absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problem catalog..."
              className="w-full bg-[#0b1326] border border-[#3c4a42] rounded pl-9 pr-4 py-2 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/40 font-mono focus:outline-none focus:border-[#10b981] h-10"
            />
          </div>

          <ProblemFiltersModal
            availableTags={availableTags}
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Active Filter Badges Bar */}
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

        <div className="bg-[#131b2e] border border-[#1f2937] rounded overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#dbe2fd]">
              <thead className="bg-[#171f33] border-b border-[#1f2937] font-mono text-[11px] text-[#bbcabf] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Title</th>
                  <th className="py-3.5 px-6">Difficulty</th>
                  <th className="py-3.5 px-6">Acceptance Rate</th>
                  <th className="py-3.5 px-6">Tags</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/60 font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#bbcabf]">
                      Loading problems from database...
                    </td>
                  </tr>
                ) : filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#bbcabf]">
                      No problems found matching active filter criteria.
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
                        <td className="py-4 px-6 text-[#bbcabf]">
                          <span className="text-[#10b981] font-bold">{prob.acceptance_rate}</span>{' '}
                          <span className="text-[10px] text-[#bbcabf]/60">({prob.total_submissions || 0} subs)</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1">
                            {prob.tags && prob.tags.map((t: string) => (
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
