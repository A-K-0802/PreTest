'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { 
  Search, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  Terminal
} from 'lucide-react';
import { Question, Difficulty } from '@/types';

export default function AdminManageQuestionsPage() {
  const [questions, setQuestions] = useState<Array<Question & { sample_count: number; hidden_count: number; is_published: boolean }>>([]);
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  // Load questions exclusively from Supabase DB
  const loadAllQuestions = async () => {
    setLoading(true);

    const { data: dbData, error } = await supabase
      .from('questions')
      .select('*, testcases(id, is_hidden)')
      .order('created_at', { ascending: true });

    if (!error && dbData) {
      const dbFormatted = dbData.map((q: any) => {
        const publicCount = q.testcases ? q.testcases.filter((tc: any) => !tc.is_hidden).length : 0;
        const hiddenCount = q.testcases ? q.testcases.filter((tc: any) => tc.is_hidden).length : 0;
        return {
          ...q,
          sample_count: publicCount,
          hidden_count: hiddenCount,
          is_published: true,
        };
      });
      setQuestions(dbFormatted);
    } else {
      setQuestions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAllQuestions();
  }, []);

  const handleDeleteQuestion = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete question "${title}"? This will permanently delete its testcases and submissions.`)) {
      try {
        await supabase.from('testcases').delete().eq('question_id', id);
        await supabase.from('submissions').delete().eq('question_id', id);
        await supabase.from('comments').delete().eq('question_id', id);
        await supabase.from('questions').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase cascade delete notice:', err);
      }

      try {
        await fetch(`${API_URL}/questions/${id}`, { method: 'DELETE' });
      } catch (apiErr) {
        console.warn('Backend API delete notice:', apiErr);
      }

      // Reload live database list
      loadAllQuestions();
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = 
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.title_slug.toLowerCase().includes(search.toLowerCase()) ||
      (q.tags && q.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    const matchesDifficulty = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;

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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#dbe2fd] tracking-tight">Question Bank Management</h1>
          <p className="text-xs font-mono text-[#bbcabf] mt-1">
            Create, edit, and configure problems and testcase suites.
          </p>
        </div>

        <Link
          href="/admin/questions/new"
          className="bg-[#10b981] hover:bg-[#4edea3] text-[#0b1326] font-mono font-bold text-xs px-4 py-2.5 rounded shadow-lg shadow-[#10b981]/20 flex items-center space-x-2 transition-all w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Create New Question</span>
        </Link>
      </div>

      {/* Filter & Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#131b2e] p-4 rounded border border-[#1f2937]">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-[#bbcabf] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems by title, slug, or tag..."
            className="w-full bg-[#0b1326] border border-[#3c4a42] rounded pl-9 pr-4 py-2 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/40 focus:outline-none focus:border-[#10b981] font-mono"
          />
        </div>

        {/* Difficulty Filter */}
        <div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full bg-[#0b1326] border border-[#3c4a42] rounded px-3 py-2 text-xs text-[#dbe2fd] focus:outline-none focus:border-[#10b981] font-mono"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
        </div>
      </div>

      {/* Questions Data Table */}
      <div className="bg-[#131b2e] border border-[#1f2937] rounded overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#dbe2fd]">
            <thead className="bg-[#171f33] border-b border-[#1f2937] font-mono text-[11px] text-[#bbcabf] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Problem</th>
                <th className="py-3.5 px-6">Difficulty</th>
                <th className="py-3.5 px-6">Tags</th>
                <th className="py-3.5 px-6">Testcases</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#bbcabf]">
                    Loading question bank from database...
                  </td>
                </tr>
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#bbcabf]">
                    No questions found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-[#171f33] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#dbe2fd]">{q.title}</div>
                      <div className="text-[10px] text-[#bbcabf]/60">/problems/{q.title_slug}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-bold ${getDifficultyBadge(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {q.tags && q.tags.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-[#0b1326] text-[#bbcabf] border border-[#3c4a42] text-[10px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#bbcabf]">
                      <span className="text-[#10b981] font-bold">{q.sample_count ?? 0} Public</span> · <span>{q.hidden_count ?? 0} Hidden</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded bg-[#003824] text-[#10b981] border border-[#005236] text-[10px] font-bold">
                        PUBLISHED
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        href={`/problems/${q.title_slug}`}
                        className="p-1.5 rounded bg-[#0b1326] hover:bg-[#171f33] text-[#bbcabf] hover:text-[#10b981] border border-[#3c4a42] inline-flex items-center"
                        title="Preview Problem"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/admin/questions/new?edit=${q.id}`}
                        className="p-1.5 rounded bg-[#0b1326] hover:bg-[#171f33] text-[#bbcabf] hover:text-[#10b981] border border-[#3c4a42] inline-flex items-center"
                        title="Edit Question"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteQuestion(q.id, q.title)}
                        className="p-1.5 rounded bg-[#0b1326] hover:bg-[#171f33] text-[#bbcabf] hover:text-[#f87171] border border-[#3c4a42] inline-flex items-center"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
