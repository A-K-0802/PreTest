import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header / Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-extrabold text-lg shadow-lg shadow-indigo-500/20">
              ⚡
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              TestPrep <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">DSA</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <Link href="/problems" className="hover:text-indigo-400 transition-colors">Problems</Link>
            <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link>
            <Link href="/submissions" className="hover:text-indigo-400 transition-colors">Submissions</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6 animate-pulse">
          <span>✨ Welcome to TestPrep DSA Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Master Data Structures & Algorithms with{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Real-Time Code Execution
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed">
          Solve curated coding challenges, write code in an embedded Monaco IDE, run hidden test cases securely, and track your interview readiness.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/problems"
            className="w-full sm:w-auto text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-8 py-3.5 rounded-xl shadow-xl shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 text-center"
          >
            Explore Problems →
          </Link>
          <Link
            href="/problems/two-sum"
            className="w-full sm:w-auto text-base font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 px-8 py-3.5 rounded-xl transition-all hover:text-white text-center"
          >
            Try Online IDE Demo
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all hover:-translate-y-1 shadow-lg shadow-black/40">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl font-bold mb-4">
              💻
            </div>
            <h3 className="text-xl font-bold text-slate-100">VS Code Monaco Editor</h3>
            <p className="mt-2 text-slate-400 text-sm leading-relaxed">
              Enjoy syntax highlighting, autocomplete, line numbers, and custom keybindings right inside your browser.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 transition-all hover:-translate-y-1 shadow-lg shadow-black/40">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-2xl font-bold mb-4">
              🛡️
            </div>
            <h3 className="text-xl font-bold text-slate-100">Judge0 Sandboxing</h3>
            <p className="mt-2 text-slate-400 text-sm leading-relaxed">
              Compile and run code across Python, C++, Java, and JavaScript with exact CPU time and memory monitoring.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-pink-500/40 transition-all hover:-translate-y-1 shadow-lg shadow-black/40">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center text-2xl font-bold mb-4">
              📊
            </div>
            <h3 className="text-xl font-bold text-slate-100">Analytics & Submissions</h3>
            <p className="mt-2 text-slate-400 text-sm leading-relaxed">
              Track your solved problems, review runtime breakdowns, inspect test case verdicts, and bookmark key problems.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-slate-500 text-sm">
        <p>© 2026 TestPrep DSA Platform. Built for developers by developers.</p>
      </footer>
    </div>
  );
}
