// ============================================================
// Games Page — Browse, Search, View Groups, and Wishlist Games
// ============================================================

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { 
  createWishlistEntry, 
  getUserWishlist, 
  getAllFormingGroups, 
  joinGroup, 
  createGroup 
} from '@/lib/db';
import { normalizeGameName } from '@/lib/similarity';
import type { WishlistEntry, GameGroup } from '@/lib/types';
import {
  Gamepad2, Search, Users, IndianRupee, Sparkles,
  Plus, Play, Filter, ArrowUpDown, ChevronRight, Check, ExternalLink
} from 'lucide-react';

interface GameItem {
  name: string;
  description: string;
  estimatedPrice: number;
  playerCount: string;
  tags: string[];
  genre: string[];
  steamId?: number;
  officialUrl?: string;
  imageGlow?: string;
}

// Complete database of 40 popular games with Steam App IDs & Store Links
const ALL_GAMES_DATABASE: GameItem[] = [
  { name: 'Minecraft', description: 'Build, explore, and survive in a blocky 3D world. One of the best-selling games of all time.', estimatedPrice: 1999, playerCount: '1-30+', tags: ['sandbox', 'survival', 'creative', 'multiplayer'], genre: ['sandbox', 'survival'], officialUrl: 'https://www.minecraft.net', imageGlow: 'from-green-600/20 to-emerald-800/20' },
  { name: 'Helldivers 2', description: 'Co-op third-person shooter defending Super Earth for democracy!', estimatedPrice: 2499, playerCount: '1-4', tags: ['shooter', 'co-op', 'action', 'multiplayer'], genre: ['shooter', 'co-op'], steamId: 553850, imageGlow: 'from-yellow-500/20 to-amber-700/20' },
  { name: 'Valheim', description: 'Viking survival with procedurally generated worlds. Build, craft, and explore.', estimatedPrice: 529, playerCount: '1-10', tags: ['survival', 'open-world', 'crafting', 'co-op'], genre: ['survival', 'sandbox'], steamId: 892970, imageGlow: 'from-blue-700/20 to-cyan-900/20' },
  { name: 'Stardew Valley', description: 'Relaxing farm simulation with fishing, mining, and community building.', estimatedPrice: 479, playerCount: '1-4', tags: ['farming', 'simulation', 'relaxing', 'co-op'], genre: ['simulation', 'rpg'], steamId: 413150, imageGlow: 'from-red-500/20 to-pink-600/20' },
  { name: 'Lethal Company', description: 'Co-op horror about scavenging moons for scrap to meet profit quotas.', estimatedPrice: 480, playerCount: '1-4', tags: ['horror', 'co-op', 'indie', 'multiplayer'], genre: ['horror', 'co-op'], steamId: 1966720, imageGlow: 'from-neutral-700/20 to-orange-900/20' },
  { name: 'Terraria', description: 'A 2D sandbox adventure with digging, fighting, and building. Rich boss progression.', estimatedPrice: 349, playerCount: '1-8', tags: ['sandbox', 'adventure', '2d', 'multiplayer'], genre: ['sandbox', 'adventure'], steamId: 105600, imageGlow: 'from-teal-500/20 to-green-700/20' },
  { name: 'Valorant', description: 'Tactical 5v5 shooter combining precise gunplay with unique agent abilities.', estimatedPrice: 0, playerCount: '2-10', tags: ['fps', 'tactical', 'competitive', 'multiplayer'], genre: ['fps', 'tactical'], officialUrl: 'https://playvalorant.com', imageGlow: 'from-red-600/20 to-rose-800/20' },
  { name: 'Counter-Strike 2', description: 'The legendary competitive tactical shooter, remastered. Free to play!', estimatedPrice: 0, playerCount: '2-10', tags: ['fps', 'tactical', 'competitive', 'multiplayer'], genre: ['fps', 'tactical'], steamId: 730, imageGlow: 'from-slate-700/20 to-zinc-900/20' },
  { name: 'Elden Ring', description: 'FromSoftware open-world RPG. Challenging, beautiful, and vast.', estimatedPrice: 3599, playerCount: '1-4', tags: ['rpg', 'action', 'souls-like', 'open-world'], genre: ['rpg', 'action'], steamId: 1245620, imageGlow: 'from-indigo-900/20 to-slate-900/20' },
  { name: 'Among Us', description: 'Social deduction game. Find the impostor among crewmates.', estimatedPrice: 269, playerCount: '4-15', tags: ['social', 'deduction', 'party'], genre: ['social', 'party'], steamId: 945360, imageGlow: 'from-sky-500/20 to-indigo-700/20' },
  { name: 'Deep Rock Galactic', description: 'Co-op FPS with dwarves mining in procedural caves. "Rock and Stone!"', estimatedPrice: 699, playerCount: '1-4', tags: ['fps', 'co-op', 'mining', 'multiplayer'], genre: ['fps', 'co-op'], steamId: 548430, imageGlow: 'from-amber-600/20 to-yellow-800/20' },
  { name: 'Phasmophobia', description: 'Co-op ghost hunting with voice recognition. Terrifyingly fun.', estimatedPrice: 1150, playerCount: '1-4', tags: ['horror', 'co-op', 'investigation', 'multiplayer'], genre: ['horror', 'co-op'], steamId: 739635, imageGlow: 'from-purple-900/20 to-neutral-900/20' },
  { name: 'Fall Guys', description: 'Battle royale with obstacle courses and mini-games. Free to play!', estimatedPrice: 0, playerCount: '1-60', tags: ['party', 'battle-royale', 'fun'], genre: ['party', 'battle-royale'], steamId: 1097150, imageGlow: 'from-pink-500/20 to-blue-500/20' },
  { name: 'Rocket League', description: 'Soccer with rocket-powered cars. Competitive and fun. Free to play!', estimatedPrice: 0, playerCount: '1-8', tags: ['sports', 'competitive', 'cars'], genre: ['sports', 'racing'], steamId: 252950, imageGlow: 'from-blue-600/20 to-orange-600/20' },
  { name: 'Fortnite', description: 'Battle royale with building mechanics. Massive player base. Free to play!', estimatedPrice: 0, playerCount: '1-100', tags: ['battle-royale', 'building', 'fps'], genre: ['battle-royale', 'fps'], officialUrl: 'https://www.fortnite.com', imageGlow: 'from-purple-600/20 to-indigo-800/20' },
  { name: 'Apex Legends', description: 'Fast-paced hero battle royale with unique abilities. Free to play!', estimatedPrice: 0, playerCount: '1-60', tags: ['battle-royale', 'fps', 'hero-shooter'], genre: ['battle-royale', 'fps'], steamId: 1172470, imageGlow: 'from-red-700/20 to-grey-900/20' },
  { name: 'Overwatch 2', description: 'Team-based hero shooter with diverse characters. Free to play!', estimatedPrice: 0, playerCount: '2-10', tags: ['fps', 'hero-shooter', 'team'], genre: ['fps', 'hero-shooter'], steamId: 2357570, imageGlow: 'from-orange-500/20 to-sky-500/20' },
  { name: 'GTA V Online', description: 'Open-world crime action with heists and missions in multiplayer.', estimatedPrice: 1999, playerCount: '1-30', tags: ['open-world', 'action', 'crime'], genre: ['action', 'open-world'], steamId: 271590, imageGlow: 'from-green-700/20 to-slate-900/20' },
  { name: 'Sea of Thieves', description: 'Pirate adventure on the open seas. Sail, fight, and find treasure!', estimatedPrice: 1499, playerCount: '1-4', tags: ['adventure', 'pirate', 'co-op'], genre: ['adventure', 'co-op'], steamId: 1172620, imageGlow: 'from-teal-600/20 to-cyan-800/20' },
  { name: 'It Takes Two', description: 'Award-winning co-op adventure for two players. Must play together.', estimatedPrice: 2199, playerCount: '2', tags: ['co-op', 'adventure', 'story'], genre: ['adventure', 'co-op'], steamId: 1426210, imageGlow: 'from-pink-600/20 to-amber-600/20' },
  { name: 'A Way Out', description: 'Co-op prison break adventure. Two players must cooperate to escape.', estimatedPrice: 1499, playerCount: '2', tags: ['co-op', 'adventure', 'story'], genre: ['adventure', 'co-op'], steamId: 730580, imageGlow: 'from-neutral-700/20 to-zinc-950/20' },
  { name: 'Rust', description: 'Harsh survival multiplayer. Gather, build, fight. Trust no one.', estimatedPrice: 1799, playerCount: '1-100+', tags: ['survival', 'pvp', 'open-world'], genre: ['survival', 'fps'], steamId: 252490, imageGlow: 'from-orange-800/20 to-stone-900/20' },
  { name: 'ARK: Survival Evolved', description: 'Survive with dinosaurs. Tame, build, and explore a vast world.', estimatedPrice: 1199, playerCount: '1-70', tags: ['survival', 'dinosaurs', 'open-world'], genre: ['survival', 'sandbox'], steamId: 346110, imageGlow: 'from-emerald-700/20 to-cyan-900/20' },
  { name: 'Left 4 Dead 2', description: 'Classic zombie co-op shooter. Four survivors against the horde.', estimatedPrice: 480, playerCount: '1-4', tags: ['fps', 'co-op', 'zombie'], genre: ['fps', 'co-op'], steamId: 550, imageGlow: 'from-green-900/20 to-neutral-900/20' },
  { name: 'Destiny 2', description: 'Sci-fi MMO shooter with raids, dungeons, and PvP. Free base game.', estimatedPrice: 0, playerCount: '1-6', tags: ['fps', 'mmo', 'sci-fi', 'looter'], genre: ['fps', 'mmo'], steamId: 1085660, imageGlow: 'from-sky-700/20 to-indigo-950/20' },
  { name: 'Monster Hunter: World', description: 'Hunt massive monsters with friends. Deep combat and crafting.', estimatedPrice: 1199, playerCount: '1-4', tags: ['action', 'rpg', 'co-op', 'hunting'], genre: ['action', 'rpg'], steamId: 582010, imageGlow: 'from-blue-900/20 to-slate-950/20' },
  { name: 'Borderlands 3', description: 'Loot-and-shoot FPS with humor and billions of guns.', estimatedPrice: 2999, playerCount: '1-4', tags: ['fps', 'rpg', 'loot', 'humor'], genre: ['fps', 'rpg'], steamId: 397540, imageGlow: 'from-yellow-600/20 to-orange-700/20' },
  { name: 'Palworld', description: 'Open-world survival with collectible creatures. Build and battle.', estimatedPrice: 1300, playerCount: '1-32', tags: ['survival', 'creatures', 'open-world'], genre: ['survival', 'sandbox'], steamId: 1623730, imageGlow: 'from-sky-600/20 to-teal-800/20' },
  { name: 'The Forest', description: 'Survival horror in a forest full of mutants. Build and survive.', estimatedPrice: 529, playerCount: '1-8', tags: ['survival', 'horror', 'open-world'], genre: ['survival', 'horror'], steamId: 242760, imageGlow: 'from-stone-800/20 to-neutral-900/20' },
  { name: "No Man's Sky", description: 'Explore an infinite procedurally generated universe. Epic comeback story.', estimatedPrice: 3000, playerCount: '1-32', tags: ['exploration', 'space', 'survival'], genre: ['exploration', 'survival'], steamId: 275850, imageGlow: 'from-pink-800/20 to-violet-950/20' },
  { name: "Don't Starve Together", description: 'Gothic survival with endearing art. Survive the wilderness together.', estimatedPrice: 459, playerCount: '1-6', tags: ['survival', 'indie', 'art'], genre: ['survival', 'indie'], steamId: 322330, imageGlow: 'from-amber-900/20 to-red-950/20' },
  { name: 'Raft', description: 'Survive on a raft in the ocean. Expand, explore, and survive.', estimatedPrice: 529, playerCount: '1-8', tags: ['survival', 'ocean', 'crafting'], genre: ['survival', 'co-op'], steamId: 648800, imageGlow: 'from-cyan-700/20 to-blue-900/20' },
  { name: 'Human: Fall Flat', description: 'Physics-based puzzle platformer. Wobbly fun with friends.', estimatedPrice: 529, playerCount: '1-8', tags: ['puzzle', 'physics', 'fun'], genre: ['puzzle', 'party'], steamId: 477160, imageGlow: 'from-amber-500/20 to-stone-700/20' },
  { name: 'Unravel Two', description: 'Beautiful co-op puzzle platformer with two yarn characters.', estimatedPrice: 999, playerCount: '1-2', tags: ['puzzle', 'co-op', 'beautiful'], genre: ['puzzle', 'co-op'], steamId: 1225570, imageGlow: 'from-rose-500/20 to-red-800/20' },
  { name: 'Overcooked! 2', description: 'Chaotic co-op cooking game. Cook, serve, and don\'t burn the kitchen!', estimatedPrice: 599, playerCount: '1-4', tags: ['party', 'co-op', 'cooking'], genre: ['party', 'co-op'], steamId: 728880, imageGlow: 'from-orange-500/20 to-yellow-600/20' },
  { name: 'Satisfactory', description: 'First-person factory building in an alien world. Automate everything.', estimatedPrice: 1300, playerCount: '1-4', tags: ['factory', 'building', 'automation'], genre: ['simulation', 'sandbox'], steamId: 526875, imageGlow: 'from-amber-500/20 to-neutral-800/20' },
  { name: 'Factorio', description: 'Top-down factory building and automation. Incredibly addictive.', estimatedPrice: 1499, playerCount: '1-inf', tags: ['factory', 'automation', 'strategy'], genre: ['simulation', 'strategy'], steamId: 427520, imageGlow: 'from-orange-700/20 to-zinc-950/20' },
  { name: 'Barotrauma', description: 'Submarine co-op survival in the oceans of Europa. Chaos ensues.', estimatedPrice: 1499, playerCount: '1-16', tags: ['co-op', 'submarine', 'survival'], genre: ['survival', 'co-op'], steamId: 602960, imageGlow: 'from-slate-800/20 to-emerald-950/20' },
  { name: 'Risk of Rain 2', description: 'Roguelike third-person shooter. Stack items, fight bosses.', estimatedPrice: 999, playerCount: '1-4', tags: ['roguelike', 'shooter', 'co-op'], genre: ['roguelike', 'shooter'], steamId: 632360, imageGlow: 'from-purple-800/20 to-indigo-900/20' },
  { name: 'Halo Infinite', description: 'Classic sci-fi FPS with multiplayer arena combat. Free multiplayer.', estimatedPrice: 0, playerCount: '1-24', tags: ['fps', 'sci-fi', 'arena'], genre: ['fps', 'arena'], steamId: 1240440, imageGlow: 'from-blue-800/20 to-slate-900/20' },
];

export default function GamesPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [wishlist, setWishlist] = useState<WishlistEntry[]>([]);
  const [formingGroups, setFormingGroups] = useState<GameGroup[]>([]);
  const [gamesList, setGamesList] = useState<GameItem[]>(ALL_GAMES_DATABASE);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'trending' | 'price-low' | 'price-high'>('trending');
  
  // Detail Modal States
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Search loader for Steam search API
  const [searchingSteam, setSearchingSteam] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (user) {
        const wl = await getUserWishlist(user.uid);
        setWishlist(wl);
      }
      
      const groups = await getAllFormingGroups();
      setFormingGroups(groups);

      // Fetch featured/popular games from Steam
      const res = await fetch('/.netlify/functions/steam');
      const data = await res.json();
      
      if (data.items && data.items.length > 0) {
        const steamGames: GameItem[] = data.items.map((item: any) => {
          const priceVal = item.price ? Math.round(item.price.final / 100) : 0;
          return {
            name: item.name,
            description: `Popular trending title available on Steam.`,
            estimatedPrice: priceVal,
            playerCount: 'Multiplayer',
            tags: ['steam', 'trending'],
            genre: ['action'],
            steamId: item.id
          };
        });

        // Merge keeping local curated first and avoiding duplicates
        const combined = [...ALL_GAMES_DATABASE];
        steamGames.forEach(sg => {
          if (!combined.some(cg => cg.name.toLowerCase() === sg.name.toLowerCase())) {
            combined.push(sg);
          }
        });
        setGamesList(combined);
      }
    } catch (err) {
      console.error('Failed to load games:', err);
    } finally {
      setLoading(false);
    }
  };

  // Perform search (filtering local DB or fetching custom Steam games)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setGamesList(ALL_GAMES_DATABASE);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearchingSteam(true);
      try {
        const res = await fetch(`/.netlify/functions/steam?term=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        
        if (data.items && data.items.length > 0) {
          const steamGames: GameItem[] = data.items.map((item: any) => {
            const priceVal = item.price ? Math.round(item.price.final / 100) : 0;
            return {
              name: item.name,
              description: `Official Steam title. Available on Steam store.`,
              estimatedPrice: priceVal,
              playerCount: 'Multiplayer',
              tags: ['steam'],
              genre: ['action'],
              steamId: item.id
            };
          });

          // Filter local copies to avoid exact name duplicates
          const filteredLocal = ALL_GAMES_DATABASE.filter(g => 
            g.name.toLowerCase().includes(searchQuery.toLowerCase())
          );

          const combined = [...filteredLocal];
          steamGames.forEach(sg => {
            if (!combined.some(cg => cg.name.toLowerCase() === sg.name.toLowerCase())) {
              combined.push(sg);
            }
          });

          setGamesList(combined);
        } else {
          // Local fallback filter
          const localFiltered = ALL_GAMES_DATABASE.filter(g => 
            g.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setGamesList(localFiltered);
        }
      } catch (err) {
        // Local fallback on error
        const localFiltered = ALL_GAMES_DATABASE.filter(g => 
          g.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setGamesList(localFiltered);
      } finally {
        setSearchingSteam(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Categories
  const categories = ['All', 'Sandbox', 'Survival', 'Shooter', 'RPG', 'Free'];

  const filteredGames = gamesList.filter(game => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Free') return game.estimatedPrice === 0;
    return game.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase()) || 
           game.genre.some(g => g.toLowerCase() === selectedCategory.toLowerCase());
  });

  // Sorting
  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.estimatedPrice - b.estimatedPrice;
    }
    if (sortBy === 'price-high') {
      return b.estimatedPrice - a.estimatedPrice;
    }
    // Default 'trending' sorted by predefined DB index
    const aIdx = ALL_GAMES_DATABASE.findIndex(g => g.name === a.name);
    const bIdx = ALL_GAMES_DATABASE.findIndex(g => g.name === b.name);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  // Firestore actions
  const handleAddToWishlist = async (game: GameItem) => {
    if (!user) {
      toast('warning', 'Please sign in first');
      return;
    }
    setAddingToWishlist(true);
    try {
      await createWishlistEntry({
        userId: user.uid,
        gameName: game.name,
        budget: game.estimatedPrice || 1000,
        playersNeeded: 4,
        preferredPlayTime: 'Weekends',
      });
      toast('success', `Added ${game.name} to your Wishlist! 🎮`);
      const wl = await getUserWishlist(user.uid);
      setWishlist(wl);
    } catch (err) {
      toast('error', 'Failed to add to Wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleCreateNewGroup = async (game: GameItem) => {
    if (!user) {
      toast('warning', 'Please sign in first');
      return;
    }
    setCreatingGroup(true);
    try {
      const username = profile?.username || user.displayName || 'Gamer';
      await createGroup({
        gameName: game.name,
        members: [user.uid],
        memberNames: [username],
        maxPlayers: 4,
        createdBy: user.uid,
      });
      toast('success', `Started new group for ${game.name}! 🎉`);
      const groups = await getAllFormingGroups();
      setFormingGroups(groups);
    } catch (err) {
      toast('error', 'Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleJoin = async (groupId: string, gName: string) => {
    if (!user) {
      toast('warning', 'Please sign in first');
      return;
    }
    setJoiningGroupId(groupId);
    try {
      const username = profile?.username || user.displayName || 'Gamer';
      await joinGroup(groupId, user.uid, username);
      toast('success', `Joined group for ${gName}!`);
      const groups = await getAllFormingGroups();
      setFormingGroups(groups);
    } catch (err: any) {
      toast('error', err?.message || 'Failed to join group');
    } finally {
      setJoiningGroupId(null);
    }
  };

  // Find active groups for selected game in modal, sorted by member count descending
  const selectedGameGroups = selectedGame 
    ? formingGroups
        .filter(g => normalizeGameName(g.gameName) === normalizeGameName(selectedGame.name))
        .sort((a, b) => b.members.length - a.members.length)
    : [];

  const isAlreadyInWishlist = (gameName: string) => {
    return wishlist.some(w => normalizeGameName(w.gameName) === normalizeGameName(gameName));
  };

  // Store page redirect link
  const getStoreUrl = (game: GameItem) => {
    if (game.steamId) return `https://store.steampowered.com/app/${game.steamId}`;
    return game.officialUrl || 'https://store.steampowered.com';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-brand-400" />
          Browse Games ({ALL_GAMES_DATABASE.length}+ Titles)
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Explore multiplayer titles, see split costs, and join forming teams.
        </p>
      </div>

      {/* Search & Sorting bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Input
            placeholder="Search game database or fetch live Steam titles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          {searchingSteam && (
            <div className="absolute right-3 top-3.5 flex items-center gap-1.5 text-xs text-text-muted">
              <div className="w-3.5 h-3.5 border border-brand-500 border-t-transparent rounded-full animate-spin" />
              Searching Steam...
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-surface-800 border border-surface-500 px-3 py-2 rounded-xl text-sm">
            <ArrowUpDown className="w-4 h-4 text-text-muted" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-text-primary focus:outline-none"
            >
              <option value="trending">Sort: Trending</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              selectedCategory === cat
                ? 'bg-brand-500 text-white'
                : 'bg-surface-800 text-text-secondary hover:text-text-primary border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Poster Grid Library */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="skeleton aspect-[2/3] w-full" />
          ))}
        </div>
      ) : sortedGames.length === 0 ? (
        <Card className="text-center py-10" padding="lg">
          <Gamepad2 className="w-12 h-12 text-text-muted mx-auto mb-3 animate-pulse" />
          <h3 className="text-base font-bold">No games found</h3>
          <p className="text-sm text-text-secondary mt-1">Try another query or clear the filters.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedGames.map(game => {
            const groupsCount = formingGroups.filter(g => 
              normalizeGameName(g.gameName) === normalizeGameName(game.name)
            ).length;

            // Vertical 600x900 poster capsule for Steam Deck style
            const posterUrl = game.steamId 
              ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/library_600x900.jpg` 
              : null;

            return (
              <div 
                key={game.name} 
                onClick={() => setSelectedGame(game)}
                className="group relative aspect-[2/3] w-full rounded-lg overflow-hidden border border-white/[0.08] bg-[#11131A] shadow-[0_4px_25px_rgba(0,0,0,0.5)] cursor-pointer hover:border-[var(--color-accent)]/60 hover:shadow-[0_0_30px_rgba(124,92,255,0.2)] hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Poster Image */}
                {posterUrl ? (
                  <img 
                    src={posterUrl} 
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${game.imageGlow || 'from-white/[0.02] to-white/[0.06]'} flex flex-col items-center justify-center p-4 text-center`}>
                    <Gamepad2 className="w-10 h-10 text-white/10 mb-2 group-hover:scale-110 transition-transform text-[var(--color-accent)]" />
                    <span className="text-[11px] font-bold text-[var(--color-text-2)] uppercase tracking-wider truncate w-full">{game.name}</span>
                  </div>
                )}

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent opacity-95 group-hover:via-black/25 transition-all" />

                {/* Active Lobbies Telemetry Pip */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/85 px-2 py-1 rounded border border-white/10 text-[9px] font-mono font-bold text-white tracking-widest uppercase">
                  <span className={groupsCount > 0 ? "w-2 h-2 rounded-full bg-[var(--color-green)] animate-pulse shadow-[0_0_6px_var(--color-green)]" : "w-1.5 h-1.5 bg-[var(--color-text-3)] rounded-full"}></span>
                  {groupsCount} LOBB{groupsCount === 1 ? 'Y' : 'IES'}
                </div>

                {/* Price Tag Badge */}
                <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] text-white text-[10px] font-black px-2.5 py-0.5 rounded shadow-lg tracking-wider font-heading">
                  {game.estimatedPrice === 0 ? 'FREE' : `₹${game.estimatedPrice}`}
                </div>

                {/* Poster Info Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4.5 space-y-2 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <h3 className="font-heading text-[14px] font-black text-white truncate group-hover:text-[var(--color-blue)] transition-colors uppercase tracking-wide">
                    {game.name}
                  </h3>
                  <div className="flex items-center justify-between text-[9px] text-[var(--color-text-3)] font-mono tracking-widest uppercase">
                    <span>CAP: {game.playerCount} Players</span>
                    <span className="text-[var(--color-blue)] font-bold">Split Ready</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Game Details Modal */}
      {selectedGame && (
        <Modal
          isOpen={!!selectedGame}
          onClose={() => setSelectedGame(null)}
          title={selectedGame.name}
          size="md"
        >
          <div className="space-y-6">
            {/* Header cover picture inside modal */}
            {selectedGame.steamId && (
              <div className="w-full h-36 rounded-xl overflow-hidden relative border border-white/5">
                <img 
                  src={`https://cdn.akamai.steamstatic.com/steam/apps/${selectedGame.steamId}/header.jpg`} 
                  alt={selectedGame.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Header info */}
            <div className="flex items-center justify-between bg-surface-800 p-4 rounded-xl border border-white/5 gap-3">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-widest font-black">Official Pricing</p>
                <p className="text-xl font-black text-neon-green mt-0.5">
                  {selectedGame.estimatedPrice === 0 ? 'Free to Play' : `₹${selectedGame.estimatedPrice}`}
                </p>
              </div>
              <div className="flex gap-2">
                <a 
                  href={getStoreUrl(selectedGame)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="secondary" size="sm" icon={<ExternalLink className="w-4 h-4" />}>
                    Store Page
                  </Button>
                </a>
                
                {isAlreadyInWishlist(selectedGame.name) ? (
                  <Badge variant="success" className="flex items-center gap-1 shrink-0 h-9 px-3 rounded-xl">
                    <Check className="w-3.5 h-3.5" /> In Wishlist
                  </Badge>
                ) : (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => handleAddToWishlist(selectedGame)}
                    loading={addingToWishlist}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Add Wishlist
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs text-text-muted uppercase tracking-widest font-black mb-2">About Game</h3>
              <p className="text-sm text-text-secondary leading-relaxed bg-surface-800/40 p-3 rounded-xl border border-white/5">
                {selectedGame.description}
              </p>
            </div>

            {/* Groups section */}
            <div className="space-y-3">
              <h3 className="text-xs text-text-muted uppercase tracking-widest font-black">
                Active Cost-Splitting Groups (Sorted by Members)
              </h3>

              {/* List of active groups */}
              {selectedGameGroups.length === 0 ? (
                <div className="text-center py-5 bg-surface-800/30 rounded-xl border border-dashed border-white/10 text-text-muted text-xs">
                  <Users className="w-8 h-8 mx-auto mb-2 text-text-muted/60" />
                  No active groups for this game right now.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedGameGroups.map(group => {
                    const isMember = group.members.includes(user?.uid || '');
                    const dividedCost = selectedGame.estimatedPrice > 0 
                      ? Math.round(selectedGame.estimatedPrice / group.maxPlayers) 
                      : 0;

                    return (
                      <div 
                        key={group.id} 
                        className="p-3 rounded-xl bg-surface-800/60 border border-white/5 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-text-primary">Group by {group.memberNames[0]}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                            <span className="flex items-center gap-1 font-medium">
                              <Users className="w-3.5 h-3.5" />
                              {group.members.length}/{group.maxPlayers} players
                            </span>
                            {selectedGame.estimatedPrice > 0 && (
                              <span className="text-neon-cyan font-bold">
                                ₹{dividedCost}/person
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          variant={isMember ? 'ghost' : 'success'}
                          size="sm"
                          disabled={isMember || group.members.length >= group.maxPlayers || joiningGroupId === group.id}
                          onClick={() => handleJoin(group.id, selectedGame.name)}
                        >
                          {isMember ? 'Joined' : 'Join'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Group Creation options - ALWAYS present below the list */}
              <div className="pt-3 border-t border-white/5 flex flex-col items-center gap-2">
                <p className="text-xs text-text-muted text-center">
                  Want to start your own split with different players or custom preferences?
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => handleCreateNewGroup(selectedGame)}
                  loading={creatingGroup}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Create a Group
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
