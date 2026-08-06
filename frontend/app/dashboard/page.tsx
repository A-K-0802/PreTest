'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  Terminal, 
  ShieldCheck, 
  CheckCircle2, 
  Code2, 
  Award, 
  Bookmark, 
  LogOut,
  ExternalLink,
  Target,
  Clock,
  Activity
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Live user profile analytics state
  const [stats, setStats] = useState({
    username: 'Engineer',
    email: '',
    role: 'LEARNER',
    solvedCount: 0,
    totalQuestionsCount: 0,
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    accuracy: '0.0%',
    easySolved: 0,
    totalEasy: 0,
    mediumSolved: 0,
    totalMedium: 0,
    hardSolved: 0,
    totalHard: 0,
  });

  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirectedFrom=/dashboard');
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);

      const username = currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || 'Learner';
      const email = currentUser.email || '';
      let role = currentUser.user_metadata?.role || 'LEARNER';

      // 1. Fetch user role profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profile?.role) {
        role = profile.role;
      }

      // 2. Fetch all questions from DB for difficulty totals
      const { data: allQuestions } = await supabase
        .from('questions')
        .select('id, title, title_slug, difficulty');

      const totalQ = allQuestions ? allQuestions.length : 0;
      const totalEasy = allQuestions ? allQuestions.filter(q => q.difficulty === 'EASY').length : 0;
      const totalMed = allQuestions ? allQuestions.filter(q => q.difficulty === 'MEDIUM').length : 0;
      const totalHard = allQuestions ? allQuestions.filter(q => q.difficulty === 'HARD').length : 0;

      const questionDict: Record<string, any> = {};
      if (allQuestions) {
        allQuestions.forEach(q => {
          questionDict[q.id] = q;
        });
      }

      // 3. Fetch user's real submissions from Supabase DB
      const { data: subsData } = await supabase
        .from('submissions')
        .select('*, questions(id, title, title_slug, difficulty)')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      let totalSubs = 0;
      let acceptedSubs = 0;
      const solvedQuestionIds = new Set<string>();
      const easySolvedSet = new Set<string>();
      const medSolvedSet = new Set<string>();
      const hardSolvedSet = new Set<string>();

      if (subsData && subsData.length > 0) {
        totalSubs = subsData.length;
        setRecentSubmissions(subsData.slice(0, 8));

        subsData.forEach((sub: any) => {
          if (sub.verdict === 'ACCEPTED') {
            acceptedSubs += 1;
            const qId = sub.question_id || sub.questions?.id;
            if (qId) {
              solvedQuestionIds.add(String(qId));
              const diff = sub.questions?.difficulty || questionDict[qId]?.difficulty || 'EASY';
              if (diff === 'EASY') easySolvedSet.add(String(qId));
              else if (diff === 'MEDIUM') medSolvedSet.add(String(qId));
              else if (diff === 'HARD') hardSolvedSet.add(String(qId));
            }
          }
        });
      }

      const accRate = totalSubs > 0 
        ? ((acceptedSubs / totalSubs) * 100).toFixed(1) + '%' 
        : '0.0%';

      setStats({
        username,
        email,
        role,
        solvedCount: solvedQuestionIds.size,
        totalQuestionsCount: totalQ,
        totalSubmissions: totalSubs,
        acceptedSubmissions: acceptedSubs,
        accuracy: accRate,
        easySolved: easySolvedSet.size,
        totalEasy,
        mediumSolved: medSolvedSet.size,
        totalMedium: totalMed,
        hardSolved: hardSolvedSet.size,
        totalHard,
      });

      setLoading(false);
    };

    fetchUserAnalytics();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1326] text-[#dbe2fd] flex items-center justify-center font-mono text-xs">
        <div className="flex items-center space-x-2 text-[#10b981] animate-pulse">
          <Terminal className="w-5 h-5" />
          <span>Fetching your live profile analytics from database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dbe2fd] flex flex-col font-sans selection:bg-[#10b981] selection:text-[#0b1326]">
      {/* Top Header */}
      <header className="border-b border-[#1f2937] bg-[#0b1326] px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center font-bold">
            <Terminal className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-bold text-xl text-[#dbe2fd]">
            TestPrep <span className="text-xs text-[#10b981] font-mono">Dashboard</span>
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xs font-mono text-[#bbcabf] hover:text-[#10b981] transition-colors">
            Problemset
          </Link>
          <Link href="/submissions" className="text-xs font-mono text-[#bbcabf] hover:text-[#10b981] transition-colors">
            Submissions History
          </Link>
          <button
            onClick={handleSignOut}
            className="text-xs font-mono text-[#bbcabf] hover:text-rose-400 p-1.5 transition-colors flex items-center gap-1"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto w-full px-6 py-8 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-[#131b2e] border border-[#1f2937] p-8 rounded-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center text-2xl font-extrabold shadow-lg shadow-[#10b981]/20 font-mono">
              {stats.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-[#dbe2fd] tracking-tight">{stats.username}</h1>
                <span className="px-2.5 py-0.5 rounded bg-[#003824] text-[#10b981] border border-[#005236] text-[10px] font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {stats.role}
                </span>
              </div>
              <p className="text-xs text-[#bbcabf] font-mono mt-1">{stats.email}</p>
            </div>
          </div>

          <Link
            href="/"
            className="bg-[#10b981] hover:bg-[#4edea3] text-[#0b1326] font-mono font-bold text-xs px-5 py-2.5 rounded shadow-md shadow-[#10b981]/20 transition-all text-center w-full md:w-auto"
          >
            Solve Problems →
          </Link>
        </div>

        {/* LeetCode-Style Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Box 1: Overall Solved Card & Circular Accuracy */}
          <div className="bg-[#131b2e] border border-[#1f2937] p-6 rounded-md shadow-xl flex flex-col justify-between font-mono space-y-6">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <span className="text-xs font-bold text-[#10b981] uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4" /> Solved Progress
              </span>
              <span className="text-[10px] text-[#bbcabf]">
                {stats.solvedCount}/{stats.totalQuestionsCount || 10} Total
              </span>
            </div>

            <div className="flex items-center justify-around py-4">
              <div className="relative w-32 h-32 rounded-full border-4 border-[#10b981] flex flex-col items-center justify-center bg-[#0b1326] shadow-lg shadow-[#10b981]/10">
                <span className="text-3xl font-extrabold text-[#dbe2fd]">{stats.solvedCount}</span>
                <span className="text-[10px] text-[#10b981] uppercase font-bold tracking-wider">Solved</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#bbcabf] text-[10px] block">Acceptance Rate</span>
                  <span className="text-2xl font-extrabold text-[#10b981]">{stats.accuracy}</span>
                </div>
                <div>
                  <span className="text-[#bbcabf] text-[10px] block">Total Submissions</span>
                  <span className="text-sm font-bold text-[#dbe2fd]">{stats.totalSubmissions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Box 2: Easy / Medium / Hard Difficulty Breakdown */}
          <div className="bg-[#131b2e] border border-[#1f2937] p-6 rounded-md shadow-xl font-mono space-y-6">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <span className="text-xs font-bold text-[#10b981] uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4" /> Difficulty Breakdown
              </span>
            </div>

            <div className="space-y-5 text-xs">
              {/* Easy Progress */}
              <div>
                <div className="flex justify-between font-bold mb-1.5">
                  <span className="text-[#10b981]">Easy</span>
                  <span className="text-[#dbe2fd]">{stats.easySolved} / {stats.totalEasy || 4}</span>
                </div>
                <div className="w-full bg-[#0b1326] h-2.5 rounded-full overflow-hidden border border-[#1f2937]">
                  <div
                    className="bg-[#10b981] h-full transition-all"
                    style={{ width: `${stats.totalEasy > 0 ? (stats.easySolved / stats.totalEasy) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Medium Progress */}
              <div>
                <div className="flex justify-between font-bold mb-1.5">
                  <span className="text-[#f59e0b]">Medium</span>
                  <span className="text-[#dbe2fd]">{stats.mediumSolved} / {stats.totalMedium || 4}</span>
                </div>
                <div className="w-full bg-[#0b1326] h-2.5 rounded-full overflow-hidden border border-[#1f2937]">
                  <div
                    className="bg-[#f59e0b] h-full transition-all"
                    style={{ width: `${stats.totalMedium > 0 ? (stats.mediumSolved / stats.totalMedium) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Hard Progress */}
              <div>
                <div className="flex justify-between font-bold mb-1.5">
                  <span className="text-[#f87171]">Hard</span>
                  <span className="text-[#dbe2fd]">{stats.hardSolved} / {stats.totalHard || 2}</span>
                </div>
                <div className="w-full bg-[#0b1326] h-2.5 rounded-full overflow-hidden border border-[#1f2937]">
                  <div
                    className="bg-[#f87171] h-full transition-all"
                    style={{ width: `${stats.totalHard > 0 ? (stats.hardSolved / stats.totalHard) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Box 3: Recent Activity Trajectory */}
          <div className="bg-[#131b2e] border border-[#1f2937] p-6 rounded-md shadow-xl font-mono space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <span className="text-xs font-bold text-[#10b981] uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4" /> Recent Submissions
              </span>
              <Link href="/submissions" className="text-[10px] text-[#10b981] hover:underline flex items-center gap-1">
                <span>View All</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {recentSubmissions.length === 0 ? (
              <div className="py-8 text-center text-[#bbcabf] text-xs">
                No submissions recorded yet. Start solving problems on the Problemset!
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {recentSubmissions.map((sub) => (
                  <div key={sub.id} className="p-2.5 bg-[#0b1326] border border-[#1f2937] rounded flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate max-w-[180px]">
                      <span className={`w-2 h-2 rounded-full ${sub.verdict === 'ACCEPTED' ? 'bg-[#10b981]' : 'bg-[#f87171]'}`}></span>
                      <span className="font-bold text-[#dbe2fd] truncate">
                        {sub.questions?.title || 'Problem'}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sub.verdict === 'ACCEPTED' 
                        ? 'bg-[#003824] text-[#10b981] border border-[#005236]' 
                        : 'bg-[#3b0914] text-[#f87171] border border-[#7f1d1d]'
                    }`}>
                      {sub.verdict}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
