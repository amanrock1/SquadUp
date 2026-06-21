// ============================================================
// Wishlist Page — Add games + view/manage wishlist entries
// ============================================================

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { createWishlistEntry, getUserWishlist, deleteWishlistEntry, updateWishlistEntry, getAllFormingGroups, joinGroup, createGroup } from '@/lib/db';
import { getGameRecommendations, optimizeCost } from '@/lib/ai';
import { normalizeGameName } from '@/lib/similarity';
import type { WishlistEntry, GameRecommendation, CostOptimization, GameGroup } from '@/lib/types';
import {
  Plus, Gamepad2, IndianRupee, Users, Clock, Trash2,
  Edit3, Sparkles, TrendingDown, X, ChevronDown, UserPlus
} from 'lucide-react';

export default function WishlistPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [wishlist, setWishlist] = useState<WishlistEntry[]>([]);
  const [formingGroups, setFormingGroups] = useState<GameGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [gameName, setGameName] = useState('');
  const [budget, setBudget] = useState('');
  const [playersNeeded, setPlayersNeeded] = useState('2');
  const [playTime, setPlayTime] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // AI panels
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [costResult, setCostResult] = useState<CostOptimization | null>(null);
  const [showAI, setShowAI] = useState<string | null>(null);
  const [selectedGameGroups, setSelectedGameGroups] = useState<string | null>(null);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  // Delete confirmation
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    try {
      const [entries, groups] = await Promise.all([
        getUserWishlist(user!.uid),
        getAllFormingGroups()
      ]);
      setWishlist(entries);
      setFormingGroups(groups);
    } catch (err) {
      toast('error', 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string, gName: string) => {
    if (!user) return;
    setJoiningGroupId(groupId);
    try {
      const username = profile?.username || user.displayName || 'Gamer';
      await joinGroup(groupId, user.uid, username);
      toast('success', `Joined group for ${gName}! 🎉`);
      await loadWishlist();
    } catch (err: any) {
      toast('error', err?.message || 'Failed to join group');
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleQuickCreateGroup = async (entry: WishlistEntry) => {
    if (!user) return;
    try {
      const username = profile?.username || user.displayName || 'Gamer';
      await createGroup({
        gameName: entry.gameName,
        members: [user.uid],
        memberNames: [username],
        maxPlayers: entry.playersNeeded,
        createdBy: user.uid,
      });
      toast('success', `Created a new group for ${entry.gameName}!`);
      await loadWishlist();
    } catch (err: any) {
      toast('error', err?.message || 'Failed to create group');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName.trim() || !budget) {
      toast('warning', 'Please fill in game name and budget');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateWishlistEntry(editingId, {
          gameName: gameName.trim(),
          budget: Number(budget),
          playersNeeded: Number(playersNeeded),
          preferredPlayTime: playTime,
        });
        toast('success', 'Entry updated!');
      } else {
        await createWishlistEntry({
          userId: user!.uid,
          gameName: gameName.trim(),
          budget: Number(budget),
          playersNeeded: Number(playersNeeded),
          preferredPlayTime: playTime,
        });
        toast('success', `${gameName} added to your wishlist! 🎮`);
      }

      resetForm();
      await loadWishlist();
    } catch (err) {
      toast('error', 'Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWishlistEntry(id);
      setWishlist(prev => prev.filter(w => w.id !== id));
      toast('success', 'Entry removed');
      setDeleteModal(null);
    } catch (err) {
      toast('error', 'Failed to delete entry');
    }
  };

  const handleEdit = (entry: WishlistEntry) => {
    setGameName(entry.gameName);
    setBudget(entry.budget.toString());
    setPlayersNeeded(entry.playersNeeded.toString());
    setPlayTime(entry.preferredPlayTime || '');
    setEditingId(entry.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setGameName('');
    setBudget('');
    setPlayersNeeded('2');
    setPlayTime('');
    setEditingId(null);
    setShowForm(false);
  };

  const showRecommendations = (gName: string) => {
    const recs = getGameRecommendations(gName);
    setRecommendations(recs);
    setShowAI(gName);
  };

  const showCostOptimizer = (gName: string, gBudget: number) => {
    const result = optimizeCost(gBudget * Number(playersNeeded || 2), gBudget);
    setCostResult(result);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-brand-400" />
            My Wishlist
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Add games you want to play and find others to team up with.
          </p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          icon={showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          variant={showForm ? 'ghost' : 'primary'}
        >
          {showForm ? 'Cancel' : 'Add Game'}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card padding="lg" variant="glow" className="animate-slide-up">
          <h2 className="text-lg font-bold mb-4">
            {editingId ? 'Edit Entry' : 'Add to Wishlist'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Game Name"
                placeholder="e.g. Minecraft, CS2, Helldivers 2"
                value={gameName}
                onChange={e => setGameName(e.target.value)}
                icon={<Gamepad2 className="w-4 h-4" />}
                required
              />
              <Input
                label="Your Budget (₹)"
                type="number"
                placeholder="e.g. 1000"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                icon={<IndianRupee className="w-4 h-4" />}
                min="0"
                max="50000"
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Players Needed"
                value={playersNeeded}
                onChange={e => setPlayersNeeded(e.target.value)}
                options={[
                  { value: 2, label: '2 Players' },
                  { value: 3, label: '3 Players' },
                  { value: 4, label: '4 Players' },
                  { value: 5, label: '5 Players' },
                  { value: 6, label: '6 Players' },
                  { value: 8, label: '8 Players' },
                  { value: 10, label: '10 Players' },
                ]}
              />
              <Input
                label="Preferred Play Time (optional)"
                placeholder="e.g. Evenings, Weekends"
                value={playTime}
                onChange={e => setPlayTime(e.target.value)}
                icon={<Clock className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={submitting}>
                {editingId ? 'Save Changes' : 'Add to Wishlist'}
              </Button>
              {editingId && (
                <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              )}
            </div>
          </form>
        </Card>
      )}

      {/* Wishlist Entries */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-24 w-full" />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <Card padding="lg" className="text-center">
          <Gamepad2 className="w-14 h-14 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No games yet</h3>
          <p className="text-sm text-text-secondary mb-4">
            Add your first game to start finding matches!
          </p>
          <Button onClick={() => setShowForm(true)} icon={<Plus className="w-4 h-4" />}>
            Add Your First Game
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {wishlist.map(entry => {
            const gameGroups = formingGroups.filter(g => 
              normalizeGameName(g.gameName) === normalizeGameName(entry.gameName)
            );

            return (
              <Card key={entry.id} padding="md" className="animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Game info */}
                  <div className="flex items-center gap-3 flex-1" onClick={() => setSelectedGameGroups(selectedGameGroups === entry.gameName ? null : entry.gameName)} style={{ cursor: 'pointer' }}>
                    <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-6 h-6 text-brand-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-text-primary truncate">{entry.gameName}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />Budget: ₹{entry.budget}
                        </span>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Users className="w-3 h-3" />{entry.playersNeeded} players
                        </span>
                        {entry.preferredPlayTime && (
                          <span className="text-xs text-text-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />{entry.preferredPlayTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={entry.status === 'active' ? 'info' : entry.status === 'matched' ? 'success' : 'neon'}>
                      {entry.status}
                    </Badge>
                    <Button 
                      variant={selectedGameGroups === entry.gameName ? 'primary' : 'ghost'} 
                      size="sm" 
                      onClick={() => setSelectedGameGroups(selectedGameGroups === entry.gameName ? null : entry.gameName)}
                      icon={<Users className="w-4 h-4" />}
                    >
                      Groups ({gameGroups.length})
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => showRecommendations(entry.gameName)} icon={<Sparkles className="w-4 h-4" />}>
                      AI
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)} icon={<Edit3 className="w-4 h-4" />} />
                    <Button variant="ghost" size="sm" onClick={() => setDeleteModal(entry.id)} icon={<Trash2 className="w-4 h-4 text-error" />} />
                  </div>
                </div>

                {/* AI Recommendations Panel (inline) */}
                {showAI === entry.gameName && (
                  <div className="mt-4 pt-4 border-t border-white/5 animate-slide-up">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-neon-cyan" />
                        Similar Games & Alternatives
                      </h4>
                      <Button variant="ghost" size="sm" onClick={() => setShowAI(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {recommendations.map(rec => (
                        <div key={rec.name} className="p-3 rounded-xl bg-surface-800/70">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-text-primary">{rec.name}</p>
                            <span className={`text-xs font-bold ${rec.estimatedPrice === 0 ? 'text-neon-green' : rec.estimatedPrice < entry.budget ? 'text-neon-green' : 'text-text-muted'}`}>
                              {rec.estimatedPrice === 0 ? 'FREE' : `₹${rec.estimatedPrice}`}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted mt-1 line-clamp-2">{rec.description}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Users className="w-3 h-3 text-text-muted" />
                            <span className="text-xs text-text-muted">{rec.playerCount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Groups Panel (inline) */}
                {selectedGameGroups === entry.gameName && (
                  <div className="mt-4 pt-4 border-t border-white/5 animate-slide-up">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        <Users className="w-4 h-4 text-neon-purple" />
                        Available Groups for {entry.gameName}
                      </h4>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedGameGroups(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    {gameGroups.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-xs text-text-muted mb-2">No active groups for this game yet.</p>
                        <Button variant="secondary" size="sm" onClick={() => handleQuickCreateGroup(entry)}>
                          Start a Group
                        </Button>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-2">
                        {gameGroups.map(group => {
                          const inGroup = group.members.includes(user?.uid || '');
                          return (
                            <div key={group.id} className="p-3 rounded-xl bg-surface-800/70 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-text-primary">Group by {group.memberNames[0]}</p>
                                <p className="text-xs text-text-muted mt-0.5">
                                  {group.members.length}/{group.maxPlayers} Players
                                </p>
                              </div>
                              <Button
                                variant={inGroup ? 'ghost' : 'success'}
                                size="sm"
                                disabled={inGroup || group.members.length >= group.maxPlayers || joiningGroupId === group.id}
                                onClick={() => handleJoinGroup(group.id, entry.gameName)}
                                icon={<UserPlus className="w-3.5 h-3.5" />}
                              >
                                {inGroup ? 'Joined' : 'Join'}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Remove from Wishlist?"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-4">
          This will remove the game from your wishlist and any associated matches.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => deleteModal && handleDelete(deleteModal)}>
            Yes, Remove
          </Button>
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
