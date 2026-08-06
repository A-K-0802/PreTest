'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { 
  Search, 
  MessageSquare, 
  Trash2, 
  Terminal, 
  ExternalLink,
  Flag,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  RefreshCw
} from 'lucide-react';

export default function AdminDiscussionModeratorPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const supabase = createClient();

  // Fetch all comments, users, and question titles
  const fetchRealComments = async () => {
    setLoading(true);
    setFetchErrorMsg(null);

    // 1. Fetch raw comments from Supabase
    const { data: rawComments, error: commentsErr } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (commentsErr) {
      console.error('Supabase comments fetch error:', commentsErr.message);
      setFetchErrorMsg(`Supabase query notice: ${commentsErr.message}`);
      setComments([]);
      setLoading(false);
      return;
    }

    if (rawComments && rawComments.length > 0) {
      // Auto-expand all questions containing comments by default
      const qIdSet = new Set<string>(rawComments.map((c: any) => c.question_id).filter(Boolean));
      setExpandedQuestions(qIdSet);

      // 2. Fetch associated user profiles safely
      const userIds = Array.from(new Set(rawComments.map((c: any) => c.user_id).filter(Boolean)));
      let profileMap: Record<string, string> = {};

      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        if (profs) {
          profs.forEach((p: any) => {
            profileMap[p.id] = p.username;
          });
        }
      }

      // 3. Fetch ALL questions from DB so title mapping never fails
      let questionMap: Record<string, any> = {};
      const { data: qData } = await supabase
        .from('questions')
        .select('id, title, title_slug, difficulty');

      if (qData) {
        qData.forEach((q: any) => {
          questionMap[q.id] = q;
          if (q.title_slug) {
            questionMap[q.title_slug] = q;
          }
        });
      }

      const mapped = rawComments.map((c: any) => {
        const foundQuestion = questionMap[c.question_id];
        return {
          ...c,
          is_flagged: !!c.is_flagged,
          profiles: {
            username: profileMap[c.user_id] || 'Learner'
          },
          questions: foundQuestion || { 
            id: c.question_id, 
            title: `Question (${c.question_id.slice(0, 8)}...)`, 
            title_slug: '' 
          }
        };
      });

      setComments(mapped);
    } else {
      setComments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRealComments();
  }, []);

  // Toggle Flag / Mark as Important for a comment
  const handleToggleFlag = async (commentId: string, currentFlagState: boolean) => {
    const newFlagState = !currentFlagState;
    
    // Optimistic UI update
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, is_flagged: newFlagState } : c))
    );

    const { error } = await supabase
      .from('comments')
      .update({ is_flagged: newFlagState })
      .eq('id', commentId);

    if (error) {
      console.warn('Flag update notice:', error.message);
      // Revert if error
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, is_flagged: currentFlagState } : c))
      );
    }
  };

  // Delete comment handler
  const handleDeleteComment = async (id: string) => {
    if (confirm('Are you sure you want to delete this discussion comment?')) {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (!error) {
        setComments(comments.filter((c) => c.id !== id));
      }
    }
  };

  const toggleQuestionExpand = (qId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Group comments question-wise
  const groupedQuestions = useMemo(() => {
    const filtered = comments.filter((c) => {
      const contentMatch = c.content?.toLowerCase().includes(search.toLowerCase());
      const userMatch = c.profiles?.username?.toLowerCase().includes(search.toLowerCase());
      const problemMatch = c.questions?.title?.toLowerCase().includes(search.toLowerCase());
      return contentMatch || userMatch || problemMatch;
    });

    const map = new Map<string, { question: any; comments: any[]; flaggedCount: number }>();

    filtered.forEach((comment) => {
      const qId = comment.question_id || 'unknown';
      if (!map.has(qId)) {
        map.set(qId, {
          question: comment.questions,
          comments: [],
          flaggedCount: 0,
        });
      }
      const entry = map.get(qId)!;
      entry.comments.push(comment);
      if (comment.is_flagged) {
        entry.flaggedCount += 1;
      }
    });

    return Array.from(map.values());
  }, [comments, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1326] text-[#dbe2fd] flex items-center justify-center font-mono text-xs">
        <div className="flex items-center space-x-2 text-[#10b981] animate-pulse">
          <Terminal className="w-5 h-5" />
          <span>Fetching live question discussions from database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-[#1f2937] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#dbe2fd] tracking-tight">Question Discussions Moderator</h1>
          <p className="text-xs font-mono text-[#bbcabf] mt-1">
            Grouped question-wise comments thread view with flag & importance bookmarking.
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <button
            onClick={fetchRealComments}
            className="bg-[#131b2e] hover:bg-[#171f33] border border-[#3c4a42] text-[#dbe2fd] px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Refresh Comments</span>
          </button>
          <span className="bg-[#131b2e] px-3 py-1.5 rounded border border-[#1f2937] text-[#bbcabf]">
            Total Threads: <span className="text-[#10b981] font-bold">{groupedQuestions.length}</span>
          </span>
        </div>
      </div>

      {fetchErrorMsg && (
        <div className="p-3 bg-[#3b0914] text-[#f87171] border border-[#7f1d1d] rounded text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fetchErrorMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[#131b2e] border border-[#1f2937] p-4 rounded flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#bbcabf] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussions by user, comment text, or problem..."
            className="w-full bg-[#0b1326] border border-[#3c4a42] rounded px-3.5 pl-10 py-2 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#10b981] font-mono"
          />
        </div>
      </div>

      {/* Grouped Question-Wise Discussions Feed */}
      <div className="space-y-4 font-mono">
        {groupedQuestions.length === 0 ? (
          <div className="bg-[#131b2e] border border-[#1f2937] p-12 text-center text-[#bbcabf] text-xs rounded space-y-3">
            <MessageSquare className="w-8 h-8 text-[#10b981]/40 mx-auto" />
            <p className="text-[#dbe2fd] font-bold">No discussion threads found in database.</p>
            <p className="text-[#bbcabf]/70">When learners post comments on problem pages, they will be grouped here question-wise.</p>
          </div>
        ) : (
          groupedQuestions.map(({ question, comments: qComments, flaggedCount }) => {
            const qId = question.id || 'unknown';
            const isExpanded = expandedQuestions.has(qId) || search.length > 0;

            return (
              <div key={qId} className="bg-[#131b2e] border border-[#1f2937] rounded overflow-hidden shadow-lg transition-all">
                {/* Question Group Header */}
                <div 
                  onClick={() => toggleQuestionExpand(qId)}
                  className="p-4 bg-[#171f33] hover:bg-[#1a233a] cursor-pointer flex items-center justify-between border-b border-[#1f2937]"
                >
                  <div className="flex items-center space-x-3">
                    <button type="button" className="text-[#bbcabf]">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-[#10b981]" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div>
                      <h3 className="text-sm font-bold text-[#dbe2fd] flex items-center gap-2">
                        {question.title}
                        {question.title_slug && (
                          <Link
                            href={`/problems/${question.title_slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#10b981] hover:underline text-xs inline-flex items-center gap-0.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <span className="px-2.5 py-1 rounded bg-[#0b1326] border border-[#3c4a42] text-[#bbcabf]">
                      {qComments.length} {qComments.length === 1 ? 'Comment' : 'Comments'}
                    </span>

                    {flaggedCount > 0 ? (
                      <span className="px-2.5 py-1 rounded bg-[#3d2a00] text-[#f59e0b] border border-[#78350f] font-bold flex items-center gap-1">
                        <Flag className="w-3 h-3 fill-[#f59e0b]" />
                        {flaggedCount} Flagged
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-[10px] text-[#bbcabf]/50">0 Flagged</span>
                    )}
                  </div>
                </div>

                {/* Question Comments Thread (Expanded by Default) */}
                {isExpanded && (
                  <div className="p-4 space-y-3 bg-[#0b1326]">
                    {qComments.map((comment) => (
                      <div 
                        key={comment.id} 
                        className={`p-4 rounded border font-mono text-xs space-y-2 transition-all ${
                          comment.is_flagged 
                            ? 'bg-[#181308] border-[#78350f]' 
                            : 'bg-[#131b2e] border-[#1f2937]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center font-bold text-[10px]">
                              {(comment.profiles?.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-[#dbe2fd]">{comment.profiles?.username || 'Learner'}</span>
                            {comment.is_flagged && (
                              <span className="px-2 py-0.5 rounded bg-[#78350f] text-[#f59e0b] text-[10px] font-bold flex items-center gap-1">
                                <Flag className="w-3 h-3 fill-[#f59e0b]" /> IMPORTANT / FLAGGED
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-[#bbcabf]/60">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>

                            {/* Flag Toggle Button */}
                            <button
                              onClick={() => handleToggleFlag(comment.id, comment.is_flagged)}
                              className={`p-1.5 rounded text-xs font-bold border flex items-center gap-1 transition-all ${
                                comment.is_flagged
                                  ? 'bg-[#f59e0b] text-[#0b1326] border-[#f59e0b]'
                                  : 'bg-[#0b1326] text-[#bbcabf] hover:text-[#f59e0b] border-[#3c4a42]'
                              }`}
                              title={comment.is_flagged ? "Unflag Comment" : "Mark as Important / Flag Issue"}
                            >
                              <Flag className="w-3.5 h-3.5" />
                              <span>{comment.is_flagged ? 'Flagged' : 'Flag'}</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1.5 rounded bg-[#0b1326] hover:bg-[#3b0914] text-[#bbcabf] hover:text-[#f87171] border border-[#3c4a42] transition-colors"
                              title="Delete Comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-[#bbcabf] leading-relaxed pl-8">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
