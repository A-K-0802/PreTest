'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Check, 
  Lock, 
  Eye, 
  FileText, 
  Code2, 
  Sparkles,
  Terminal
} from 'lucide-react';
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

  // Testcase Builder state
  const [testcases, setTestcases] = useState<Array<{ input: string; expected_output: string; is_hidden: boolean }>>([
    { input: '4\n2 7 11 15\n9', expected_output: '0 1', is_hidden: false },
    { input: '5\n3 2 4 1 9\n10', expected_output: '3 4', is_hidden: true },
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
    setSuccessMsg('Question and testcases saved to database!');
    setTimeout(() => {
      setLoading(false);
      router.push('/admin/questions');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#bbcabf] mb-1">
            <Link href="/admin/questions" className="hover:text-[#10b981]">Question Bank</Link>
            <span>/</span>
            <span className="text-[#10b981]">New Question Builder</span>
          </div>
          <h1 className="text-2xl font-bold text-[#dbe2fd] tracking-tight">Create New Question</h1>
        </div>

        <Link
          href="/admin/questions"
          className="text-xs font-mono text-[#bbcabf] hover:text-[#dbe2fd] bg-[#131b2e] border border-[#3c4a42] px-3.5 py-2 rounded transition-all w-fit"
        >
          Cancel
        </Link>
      </div>

      {successMsg && (
        <div className="p-4 rounded bg-[#003824] border border-[#005236] flex items-center space-x-3 text-[#10b981] text-xs font-mono">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-[#131b2e] border border-[#1f2937] p-6 rounded space-y-4">
          <h3 className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider border-b border-[#1f2937] pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            1. Problem Metadata
          </h3>

          <div>
            <label className="block text-[11px] font-mono text-[#bbcabf] uppercase tracking-wider mb-2">
              Question Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Two Sum"
              className="w-full bg-[#0b1326] border border-[#3c4a42] rounded px-4 py-2.5 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#10b981] font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-[#bbcabf] uppercase tracking-wider mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-[#0b1326] border border-[#3c4a42] rounded px-4 py-2.5 text-xs text-[#dbe2fd] focus:outline-none focus:border-[#10b981] font-mono"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#bbcabf] uppercase tracking-wider mb-2">
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Array, Hash Table, Two Pointers"
                className="w-full bg-[#0b1326] border border-[#3c4a42] rounded px-4 py-2.5 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#10b981] font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Statement & Formats */}
        <div className="bg-[#131b2e] border border-[#1f2937] p-6 rounded space-y-4">
          <h3 className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider border-b border-[#1f2937] pb-3 flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            2. Problem Statement & Specifications
          </h3>

          <div>
            <label className="block text-[11px] font-mono text-[#bbcabf] uppercase tracking-wider mb-2">
              Problem Description (Markdown Supported)
            </label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Given an array of integers nums and an integer target..."
              className="w-full bg-[#0b1326] border border-[#3c4a42] rounded p-3 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#10b981] font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-[#bbcabf] uppercase tracking-wider mb-2">
                Input Format (stdin specifications)
              </label>
              <textarea
                required
                rows={3}
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
                placeholder="Line 1: N (array length)&#10;Line 2: N space-separated integers&#10;Line 3: target integer"
                className="w-full bg-[#0b1326] border border-[#3c4a42] rounded p-3 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#10b981] font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#bbcabf] uppercase tracking-wider mb-2">
                Output Format (stdout expectations)
              </label>
              <textarea
                required
                rows={3}
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                placeholder="Print indices separated by space"
                className="w-full bg-[#0b1326] border border-[#3c4a42] rounded p-3 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#10b981] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#bbcabf] uppercase tracking-wider mb-2">
              Constraints (One per line)
            </label>
            <textarea
              rows={3}
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="1 <= N <= 10^5&#10;-10^9 <= nums[i] <= 10^9"
              className="w-full bg-[#0b1326] border border-[#3c4a42] rounded p-3 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#10b981] font-mono"
            />
          </div>
        </div>

        {/* Section 3: Test Case Manager */}
        <div className="bg-[#131b2e] border border-[#1f2937] p-6 rounded space-y-4">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
            <h3 className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              3. Test Case Builder
            </h3>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => addTestcase(false)}
                className="bg-[#0b1326] hover:bg-[#171f33] text-[#10b981] border border-[#3c4a42] text-xs font-mono font-bold px-3 py-1.5 rounded flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Sample Case
              </button>
              <button
                type="button"
                onClick={() => addTestcase(true)}
                className="bg-[#003824] hover:bg-[#005236] text-[#4edea3] border border-[#005236] text-xs font-mono font-bold px-3 py-1.5 rounded flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Secret Hidden Case
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {testcases.map((tc, idx) => (
              <div key={idx} className="p-4 bg-[#0b1326] border border-[#1f2937] rounded relative space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    tc.is_hidden 
                      ? 'bg-[#3d2a00] text-[#f59e0b] border-[#78350f]' 
                      : 'bg-[#003824] text-[#10b981] border-[#005236]'
                  }`}>
                    {tc.is_hidden ? '🔒 Secret Hidden Testcase' : '📖 Public Sample Testcase'} #{idx + 1}
                  </span>

                  {testcases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestcase(idx)}
                      className="text-[#bbcabf] hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#bbcabf] mb-1">Input (stdin)</label>
                    <textarea
                      required
                      rows={3}
                      value={tc.input}
                      onChange={(e) => updateTestcase(idx, 'input', e.target.value)}
                      placeholder="4&#10;2 7 11 15&#10;9"
                      className="w-full bg-[#131b2e] border border-[#3c4a42] rounded p-2.5 text-xs text-[#dbe2fd]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#bbcabf] mb-1">Expected Output (stdout)</label>
                    <textarea
                      required
                      rows={3}
                      value={tc.expected_output}
                      onChange={(e) => updateTestcase(idx, 'expected_output', e.target.value)}
                      placeholder="0 1"
                      className="w-full bg-[#131b2e] border border-[#3c4a42] rounded p-2.5 text-xs text-[#dbe2fd]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#10b981] hover:bg-[#4edea3] text-[#0b1326] font-mono font-bold py-3.5 rounded shadow-lg shadow-[#10b981]/20 transition-all uppercase tracking-wider text-xs disabled:opacity-50"
        >
          {loading ? 'Saving Question to Supabase...' : 'Publish Question to Platform'}
        </button>
      </form>
    </div>
  );
}
