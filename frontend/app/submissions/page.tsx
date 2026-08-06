'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Terminal, CheckCircle2, XCircle, Clock, FileCode, ExternalLink, AlertOctagon, AlertTriangle } from 'lucide-react';
import { Verdict } from '@/types';

export default function SubmissionsHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserSubmissions = async () => {
      // 1. Verify user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirectedFrom=/submissions');
        return;
      }

      // 2. Query user's real submissions from Supabase 'submissions' table joined with 'questions'
      const { data, error: fetchError } = await supabase
        .from('submissions')
        .select('*, questions(title, title_slug)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.warn('Could not fetch submissions from DB:', fetchError.message);
        setSubmissions([]);
      } else {
        setSubmissions(data || []);
      }

      setLoading(false);
    };

    fetchUserSubmissions();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1326] text-[#dbe2fd] flex items-center justify-center font-mono text-xs">
        <div className="flex items-center space-x-2 text-[#10b981] animate-pulse">
          <Terminal className="w-5 h-5" />
          <span>Fetching your submission history from Supabase...</span>
        </div>
      </div>
    );
  }

  const getVerdictBadge = (verdict: Verdict) => {
    switch (verdict) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#003824] text-[#10b981] border border-[#005236] font-mono font-bold text-[10px]">
            <CheckCircle2 className="w-3 h-3" /> ACCEPTED
          </span>
        );
      case 'WRONG_ANSWER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#450a0a] text-[#f87171] border border-[#991b1b] font-mono font-bold text-[10px]">
            <XCircle className="w-3 h-3" /> WRONG ANSWER
          </span>
        );
      case 'TIME_LIMIT_EXCEEDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#3d2a00] text-[#f59e0b] border border-[#78350f] font-mono font-bold text-[10px]">
            <Clock className="w-3 h-3" /> TLE
          </span>
        );
      case 'COMPILATION_ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#3b0914] text-[#f87171] border border-[#7f1d1d] font-mono font-bold text-[10px]">
            <AlertOctagon className="w-3 h-3" /> COMPILATION ERROR
          </span>
        );
      case 'RUNTIME_ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#3b0914] text-[#f87171] border border-[#7f1d1d] font-mono font-bold text-[10px]">
            <AlertTriangle className="w-3 h-3" /> RUNTIME ERROR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#171f33] text-[#dbe2fd] font-mono font-bold text-[10px]">
            {verdict}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dbe2fd] flex flex-col font-sans selection:bg-[#10b981] selection:text-[#0b1326]">
      {/* Top Header */}
      <header className="border-b border-[#1f2937] bg-[#0b1326] px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center font-bold">
              <Terminal className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-bold text-xl text-[#dbe2fd]">
              TestPrep <span className="text-xs text-[#10b981] font-mono">Submissions</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4 font-mono">
          <Link href="/" className="text-xs text-[#bbcabf] hover:text-[#10b981] transition-colors">
            Problemset
          </Link>
          <Link href="/dashboard" className="text-xs text-[#bbcabf] hover:text-[#10b981] transition-colors">
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#dbe2fd]">Submission History</h1>
            <p className="text-xs font-mono text-[#bbcabf] mt-1">Live evaluated code submissions from your account</p>
          </div>
        </div>

        {/* High-Density Submissions Table */}
        <div className="bg-[#131b2e] border border-[#1f2937] rounded-md overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            {submissions.length === 0 ? (
              <div className="p-12 text-center text-[#bbcabf] font-mono text-xs space-y-3">
                <FileCode className="w-8 h-8 text-[#10b981]/40 mx-auto" />
                <p className="text-[#dbe2fd] font-bold">No submissions found yet.</p>
                <p className="text-[#bbcabf]/70">Solve a problem on the <Link href="/" className="text-[#10b981] hover:underline">Problemset</Link> and click Submit to record your first entry!</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-[#dbe2fd]">
                <thead className="bg-[#171f33] border-b border-[#1f2937] font-mono text-[11px] text-[#bbcabf] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Problem</th>
                    <th className="py-3.5 px-6">Verdict</th>
                    <th className="py-3.5 px-6">Language</th>
                    <th className="py-3.5 px-6">Execution Time</th>
                    <th className="py-3.5 px-6">Memory Used</th>
                    <th className="py-3.5 px-6 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]/60 font-mono">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#171f33] transition-colors">
                      <td className="py-4 px-6 font-bold text-[#dbe2fd]">
                        {sub.questions?.title_slug ? (
                          <Link
                            href={`/problems/${sub.questions.title_slug}`}
                            className="hover:text-[#10b981] inline-flex items-center gap-1 transition-colors"
                          >
                            <span>{sub.questions.title}</span>
                            <ExternalLink className="w-3 h-3 text-[#bbcabf]" />
                          </Link>
                        ) : (
                          sub.questions?.title || 'Problem'
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {getVerdictBadge(sub.verdict)}
                      </td>
                      <td className="py-4 px-6 text-[#dbe2fd] font-semibold">
                        {sub.language}
                      </td>
                      <td className="py-4 px-6 text-[#bbcabf]">
                        {sub.execution_time_ms ? `${sub.execution_time_ms} ms` : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-[#bbcabf]">
                        {sub.memory_kb ? `${(sub.memory_kb / 1024).toFixed(1)} MB` : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-right text-[#bbcabf]/70">
                        {new Date(sub.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
