'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, ShieldCheck, CheckCircle2, Code2, Award, ArrowRight, Bookmark } from 'lucide-react';

export default function DashboardPage() {
  const [user] = useState({
    username: 'CodeExplorer',
    email: 'user@example.com',
    role: 'LEARNER',
    solvedCount: 14,
    totalSubmissions: 32,
    accuracy: '78.5%',
    easySolved: 8,
    mediumSolved: 5,
    hardSolved: 1,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-extrabold text-lg shadow-lg shadow-indigo-500/20">
            ⚡
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            CodeForge <span className="text-xs text-indigo-400">DSA</span>
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/problems" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Problems
          </Link>
          <Link href="/submissions" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Submissions
          </Link>
        </div>
      </header>

      {/* Dashboard Main Content */}
      <main className="max-w-6xl mx-auto w-full px-6 py-10">
        {/* Profile Banner */}
        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center space-x-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-indigo-500/30">
              {user.username.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user.role}
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/problems"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] text-center w-full md:w-auto"
            >
              Solve Problems →
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Problems Solved</p>
            <p className="text-3xl font-extrabold text-white mt-1">{user.solvedCount}</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <Code2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Submissions</p>
            <p className="text-3xl font-extrabold text-white mt-1">{user.totalSubmissions}</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Acceptance Rate</p>
            <p className="text-3xl font-extrabold text-white mt-1">{user.accuracy}</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-3">
              <Bookmark className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bookmarked</p>
            <p className="text-3xl font-extrabold text-white mt-1">4</p>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Difficulty Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase">Easy</span>
              <span className="text-lg font-extrabold text-white">{user.easySolved}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase">Medium</span>
              <span className="text-lg font-extrabold text-white">{user.mediumSolved}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase">Hard</span>
              <span className="text-lg font-extrabold text-white">{user.hardSolved}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
