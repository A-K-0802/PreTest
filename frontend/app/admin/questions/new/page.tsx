'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
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

// Baseline questions data for fallback editing
const BASELINE_DATA: Record<string, any> = {
  '1': {
    title: 'Two Sum',
    difficulty: 'EASY',
    tags: 'Array, Hash Table',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    inputFormat: 'Line 1: N (number of elements)\nLine 2: N space-separated integers\nLine 3: target integer',
    outputFormat: 'Space-separated indices',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    testcases: [
      { input: '4\n2 7 11 15\n9', expected_output: '0 1', is_hidden: false },
      { input: '3\n3 2 4\n6', expected_output: '1 2', is_hidden: false },
      { input: '5\n3 2 4 1 9\n10', expected_output: '3 4', is_hidden: true },
    ]
  },
  '2': {
    title: 'Add Two Numbers',
    difficulty: 'MEDIUM',
    tags: 'Linked List, Math',
    description: 'You are given two non-empty linked lists representing two non-negative integers. Add the two numbers and return the sum as a linked list.',
    inputFormat: 'Line 1: N space-separated list 1\nLine 2: M space-separated list 2',
    outputFormat: 'Space-separated sum list',
    constraints: 'The number of nodes in each linked list is in range [1, 100].',
    testcases: [
      { input: '2 4 3\n5 6 4', expected_output: '7 0 8', is_hidden: false },
      { input: '9 9\n1', expected_output: '0 0 1', is_hidden: true },
    ]
  }
};

function QuestionFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

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

  const supabase = createClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  // Load existing question data if in Edit Mode
  useEffect(() => {
    if (!editId) return;

    const loadQuestionData = async () => {
      // 1. Try querying custom_questions in localStorage first
      const customQuestions: any[] = JSON.parse(localStorage.getItem('custom_questions') || '[]');
      const localMatch = customQuestions.find((q) => q.id === editId || q.title_slug === editId);

      if (localMatch) {
        setTitle(localMatch.title || '');
        setDifficulty(localMatch.difficulty || 'EASY');
        setTags(Array.isArray(localMatch.tags) ? localMatch.tags.join(', ') : localMatch.tags || '');
        setDescription(localMatch.description || '');
        setInputFormat(localMatch.input_format || '');
        setOutputFormat(localMatch.output_format || '');
        setConstraints(Array.isArray(localMatch.constraints) ? localMatch.constraints.join('\n') : localMatch.constraints || '');
        
        if (localMatch.testcases && localMatch.testcases.length > 0) {
          setTestcases(localMatch.testcases.map((tc: any) => ({
            input: tc.input || '',
            expected_output: tc.expected_output || tc.output || '',
            is_hidden: !!tc.is_hidden
          })));
        }
        return;
      }

      // 2. Try querying Supabase DB
      const { data: qData, error: qErr } = await supabase
        .from('questions')
        .select('*, testcases(*)')
        .eq('id', editId)
        .single();

      if (!qErr && qData) {
        setTitle(qData.title || '');
        setDifficulty(qData.difficulty || 'EASY');
        setTags(Array.isArray(qData.tags) ? qData.tags.join(', ') : '');
        setDescription(qData.description || '');
        setInputFormat(qData.input_format || '');
        setOutputFormat(qData.output_format || '');
        setConstraints(Array.isArray(qData.constraints) ? qData.constraints.join('\n') : '');
        
        if (qData.testcases && qData.testcases.length > 0) {
          setTestcases(qData.testcases.map((tc: any) => ({
            input: tc.input || '',
            expected_output: tc.expected_output || tc.output || '',
            is_hidden: !!tc.is_hidden
          })));
        }
      } else if (BASELINE_DATA[editId]) {
        // Fallback baseline pre-fill
        const base = BASELINE_DATA[editId];
        setTitle(base.title);
        setDifficulty(base.difficulty);
        setTags(base.tags);
        setDescription(base.description);
        setInputFormat(base.inputFormat);
        setOutputFormat(base.outputFormat);
        setConstraints(base.constraints);
        setTestcases(base.testcases || []);
      }
    };

    loadQuestionData();
  }, [editId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const qId = editId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '10000000-0000-0000-0000-' + Date.now().toString().padStart(12, '0'));
    const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const validTestcases = testcases.filter((tc) => tc.input.trim() !== '' || tc.expected_output.trim() !== '');

    const apiPayload = {
      title: title.trim(),
      description,
      difficulty,
      input_format: inputFormat,
      output_format: outputFormat,
      constraints: constraints.split('\n').filter(Boolean),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      testcases: validTestcases.map((tc) => ({
        input: tc.input,
        expected_output: tc.expected_output,
        is_hidden: tc.is_hidden,
      })),
    };

    let activeQuestionId = qId;

    // 1. Submit directly to backend API (bypasses Supabase RLS limits with SQL connection)
    try {
      const endpoint = editId ? `${API_URL}/questions/${editId}` : `${API_URL}/questions`;
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData?.id) {
          activeQuestionId = resData.id;
        }
      }
    } catch (apiErr) {
      console.warn('Backend API save notice:', apiErr);
    }

    // 2. Local memory persistence object
    const questionObj = {
      id: activeQuestionId,
      title: title.trim(),
      title_slug: titleSlug,
      description,
      difficulty,
      input_format: inputFormat,
      output_format: outputFormat,
      constraints: constraints.split('\n').filter(Boolean),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      testcases: validTestcases,
      sample_count: validTestcases.filter((tc) => !tc.is_hidden).length,
      hidden_count: validTestcases.filter((tc) => tc.is_hidden).length,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const customQuestions: any[] = JSON.parse(localStorage.getItem('custom_questions') || '[]');
    const existingIdx = customQuestions.findIndex((q) => q.id === qId || q.id === activeQuestionId || q.title_slug === titleSlug);
    if (existingIdx >= 0) {
      customQuestions[existingIdx] = questionObj;
    } else {
      customQuestions.push(questionObj);
    }
    localStorage.setItem('custom_questions', JSON.stringify(customQuestions));

    setSuccessMsg(editId ? 'Question & Testcases updated successfully!' : 'New Question & Testcases published successfully!');
    setTimeout(() => {
      setLoading(false);
      router.push('/admin/questions');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#bbcabf] mb-1">
            <Link href="/admin/questions" className="hover:text-[#10b981]">Question Bank</Link>
            <span>/</span>
            <span className="text-[#10b981]">{editId ? 'Edit Question' : 'New Question Builder'}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#dbe2fd] tracking-tight">
            {editId ? `Edit Question — ${title || 'Existing Question'}` : 'Create New Question'}
          </h1>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#bbcabf] mb-1">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Valid Parentheses"
                className="w-full bg-[#0b1326] border border-[#3c4a42] rounded p-2.5 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/40 focus:outline-none focus:border-[#10b981] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#bbcabf] mb-1">Difficulty *</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-[#0b1326] border border-[#3c4a42] rounded p-2.5 text-xs text-[#dbe2fd] focus:outline-none focus:border-[#10b981] font-mono"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#bbcabf] mb-1">Topic Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. String, Stack, Two Pointers"
              className="w-full bg-[#0b1326] border border-[#3c4a42] rounded p-2.5 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/40 focus:outline-none focus:border-[#10b981] font-mono"
            />
          </div>
        </div>

        {/* Section 2: Problem Description */}
        <div className="bg-[#131b2e] border border-[#1f2937] p-6 rounded space-y-4">
          <h3 className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider border-b border-[#1f2937] pb-3 flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            2. Problem Description & Formats
          </h3>

          <div>
            <label className="block text-xs font-mono text-[#bbcabf] mb-1">Description (Markdown Supported) *</label>
            <textarea
              rows={6}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed problem statement..."
              className="w-full bg-[#0b1326] border border-[#3c4a42] rounded p-3 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/40 focus:outline-none focus:border-[#10b981] font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#bbcabf] mb-1">Input Format</label>
              <textarea
                rows={3}
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
                placeholder="e.g. Line 1: N\nLine 2: N integers"
                className="w-full bg-[#0b1326] border border-[#3c4a42] rounded p-3 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/40 focus:outline-none focus:border-[#10b981] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#bbcabf] mb-1">Output Format</label>
              <textarea
                rows={3}
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                placeholder="e.g. Single space-separated line"
                className="w-full bg-[#0b1326] border border-[#3c4a42] rounded p-3 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/40 focus:outline-none focus:border-[#10b981] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#bbcabf] mb-1">Constraints (one per line)</label>
            <textarea
              rows={3}
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="1 <= N <= 10^4\n-10^9 <= nums[i] <= 10^9"
              className="w-full bg-[#0b1326] border border-[#3c4a42] rounded p-3 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/40 focus:outline-none focus:border-[#10b981] font-mono"
            />
          </div>
        </div>

        {/* Section 3: Testcases (Public & Hidden) */}
        <div className="bg-[#131b2e] border border-[#1f2937] p-6 rounded space-y-4">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
            <h3 className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              3. Testcases (Judge0 Engine)
            </h3>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => addTestcase(false)}
                className="bg-[#0b1326] hover:bg-[#171f33] border border-[#3c4a42] text-[#10b981] text-[11px] font-mono px-3 py-1 rounded flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>+ Public Case</span>
              </button>
              <button
                type="button"
                onClick={() => addTestcase(true)}
                className="bg-[#0b1326] hover:bg-[#171f33] border border-[#3c4a42] text-[#f59e0b] text-[11px] font-mono px-3 py-1 rounded flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>+ Hidden Case</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {testcases.map((tc, idx) => (
              <div key={idx} className="p-4 bg-[#0b1326] border border-[#3c4a42] rounded space-y-3 relative font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    tc.is_hidden 
                      ? 'bg-[#3d2a00] text-[#f59e0b] border border-[#78350f]' 
                      : 'bg-[#003824] text-[#10b981] border border-[#005236]'
                  }`}>
                    {tc.is_hidden ? 'HIDDEN TESTCASE' : 'PUBLIC SAMPLE CASE'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTestcase(idx)}
                    className="text-[#bbcabf] hover:text-[#f87171] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#bbcabf] mb-1">Standard Input (stdin)</label>
                    <textarea
                      rows={2}
                      value={tc.input}
                      onChange={(e) => updateTestcase(idx, 'input', e.target.value)}
                      placeholder="Enter custom input for this question..."
                      className="w-full bg-[#131b2e] border border-[#3c4a42] rounded p-2 text-xs text-[#dbe2fd] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#bbcabf] mb-1">Expected Output (stdout)</label>
                    <textarea
                      rows={2}
                      value={tc.expected_output}
                      onChange={(e) => updateTestcase(idx, 'expected_output', e.target.value)}
                      placeholder="Enter expected output..."
                      className="w-full bg-[#131b2e] border border-[#3c4a42] rounded p-2 text-xs text-[#dbe2fd] font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#10b981] hover:bg-[#4edea3] text-[#0b1326] font-mono font-bold text-xs px-6 py-3 rounded shadow-lg shadow-[#10b981]/20 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Saving Question...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{editId ? 'Update Question & Testcases' : 'Publish Question & Testcases'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminNewQuestionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b1326] text-[#dbe2fd] flex items-center justify-center font-mono text-xs">
        <div className="flex items-center space-x-2 text-[#10b981] animate-pulse">
          <Terminal className="w-5 h-5" />
          <span>Loading Question Form...</span>
        </div>
      </div>
    }>
      <QuestionFormContent />
    </Suspense>
  );
}
