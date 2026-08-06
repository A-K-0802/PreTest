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
  MessageSquare,
  Flag,
  Sparkles
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
    totalComments: 0,
    flaggedCommentsCount: 0,
    passRate: '0.0%',
  });

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
        const { count: learnersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // 3. Fetch total & flagged discussion comments from 'comments' table
        const { data: commentsData } = await supabase
          .from('comments')
          .select('id, is_flagged');

        let totalComments = 0;
        let flaggedCount = 0;

        if (commentsData) {
          totalComments = commentsData.length;
          flaggedCount = commentsData.filter((c: any) => c.is_flagged).length;
        }

        // 4. Fetch real submissions and calculate acceptance pass rate
        const { data: subsData, error: sErr } = await supabase
          .from('submissions')
          .select('verdict');

        let subsCount = 0;
        let acceptedCount = 0;

        if (!sErr && subsData) {
          subsCount = subsData.length;
          acceptedCount = subsData.filter((s: any) => s.verdict === 'ACCEPTED').length;
        }

        const calculatedPassRate = subsCount > 0 
          ? ((acceptedCount / subsCount) * 100).toFixed(1) + '%' 
          : '0.0%';

        setStats({
          totalQuestions: totalQ,
          easyCount: easyQ,
          mediumCount: medQ,
          hardCount: hardQ,
          totalLearners: learnersCount || 0,
          totalSubmissions: subsCount,
          totalComments,
          flaggedCommentsCount: flaggedCount,
          passRate: calculatedPassRate,
        });
      } catch (err) {
        console.warn('Admin metrics error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealAdminMetrics();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#dbe2fd] tracking-tight">System Overview Dashboard</h1>
          <p className="text-xs font-mono text-[#bbcabf] mt-1">
            Real-time administrative analytics across question bank, discussions, and learner stats.
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

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Question Bank */}
        <div className="bg-[#131b2e] border border-[#1f2937] p-5 rounded relative overflow-hidden font-mono">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#bbcabf] font-semibold uppercase tracking-wider">Total Questions</span>
            <div className="p-2 rounded bg-[#003824] text-[#10b981] border border-[#005236]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#dbe2fd]">{loading ? '...' : stats.totalQuestions}</span>
            <span className="text-[10px] text-[#10b981]">
              E:{stats.easyCount} | M:{stats.mediumCount} | H:{stats.hardCount}
            </span>
          </div>
          <Link
            href="/admin/questions"
            className="mt-3 text-[11px] text-[#10b981] hover:underline flex items-center gap-1 inline-block"
          >
            <span>Manage Question Bank</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 2: Active Learners */}
        <div className="bg-[#131b2e] border border-[#1f2937] p-5 rounded relative overflow-hidden font-mono">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#bbcabf] font-semibold uppercase tracking-wider">Registered Users</span>
            <div className="p-2 rounded bg-[#003824] text-[#10b981] border border-[#005236]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#dbe2fd]">{loading ? '...' : stats.totalLearners}</span>
            <span className="text-[10px] text-[#bbcabf]">Active Profiles</span>
          </div>
          <div className="mt-3 text-[11px] text-[#bbcabf] flex items-center gap-1">
            <span>Supabase User Records</span>
          </div>
        </div>

        {/* Card 3: Discussions & Flagged Comments */}
        <div className="bg-[#131b2e] border border-[#1f2937] p-5 rounded relative overflow-hidden font-mono">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#bbcabf] font-semibold uppercase tracking-wider">Discussions</span>
            <div className="p-2 rounded bg-[#003824] text-[#10b981] border border-[#005236]">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#dbe2fd]">{loading ? '...' : stats.totalComments}</span>
            <span className="text-[10px] text-[#f59e0b] font-bold">
              🚩 {stats.flaggedCommentsCount} Flagged
            </span>
          </div>
          <Link
            href="/admin/comments"
            className="mt-3 text-[11px] text-[#10b981] hover:underline flex items-center gap-1 inline-block"
          >
            <span>Moderate Question Discussions</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 4: Platform Pass Rate */}
        <div className="bg-[#131b2e] border border-[#1f2937] p-5 rounded relative overflow-hidden font-mono">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#bbcabf] font-semibold uppercase tracking-wider">Acceptance Rate</span>
            <div className="p-2 rounded bg-[#003824] text-[#10b981] border border-[#005236]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#10b981]">{loading ? '...' : stats.passRate}</span>
            <span className="text-[10px] text-[#bbcabf]">({stats.totalSubmissions} Subs)</span>
          </div>
          <div className="mt-3 text-[11px] text-[#bbcabf] flex items-center gap-1">
            <span>Overall Platform Score</span>
          </div>
        </div>
      </div>

      {/* Admin Quick Action Banner */}
      <div className="bg-[#131b2e] border border-[#1f2937] rounded p-6 font-mono space-y-3">
        <div className="flex items-center space-x-2 text-[#10b981] font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Admin Workspace Control</span>
        </div>
        <p className="text-xs text-[#bbcabf] leading-relaxed">
          Manage questions, review community discussions grouped question-wise, and flag important posts or issue reports directly from the <Link href="/admin/comments" className="text-[#10b981] hover:underline">Discussion Moderator</Link>.
        </p>
      </div>
    </div>
  );
}
