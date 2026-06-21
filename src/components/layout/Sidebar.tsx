'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ListPlus, Users, UserCircle,
  Sparkles, Gamepad2, Flame
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/games',     label: 'Games',      icon: Gamepad2        },
  { href: '/wishlist',  label: 'Wishlist',   icon: ListPlus        },
  { href: '/matches',   label: 'Matches',    icon: Sparkles        },
  { href: '/groups',    label: 'Groups',     icon: Users           },
  { href: '/profile',   label: 'Profile',    icon: UserCircle      },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-[calc(100vh-58px)] border-r border-white/[0.06] p-3 pt-4 shrink-0" style={{ background: 'var(--color-bg-raised)' }}>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom branding */}
      <div className="mt-4 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 px-2">
          <Flame className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span className="text-[11px] text-[var(--color-text-3)] font-medium">SquadUp v1.0</span>
        </div>
      </div>
    </aside>
  );
}
