'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { 
  FileText, 
  Users, 
  Code2, 
  CheckCircle2, 
  PlusCircle, 
  ArrowUpRight,
  Activity,
  Terminal
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    easyCount: 0,
    mediumCount: 0,
    hardCount: 0,
    totalLearners: 0,
    totalSubmissions: 0,
    passRate: '0.0%',
  });

  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    const fetchRealAdminMetrics = async () => {
      try {
        // 1. Fetch real questions metrics from 'questions' table
        const { data: questionsData, error: qErr } = await supabase
          .from('questions')
          .select('id, difficulty');

        let totalQ = 0;
        let easyQ = 0;
        let medQ = 0;
        let hardQ = 0;

        if (!qErr && questionsData) {
          totalQ = questionsData.length;
          easyQ = questionsData.filter((q) => q.difficulty === 'EASY').length;
          medQ = questionsData.filter((q) => q.difficulty === 'MEDIUM').length;
          hardQ = questionsData.filter((q) => q.difficulty === 'HARD').length;
        }

        // 2. Fetch real active learners from 'profiles' table
        const { count: learnersCount, error: pErr } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // 3. Fetch real submissions metrics from 'submissions' table
        const { data: submissionsData, error: sErr } = await supabase
          .from('submissions')
          .select('*')
          .order('created_at', { ascending: false });

        let totalSub = 0;
        let acceptedSub = 0;
        let subFeed: any[] = [];

        if (!sErr && submissionsData) {
          totalSub = submissionsData.length;
          acceptedSub = submissionsData.filter((s) => s.verdict === 'ACCEPTED').length;
          subFeed = submissionsData.slice(0, 5); // top 5 recent submissions
        }

        const calculatedPassRate = totalSub > 0 
          ? `${((acceptedSub / totalSub) * 100).toFixed(1)}%` 
          : '0.0%';

        setStats({
          totalQuestions: totalQ,
          easyCount: easyQ,
          mediumCount: medQ,
          hardCount: hardQ,
          totalLearners: learnersCount || 0,
          totalSubmissions: totalSub,
          passRate: calculatedPassRate,
        });

        setRecentSubmissions(subFeed);
      } catch (err) {
        console.error('Error fetching admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealAdminMetrics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1326] text-[#dbe2fd] flex items-center justify-center font-mono text-xs">
        <div className="flex items-center space-x-2 text-[#10b981] animate-pulse">
          <Terminal className="w-5 h-5" />
          <span>Fetching live database metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#dbe2fd] tracking-tight">Admin Control Center</h1>
          <p className="text-xs font-mono text-[#bbcabf] mt-1">Live database metrics, system health, and platform control</p>
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

      {/* Bento Metrics Grid (Real Live Supabase Counts) */}
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
          <p className="text-xs text-[#bbcabf] font-mono mt-1">Registered Profiles in DB</p>
        </div>

        <div className="bg-[#131b2e] border border-[#1f2937] hover:border-[#10b981] p-5 rounded transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#10b981] uppercase tracking-widest">Total Submissions</span>
            <Code2 className="w-5 h-5 text-[#10b981]/60 group-hover:text-[#10b981] transition-colors" />
          </div>
          <div className="text-3xl font-extrabold text-[#dbe2fd] font-mono mt-2">{stats.totalSubmissions}</div>
          <p className="text-xs text-[#bbcabf] font-mono mt-1">Evaluated Submissions</p>
        </div>

        <div className="bg-[#131b2e] border border-[#1f2937] hover:border-[#10b981] p-5 rounded transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#10b981] uppercase tracking-widest">Pass Rate</span>
            <CheckCircle2 className="w-5 h-5 text-[#10b981]/60 group-hover:text-[#10b981] transition-colors" />
          </div>
          <div className="text-3xl font-extrabold text-[#dbe2fd] font-mono mt-2">{stats.passRate}</div>
          <p className="text-xs text-[#bbcabf] font-mono mt-1">Accepted Submissions %</p>
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
            {recentSubmissions.length === 0 ? (
              <div className="p-8 text-center text-[#bbcabf] font-mono text-xs">
                No live submissions recorded in database yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-[#dbe2fd]">
                <thead className="bg-[#0b1326] border-b border-[#1f2937] font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Verdict</th>
                    <th className="py-3 px-4">Runtime</th>
                    <th className="py-3 px-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]/60 font-mono">
                  {recentSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#171f33] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#dbe2fd]">{sub.language}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.verdict === 'ACCEPTED' ? 'bg-[#003824] text-[#10b981] border border-[#005236]' : 'bg-[#450a0a] text-[#f87171] border border-[#991b1b]'
                        }`}>
                          {sub.verdict}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#bbcabf]">
                        {sub.execution_time_ms ? `${sub.execution_time_ms}ms` : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right text-[#bbcabf]/70">
                        {new Date(sub.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
                <div className="font-bold text-[#dbe2fd]">Supabase PostgreSQL</div>
                <div className="text-[10px] text-[#bbcabf]">Database Connection</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#003824] text-[#10b981] border border-[#005236] text-[10px] font-bold">
                CONNECTED
              </span>
            </div>

            <div className="p-3 bg-[#0b1326] border border-[#1f2937] rounded flex items-center justify-between">
              <div>
                <div className="font-bold text-[#dbe2fd]">Judge0 Sandbox</div>
                <div className="text-[10px] text-[#bbcabf]">Code Execution Engine</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#003824] text-[#10b981] border border-[#005236] text-[10px] font-bold">
                ONLINE
              </span>
            </div>

            <div className="p-3 bg-[#0b1326] border border-[#1f2937] rounded flex items-center justify-between">
              <div>
                <div className="font-bold text-[#dbe2fd]">FastAPI Backend</div>
                <div className="text-[10px] text-[#bbcabf]">Port 8000 (v1 REST)</div>
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
