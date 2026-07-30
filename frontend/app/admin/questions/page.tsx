'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  FileCode,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { Question, Difficulty } from '@/types';

const ADMIN_QUESTIONS_DATA: Array<Question & { sample_count: number; hidden_count: number; is_published: boolean }> = [
  {
    id: '1',
    title: 'Two Sum',
    title_slug: 'two-sum',
    description: 'Given an array of integers nums and an integer target...',
    difficulty: 'EASY',
    constraints: ['2 <= nums.length <= 10^4'],
    input_format: 'Array nums and target',
    output_format: 'Indices array',
    sample_cases: [],
    tags: ['Array', 'Hash Table'],
    sample_count: 2,
    hidden_count: 8,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Add Two Numbers',
    title_slug: 'add-two-numbers',
    description: 'You are given two non-empty linked lists...',
    difficulty: 'MEDIUM',
    constraints: ['Nodes in range [1, 100]'],
    input_format: 'Two linked lists',
    output_format: 'Sum list',
    sample_cases: [],
    tags: ['Linked List', 'Math'],
    sample_count: 2,
    hidden_count: 12,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Trapping Rain Water',
    title_slug: 'trapping-rain-water',
    description: 'Given n non-negative integers representing an elevation map...',
    difficulty: 'HARD',
    constraints: ['1 <= n <= 2 * 10^4'],
    input_format: 'Heights array',
    output_format: 'Trapped volume',
    sample_cases: [],
    tags: ['Array', 'Two Pointers', 'Dynamic Programming'],
    sample_count: 3,
    hidden_count: 15,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function AdminManageQuestionsPage() {
  const [questions, setQuestions] = useState(ADMIN_QUESTIONS_DATA);
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');

  const handleDeleteQuestion = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete question "${title}"? This will permanently delete its testcases and submissions.`)) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesDiff = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#dbe2fd] tracking-tight">Question Bank</h1>
          <p className="text-xs font-mono text-[#bbcabf] mt-1">Manage problem statements, tags, difficulty, and testcases</p>
        </div>

        <Link
          href="/admin/questions/new"
          className="bg-[#10b981] hover:bg-[#4edea3] text-[#0b1326] font-mono font-bold text-xs px-4 py-2.5 rounded shadow-md shadow-[#10b981]/20 transition-all flex items-center space-x-2 w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Question</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#131b2e] border border-[#1f2937] p-4 rounded flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#bbcabf] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by title or topic..."
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
              {filteredQuestions.map((q) => (
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
                      {q.tags.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-[#0b1326] text-[#bbcabf] border border-[#3c4a42] text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[#bbcabf]">
                    <span className="text-[#10b981] font-bold">{q.sample_count} Public</span> · <span>{q.hidden_count} Hidden</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded bg-[#003824] text-[#10b981] border border-[#005236] text-[10px] font-bold">
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
                      className="p-1.5 rounded bg-[#0b1326] hover:bg-[#450a0a] text-[#bbcabf] hover:text-[#f87171] border border-[#3c4a42] inline-flex items-center transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
