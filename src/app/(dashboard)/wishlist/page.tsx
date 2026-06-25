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
  Edit3, Sparkles, TrendingDown, X, ChevronDown, UserPlus,
  Flame, LineChart, Shield, Check, Info, ArrowUpRight
} from 'lucide-react';

const STEAM_ID_MAP: Record<string, number> = {
  'minecraft': 0,
  'helldivers 2': 553850,
  'valheim': 892970,
  'stardew valley': 413150,
  'lethal company': 1966720,
  'terraria': 105600,
  'valorant': 0,
  'counter strike 2': 730,
  'counter strike': 730,
  'cs2': 730,
  'cs:go': 730,
  'elden ring': 1245620,
  'among us': 945360,
  'deep rock galactic': 548430,
  'phasmophobia': 739635,
  'fall guys': 1097150,
  'rocket league': 252950,
  'fortnite': 0,
  'apex legends': 1172470,
  'overwatch 2': 2357570,
  'gta v online': 271590,
  'gta 5': 271590,
  'sea of thieves': 1172620,
  'it takes two': 1426210,
  'a way out': 730580,
  'rust': 252490,
  'ark survival evolved': 346110,
  'ark': 346110,
  'left 4 dead 2': 550,
  'destiny 2': 1085660,
  'monster hunter world': 582010,
  'borderlands 3': 397540,
  'palworld': 1623730,
  'the forest': 242760,
  "no man's sky": 275850,
  "don't starve together": 322330,
  'raft': 648800,
  'human fall flat': 477160,
  'unravel two': 1225570,
  'overcooked 2': 728880,
  'satisfactory': 526875,
  'factorio': 427520,
  'barotrauma': 602960,
  'risk of rain 2': 632360,
  'halo infinite': 1240440,
};

const getSteamId = (name: string): number | null => {
  const norm = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (!norm) return null;
  
  // Try exact normalized key match
  for (const [key, val] of Object.entries(STEAM_ID_MAP)) {
    const keyNorm = key.replace(/[^a-z0-9]/g, '');
    if (norm === keyNorm) return val || null;
  }
  
  // Try partial match
  for (const [key, val] of Object.entries(STEAM_ID_MAP)) {
    const keyNorm = key.replace(/[^a-z0-9]/g, '');
    if (norm.includes(keyNorm) || keyNorm.includes(norm)) {
      return val || null;
    }
  }
  
  return null;
};

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
  const [showPriceHistory, setShowPriceHistory] = useState<string | null>(null);

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
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to join group';
      toast('error', msg);
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create group';
      toast('error', msg);
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
    setShowAI(gName === showAI ? null : gName);
  };

  // SVG drawing details for Cost Optimization Curve
  const drawSvgCurve = (budget: number, playersNeeded: number) => {
    const steps = [1, 2, 3, 4, 6, 8];
    const points = steps.map((s, idx) => {
      const x = 40 + idx * 60;
      const splitVal = Math.round(budget / s);
      const ratio = splitVal / budget;
      const y = 90 - (ratio * 70); // Y scale between 20 and 90
      return { x, y, players: s, split: splitVal };
    });

    const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;

    return { points, pathD, areaD };
  };

  // Quick stats
  const totalGames = wishlist.length;
  const activeLobbiesCount = formingGroups.filter(g =>
    wishlist.some(w => normalizeGameName(w.gameName) === normalizeGameName(g.gameName))
  ).length;
  const totalOptimizedPotential = wishlist.reduce((acc, curr) => {
    const soloCost = curr.budget * curr.playersNeeded;
    const splitCost = curr.budget;
    return acc + (soloCost - splitCost);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-bg-border)] pb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 font-heading tracking-tight text-white">
            <Gamepad2 className="w-5 h-5 text-[var(--color-accent)]" />
            Your Wishlist
          </h1>
          <p className="text-xs text-[var(--color-text-3)] font-medium mt-1">
            Add games you are watching to match with other players splitting checkout costs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            icon={showForm ? <X className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-black animate-bounce" />}
            variant={showForm ? 'ghost' : 'primary'}
            className={showForm 
              ? 'border border-[var(--color-bg-border)] hover:bg-white/[0.02] text-white' 
              : 'bg-[var(--color-accent)] hover:bg-[var(--color-brand-600)] text-white border-none'
            }
          >
            {showForm ? 'Cancel' : 'Add Game'}
          </Button>
        </div>
      </div>

      {/* Quick Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-bg-border)] flex items-center gap-4 relative rounded-xl">
          <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-[var(--color-accent)]" />
          <div className="w-9 h-9 rounded bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-[var(--color-accent)]" />
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-text-3)] font-semibold uppercase tracking-wider font-subheading">GAMES WATCHING</p>
            <p className="text-base font-bold text-white">{totalGames} Games</p>
          </div>
        </div>

        <div className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-bg-border)] flex items-center gap-4 relative rounded-xl">
          <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-[var(--color-blue)]" />
          <div className="w-9 h-9 rounded bg-[var(--color-blue-dim)] border border-[var(--color-blue-border)] flex items-center justify-center">
            <Users className="w-5 h-5 text-[var(--color-blue)]" />
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-text-3)] font-semibold uppercase tracking-wider font-subheading">ACTIVE GROUPS</p>
            <p className="text-base font-bold text-white">{activeLobbiesCount} Groups</p>
          </div>
        </div>

        <div className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-bg-border)] flex items-center gap-4 relative rounded-xl">
          <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-[var(--color-green)]" />
          <div className="w-9 h-9 rounded bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.15)] flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-[var(--color-green)]" />
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-text-3)] font-semibold uppercase tracking-wider font-subheading">POTENTIAL SAVINGS</p>
            <p className="text-base font-bold text-[var(--color-green)]">₹{totalOptimizedPotential} Saved</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Console */}
      {showForm && (
        <div className="hud-panel p-6 border border-white/[0.08] bg-[#11131A] rounded-xl shadow-2xl animate-slide-up relative">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-[var(--color-accent)]" />
            <h2 className="text-base font-bold tracking-tight text-white">
              {editingId ? 'Edit Game split settings' : 'Add Game split settings'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Game Name"
                placeholder="e.g. Helldivers 2, Valheim, Elden Ring"
                value={gameName}
                onChange={e => setGameName(e.target.value)}
                icon={<Gamepad2 className="w-4 h-4 text-[var(--color-text-3)]" />}
                required
              />
              <Input
                label="Split Budget Limit (₹)"
                type="number"
                placeholder="e.g. 1500"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                icon={<IndianRupee className="w-4 h-4 text-[var(--color-text-3)]" />}
                min="0"
                max="50000"
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Desired Team Size"
                value={playersNeeded}
                onChange={e => setPlayersNeeded(e.target.value)}
                options={[
                  { value: 2, label: '2 Players (Duo Split)' },
                  { value: 3, label: '3 Players (Trio Split)' },
                  { value: 4, label: '4 Players (Squad Split)' },
                  { value: 5, label: '5 Players' },
                  { value: 6, label: '6 Players' },
                  { value: 8, label: '8 Players (Raid Split)' },
                  { value: 10, label: '10 Players' },
                ]}
              />
              <Input
                label="Active Tactical Play Window (optional)"
                placeholder="e.g. Weekends, Daily 8PM-11PM"
                value={playTime}
                onChange={e => setPlayTime(e.target.value)}
                icon={<Clock className="w-4 h-4 text-[var(--color-text-3)]" />}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={submitting} className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-white border-none font-heading uppercase tracking-wider font-bold shadow-[0_0_12px_rgba(124,92,255,0.3)]">
                {editingId ? 'Save Configuration' : 'Confirm Loadout'}
              </Button>
              <Button variant="ghost" onClick={resetForm} className="border border-white/[0.06] hover:bg-white/[0.02]">
                Cancel Protocol
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Wishlist Entries Board */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-32 w-full rounded-xl bg-white/[0.02]" />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[var(--color-bg-border)] bg-[var(--color-bg-card)] rounded-xl relative overflow-hidden">
          <Gamepad2 className="w-12 h-12 text-white/5 mx-auto mb-4" />
          <h3 className="text-base font-bold text-white mb-2">Your wishlist is empty</h3>
          <p className="text-xs text-[var(--color-text-3)] mb-6 max-w-md mx-auto leading-relaxed">
            Add games you want to play to see cost splits with matching groups.
          </p>
          <Button onClick={() => setShowForm(true)} icon={<Plus className="w-4 h-4 text-white" />} className="bg-[var(--color-accent)] hover:bg-[var(--color-brand-600)] text-white border-none font-semibold text-xs">
            Add First Game
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {wishlist.map(entry => {
            const gameGroups = formingGroups.filter(g => 
              normalizeGameName(g.gameName) === normalizeGameName(entry.gameName)
            );
            
            const steamId = getSteamId(entry.gameName);
            const headerUrl = steamId 
              ? `https://cdn.akamai.steamstatic.com/steam/apps/${steamId}/header.jpg` 
              : null;
            
            const splitCost = Math.round(entry.budget / entry.playersNeeded);

            return (
              <div key={entry.id} className="hud-panel border border-white/[0.08] bg-[#11131A] hover:bg-[#13151D] hover:border-white/[0.15] transition-all duration-300 rounded-xl overflow-hidden shadow-md flex flex-col">
                {/* Horizontal main card details */}
                <div className="flex flex-col lg:flex-row items-stretch">
                  {/* Left Column: Artwork banner */}
                  <div className="lg:w-72 min-h-[140px] relative shrink-0 bg-black/40 flex items-center justify-center overflow-hidden border-r border-white/[0.06]">
                    {headerUrl ? (
                      <img 
                        src={headerUrl} 
                        alt={entry.gameName}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-950/40 to-slate-900/40 flex flex-col items-center justify-center p-4 text-center">
                        <Gamepad2 className="w-10 h-10 text-[var(--color-accent)]/40 mb-2 animate-pulse" />
                        <span className="text-[10px] font-mono text-[var(--color-text-3)] uppercase tracking-wider">STATIC CAPSULETTE</span>
                      </div>
                    )}
                    
                    {/* Steam Badge tag */}
                    {steamId !== null && steamId > 0 && (
                      <span className="absolute top-2 left-2 bg-black/85 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-widest text-[var(--color-blue)] border border-[var(--color-blue-border)]">
                        STEAM ASSET
                      </span>
                    )}

                    {/* Lateral accent tag */}
                    <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-[var(--color-accent)]" />
                  </div>

                  {/* Middle Column: Metadata details */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white font-heading">
                          {entry.gameName}
                        </h3>
                        <Badge variant={entry.status === 'active' ? 'info' : entry.status === 'matched' ? 'success' : 'neon'}>
                          {entry.status === 'active' ? 'Looking' : entry.status === 'matched' ? 'Matched' : 'Searching'}
                        </Badge>
                      </div>

                      {/* Specs badges */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs font-semibold text-[var(--color-text-2)]">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                          {entry.playersNeeded} Players
                        </span>
                        {entry.preferredPlayTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[var(--color-blue)]" />
                            Play: {entry.preferredPlayTime}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[var(--color-text-3)] font-semibold">
                          Groups: {gameGroups.length > 0 ? `${gameGroups.length} active` : 'None'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom stats status line */}
                    <div className="flex flex-wrap gap-2 items-center text-[10px] font-semibold uppercase text-[var(--color-text-3)]">
                      <span className="bg-white/[0.02] border border-[var(--color-bg-border)] px-2 py-0.5 rounded">
                        GROUPS DETECTED: {gameGroups.length}
                      </span>
                      <span className="bg-white/[0.02] border border-[var(--color-bg-border)] px-2 py-0.5 rounded">
                        STATUS: SEARCHING
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Pricing & Split Action Panel */}
                  <div className="p-5 bg-white/[0.01] border-l border-white/[0.06] shrink-0 flex flex-col justify-between items-end gap-4 min-w-[210px] text-right">
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-[var(--color-text-3)] uppercase tracking-wider">OPTIMIZED SPLIT COST</div>
                      <div className="text-2xl font-black font-heading text-[var(--color-green)] flex items-center justify-end gap-1">
                        <IndianRupee className="w-5 h-5 shrink-0" />
                        {splitCost}
                        <span className="text-xs text-[var(--color-text-2)] font-body font-normal"> / person</span>
                      </div>
                      <div className="text-[10px] text-[var(--color-text-2)] font-mono uppercase">
                        (Budget Limit: ₹{entry.budget} / Solo)
                      </div>
                    </div>

                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-end gap-1 w-full">
                        {/* Lobbies Trigger */}
                        <Button 
                          variant={selectedGameGroups === entry.gameName ? 'primary' : 'ghost'} 
                          size="sm" 
                          onClick={() => {
                            setSelectedGameGroups(selectedGameGroups === entry.gameName ? null : entry.gameName);
                            setShowAI(null);
                            setShowPriceHistory(null);
                          }}
                          icon={<Users className="w-3.5 h-3.5" />}
                          className="flex-1 text-[11px] font-mono border border-white/[0.06] hover:bg-white/[0.02] uppercase tracking-wider py-1.5"
                        >
                          Lobbies ({gameGroups.length})
                        </Button>

                        {/* Cost Trends Trigger */}
                        <Button 
                          variant={showPriceHistory === entry.id ? 'primary' : 'ghost'} 
                          size="sm" 
                          onClick={() => {
                            setShowPriceHistory(showPriceHistory === entry.id ? null : entry.id);
                            setShowAI(null);
                            setSelectedGameGroups(null);
                          }}
                          icon={<LineChart className="w-3.5 h-3.5" />}
                          className="text-[11px] font-mono border border-white/[0.06] hover:bg-white/[0.02] uppercase tracking-wider p-1.5"
                          title="Cost Splitting Curve / Price Trends"
                        />

                        {/* AI Intel Trigger */}
                        <Button 
                          variant={showAI === entry.gameName ? 'primary' : 'ghost'} 
                          size="sm" 
                          onClick={() => {
                            showRecommendations(entry.gameName);
                            setSelectedGameGroups(null);
                            setShowPriceHistory(null);
                          }}
                          icon={<Sparkles className="w-3.5 h-3.5 text-[var(--color-blue)]" />}
                          className="text-[11px] font-mono border border-white/[0.06] hover:bg-white/[0.02] uppercase tracking-wider p-1.5"
                          title="Alternative Game Recommendations"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(entry)} 
                          icon={<Edit3 className="w-3 h-3" />} 
                          className="hover:bg-white/[0.02] text-[var(--color-text-2)] hover:text-white p-1.5 border border-white/[0.06]" 
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setDeleteModal(entry.id)} 
                          icon={<Trash2 className="w-3 h-3 text-[var(--color-red)]" />} 
                          className="hover:bg-[rgba(255,70,85,0.06)] p-1.5 border border-white/[0.06]" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* EXPANDABLE PANEL 1: Price Splitting History / Curve (SVG Chart) */}
                {showPriceHistory === entry.id && (
                  <div className="border-t border-white/[0.06] bg-black/15 p-5 animate-slide-up relative">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-[var(--color-green)] animate-pulse" />
                        <h4 className="text-xs font-mono uppercase tracking-widest font-bold text-white">
                          Split Cost Optimization Curve // Pricing Projections
                        </h4>
                      </div>
                      <button onClick={() => setShowPriceHistory(null)} className="text-[var(--color-text-3)] hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-5 items-center">
                      {/* SVG Line Graph */}
                      <div className="lg:col-span-7 bg-[#0E1016] p-4 rounded-lg border border-white/[0.04] flex items-center justify-center">
                        <div className="w-full max-w-[420px]">
                          {(() => {
                            const { points, pathD, areaD } = drawSvgCurve(entry.budget, entry.playersNeeded);
                            return (
                              <div className="relative">
                                <svg viewBox="0 0 420 120" className="w-full overflow-visible">
                                  {/* Grid Lines */}
                                  <line x1="30" y1="20" x2="390" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                  <line x1="30" y1="55" x2="390" y2="55" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                  <line x1="30" y1="90" x2="390" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                                  {/* Graph Area Fill */}
                                  <path d={areaD} fill="url(#split-grad)" opacity="0.15" />
                                  
                                  {/* Graph Line */}
                                  <path d={pathD} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" />

                                  {/* Interactive Points */}
                                  {points.map((p, idx) => {
                                    const isSelected = p.players === entry.playersNeeded;
                                    return (
                                      <g key={idx} className="group/dot cursor-pointer">
                                        <circle 
                                          cx={p.x} 
                                          cy={p.y} 
                                          r={isSelected ? "5" : "3.5"} 
                                          fill={isSelected ? "var(--color-green)" : "#11131A"} 
                                          stroke={isSelected ? "var(--color-green)" : "var(--color-accent)"}
                                          strokeWidth="2.5" 
                                        />
                                        {/* Value Label */}
                                        <text 
                                          x={p.x} 
                                          y={p.y - 8} 
                                          textAnchor="middle" 
                                          className="text-[9px] font-mono font-bold fill-white"
                                          opacity={isSelected ? "1" : "0.5"}
                                        >
                                          ₹{p.split}
                                        </text>
                                        {/* Players Label */}
                                        <text 
                                          x={p.x} 
                                          y="112" 
                                          textAnchor="middle" 
                                          className="text-[8px] font-mono fill-[var(--color-text-3)]"
                                        >
                                          {p.players}P
                                        </text>
                                      </g>
                                    );
                                  })}

                                  {/* Gradient Definition */}
                                  <defs>
                                    <linearGradient id="split-grad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="var(--color-accent)" />
                                      <stop offset="100%" stopColor="transparent" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Quick Split Info Box */}
                      <div className="lg:col-span-5 space-y-3">
                        <div className="bg-[#0E1016] border border-white/[0.04] p-3 rounded-lg">
                          <p className="text-[10px] font-mono text-[var(--color-text-3)] uppercase tracking-wider">SAVINGS BREAKDOWN</p>
                          <div className="mt-1.5 space-y-1.5 text-xs font-mono">
                            <div className="flex justify-between text-white/60">
                              <span>Solo Purchase:</span>
                              <span>₹{entry.budget}</span>
                            </div>
                            <div className="flex justify-between text-[var(--color-green)] font-bold">
                              <span>{entry.playersNeeded}-Way Squad Split:</span>
                              <span>₹{splitCost} / person</span>
                            </div>
                            <div className="border-t border-white/5 pt-1.5 flex justify-between font-bold text-white">
                              <span>Net Split Savings:</span>
                              <span className="text-[var(--color-blue)]">₹{entry.budget - splitCost} saved</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-[10px] text-[var(--color-text-3)] leading-relaxed bg-white/[0.02] p-2.5 rounded border border-white/[0.04]">
                          <Info className="w-3.5 h-3.5 text-[var(--color-blue)] shrink-0 mt-0.5" />
                          <span>
                            Cost optimization decreases exponentially. Standard co-op matching searches active lobbies to reach target sizes and split costs instantly.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* EXPANDABLE PANEL 2: AI Recommendations (inline) */}
                {showAI === entry.gameName && (
                  <div className="border-t border-white/[0.06] bg-black/15 p-5 animate-slide-up relative">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-blue)] to-transparent" />
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[var(--color-blue)] animate-pulse" />
                        <h4 className="text-xs font-mono uppercase tracking-widest font-bold text-white">
                          Alternative Targets / AI Recommended Splitting Assets
                        </h4>
                      </div>
                      <button onClick={() => setShowAI(null)} className="text-[var(--color-text-3)] hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {recommendations.length === 0 ? (
                      <div className="text-center py-4 text-xs font-mono text-[var(--color-text-3)]">
                        No similar co-op optimization assets identified.
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {recommendations.map(rec => (
                          <div key={rec.name} className="p-3.5 rounded-lg border border-white/[0.04] bg-[#0E1016] hover:border-white/[0.1] transition-all">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-white truncate uppercase tracking-wider">{rec.name}</p>
                              <span className={`text-[10px] font-mono font-bold shrink-0 ${rec.estimatedPrice === 0 ? 'text-[var(--color-green)]' : rec.estimatedPrice <= entry.budget ? 'text-[var(--color-green)]' : 'text-[var(--color-text-3)]'}`}>
                                {rec.estimatedPrice === 0 ? 'FREE' : `₹${rec.estimatedPrice}`}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--color-text-2)] mt-1.5 line-clamp-2 leading-relaxed">{rec.description}</p>
                            <div className="flex items-center justify-between mt-3 text-[9px] font-mono text-[var(--color-text-3)] uppercase tracking-wider pt-2 border-t border-white/[0.03]">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {rec.playerCount} capacity
                              </span>
                              <span className="text-[var(--color-blue)] font-bold">MATCH READY</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* EXPANDABLE PANEL 3: Lobbies (inline) */}
                {selectedGameGroups === entry.gameName && (
                  <div className="border-t border-white/[0.06] bg-black/15 p-5 animate-slide-up relative">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[var(--color-accent)] animate-pulse" />
                        <h4 className="text-xs font-mono uppercase tracking-widest font-bold text-white">
                          Open Lobbies / Matchmaking Pipelines for {entry.gameName}
                        </h4>
                      </div>
                      <button onClick={() => setSelectedGameGroups(null)} className="text-[var(--color-text-3)] hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {gameGroups.length === 0 ? (
                      <div className="text-center py-6 bg-[#0E1016] rounded border border-dashed border-white/[0.06] max-w-lg mx-auto">
                        <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-3)] mb-4">
                          No active match pipelines forming for {entry.gameName}.
                        </p>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleQuickCreateGroup(entry)}
                          className="border border-white/[0.06] hover:bg-white/[0.02]"
                        >
                          Host Cost-Split Lobby
                        </Button>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {gameGroups.map(group => {
                          const inGroup = group.members.includes(user?.uid || '');
                          return (
                            <div key={group.id} className="p-3.5 rounded-lg border border-[var(--color-bg-border)] bg-[var(--color-bg-raised)] hover:border-white/[0.08] flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />
                                  Host: {group.memberNames[0]}
                                </p>
                                <p className="text-[10px] font-semibold text-[var(--color-text-3)] mt-1.5 uppercase font-subheading">
                                  Group Capacity: {group.members.length} / {group.maxPlayers} Players
                                </p>
                              </div>
                              <Button
                                variant={inGroup ? 'ghost' : 'success'}
                                size="sm"
                                disabled={inGroup || group.members.length >= group.maxPlayers || joiningGroupId === group.id}
                                onClick={() => handleJoinGroup(group.id, entry.gameName)}
                                icon={<UserPlus className="w-3.5 h-3.5 text-white" />}
                                className={inGroup 
                                  ? 'border border-[var(--color-bg-border)]' 
                                  : 'bg-[var(--color-accent)] hover:bg-[var(--color-brand-600)] text-white border-none font-semibold text-xs'
                                }
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
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Remove Game?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-[var(--color-text-2)] leading-relaxed">
            Are you sure you want to stop watching this game split and leave the queue?
          </p>
          <div className="flex gap-3 pt-2">
            <Button 
              variant="danger" 
              onClick={() => deleteModal && handleDelete(deleteModal)}
              className="bg-[var(--color-red)] hover:bg-red-600 text-white font-semibold border-none text-xs"
            >
              Remove Game
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setDeleteModal(null)}
              className="border border-[var(--color-bg-border)] hover:bg-white/[0.02] text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
