'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Code2, Tag } from 'lucide-react';
import { Question, Difficulty } from '@/types';

// Mock sample problems for initial preview
const SAMPLE_PROBLEMS: Question[] = [
  {
    id: '1',
    title: 'Two Sum',
    title_slug: 'two-sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'EASY',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
    input_format: 'First line contains integer array, second line contains target integer.',
    output_format: 'Array of two indices.',
    sample_cases: [],
    tags: ['Array', 'Hash Table'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Add Two Numbers',
    title_slug: 'add-two-numbers',
    description: 'You are given two non-empty linked lists representing two non-negative integers.',
    difficulty: 'MEDIUM',
    constraints: ['The number of nodes in each linked list is in range [1, 100].'],
    input_format: 'Two linked list head values.',
    output_format: 'Sum linked list head.',
    sample_cases: [],
    tags: ['Linked List', 'Math'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Trapping Rain Water',
    title_slug: 'trapping-rain-water',
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    difficulty: 'HARD',
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4'],
    input_format: 'Array of heights.',
    output_format: 'Integer representing trapped water volume.',
    sample_cases: [],
    tags: ['Array', 'Two Pointers', 'Dynamic Programming'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function ProblemsPage() {
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  const filteredProblems = SAMPLE_PROBLEMS.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase()) ||
      problem.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesDifficulty = selectedDifficulty === 'ALL' || problem.difficulty === selectedDifficulty;
    const matchesTag = selectedTag === 'ALL' || problem.tags.includes(selectedTag);

    return matchesSearch && matchesDifficulty && matchesTag;
  });

  const getDifficultyBadge = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'HARD':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-extrabold text-lg shadow-lg shadow-indigo-500/20">
              ⚡
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              CodeForge <span className="text-xs text-indigo-400">DSA</span>
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Problem List</h1>
            <p className="text-slate-400 text-sm mt-1">Explore and solve coding challenges across various data structures</p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/questions/new"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
            >
              <span>+ Add Question (Admin)</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems or tags..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Difficulty:
            </span>
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  selectedDifficulty === diff
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Problems Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Difficulty</th>
                  <th className="py-4 px-6">Tags</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No problems found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((problem) => (
                    <tr key={problem.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">
                        ⚪ Unsolved
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-100 hover:text-indigo-400 transition-colors">
                        <Link href={`/problems/${problem.title_slug}`}>
                          {problem.title}
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-bold ${getDifficultyBadge(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1.5">
                          {problem.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800 text-xs font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/problems/${problem.title_slug}`}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg transition-all"
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
