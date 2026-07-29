'use client';

import { useState } from 'react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { useIDEStore } from '@/store/useIDEStore';
import { Play, Send, ChevronLeft, CheckCircle2, XCircle, Clock, Database } from 'lucide-react';

export default function ProblemDetailPage() {
  const { language, code, setLanguage, setCode, isExecuting, setIsExecuting, activeTab, setActiveTab } = useIDEStore();
  const [output, setOutput] = useState<string | null>(null);

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
    setOutput('Compiling and running code against sample testcases...');
    setTimeout(() => {
      setIsExecuting(false);
      setOutput('✅ Sample Case 1 Passed!\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExpected: [0,1]\nExecution Time: 12ms | Memory: 14.2MB');
    }, 1500);
  };

  const handleSubmitCode = () => {
    setIsExecuting(true);
    setOutput('Submitting code to Judge0 for hidden evaluation...');
    setTimeout(() => {
      setIsExecuting(false);
      setOutput('🎉 ACCEPTED\nAll 45/45 testcases passed!\nRuntime: 34ms (Beats 89.2% of Python3 submissions)\nMemory: 16.1MB (Beats 78.4% of Python3 submissions)');
    }, 2000);
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <Link href="/problems" className="text-slate-400 hover:text-white flex items-center space-x-1 text-sm font-medium transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Problems</span>
          </Link>
          <span className="text-slate-700">|</span>
          <span className="font-bold text-white text-base">{sampleProblem.title}</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            {sampleProblem.difficulty}
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="python">Python 3</option>
            <option value="cpp">C++ (GCC 13)</option>
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="java">Java 17</option>
          </select>

          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>Run Code</span>
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={isExecuting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Left Panel: Problem Statement & Tabs */}
        <div className="border-r border-slate-800 flex flex-col h-full bg-slate-950 overflow-y-auto p-6">
          <div className="flex items-center space-x-6 border-b border-slate-800 pb-3 mb-6 text-xs font-semibold text-slate-400">
            <button
              onClick={() => setActiveTab('problem')}
              className={`hover:text-white transition-colors ${activeTab === 'problem' ? 'text-indigo-400 border-b-2 border-indigo-500 pb-3 -mb-3.5' : ''}`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('solutions')}
              className={`hover:text-white transition-colors ${activeTab === 'solutions' ? 'text-indigo-400 border-b-2 border-indigo-500 pb-3 -mb-3.5' : ''}`}
            >
              Editorial & Solutions
            </button>
            <button
              onClick={() => setActiveTab('discussion')}
              className={`hover:text-white transition-colors ${activeTab === 'discussion' ? 'text-indigo-400 border-b-2 border-indigo-500 pb-3 -mb-3.5' : ''}`}
            >
              Discussion
            </button>
          </div>

          <div className="space-y-6 text-slate-300 text-sm">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{sampleProblem.description}</ReactMarkdown>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Input Format</h4>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono">
                {sampleProblem.inputFormat}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Output Format</h4>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono">
                {sampleProblem.outputFormat}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Constraints</h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 font-mono bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                {sampleProblem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sample Testcases</h4>
              <div className="space-y-3">
                {sampleProblem.sampleCases.map((tc, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-2">
                    <div>
                      <span className="text-slate-500 font-mono font-bold">Input: </span>
                      <code className="text-indigo-300 bg-slate-950 px-2 py-0.5 rounded">{tc.input}</code>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono font-bold">Output: </span>
                      <code className="text-emerald-300 bg-slate-950 px-2 py-0.5 rounded">{tc.output}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Monaco Editor & Output Terminal */}
        <div className="flex flex-col h-full bg-slate-900">
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
          <div className="h-48 border-t border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-slate-400">
              <span className="font-bold flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                Execution Result
              </span>
              {isExecuting && (
                <span className="text-indigo-400 animate-pulse flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Running...
                </span>
              )}
            </div>

            {output ? (
              <pre className="whitespace-pre-wrap text-slate-300 leading-relaxed">{output}</pre>
            ) : (
              <p className="text-slate-600">Run code or submit to view testcase execution results here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
