'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Search, MessageSquare, Trash2, Terminal } from 'lucide-react';

export default function AdminDiscussionModeratorPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchRealComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(username), questions(title)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setComments(data);
      } else {
        setComments([]);
      }
      setLoading(false);
    };

    fetchRealComments();
  }, []);

  const handleDeleteComment = async (id: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      // Execute real deletion from Supabase DB
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (!error) {
        setComments(comments.filter((c) => c.id !== id));
      }
    }
  };

  const filteredComments = comments.filter((c) => {
    const contentMatch = c.content?.toLowerCase().includes(search.toLowerCase());
    const userMatch = c.profiles?.username?.toLowerCase().includes(search.toLowerCase());
    const problemMatch = c.questions?.title?.toLowerCase().includes(search.toLowerCase());
    return contentMatch || userMatch || problemMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1326] text-[#dbe2fd] flex items-center justify-center font-mono text-xs">
        <div className="flex items-center space-x-2 text-[#10b981] animate-pulse">
          <Terminal className="w-5 h-5" />
          <span>Fetching live discussion comments from database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-[#1f2937] pb-6">
        <h1 className="text-2xl font-bold text-[#dbe2fd] tracking-tight">Discussion Moderator</h1>
        <p className="text-xs font-mono text-[#bbcabf] mt-1">Review live learner posts and moderate community discussion comments</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#131b2e] border border-[#1f2937] p-4 rounded flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#bbcabf] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search comments by user, text, or problem..."
            className="w-full bg-[#0b1326] border border-[#3c4a42] rounded px-3.5 pl-10 py-2 text-xs text-[#dbe2fd] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#10b981] font-mono"
          />
        </div>
      </div>

      {/* Live Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="bg-[#131b2e] border border-[#1f2937] p-12 text-center text-[#bbcabf] font-mono text-xs rounded space-y-3">
            <MessageSquare className="w-8 h-8 text-[#10b981]/40 mx-auto" />
            <p className="text-[#dbe2fd] font-bold">No discussion comments found in database.</p>
            <p className="text-[#bbcabf]/70">When learners post comments on problem discussions, they will appear here for moderation.</p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div key={comment.id} className="bg-[#131b2e] border border-[#1f2937] p-5 rounded space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center font-bold text-xs">
                    {(comment.profiles?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-[#dbe2fd] text-xs">{comment.profiles?.username || 'Learner'}</span>
                    <span className="text-[#bbcabf]/60 text-[10px] ml-2">on {comment.questions?.title || 'Problem'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[10px] text-[#bbcabf]/60">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-1.5 rounded bg-[#0b1326] hover:bg-[#450a0a] text-[#bbcabf] hover:text-[#f87171] border border-[#3c4a42] transition-colors"
                    title="Delete Comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#0b1326] border border-[#1f2937] rounded text-xs text-[#dbe2fd] leading-relaxed">
                {comment.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
