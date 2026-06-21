'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { LayoutDashboard, ListPlus, Users, Sparkles, UserCircle, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Home',    icon: LayoutDashboard },
  { href: '/games',     label: 'Games',   icon: Gamepad2        },
  { href: '/wishlist',  label: 'Wishlist', icon: ListPlus       },
  { href: '/matches',   label: 'Matches', icon: Sparkles        },
  { href: '/groups',    label: 'Groups',  icon: Users           },
  { href: '/profile',   label: 'Profile', icon: UserCircle      },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-base)' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[var(--color-text-3)] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-58px)]">
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 overflow-auto pb-20 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
          {children}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06]" style={{ background: 'rgba(20,20,24,0.92)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-text-3)] hover:text-[var(--color-text-2)]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[9px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
