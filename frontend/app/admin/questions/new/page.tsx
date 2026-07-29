'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2, ShieldAlert, Check } from 'lucide-react';
import { Difficulty } from '@/types';

export default function CreateQuestionAdminPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [constraints, setConstraints] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');

  const [testcases, setTestcases] = useState<Array<{ input: string; expected_output: string; is_hidden: boolean }>>([
    { input: '', expected_output: '', is_hidden: false },
    { input: '', expected_output: '', is_hidden: true },
  ]);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const addTestcase = (isHidden: boolean) => {
    setTestcases([...testcases, { input: '', expected_output: '', is_hidden: isHidden }]);
  };

  const removeTestcase = (index: number) => {
    setTestcases(testcases.filter((_, i) => i !== index));
  };

  const updateTestcase = (index: number, field: 'input' | 'expected_output', value: string) => {
    const updated = [...testcases];
    updated[index][field] = value;
    setTestcases(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('Question successfully created!');
    setTimeout(() => {
      setLoading(false);
      router.push('/problems');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/problems" className="text-slate-400 hover:text-white flex items-center space-x-1 text-sm font-medium transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Problems</span>
          </Link>
          <span className="text-slate-700">|</span>
          <span className="font-bold text-white text-base flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            Admin Panel — Add Question
          </span>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-4xl mx-auto w-full px-6 py-10">
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3 text-emerald-400 text-sm">
            <Check className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl space-y-6 shadow-2xl">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Question Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Valid Parentheses"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="String, Stack, Hash Table"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Problem Description (Markdown Supported)
            </label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem statement clearly..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Input Format
              </label>
              <textarea
                required
                rows={3}
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
                placeholder="e.g. First line contains integer n..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Output Format
              </label>
              <textarea
                required
                rows={3}
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                placeholder="e.g. Print boolean answer..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Constraints (One per line)
            </label>
            <textarea
              rows={3}
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="1 <= n <= 10^5&#10;nums[i] >= 0"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Testcases Section */}
          <div className="border-t border-slate-800 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100">Test Cases</h3>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => addTestcase(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Sample Case
                </button>
                <button
                  type="button"
                  onClick={() => addTestcase(true)}
                  className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Hidden Case
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {testcases.map((tc, idx) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl relative space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${tc.is_hidden ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                      {tc.is_hidden ? '🔒 Hidden Testcase' : '📖 Sample Testcase'} #{idx + 1}
                    </span>
                    {testcases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTestcase(idx)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Input Stdin</label>
                      <textarea
                        required
                        rows={2}
                        value={tc.input}
                        onChange={(e) => updateTestcase(idx, 'input', e.target.value)}
                        placeholder="[2,7,11,15], 9"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Expected Output</label>
                      <textarea
                        required
                        rows={2}
                        value={tc.expected_output}
                        onChange={(e) => updateTestcase(idx, 'expected_output', e.target.value)}
                        placeholder="[0,1]"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Creating Question...' : 'Save Question to Database'}
          </button>
        </form>
      </main>
    </div>
  );
}
