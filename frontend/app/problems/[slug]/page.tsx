'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { useIDEStore } from '@/store/useIDEStore';
import { createClient } from '@/lib/supabase';
import { 
  Terminal, 
  Play, 
  Send, 
  ChevronLeft, 
  Lock, 
  Database, 
  Clock, 
  X, 
  LogIn, 
  UserPlus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ProblemDetailPage() {
  const { language, code, setLanguage, setCode, isExecuting, setIsExecuting, activeTab, setActiveTab } = useIDEStore();
  const [output, setOutput] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, []);

  const sampleProblem = {
    title: 'Two Sum',
    difficulty: 'EASY',
    tags: ['Array', 'Hash Table'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice. You can return the answer in any order.`,
    inputFormat: 'Line 1: Array of integers `nums`\nLine 2: Integer `target`',
    outputFormat: 'Array of two integers representing indices',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    sampleCases: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ]
  };

  const handleRunCode = () => {
    setIsExecuting(true);
    setOutput('Compiling and executing code against sample test cases...');
    setTimeout(() => {
      setIsExecuting(false);
      setOutput('✅ Sample Case 1 Passed!\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExpected: [0,1]\nExecution Time: 12ms | Memory: 14.2MB');
    }, 1200);
  };

  const handleSubmitCode = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    setIsExecuting(true);
    setOutput('Submitting code to Judge0 sandbox for hidden evaluation...');
    setTimeout(() => {
      setIsExecuting(false);
      setOutput('🎉 ACCEPTED\nAll 45/45 testcases passed!\nRuntime: 34ms (Beats 89.2% of Python3 submissions)\nMemory: 16.1MB (Beats 78.4% of Python3 submissions)');
    }, 1800);
  };

  return (
    <div className="h-screen bg-[#0b1326] text-[#dbe2fd] flex flex-col overflow-hidden font-sans selection:bg-[#10b981] selection:text-[#0b1326] relative">
      {/* Top Navbar */}
      <header className="h-14 border-b border-[#1f2937] bg-[#0b1326] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-[#bbcabf] hover:text-[#10b981] flex items-center space-x-1 text-xs font-mono font-semibold transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Problemset</span>
          </Link>
          <span className="text-[#3c4a42]">|</span>
          <span className="font-bold text-[#dbe2fd] text-sm">TestPrep — {sampleProblem.title}</span>
          <span className="px-2 py-0.5 rounded bg-[#003824] text-[#10b981] border border-[#005236] text-[10px] font-mono font-bold">
            {sampleProblem.difficulty}
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#131b2e] border border-[#3c4a42] rounded text-xs font-mono font-semibold px-3 py-1.5 text-[#dbe2fd] focus:outline-none focus:border-[#10b981]"
          >
            <option value="python">Python 3</option>
            <option value="cpp">C++ (GCC 13)</option>
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="java">Java 17</option>
          </select>

          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="bg-[#131b2e] hover:bg-[#171f33] border border-[#3c4a42] text-[#dbe2fd] text-xs font-mono font-bold px-4 py-1.5 rounded flex items-center space-x-1.5 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-[#10b981] fill-[#10b981]" />
            <span>Run</span>
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={isExecuting}
            className="bg-[#10b981] hover:bg-[#4edea3] text-[#0b1326] text-xs font-mono font-bold px-4 py-1.5 rounded shadow-md shadow-[#10b981]/20 flex items-center space-x-1.5 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit</span>
          </button>
        </div>
      </header>

      {/* Main Split Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Left Panel: Problem Statement & Tabs */}
        <div className="border-r border-[#1f2937] flex flex-col h-full bg-[#0b1326] overflow-y-auto p-6">
          <div className="flex items-center space-x-6 border-b border-[#1f2937] pb-3 mb-6 text-xs font-mono font-semibold text-[#bbcabf]">
            <button
              onClick={() => setActiveTab('problem')}
              className={`hover:text-[#10b981] transition-colors ${activeTab === 'problem' ? 'text-[#10b981] border-b-2 border-[#10b981] pb-3 -mb-3.5' : ''}`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('solutions')}
              className={`hover:text-[#10b981] transition-colors ${activeTab === 'solutions' ? 'text-[#10b981] border-b-2 border-[#10b981] pb-3 -mb-3.5' : ''}`}
            >
              Editorial & Solutions
            </button>
            <button
              onClick={() => setActiveTab('discussion')}
              className={`hover:text-[#10b981] transition-colors ${activeTab === 'discussion' ? 'text-[#10b981] border-b-2 border-[#10b981] pb-3 -mb-3.5' : ''}`}
            >
              Discussion
            </button>
          </div>

          <div className="space-y-6 text-[#dbe2fd] text-sm">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{sampleProblem.description}</ReactMarkdown>
            </div>

            <div>
              <h4 className="text-[11px] font-mono font-bold text-[#10b981] uppercase tracking-wider mb-2">Input Format</h4>
              <div className="p-3 bg-[#131b2e] border border-[#1f2937] rounded text-xs font-mono text-[#bbcabf]">
                {sampleProblem.inputFormat}
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-mono font-bold text-[#10b981] uppercase tracking-wider mb-2">Output Format</h4>
              <div className="p-3 bg-[#131b2e] border border-[#1f2937] rounded text-xs font-mono text-[#bbcabf]">
                {sampleProblem.outputFormat}
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-mono font-bold text-[#10b981] uppercase tracking-wider mb-2">Constraints</h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-[#bbcabf] font-mono bg-[#131b2e] p-3 rounded border border-[#1f2937]">
                {sampleProblem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-mono font-bold text-[#10b981] uppercase tracking-wider mb-2">Sample Testcases</h4>
              <div className="space-y-3">
                {sampleProblem.sampleCases.map((tc, idx) => (
                  <div key={idx} className="p-3.5 bg-[#131b2e] border border-[#1f2937] rounded text-xs font-mono space-y-2">
                    <div>
                      <span className="text-[#bbcabf] font-bold">Input: </span>
                      <code className="text-[#4edea3] bg-[#0b1326] px-2 py-0.5 rounded border border-[#3c4a42]">{tc.input}</code>
                    </div>
                    <div>
                      <span className="text-[#bbcabf] font-bold">Output: </span>
                      <code className="text-[#10b981] bg-[#0b1326] px-2 py-0.5 rounded border border-[#3c4a42]">{tc.output}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Monaco Editor & Output Terminal */}
        <div className="flex flex-col h-full bg-[#131b2e]">
          <div className="flex-1">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12 },
              }}
            />
          </div>

          {/* Terminal / Verdict Output */}
          <div className="h-48 border-t border-[#1f2937] bg-[#0b1326] p-4 font-mono text-xs overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-2 mb-3 text-[#bbcabf]">
              <span className="font-bold flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-[#10b981]" />
                Execution Output
              </span>
              {isExecuting && (
                <span className="text-[#10b981] animate-pulse flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Evaluating...
                </span>
              )}
            </div>

            {output ? (
              <pre className="whitespace-pre-wrap text-[#dbe2fd] leading-relaxed">{output}</pre>
            ) : (
              <p className="text-[#bbcabf]/60">Click Run to test against sample cases, or Submit for full evaluation.</p>
            )}
          </div>
        </div>
      </div>

      {/* Authentication Required Modal for Guest Users */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-[#3c4a42] p-6 rounded-md max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-[#bbcabf] hover:text-[#dbe2fd] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded bg-[#003824] border border-[#005236] text-[#10b981] flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#dbe2fd] font-sans mb-2">Sign in to Submit Solutions</h3>
            <p className="text-[#bbcabf] text-xs font-mono mb-6 leading-relaxed">
              Guest users can view problems and test code locally. To record your submission, earn rank, and save your progress to your profile, please sign in.
            </p>

            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="flex-1 bg-[#10b981] hover:bg-[#4edea3] text-[#0b1326] font-bold py-2.5 rounded shadow-md shadow-[#10b981]/20 transition-all text-center flex items-center justify-center space-x-2 text-xs font-mono"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="flex-1 bg-[#0b1326] hover:bg-[#171f33] text-[#dbe2fd] font-semibold py-2.5 rounded border border-[#3c4a42] transition-all text-center text-xs font-mono"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
