// ============================================================
// Matches Page — View matched users per wishlist entry
// ============================================================

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { getUserWishlist, getAllActiveEntries, getUserProfile, createGroup } from '@/lib/db';
import { gameNameMatchScore } from '@/lib/similarity';
import type { WishlistEntry, UserProfile, MatchResult } from '@/lib/types';
import { Sparkles, Search, Users, IndianRupee, Gamepad2, UserPlus } from 'lucide-react';

export default function MatchesPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [myEntries, setMyEntries] = useState<WishlistEntry[]>([]);
  const [matches, setMatches] = useState<Record<string, MatchResult[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) loadMatches();
  }, [user]);

  const loadMatches = async () => {
    try {
      const [myWishlist, allEntries] = await Promise.all([
        getUserWishlist(user!.uid),
        getAllActiveEntries(),
      ]);
      setMyEntries(myWishlist);

      const matchMap: Record<string, MatchResult[]> = {};

      for (const myEntry of myWishlist) {
        const entryMatches: MatchResult[] = [];

        for (const otherEntry of allEntries) {
          if (otherEntry.userId === user!.uid) continue;

          const nameScore = gameNameMatchScore(myEntry.gameName, otherEntry.gameName);
          if (nameScore === 0) continue; 

          const budgetDiff = Math.abs(myEntry.budget - otherEntry.budget);
          const maxBudget = Math.max(myEntry.budget, otherEntry.budget, 1);
          const budgetScore = Math.max(0, 30 - (budgetDiff / maxBudget * 30));

          const playerDiff = Math.abs(myEntry.playersNeeded - otherEntry.playersNeeded);
          const playerScore = playerDiff === 0 ? 20 : playerDiff === 1 ? 10 : 0;

          const totalScore = Math.round((nameScore * 0.5) + budgetScore + playerScore);

          if (totalScore >= 20) {
            let userProfile: UserProfile | null = null;
            try {
              userProfile = await getUserProfile(otherEntry.userId);
            } catch (e) {
              // ignore
            }

            if (userProfile) {
              const reasons: string[] = [];
              if (nameScore >= 80) reasons.push('Same game');
              else if (nameScore >= 50) reasons.push('Similar game');
              if (budgetScore >= 20) reasons.push('Similar budget');
              if (playerScore >= 15) reasons.push('Same player count');

              entryMatches.push({
                entry: otherEntry,
                user: userProfile,
                score: Math.min(totalScore, 100),
                reasons,
              });
            }
          }
        }

        entryMatches.sort((a, b) => b.score - a.score);
        if (entryMatches.length > 0) {
          matchMap[myEntry.id] = entryMatches;
        }
      }

      setMatches(matchMap);
    } catch (err) {
      console.error('Failed to load matches:', err);
      toast('error', 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (myEntry: WishlistEntry, matchedUser: MatchResult) => {
    try {
      const groupId = await createGroup({
        gameName: myEntry.gameName,
        members: [user!.uid, matchedUser.user.uid],
        memberNames: [profile?.username || 'You', matchedUser.user.username],
        maxPlayers: myEntry.playersNeeded,
        createdBy: user!.uid,
      });
      toast('success', `Group created for ${myEntry.gameName}! 🎉`);
    } catch (err: any) {
      toast('error', err?.message || 'Failed to create group');
    }
  };

  const filteredEntries = myEntries.filter(entry =>
    !searchQuery || entry.gameName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMatches = Object.values(matches).reduce((sum, m) => sum + m.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 font-heading tracking-tight text-white">
          <Sparkles className="w-5 h-5 text-[var(--color-accent)]" />
          Recent Matches
        </h1>
        <p className="text-xs text-[var(--color-text-3)] font-medium mt-1">
          {totalMatches} active player match{totalMatches !== 1 ? 'es' : ''} found based on games you are watching.
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by game title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 text-[var(--color-text-3)]" />}
          />
        </div>
      </div>

      {/* Match Results */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-48 w-full" />
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[var(--color-bg-border)] bg-[var(--color-bg-card)] rounded-xl">
          <Sparkles className="w-10 h-10 text-[var(--color-text-3)] mx-auto mb-4" />
          <h3 className="text-base font-bold text-white mb-1">No Matches Found</h3>
          <p className="text-xs text-[var(--color-text-3)] max-w-xs mx-auto">
            Add games to your wishlist and set your split budget to see matched players in your region.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEntries.map(entry => {
            const entryMatches = matches[entry.id] || [];

            return (
              <div key={entry.id} className="p-5 border border-[var(--color-bg-border)] bg-[var(--color-bg-card)] rounded-xl relative overflow-hidden">
                
                {/* Entry header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-bg-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-white leading-tight">{entry.gameName}</h3>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--color-text-3)] font-semibold uppercase">
                        <span>Max Share: ₹{entry.budget}</span>
                        <span>·</span>
                        <span>Group Size: {entry.playersNeeded} Players</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={entryMatches.length > 0 ? 'success' : 'default'}>
                    {entryMatches.length} Match{entryMatches.length !== 1 ? 'es' : ''}
                  </Badge>
                </div>

                {/* Matched users */}
                {entryMatches.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-3)] text-center py-4 font-medium uppercase tracking-wider">
                    Looking for players with matching budgets...
                  </p>
                ) : (
                  <div className="space-y-2">
                    {entryMatches.map((match, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-[var(--color-bg-border)] bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                        {/* User info */}
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative">
                            <div className="w-8 h-8 bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] rounded flex items-center justify-center text-xs font-bold text-[var(--color-accent)] shrink-0 select-none">
                              {match.user.username[0].toUpperCase()}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-[var(--color-green)] border border-[var(--color-bg-card)] rounded-full" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-white leading-none">{match.user.username}</p>
                              {match.user.region && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-bg-subtle)] border border-[var(--color-bg-border)] text-[var(--color-text-2)] font-semibold uppercase tracking-wider leading-none">
                                  {match.user.region}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[var(--color-text-3)] font-semibold mt-1 uppercase tracking-wide">
                              Their Budget: ₹{match.entry.budget} Max Share
                            </p>
                          </div>
                        </div>

                        {/* Match details & actions */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex flex-wrap gap-1">
                            {match.reasons.map(r => (
                              <span key={r} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--color-blue-dim)] border border-[var(--color-blue-border)] text-[var(--color-accent)]">{r}</span>
                            ))}
                          </div>
                          <span className="text-xs font-bold text-[var(--color-green)] px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20">
                            {match.score}% Compatibility
                          </span>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleCreateGroup(entry, match)}
                            icon={<UserPlus className="w-3.5 h-3.5" />}
                            className="bg-[var(--color-accent)] hover:bg-[var(--color-brand-600)] text-white border-none font-medium rounded-lg"
                          >
                            Join Group
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
