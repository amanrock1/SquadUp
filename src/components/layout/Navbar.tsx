'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Gamepad2, LogOut, Menu, X } from 'lucide-react';
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
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--color-bg-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[58px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-7 h-7 rounded bg-[var(--color-accent)] flex items-center justify-center transition-transform group-hover:scale-105">
              <Gamepad2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-white font-heading">
              GAME<span className="text-[var(--color-accent-light)]">POOL</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-1 h-full">
              {navLinks.map(link => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 h-full flex items-center text-xs font-semibold tracking-wide transition-all duration-150 font-subheading ${
                      isActive
                        ? 'text-white font-bold'
                        : 'text-[var(--color-text-2)] hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[var(--color-accent)] rounded-t-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* User Profile Panel */}
                <Link
                  href="/profile"
                  className="hidden md:flex items-center gap-3 px-3 py-1 rounded-lg bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group"
                >
                  <div className="relative">
                    <div className="w-7 h-7 rounded bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] flex items-center justify-center text-xs font-bold text-[var(--color-accent)]">
                      {(profile?.username || user.email || 'U')[0].toUpperCase()}
                    </div>
                    {/* Status indicator pip */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[var(--color-green)] border border-[var(--color-bg-base)] rounded-full" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="text-xs font-bold text-white group-hover:text-[var(--color-accent-light)] transition-colors">
                        {profile?.username || 'Profile'}
                      </span>
                    </div>
                    <span className="text-[9px] text-[var(--color-text-3)] font-medium tracking-wide block mt-0.5">Online</span>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-[var(--color-text-3)] hover:text-[var(--color-red)] hover:bg-[rgba(239,68,68,0.06)] transition-all font-subheading tracking-wide"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log out
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--color-bg-border)] animate-slide-up bg-[var(--color-bg-raised)]">
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
            <div className="pt-2 border-t border-[var(--color-bg-border)] mt-2">
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--color-red)] hover:bg-[rgba(239,68,68,0.06)] transition-colors"
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
