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
  TrendingUp, Zap, ChevronRight
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

  return (
    <div className="space-y-6 pb-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />
            <span className="text-[10px] font-semibold tracking-wider text-[var(--color-text-3)] uppercase font-subheading">Status: Online</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-heading">
            Welcome back, {profile?.username || 'User'}
          </h1>
          <p className="text-xs text-[var(--color-text-3)] font-medium mt-0.5">
            Manage your groups, track game splits, and find other players.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" onClick={handleSeed} loading={seeding} icon={<Database className="w-3.5 h-3.5" />} className="border border-[var(--color-bg-border)] hover:bg-white/[0.02]">
            Seed Data
          </Button>
          <Link href="/wishlist">
            <Button variant="primary" icon={<ListPlus className="w-3.5 h-3.5" />} className="bg-[var(--color-accent)] hover:bg-[var(--color-brand-600)]">
              Add Game
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Watching',     value: wishlist.length,                         icon: ListPlus,   color: 'var(--color-accent)', href: '/wishlist' },
          { label: 'Matches',      value: `${activeMatches}`,                      icon: Sparkles,   color: 'var(--color-blue)',   href: '/matches'  },
          { label: 'Active Groups', value: groups.length,                           icon: Users,      color: 'var(--color-accent-light)', href: '/groups'   },
          { label: 'Reputation',   value: profile?.rating?.toFixed(1) || '5.0',   icon: Star,       color: 'var(--color-yellow)', href: '/profile'  },
        ].map(stat => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-bg-border)] p-4 flex flex-col gap-3 rounded-xl hover:border-white/[0.1] hover:bg-[var(--color-bg-hover)] transition-all group">
              <div className="flex items-center justify-between">
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-3)] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-heading tracking-tight leading-none">{stat.value}</p>
                <p className="text-[10px] text-[var(--color-text-3)] font-semibold tracking-wider mt-1.5 uppercase font-subheading">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recommended Splits Banner */}
      <div className="relative overflow-hidden border border-[var(--color-bg-border)] bg-[var(--color-bg-card)] rounded-xl" style={{ minHeight: '150px' }}>
        <img
          src="https://cdn.akamai.steamstatic.com/steam/apps/553850/header.jpg"
          alt="Helldivers 2"
          className="absolute inset-0 w-full h-full object-cover opacity-15 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-card)] via-[var(--color-bg-card)]/90 to-transparent" />

        <div className="relative p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg z-10">
            <span className="px-2.5 py-0.5 rounded bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] text-[9px] font-bold tracking-wider text-[var(--color-accent)] uppercase inline-flex items-center gap-1">
              <Zap className="w-3 h-3" /> Recommended Split
            </span>
            <h2 className="text-xl font-bold text-white font-heading">Helldivers 2</h2>
            <p className="text-xs text-[var(--color-text-2)] leading-relaxed">
              4 players splitting ₹2,499 — pay just <strong className="text-white">₹625/person.</strong> Join and match with active players instantly.
            </p>
            <div className="flex items-center gap-5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-3)] pt-1">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[var(--color-accent)]" /> 3 / 4 Joined
              </span>
              <span className="flex items-center gap-1 text-white">
                <IndianRupee className="w-3.5 h-3.5 text-[var(--color-green)]" /> ₹625 Per Player
              </span>
            </div>
          </div>
          <Link href="/games" className="shrink-0 z-10">
            <Button variant="primary" icon={<ArrowRight className="w-3.5 h-3.5" />} className="bg-[var(--color-accent)] hover:bg-[var(--color-brand-600)]">
              Join Group
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Left: Watching & Active Groups */}
        <div className="lg:col-span-2 space-y-5">
          {/* Watching */}
          <div className="p-5 border border-[var(--color-bg-border)] bg-[var(--color-bg-card)] rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-bold text-white uppercase tracking-wider flex items-center gap-2 font-heading">
                <Gamepad2 className="w-4 h-4 text-[var(--color-accent)]" />
                Games You're Watching
              </h2>
              <Link href="/wishlist" className="text-xs font-semibold text-[var(--color-accent)] hover:text-white transition-colors">
                Edit List →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 w-full" />)}
              </div>
            ) : wishlist.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[var(--color-bg-border)] rounded-lg">
                <Gamepad2 className="w-8 h-8 text-[var(--color-text-3)] mx-auto mb-2" />
                <p className="text-xs text-[var(--color-text-3)] mb-3">Watchlist is empty.</p>
                <Link href="/wishlist">
                  <Button variant="secondary" size="sm">Add first game</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {wishlist.slice(0, 5).map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between px-4 py-3 rounded-lg border border-[var(--color-bg-border)] bg-white/[0.01] hover:bg-white/[0.03] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded bg-white/[0.02] border border-[var(--color-bg-border)] flex items-center justify-center shrink-0">
                        <Gamepad2 className="w-3.5 h-3.5 text-[var(--color-accent-light)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-white truncate">{entry.gameName}</p>
                        <p className="text-xs text-[var(--color-text-3)]">
                          ₹{entry.budget} Max Budget · {entry.playersNeeded} Players
                        </p>
                      </div>
                    </div>
                    <Badge variant={entry.status === 'matched' ? 'success' : entry.status === 'active' ? 'neon' : 'warning'}>
                      {entry.status === 'matched' ? 'Matched' : entry.status === 'active' ? 'Looking' : 'Searching'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active groups */}
          <div className="p-5 border border-[var(--color-bg-border)] bg-[var(--color-bg-card)] rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-bold text-white uppercase tracking-wider flex items-center gap-2 font-heading">
                <Users className="w-4 h-4 text-[var(--color-accent)]" />
                Your Active Groups
              </h2>
              <Link href="/groups" className="text-xs font-semibold text-[var(--color-accent)] hover:text-white transition-colors">
                View All Groups →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="skeleton h-14 w-full" />)}
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-6 text-[var(--color-text-3)] text-xs font-semibold uppercase tracking-wider">
                No active groups. Join or start a group to split.
              </div>
            ) : (
              <div className="space-y-2.5">
                {groups.slice(0, 4).map(group => {
                  const fill = group.members.length / group.maxPlayers;
                  return (
                    <div key={group.id} className="px-4 py-3 rounded-lg border border-[var(--color-bg-border)] bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[13px] font-bold text-white truncate max-w-[70%]">{group.gameName}</p>
                        <Badge variant={group.status === 'complete' ? 'success' : 'warning'}>
                          {group.status === 'complete' ? 'Completed' : 'Looking'}
                        </Badge>
                      </div>
                      <div className="cap-bar mb-2">
                        <div className={`cap-bar-fill ${fill >= 1 ? 'full' : ''}`} style={{ width: `${Math.min(fill * 100, 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-[var(--color-text-3)] font-semibold uppercase tracking-wider font-subheading">{group.members.length} / {group.maxPlayers} Players Joined</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: AI suggestions & Quick Actions */}
        <div className="space-y-5">
          {/* Recommended Splits */}
          <div className="p-5 border border-[var(--color-bg-border)] bg-[var(--color-bg-card)] rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
              <h2 className="text-[13px] font-bold text-white uppercase tracking-wider font-heading">Recommended Splits</h2>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-14 w-full" />)}
              </div>
            ) : (
              <div className="space-y-2.5">
                {recommendations.map(rec => (
                  <div
                    key={rec.name}
                    className="p-3.5 rounded-lg border border-[var(--color-bg-border)] bg-white/[0.01] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-dim)] transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-bold text-white leading-tight group-hover:text-[var(--color-accent-light)] transition-colors">{rec.name}</p>
                      <span className="text-[11px] font-bold shrink-0 text-[var(--color-accent)]">
                        {rec.estimatedPrice === 0 ? 'FREE' : `₹${rec.estimatedPrice}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-2)] mt-1.5 line-clamp-2 leading-relaxed">{rec.description}</p>
                  </div>
                ))}
              </div>
            )}
            <Link href="/games">
              <Button variant="secondary" size="sm" className="w-full mt-4 border border-[var(--color-bg-border)] hover:bg-white/[0.02]">
                Browse All Games
              </Button>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="p-5 space-y-2 border border-[var(--color-bg-border)] bg-[var(--color-bg-card)] rounded-xl">
            <h2 className="text-[13px] font-bold text-white uppercase tracking-wider mb-3 font-heading">Quick Actions</h2>
            {[
              { label: 'Browse games', href: '/games',   icon: Gamepad2   },
              { label: 'Find matches', href: '/matches', icon: Sparkles   },
              { label: 'View profile', href: '/profile', icon: TrendingUp },
            ].map(a => (
              <Link key={a.href} href={a.href} className="flex items-center justify-between px-3.5 py-3 rounded-lg border border-[var(--color-bg-border)] bg-white/[0.01] hover:bg-[var(--color-accent-dim)] hover:border-[var(--color-accent-border)] transition-all group">
                <div className="flex items-center gap-2.5">
                  <a.icon className="w-4 h-4 text-[var(--color-text-3)] group-hover:text-[var(--color-accent)] transition-colors" />
                  <span className="text-xs font-semibold text-[var(--color-text-2)] group-hover:text-white transition-colors">{a.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-3)] group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
