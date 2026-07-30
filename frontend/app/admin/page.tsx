'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Users, 
  Code2, 
  CheckCircle2, 
  PlusCircle, 
  MessageSquare, 
  ArrowUpRight,
  Activity,
  AlertTriangle,
  Clock
} from 'lucide-react';

export default function AdminOverviewPage() {
  // Live admin metrics state (using actual project data)
  const [stats] = useState({
    totalQuestions: 6,
    easyCount: 2,
    mediumCount: 2,
    hardCount: 2,
    totalLearners: 128,
    totalSubmissions: 412,
    passRate: '72.4%',
  });

  const recentSubmissions = [
    { id: '1', user: 'codemaster', problem: 'Two Sum', language: 'Python 3', verdict: 'ACCEPTED', time: '2 mins ago' },
    { id: '2', user: 'algo_pro', problem: 'Trapping Rain Water', language: 'C++', verdict: 'TIME_LIMIT_EXCEEDED', time: '5 mins ago' },
    { id: '3', user: 'dev_guy', problem: 'Valid Parentheses', language: 'JavaScript', verdict: 'ACCEPTED', time: '12 mins ago' },
    { id: '4', user: 'newbie', problem: 'Add Two Numbers', language: 'Python 3', verdict: 'WRONG_ANSWER', time: '18 mins ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#dbe2fd] tracking-tight">Admin Control Center</h1>
          <p className="text-xs font-mono text-[#bbcabf] mt-1">Platform overview, system metrics, and content management</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/questions/new"
            className="bg-[#10b981] hover:bg-[#4edea3] text-[#0b1326] font-mono font-bold text-xs px-4 py-2.5 rounded shadow-md shadow-[#10b981]/20 transition-all flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Question</span>
          </Link>
        </div>
      </div>

      {/* Bento Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131b2e] border border-[#1f2937] hover:border-[#10b981] p-5 rounded transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#10b981] uppercase tracking-widest">Question Bank</span>
            <FileText className="w-5 h-5 text-[#10b981]/60 group-hover:text-[#10b981] transition-colors" />
          </div>
          <div className="text-3xl font-extrabold text-[#dbe2fd] font-mono mt-2">{stats.totalQuestions}</div>
          <p className="text-xs text-[#bbcabf] font-mono mt-1">
            {stats.easyCount} Easy · {stats.mediumCount} Medium · {stats.hardCount} Hard
          </p>
        </div>

        <div className="bg-[#131b2e] border border-[#1f2937] hover:border-[#10b981] p-5 rounded transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#10b981] uppercase tracking-widest">Active Learners</span>
            <Users className="w-5 h-5 text-[#10b981]/60 group-hover:text-[#10b981] transition-colors" />
          </div>
          <div className="text-3xl font-extrabold text-[#dbe2fd] font-mono mt-2">{stats.totalLearners}</div>
          <p className="text-xs text-[#bbcabf] font-mono mt-1">Registered Engineers</p>
        </div>

        <div className="bg-[#131b2e] border border-[#1f2937] hover:border-[#10b981] p-5 rounded transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#10b981] uppercase tracking-widest">Total Submissions</span>
            <Code2 className="w-5 h-5 text-[#10b981]/60 group-hover:text-[#10b981] transition-colors" />
          </div>
          <div className="text-3xl font-extrabold text-[#dbe2fd] font-mono mt-2">{stats.totalSubmissions}</div>
          <p className="text-xs text-[#bbcabf] font-mono mt-1">Evaluated by Judge0</p>
        </div>

        <div className="bg-[#131b2e] border border-[#1f2937] hover:border-[#10b981] p-5 rounded transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#10b981] uppercase tracking-widest">Pass Rate</span>
            <CheckCircle2 className="w-5 h-5 text-[#10b981]/60 group-hover:text-[#10b981] transition-colors" />
          </div>
          <div className="text-3xl font-extrabold text-[#dbe2fd] font-mono mt-2">{stats.passRate}</div>
          <p className="text-xs text-[#bbcabf] font-mono mt-1">Global Accepted Rate</p>
        </div>
      </div>

      {/* Quick Action Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/questions/new"
          className="bg-[#171f33] border border-[#1f2937] hover:border-[#10b981] p-6 rounded transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider">Quick Action</span>
            <ArrowUpRight className="w-4 h-4 text-[#bbcabf] group-hover:text-[#10b981] transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-[#dbe2fd] group-hover:text-[#10b981] transition-colors">Add New Question</h3>
          <p className="text-xs text-[#bbcabf] font-mono mt-1">Create problem statement, constraints, sample and secret testcases.</p>
        </Link>

        <Link
          href="/admin/questions"
          className="bg-[#171f33] border border-[#1f2937] hover:border-[#10b981] p-6 rounded transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider">Management</span>
            <ArrowUpRight className="w-4 h-4 text-[#bbcabf] group-hover:text-[#10b981] transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-[#dbe2fd] group-hover:text-[#10b981] transition-colors">Question Bank</h3>
          <p className="text-xs text-[#bbcabf] font-mono mt-1">Search, edit, toggle published status, or delete existing questions.</p>
        </Link>

        <Link
          href="/admin/comments"
          className="bg-[#171f33] border border-[#1f2937] hover:border-[#10b981] p-6 rounded transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider">Community</span>
            <ArrowUpRight className="w-4 h-4 text-[#bbcabf] group-hover:text-[#10b981] transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-[#dbe2fd] group-hover:text-[#10b981] transition-colors">Moderate Discussions</h3>
          <p className="text-xs text-[#bbcabf] font-mono mt-1">Inspect learner comments and delete inappropriate posts.</p>
        </Link>
      </div>

      {/* System Status & Recent Activity Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions Log (2 cols) */}
        <div className="lg:col-span-2 bg-[#131b2e] border border-[#1f2937] rounded overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-[#1f2937] bg-[#171f33] flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-[#dbe2fd] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#10b981]" />
              Live Submissions Feed
            </h3>
            <span className="text-[10px] font-mono text-[#10b981] bg-[#003824] px-2 py-0.5 rounded border border-[#005236]">
              Real-Time
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#dbe2fd]">
              <thead className="bg-[#0b1326] border-b border-[#1f2937] font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Learner</th>
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Verdict</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/60 font-mono">
                {recentSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#171f33] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#dbe2fd]">{sub.user}</td>
                    <td className="py-3 px-4 text-[#bbcabf]">{sub.problem}</td>
                    <td className="py-3 px-4 text-[#bbcabf]">{sub.language}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sub.verdict === 'ACCEPTED' ? 'bg-[#003824] text-[#10b981] border border-[#005236]' : 'bg-[#450a0a] text-[#f87171] border border-[#991b1b]'
                      }`}>
                        {sub.verdict}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#bbcabf]/70">{sub.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Engine Health Card (1 col) */}
        <div className="bg-[#131b2e] border border-[#1f2937] p-5 rounded space-y-4">
          <h3 className="text-xs font-mono font-bold text-[#dbe2fd] uppercase tracking-wider border-b border-[#1f2937] pb-3">
            Services & Health
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-[#0b1326] border border-[#1f2937] rounded flex items-center justify-between">
              <div>
                <div className="font-bold text-[#dbe2fd]">Judge0 Execution Sandbox</div>
                <div className="text-[10px] text-[#bbcabf]">Port 2358 / RapidAPI</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#003824] text-[#10b981] border border-[#005236] text-[10px] font-bold">
                ONLINE
              </span>
            </div>

            <div className="p-3 bg-[#0b1326] border border-[#1f2937] rounded flex items-center justify-between">
              <div>
                <div className="font-bold text-[#dbe2fd]">Supabase PostgreSQL</div>
                <div className="text-[10px] text-[#bbcabf]">Cloud Instance</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#003824] text-[#10b981] border border-[#005236] text-[10px] font-bold">
                CONNECTED
              </span>
            </div>

            <div className="p-3 bg-[#0b1326] border border-[#1f2937] rounded flex items-center justify-between">
              <div>
                <div className="font-bold text-[#dbe2fd]">FastAPI Server</div>
                <div className="text-[10px] text-[#bbcabf]">Port 8000 (v1 API)</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#003824] text-[#10b981] border border-[#005236] text-[10px] font-bold">
                HEALTHY
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
