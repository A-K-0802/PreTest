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
  MessageSquare,
  BookOpen,
  FileCode,
  SendHorizontal,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function ProblemDetailPage() {
  const { language, code, setLanguage, setCode, isExecuting, setIsExecuting, activeTab, setActiveTab } = useIDEStore();
  const [output, setOutput] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Discussion comments state
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const supabase = createClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setUser(session.user);
      }
    };
    checkAuth();
  }, []);

  // Fetch comments for this question
  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(username, avatar_url)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setComments(data);
      }
    };
    fetchComments();
  }, [activeTab]);

  const sampleProblem = {
    id: '1',
    title: 'Two Sum',
    difficulty: 'EASY',
    tags: ['Array', 'Hash Table'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice. You can return the answer in any order.`,
    inputFormat: 'Line 1: N (number of elements)\nLine 2: N space-separated integers\nLine 3: target integer',
    outputFormat: 'Space-separated indices',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    sampleCases: [
      { input: '4\n2 7 11 15\n9', output: '0 1' },
      { input: '3\n3 2 4\n6', output: '1 2' },
    ],
    solution: {
      hasSolution: true,
      title: 'Official Solution — Hash Table (One-Pass)',
      explanation: `### Approach: Hash Map Lookups

Instead of checking every pair with $O(N^2)$ brute force, we can maintain a hash map that stores each element's value as key and its array index as value.

As we iterate through \`nums\`:
1. Calculate \`complement = target - nums[i]\`.
2. Check if \`complement\` exists in our hash map.
3. If it exists, return \`[hash_map[complement], i]\`.
4. Otherwise, insert \`nums[i]\` into the hash map.

### Complexity Analysis
- **Time Complexity:** $O(N)$ — We traverse the array of $N$ elements exactly once. Hash table lookups take $O(1)$ time.
- **Space Complexity:** $O(N)$ — The extra space required depends on the number of items stored in the hash table, which stores at most $N$ elements.`,
      pythonCode: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    nums = [int(x) for x in lines[1:n+1]]
    target = int(lines[n+1])

    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            print(f"{seen[complement]} {i}")
            return
        seen[num] = i

if __name__ == '__main__':
    solve()`,
      cppCode: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int n, target;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cin >> target;

    unordered_map<int, int> seen;
    for (int i = 0; i < n; i++) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            cout << seen[complement] << " " << i << endl;
            return 0;
        }
        seen[nums[i]] = i;
    }
    return 0;
}`
    }
  };

  // Real execution against Judge0 backend API
  const handleRunCode = async () => {
    setIsExecuting(true);
    setOutput('Compiling and executing code with Judge0 sandbox...');

    try {
      const response = await fetch(`${API_URL}/execution/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          language: language,
          input: sampleProblem.sampleCases[0].input,
          expected_output: sampleProblem.sampleCases[0].output,
        }),
      });

      if (!response.ok) {
        throw new Error(`Execution Service HTTP Error: ${response.statusText}`);
      }

      const resData = await response.json();
      setIsExecuting(false);

      const actualStdout = (resData.stdout || '').trim();
      const expectedStdout = sampleProblem.sampleCases[0].output.trim();

      if (actualStdout === expectedStdout) {
        setOutput(`✅ TESTCASE PASSED\n\nInput:\n${sampleProblem.sampleCases[0].input}\n\nYour Output:\n${actualStdout || '(Empty Output)'}\n\nExpected Output:\n${expectedStdout}\n\nExecution Time: ${resData.execution_time_ms || 12}ms | Memory: ${resData.memory_kb ? (resData.memory_kb / 1024).toFixed(1) : 14.2}MB`);
      } else {
        setOutput(`❌ WRONG ANSWER\n\nInput:\n${sampleProblem.sampleCases[0].input}\n\nYour Output:\n${actualStdout || '(Empty Output)'}\n\nExpected Output:\n${expectedStdout}`);
      }
    } catch (err: any) {
      setIsExecuting(false);
      setOutput(`⚠️ EXECUTION ERROR\nCould not connect to FastAPI / Judge0 execution service at ${API_URL}.\n\nDetails: ${err.message || 'Ensure backend server is running on http://localhost:8000'}`);
    }
  };

  const handleSubmitCode = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    setIsExecuting(true);
    setOutput('Submitting solution to Judge0 evaluation engine...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/execution/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question_id: sampleProblem.id,
          user_id: user.id,
          code: code,
          language: language,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Submission API HTTP ${response.status}: ${errText || response.statusText}`);
      }

      const resData = await response.json();
      setIsExecuting(false);

      if (resData.verdict === 'ACCEPTED') {
        setOutput(`🎉 ACCEPTED\nAll testcases passed successfully!\nPassed: ${resData.passed_cases || 1}/${resData.total_cases || 1}\nRuntime: ${resData.execution_time_ms || 12}ms\nMemory: ${resData.memory_kb ? (resData.memory_kb / 1024).toFixed(1) : 14.1}MB`);
      } else {
        setOutput(`❌ ${resData.verdict}\nPassed: ${resData.passed_cases || 0}/${resData.total_cases || 1}\n${resData.error_message || 'Evaluation failed on testcase.'}`);
      }
    } catch (err: any) {
      setIsExecuting(false);
      setOutput(`⚠️ SUBMISSION SERVICE ERROR\nFailed to evaluate solution via Judge0.\n\nDetails: ${err.message || 'Ensure backend server is active.'}`);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    setPostingComment(true);

    const newCommentObj = {
      user_id: user.id,
      question_id: '1',
      content: newComment.trim(),
    };

    const { data, error } = await supabase
      .from('comments')
      .insert([newCommentObj])
      .select('*, profiles(username)');

    if (!error && data) {
      setComments([data[0], ...comments]);
      setNewComment('');
    }
    setPostingComment(false);
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
            <option value="cpp">C++ (GCC 9.2)</option>
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
              className={`hover:text-[#10b981] transition-colors flex items-center gap-1.5 ${activeTab === 'problem' ? 'text-[#10b981] border-b-2 border-[#10b981] pb-3 -mb-3.5' : ''}`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>
            <button
              onClick={() => setActiveTab('solutions')}
              className={`hover:text-[#10b981] transition-colors flex items-center gap-1.5 ${activeTab === 'solutions' ? 'text-[#10b981] border-b-2 border-[#10b981] pb-3 -mb-3.5' : ''}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Editorial & Solutions</span>
            </button>
            <button
              onClick={() => setActiveTab('discussion')}
              className={`hover:text-[#10b981] transition-colors flex items-center gap-1.5 ${activeTab === 'discussion' ? 'text-[#10b981] border-b-2 border-[#10b981] pb-3 -mb-3.5' : ''}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discussion ({comments.length})</span>
            </button>
          </div>

          {/* TAB 1: PROBLEM DESCRIPTION */}
          {activeTab === 'problem' && (
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
                        <code className="text-[#4edea3] bg-[#0b1326] px-2 py-0.5 rounded border border-[#3c4a42] whitespace-pre">{tc.input}</code>
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
          )}

          {/* TAB 2: EDITORIAL & SOLUTIONS (POSTED BY ADMIN) */}
          {activeTab === 'solutions' && (
            <div className="space-y-6 text-[#dbe2fd]">
              {sampleProblem.solution.hasSolution ? (
                <div className="space-y-6">
                  <div className="p-4 rounded bg-[#131b2e] border border-[#1f2937] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#10b981] uppercase tracking-widest font-bold block">
                        Official Editorial
                      </span>
                      <h3 className="text-base font-bold text-[#dbe2fd] mt-0.5">{sampleProblem.solution.title}</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#003824] text-[#10b981] border border-[#005236] text-[10px] font-mono font-bold">
                      ADMIN VERIFIED
                    </span>
                  </div>

                  <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-4">
                    <ReactMarkdown>{sampleProblem.solution.explanation}</ReactMarkdown>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider">Python 3 Implementation</h4>
                    <pre className="p-4 bg-[#131b2e] border border-[#1f2937] rounded text-xs font-mono text-[#4edea3] overflow-x-auto">
                      <code>{sampleProblem.solution.pythonCode}</code>
                    </pre>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider">C++ (GCC 9.2) Implementation</h4>
                    <pre className="p-4 bg-[#131b2e] border border-[#1f2937] rounded text-xs font-mono text-[#4edea3] overflow-x-auto">
                      <code>{sampleProblem.solution.cppCode}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-[#bbcabf] font-mono text-xs space-y-3 bg-[#131b2e] rounded border border-[#1f2937] p-8">
                  <BookOpen className="w-8 h-8 text-[#10b981]/40 mx-auto" />
                  <p className="text-[#dbe2fd] font-bold">No solution has been added for this problem yet.</p>
                  <p className="text-[#bbcabf]/70">The administrator will post the official editorial solution soon.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMMUNITY DISCUSSION */}
          {activeTab === 'discussion' && (
            <div className="space-y-6 text-[#dbe2fd]">
              {/* Comment Input Box */}
              <form onSubmit={handlePostComment} className="bg-[#131b2e] border border-[#1f2937] p-4 rounded space-y-3">
                <label className="block text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider">
                  Join the Discussion
                </label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={isLoggedIn ? "Share your approach, questions, or hints..." : "Sign in to post a comment..."}
                  className="w-full bg-[#0b1326] border border-[#3c4a42] rounded p-3 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#10b981] font-mono"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={postingComment || !newComment.trim()}
                    className="bg-[#10b981] hover:bg-[#4edea3] text-[#0b1326] font-mono font-bold text-xs px-4 py-2 rounded shadow-md shadow-[#10b981]/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <SendHorizontal className="w-3.5 h-3.5" />
                    <span>Post Comment</span>
                  </button>
                </div>
              </form>

              {/* Comments Feed */}
              {comments.length === 0 ? (
                <div className="py-16 text-center text-[#bbcabf] font-mono text-xs space-y-3 bg-[#131b2e] rounded border border-[#1f2937] p-8">
                  <MessageSquare className="w-8 h-8 text-[#10b981]/40 mx-auto" />
                  <p className="text-[#dbe2fd] font-bold">No discussions have happened yet for this problem.</p>
                  <p className="text-[#bbcabf]/70">Be the first to start a conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment, idx) => (
                    <div key={comment.id || idx} className="bg-[#131b2e] border border-[#1f2937] p-4 rounded space-y-2 font-mono">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center font-bold text-[10px]">
                            {(comment.profiles?.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-[#dbe2fd]">{comment.profiles?.username || 'Learner'}</span>
                        </div>
                        <span className="text-[10px] text-[#bbcabf]/60">
                          {new Date(comment.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-[#bbcabf] leading-relaxed pl-8">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
                  <Clock className="w-3 h-3" /> Evaluating with Judge0...
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
