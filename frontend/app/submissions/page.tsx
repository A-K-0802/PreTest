'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, History, CheckCircle2, XCircle, Clock, MemoryStick as Memory } from 'lucide-react';
import { Submission, Verdict } from '@/types';

const SAMPLE_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    user_id: 'usr-1',
    question_id: 'q-1',
    language: 'Python 3',
    code: 'class Solution:\n    def twoSum(self, nums, target):\n        d = {}\n        for i, n in enumerate(nums):\n            if target - n in d:\n                return [d[target - n], i]\n            d[n] = i',
    verdict: 'ACCEPTED',
    execution_time_ms: 34,
    memory_kb: 16100,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'sub-2',
    user_id: 'usr-1',
    question_id: 'q-1',
    language: 'Python 3',
    code: 'class Solution:\n    def twoSum(self, nums, target):\n        return []',
    verdict: 'WRONG_ANSWER',
    execution_time_ms: 12,
    memory_kb: 14200,
    error_message: 'Failed on testcase 2: Expected [1,2], got []',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'sub-3',
    user_id: 'usr-1',
    question_id: 'q-2',
    language: 'C++',
    code: '#include <vector>\nusing namespace std;\n...',
    verdict: 'TIME_LIMIT_EXCEEDED',
    execution_time_ms: 2000,
    memory_kb: 32400,
    error_message: 'CPU Time limit (2.0s) exceeded.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function SubmissionsHistoryPage() {
  const [submissions] = useState<Submission[]>(SAMPLE_SUBMISSIONS);

  const getVerdictBadge = (verdict: Verdict) => {
    switch (verdict) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case 'WRONG_ANSWER':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-xs">
            <XCircle className="w-3.5 h-3.5" /> Wrong Answer
          </span>
        );
      case 'TIME_LIMIT_EXCEEDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-xs">
            <Clock className="w-3.5 h-3.5" /> Time Limit Exceeded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-bold text-xs">
            {verdict}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/problems" className="text-slate-400 hover:text-white flex items-center space-x-1 text-sm font-medium transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Problems</span>
          </Link>
          <span className="text-slate-700">|</span>
          <span className="font-bold text-white text-base flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Submission History
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-6 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">My Submissions</h1>
        <p className="text-slate-400 text-sm mb-8">Review your past code submissions, runtime performance, and verdicts</p>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Verdict</th>
                  <th className="py-4 px-6">Language</th>
                  <th className="py-4 px-6">Runtime</th>
                  <th className="py-4 px-6">Memory</th>
                  <th className="py-4 px-6">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      {getVerdictBadge(sub.verdict)}
                    </td>
                    <td className="py-4 px-6 text-slate-200 font-semibold">
                      {sub.language}
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {sub.execution_time_ms ? `${sub.execution_time_ms} ms` : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {sub.memory_kb ? `${(sub.memory_kb / 1024).toFixed(1)} MB` : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(sub.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
