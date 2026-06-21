// ============================================================
// Matches Page — View matched users per wishlist entry
// ============================================================

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, MatchBadge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { getUserWishlist, getAllActiveEntries, getUserProfile, createGroup } from '@/lib/db';
import { gameNameMatchScore } from '@/lib/similarity';
import { optimizeCost } from '@/lib/ai';
import type { WishlistEntry, UserProfile, MatchResult } from '@/lib/types';
import {
  Sparkles, Search, Users, IndianRupee, Gamepad2,
  TrendingUp, UserPlus, Filter, ArrowUpDown
} from 'lucide-react';

export default function MatchesPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [myEntries, setMyEntries] = useState<WishlistEntry[]>([]);
  const [matches, setMatches] = useState<Record<string, MatchResult[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'budget'>('score');

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

      // Find matches for each of my entries
      const matchMap: Record<string, MatchResult[]> = {};

      for (const myEntry of myWishlist) {
        const entryMatches: MatchResult[] = [];

        for (const otherEntry of allEntries) {
          // Skip own entries
          if (otherEntry.userId === user!.uid) continue;

          // Calculate match score
          const nameScore = gameNameMatchScore(myEntry.gameName, otherEntry.gameName);
          if (nameScore === 0) continue; // No game name match at all

          // Budget proximity (0-30)
          const budgetDiff = Math.abs(myEntry.budget - otherEntry.budget);
          const maxBudget = Math.max(myEntry.budget, otherEntry.budget, 1);
          const budgetScore = Math.max(0, 30 - (budgetDiff / maxBudget * 30));

          // Player count match (0-20)
          const playerDiff = Math.abs(myEntry.playersNeeded - otherEntry.playersNeeded);
          const playerScore = playerDiff === 0 ? 20 : playerDiff === 1 ? 10 : 0;

          // Total weighted score (game name is most important)
          const totalScore = Math.round((nameScore * 0.5) + budgetScore + playerScore);

          if (totalScore >= 20) {
            // Get user profile
            let userProfile: UserProfile | null = null;
            try {
              userProfile = await getUserProfile(otherEntry.userId);
            } catch (e) {
              // Skip if can't load profile
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

        // Sort by score
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
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-neon-cyan" />
          Your Matches
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {totalMatches} gamer{totalMatches !== 1 ? 's' : ''} matched with your wishlist
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by game name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Match results */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-48 w-full" />
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <Card padding="lg" className="text-center">
          <Sparkles className="w-14 h-14 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No matches yet</h3>
          <p className="text-sm text-text-secondary">
            Add games to your wishlist to start finding matches!
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredEntries.map(entry => {
            const entryMatches = matches[entry.id] || [];

            return (
              <Card key={entry.id} padding="md">
                {/* Entry header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
                      <Gamepad2 className="w-5 h-5 text-brand-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-primary">{entry.gameName}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-text-muted">₹{entry.budget} budget</span>
                        <span className="text-xs text-text-muted">{entry.playersNeeded} players</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={entryMatches.length > 0 ? 'success' : 'default'} size="md">
                    {entryMatches.length} match{entryMatches.length !== 1 ? 'es' : ''}
                  </Badge>
                </div>

                {/* Matched users */}
                {entryMatches.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-4">
                    No matches found yet. More gamers join every day!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {entryMatches.map((match, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-700/50 transition-colors">
                        {/* User info */}
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-9 h-9 bg-brand-600/30 border border-brand-500/30 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-brand-300">
                              {match.user.username[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text-primary">{match.user.username}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="text-xs text-text-muted">
                                {match.entry.gameName} · ₹{match.entry.budget} budget
                              </span>
                              {match.user.region && (
                                <span className="text-xs text-text-muted">· {match.user.region}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Match info + actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex flex-wrap gap-1">
                            {match.reasons.map(r => (
                              <Badge key={r} size="sm">{r}</Badge>
                            ))}
                          </div>
                          <MatchBadge percentage={match.score} />
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleCreateGroup(entry, match)}
                            icon={<UserPlus className="w-4 h-4" />}
                          >
                            Group
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
