'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  Terminal, 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Home, 
  LogOut, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirectedFrom=/admin');
        return;
      }

      // Query public.profiles table to verify role === 'ADMIN'
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || profile?.role !== 'ADMIN') {
        console.warn('Access denied: User does not have ADMIN privileges in public.profiles.');
        router.push('/');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };

    checkAdmin();
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
          <span>Verifying Admin privileges in database...</span>
        </div>
      </div>
    );
  }

  // Left sidebar menu items (Add Question removed as requested)
  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Question Bank', path: '/admin/questions', icon: FileText },
    { name: 'Discussions', path: '/admin/comments', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dbe2fd] flex font-sans selection:bg-[#10b981] selection:text-[#0b1326]">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#131b2e] border-r border-[#1f2937] flex flex-col py-6 fixed inset-y-0 left-0 z-40">
        <div className="px-6 mb-8">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center font-bold">
              <Terminal className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#dbe2fd] tracking-tight group-hover:text-[#10b981] transition-colors">
                TestPrep
              </h1>
              <p className="text-[10px] font-mono text-[#10b981] uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Admin Suite
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          <Link
            href="/"
            className="flex items-center px-4 py-2.5 text-xs font-mono text-[#bbcabf] hover:bg-[#171f33] hover:text-[#dbe2fd] rounded transition-all mb-4 border border-transparent hover:border-[#1f2937]"
          >
            <Home className="w-4 h-4 mr-3 text-[#10b981]" />
            <span>Main Platform</span>
          </Link>

          <div className="px-4 text-[10px] font-mono uppercase tracking-widest text-[#bbcabf]/50 mb-2">
            Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-4 py-2.5 text-xs font-mono rounded transition-all ${
                  isActive
                    ? 'bg-[#10b981] text-[#0b1326] font-bold shadow-md shadow-[#10b981]/20'
                    : 'text-[#bbcabf] hover:bg-[#171f33] hover:text-[#dbe2fd]'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-3" />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Admin User Info */}
        <div className="px-4 pt-4 border-t border-[#1f2937] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-6 h-6 rounded bg-[#10b981] text-[#0b1326] flex items-center justify-center font-bold shrink-0">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="truncate text-[#dbe2fd]">{user?.email?.split('@')[0]}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-[#bbcabf] hover:text-rose-400 p-1 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col">
        <main className="flex-1 p-8 max-w-[1440px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
