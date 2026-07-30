'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MessageSquare, Trash2, ShieldAlert, CheckCircle2 } from 'lucide-react';

const SAMPLE_COMMENTS = [
  {
    id: 'c-1',
    user: 'dev_alex',
    problem: 'Two Sum',
    content: 'Great problem! Using a hash map achieves O(n) time complexity cleanly.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'c-2',
    user: 'spam_bot',
    problem: 'Trapping Rain Water',
    content: 'Check out my external site for free solutions: spam-link.com',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'c-3',
    user: 'coder_99',
    problem: 'Add Two Numbers',
    content: 'Be careful with the carry bit at the end of the linked list traversal!',
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
];

export default function AdminDiscussionModeratorPage() {
  const [comments, setComments] = useState(SAMPLE_COMMENTS);
  const [search, setSearch] = useState('');

  const handleDeleteComment = (id: string) => {
    setComments(comments.filter((c) => c.id !== id));
  };

  const filteredComments = comments.filter((c) =>
    c.content.toLowerCase().includes(search.toLowerCase()) ||
    c.user.toLowerCase().includes(search.toLowerCase()) ||
    c.problem.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-[#1f2937] pb-6">
        <h1 className="text-2xl font-bold text-[#dbe2fd] tracking-tight">Discussion Moderator</h1>
        <p className="text-xs font-mono text-[#bbcabf] mt-1">Review learner posts and moderate community discussion comments</p>
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

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="bg-[#131b2e] border border-[#1f2937] p-12 text-center text-[#bbcabf] font-mono text-xs rounded">
            No comments found matching your query.
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div key={comment.id} className="bg-[#131b2e] border border-[#1f2937] p-5 rounded space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center font-bold text-xs">
                    {comment.user.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-[#dbe2fd] text-xs">{comment.user}</span>
                    <span className="text-[#bbcabf]/60 text-[10px] ml-2">on {comment.problem}</span>
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
