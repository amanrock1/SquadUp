'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ListPlus, Users, UserCircle,
  Sparkles, Gamepad2, Laptop
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
    <aside className="hidden lg:flex flex-col w-52 min-h-[calc(100vh-58px)] border-r border-[var(--color-bg-border)] p-4 shrink-0 bg-[var(--color-bg-raised)]">

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all border border-transparent ${
                isActive
                  ? 'text-white bg-white/[0.02] border-white/[0.04] border-l-2 border-l-[var(--color-accent)]'
                  : 'text-[var(--color-text-2)] hover:text-white hover:bg-white/[0.01]'
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-3)]'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom branding */}
      <div className="mt-4 pt-3 border-t border-[var(--color-bg-border)]">
        <div className="flex items-center gap-2 px-2 text-[var(--color-text-3)]">
          <Laptop className="w-3.5 h-3.5" />
          <span className="text-[10px] font-semibold tracking-wider uppercase font-subheading">GamePool v1.0</span>
        </div>
      </div>
    </aside>
  );
}
