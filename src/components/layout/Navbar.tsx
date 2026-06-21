'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Gamepad2, LogOut, ChevronDown, Menu, X, LayoutDashboard, ListPlus, Users, Sparkles, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/games',     label: 'Games'     },
  { href: '/wishlist',  label: 'Wishlist'  },
  { href: '/matches',   label: 'Matches'   },
  { href: '/groups',    label: 'Groups'    },
];

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[58px]">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center shadow-[0_0_12px_rgba(255,107,53,0.4)]">
              <Gamepad2 className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white font-heading">
              Game<span className="text-[var(--color-accent)]">Pool</span>
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          {user && (
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map(link => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-white bg-[var(--color-bg-hover)]'
                        : 'text-[var(--color-text-2)] hover:text-white hover:bg-[var(--color-bg-raised)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Avatar + name */}
                <Link
                  href="/profile"
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[var(--color-bg-hover)] transition-colors group"
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] flex items-center justify-center text-[11px] font-bold text-[var(--color-accent)]">
                    {(profile?.username || user.email || 'G')[0].toUpperCase()}
                  </div>
                  <span className="text-[12px] font-medium text-[var(--color-text-2)] group-hover:text-white transition-colors">
                    {profile?.username || 'Profile'}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-[var(--color-text-3)] hover:text-[var(--color-red)] hover:bg-[rgba(255,69,58,0.08)] transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Out
                </button>

                {/* Mobile hamburger */}
                <button
                  className="md:hidden p-2 rounded-lg text-[var(--color-text-2)] hover:text-white hover:bg-[var(--color-bg-hover)] transition-colors"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/login">
                  <Button variant="primary" size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.06] animate-slide-up" style={{ background: 'var(--color-bg-raised)' }}>
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === link.href
                    ? 'text-white bg-[var(--color-bg-hover)] font-medium'
                    : 'text-[var(--color-text-2)] hover:text-white hover:bg-[var(--color-bg-hover)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/[0.06] mt-2">
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--color-red)] hover:bg-[rgba(255,69,58,0.08)] transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
