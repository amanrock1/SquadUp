'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getUserWishlist, getUserGroups, seedMockData } from '@/lib/db';
import { getGameRecommendations } from '@/lib/ai';
import type { WishlistEntry, GameGroup, GameRecommendation } from '@/lib/types';
import {
  ListPlus, Users, Sparkles, Gamepad2,
  ArrowRight, IndianRupee, Star, Database,
  TrendingUp, Zap, ChevronRight, Clock
} from 'lucide-react';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistEntry[]>([]);
  const [groups, setGroups] = useState<GameGroup[]>([]);
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [wl, gr] = await Promise.all([
        getUserWishlist(user!.uid),
        getUserGroups(user!.uid),
      ]);
      setWishlist(wl);
      setGroups(gr);

      const recs = getGameRecommendations(wl[0]?.gameName || 'Minecraft');
      setRecommendations(recs.slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedMockData();
      alert('Mock data seeded! 🎮');
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to seed mock data.');
    } finally {
      setSeeding(false);
    }
  };

  const activeMatches = wishlist.filter(w => w.status === 'matched').length;
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 pb-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pip-active" />
            <span className="text-[11px] font-semibold text-[var(--color-text-3)] tracking-wide uppercase">Live</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {greeting()}, {profile?.username || 'Gamer'} 👋
          </h1>
          <p className="text-sm text-[var(--color-text-2)] mt-0.5">
            Find your squad, split costs, play together.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" onClick={handleSeed} loading={seeding} icon={<Database className="w-3.5 h-3.5" />}>
            Seed data
          </Button>
          <Link href="/wishlist">
            <Button variant="primary" icon={<ListPlus className="w-3.5 h-3.5" />}>
              Add game
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Wishlist',     value: wishlist.length,                         icon: ListPlus,   color: 'var(--color-accent)', href: '/wishlist' },
          { label: 'Matched',      value: `${activeMatches}`,                      icon: Sparkles,   color: 'var(--color-blue)',   href: '/matches'  },
          { label: 'Groups',       value: groups.length,                           icon: Users,      color: 'var(--color-purple)', href: '/groups'   },
          { label: 'Rating',       value: profile?.rating?.toFixed(1) || '5.0',   icon: Star,       color: 'var(--color-yellow)', href: '/profile'  },
        ].map(stat => (
          <Link key={stat.label} href={stat.href}>
            <div className="hud-panel hud-panel-interactive p-4 flex flex-col gap-2 group">
              <div className="flex items-center justify-between">
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-3)] group-hover:text-[var(--color-text-1)] transition-colors" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-heading">{stat.value}</p>
                <p className="text-[11px] text-[var(--color-text-3)] font-medium mt-0.5 uppercase tracking-wide">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Featured banner ── */}
      <div className="hud-panel relative overflow-hidden" style={{ minHeight: '160px' }}>
        <img
          src="https://cdn.akamai.steamstatic.com/steam/apps/553850/header.jpg"
          alt="Helldivers 2"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, var(--color-bg-card) 40%, transparent 100%)' }} />

        <div className="relative p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-lg">
            <span className="section-label">
              <Zap className="w-3 h-3" /> Hot split today
            </span>
            <h2 className="text-xl font-bold text-white">Helldivers 2</h2>
            <p className="text-sm text-[var(--color-text-2)] leading-relaxed">
              4 players splitting ₹2,499 — pay just <strong className="text-white">₹625/person.</strong> One slot open!
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-[var(--color-text-2)]">
                <Users className="w-4 h-4 text-[var(--color-blue)]" /> 3 / 4 joined
              </span>
              <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--color-accent)' }}>
                <IndianRupee className="w-4 h-4" /> ₹625 per person
              </span>
            </div>
          </div>
          <Link href="/games" className="shrink-0">
            <Button variant="primary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
              Join group
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Left: Wishlist */}
        <div className="lg:col-span-2 space-y-5">
          <div className="hud-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-white flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-[var(--color-accent)]" />
                My wishlist
              </h2>
              <Link href="/wishlist" className="text-[11px] font-semibold text-[var(--color-blue)] hover:text-white transition-colors">
                Manage →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 w-full" />)}
              </div>
            ) : wishlist.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[var(--color-bg-border)] rounded-xl">
                <Gamepad2 className="w-8 h-8 text-[var(--color-text-3)] mx-auto mb-2" />
                <p className="text-sm text-[var(--color-text-3)] mb-3">Your wishlist is empty</p>
                <Link href="/wishlist">
                  <Button variant="secondary" size="sm">Add first game</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                {wishlist.slice(0, 5).map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-[var(--color-bg-border)] hover:border-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-hover)] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-hover)] border border-[var(--color-bg-border)] flex items-center justify-center shrink-0">
                        <Gamepad2 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-white truncate">{entry.gameName}</p>
                        <p className="text-[11px] text-[var(--color-text-3)]">
                          ₹{entry.budget} budget · {entry.playersNeeded} players
                        </p>
                      </div>
                    </div>
                    <Badge variant={entry.status === 'matched' ? 'success' : entry.status === 'active' ? 'neon' : 'warning'}>
                      {entry.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active groups */}
          <div className="hud-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--color-blue)]" />
                My groups
              </h2>
              <Link href="/groups" className="text-[11px] font-semibold text-[var(--color-blue)] hover:text-white transition-colors">
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="skeleton h-14 w-full" />)}
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-6 text-[var(--color-text-3)] text-sm">
                No groups yet. Browse games to join a split.
              </div>
            ) : (
              <div className="space-y-2">
                {groups.slice(0, 4).map(group => {
                  const fill = group.members.length / group.maxPlayers;
                  return (
                    <div key={group.id} className="px-3 py-3 rounded-lg border border-[var(--color-bg-border)] hover:border-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-hover)] transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[13px] font-medium text-white truncate max-w-[70%]">{group.gameName}</p>
                        <Badge variant={group.status === 'complete' ? 'success' : 'warning'}>{group.status}</Badge>
                      </div>
                      <div className="cap-bar mb-1.5">
                        <div className={`cap-bar-fill ${fill >= 1 ? 'full' : ''}`} style={{ width: `${Math.min(fill * 100, 100)}%` }} />
                      </div>
                      <p className="text-[11px] text-[var(--color-text-3)]">{group.members.length} / {group.maxPlayers} members</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: AI suggestions */}
        <div className="space-y-5">
          <div className="hud-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[var(--color-blue)]" />
              <h2 className="text-[13px] font-semibold text-white">Suggested for you</h2>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-14 w-full" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {recommendations.map(rec => (
                  <div
                    key={rec.name}
                    className="p-3 rounded-lg border border-[var(--color-bg-border)] hover:border-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-hover)] transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-medium text-white leading-tight">{rec.name}</p>
                      <span className="text-[11px] font-bold shrink-0" style={{ color: 'var(--color-accent)' }}>
                        {rec.estimatedPrice === 0 ? 'FREE' : `₹${rec.estimatedPrice}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-3)] mt-1 line-clamp-2">{rec.description}</p>
                  </div>
                ))}
              </div>
            )}
            <Link href="/games">
              <Button variant="secondary" size="sm" className="w-full mt-3">
                Browse all games
              </Button>
            </Link>
          </div>

          {/* Quick actions */}
          <div className="hud-panel p-5 space-y-2">
            <h2 className="text-[13px] font-semibold text-white mb-3">Quick actions</h2>
            {[
              { label: 'Browse games', href: '/games',   icon: Gamepad2   },
              { label: 'Find matches', href: '/matches', icon: Sparkles   },
              { label: 'View profile', href: '/profile', icon: TrendingUp },
            ].map(a => (
              <Link key={a.href} href={a.href} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-[var(--color-bg-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-dim)] transition-all group">
                <div className="flex items-center gap-2.5">
                  <a.icon className="w-3.5 h-3.5 text-[var(--color-text-3)] group-hover:text-[var(--color-accent)] transition-colors" />
                  <span className="text-[13px] font-medium text-[var(--color-text-2)] group-hover:text-white transition-colors">{a.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-3)] group-hover:text-[var(--color-text-2)] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
