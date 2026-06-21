// ============================================================
// AI Engine — Free Game Recommendations & Cost Optimization
// No API key required! Uses a built-in game database.
// If user later adds OPENAI_API_KEY, the system can upgrade.
// ============================================================

import type { GameRecommendation, CostOptimization } from './types';

// ============================================================
// Built-in Game Database — Free "AI" Recommendations
// ============================================================

interface GameData {
  name: string;
  description: string;
  estimatedPrice: number;
  playerCount: string;
  tags: string[];
  genre: string[];
}

const GAME_DATABASE: GameData[] = [
  { name: 'Minecraft', description: 'Build, explore, and survive in a blocky 3D world. One of the best-selling games of all time.', estimatedPrice: 1999, playerCount: '1-30+', tags: ['sandbox', 'survival', 'creative', 'multiplayer'], genre: ['sandbox', 'survival'] },
  { name: 'Terraria', description: 'A 2D sandbox adventure with digging, fighting, and building. Rich boss progression.', estimatedPrice: 349, playerCount: '1-8', tags: ['sandbox', 'adventure', '2d', 'multiplayer'], genre: ['sandbox', 'adventure'] },
  { name: 'Valheim', description: 'Viking survival with procedurally generated worlds. Build, craft, and explore.', estimatedPrice: 529, playerCount: '1-10', tags: ['survival', 'open-world', 'crafting'], genre: ['survival', 'sandbox'] },
  { name: 'Stardew Valley', description: 'Relaxing farm simulation with fishing, mining, and community building.', estimatedPrice: 479, playerCount: '1-4', tags: ['farming', 'simulation', 'relaxing'], genre: ['simulation', 'rpg'] },
  { name: 'Deep Rock Galactic', description: 'Co-op FPS with dwarves mining in procedural caves. "Rock and Stone!"', estimatedPrice: 699, playerCount: '1-4', tags: ['fps', 'co-op', 'mining', 'humor'], genre: ['fps', 'co-op'] },
  { name: 'Lethal Company', description: 'Co-op horror about scavenging moons for scrap to meet profit quotas.', estimatedPrice: 480, playerCount: '1-4', tags: ['horror', 'co-op', 'indie'], genre: ['horror', 'co-op'] },
  { name: 'Phasmophobia', description: 'Co-op ghost hunting with voice recognition. Terrifyingly fun.', estimatedPrice: 1150, playerCount: '1-4', tags: ['horror', 'co-op', 'investigation'], genre: ['horror', 'co-op'] },
  { name: 'Among Us', description: 'Social deduction game. Find the impostor among crewmates.', estimatedPrice: 269, playerCount: '4-15', tags: ['social', 'deduction', 'party'], genre: ['social', 'party'] },
  { name: 'Fall Guys', description: 'Battle royale with obstacle courses and mini-games. Free to play!', estimatedPrice: 0, playerCount: '1-60', tags: ['party', 'battle-royale', 'fun'], genre: ['party', 'battle-royale'] },
  { name: 'Rocket League', description: 'Soccer with rocket-powered cars. Competitive and fun. Free to play!', estimatedPrice: 0, playerCount: '1-8', tags: ['sports', 'competitive', 'cars'], genre: ['sports', 'racing'] },
  { name: 'Fortnite', description: 'Battle royale with building mechanics. Massive player base. Free to play!', estimatedPrice: 0, playerCount: '1-100', tags: ['battle-royale', 'building', 'fps'], genre: ['battle-royale', 'fps'] },
  { name: 'Apex Legends', description: 'Fast-paced hero battle royale with unique abilities. Free to play!', estimatedPrice: 0, playerCount: '1-60', tags: ['battle-royale', 'fps', 'hero-shooter'], genre: ['battle-royale', 'fps'] },
  { name: 'Valorant', description: 'Tactical 5v5 shooter combining precise gunplay with unique agent abilities.', estimatedPrice: 0, playerCount: '2-10', tags: ['fps', 'tactical', 'competitive'], genre: ['fps', 'tactical'] },
  { name: 'Counter-Strike 2', description: 'The legendary competitive tactical shooter, remastered. Free to play!', estimatedPrice: 0, playerCount: '2-10', tags: ['fps', 'tactical', 'competitive'], genre: ['fps', 'tactical'] },
  { name: 'Overwatch 2', description: 'Team-based hero shooter with diverse characters. Free to play!', estimatedPrice: 0, playerCount: '2-10', tags: ['fps', 'hero-shooter', 'team'], genre: ['fps', 'hero-shooter'] },
  { name: 'GTA V Online', description: 'Open-world crime action with heists and missions in multiplayer.', estimatedPrice: 1999, playerCount: '1-30', tags: ['open-world', 'action', 'crime'], genre: ['action', 'open-world'] },
  { name: 'Sea of Thieves', description: 'Pirate adventure on the open seas. Sail, fight, and find treasure!', estimatedPrice: 1499, playerCount: '1-4', tags: ['adventure', 'pirate', 'co-op'], genre: ['adventure', 'co-op'] },
  { name: 'It Takes Two', description: 'Award-winning co-op adventure for two players. Must play together.', estimatedPrice: 2199, playerCount: '2', tags: ['co-op', 'adventure', 'story'], genre: ['adventure', 'co-op'] },
  { name: 'A Way Out', description: 'Co-op prison break adventure. Two players must cooperate to escape.', estimatedPrice: 1499, playerCount: '2', tags: ['co-op', 'adventure', 'story'], genre: ['adventure', 'co-op'] },
  { name: 'Rust', description: 'Harsh survival multiplayer. Gather, build, fight. Trust no one.', estimatedPrice: 1799, playerCount: '1-100+', tags: ['survival', 'pvp', 'open-world'], genre: ['survival', 'fps'] },
  { name: 'ARK: Survival Evolved', description: 'Survive with dinosaurs. Tame, build, and explore a vast world.', estimatedPrice: 1199, playerCount: '1-70', tags: ['survival', 'dinosaurs', 'open-world'], genre: ['survival', 'sandbox'] },
  { name: 'Left 4 Dead 2', description: 'Classic zombie co-op shooter. Four survivors against the horde.', estimatedPrice: 480, playerCount: '1-4', tags: ['fps', 'co-op', 'zombie'], genre: ['fps', 'co-op'] },
  { name: 'Destiny 2', description: 'Sci-fi MMO shooter with raids, dungeons, and PvP. Free base game.', estimatedPrice: 0, playerCount: '1-6', tags: ['fps', 'mmo', 'sci-fi', 'looter'], genre: ['fps', 'mmo'] },
  { name: 'Monster Hunter: World', description: 'Hunt massive monsters with friends. Deep combat and crafting.', estimatedPrice: 1199, playerCount: '1-4', tags: ['action', 'rpg', 'co-op', 'hunting'], genre: ['action', 'rpg'] },
  { name: 'Borderlands 3', description: 'Loot-and-shoot FPS with humor and billions of guns.', estimatedPrice: 2999, playerCount: '1-4', tags: ['fps', 'rpg', 'loot', 'humor'], genre: ['fps', 'rpg'] },
  { name: 'Helldivers 2', description: 'Co-op third-person shooter defending Super Earth for democracy!', estimatedPrice: 2499, playerCount: '1-4', tags: ['shooter', 'co-op', 'action'], genre: ['shooter', 'co-op'] },
  { name: 'Palworld', description: 'Open-world survival with collectible creatures. Build and battle.', estimatedPrice: 1300, playerCount: '1-32', tags: ['survival', 'creatures', 'open-world'], genre: ['survival', 'sandbox'] },
  { name: 'The Forest', description: 'Survival horror in a forest full of mutants. Build and survive.', estimatedPrice: 529, playerCount: '1-8', tags: ['survival', 'horror', 'open-world'], genre: ['survival', 'horror'] },
  { name: "No Man's Sky", description: 'Explore an infinite procedurally generated universe. Epic comeback story.', estimatedPrice: 3000, playerCount: '1-32', tags: ['exploration', 'space', 'survival'], genre: ['exploration', 'survival'] },
  { name: 'Elden Ring', description: 'FromSoftware open-world RPG. Challenging, beautiful, and vast.', estimatedPrice: 3599, playerCount: '1-4', tags: ['rpg', 'action', 'souls-like', 'open-world'], genre: ['rpg', 'action'] },
  { name: "Don't Starve Together", description: 'Gothic survival with endearing art. Survive the wilderness together.', estimatedPrice: 459, playerCount: '1-6', tags: ['survival', 'indie', 'art'], genre: ['survival', 'indie'] },
  { name: 'Raft', description: 'Survive on a raft in the ocean. Expand, explore, and survive.', estimatedPrice: 529, playerCount: '1-8', tags: ['survival', 'ocean', 'crafting'], genre: ['survival', 'co-op'] },
  { name: 'Human: Fall Flat', description: 'Physics-based puzzle platformer. Wobbly fun with friends.', estimatedPrice: 529, playerCount: '1-8', tags: ['puzzle', 'physics', 'fun'], genre: ['puzzle', 'party'] },
  { name: 'Unravel Two', description: 'Beautiful co-op puzzle platformer with two yarn characters.', estimatedPrice: 999, playerCount: '1-2', tags: ['puzzle', 'co-op', 'beautiful'], genre: ['puzzle', 'co-op'] },
  { name: 'Overcooked! 2', description: 'Chaotic co-op cooking game. Cook, serve, and don\'t burn the kitchen!', estimatedPrice: 599, playerCount: '1-4', tags: ['party', 'co-op', 'cooking'], genre: ['party', 'co-op'] },
  { name: 'Satisfactory', description: 'First-person factory building in an alien world. Automate everything.', estimatedPrice: 1300, playerCount: '1-4', tags: ['factory', 'building', 'automation'], genre: ['simulation', 'sandbox'] },
  { name: 'Factorio', description: 'Top-down factory building and automation. Incredibly addictive.', estimatedPrice: 1499, playerCount: '1-inf', tags: ['factory', 'automation', 'strategy'], genre: ['simulation', 'strategy'] },
  { name: 'Barotrauma', description: 'Submarine co-op survival in the oceans of Europa. Chaos ensues.', estimatedPrice: 1499, playerCount: '1-16', tags: ['co-op', 'submarine', 'survival'], genre: ['survival', 'co-op'] },
  { name: 'Risk of Rain 2', description: 'Roguelike third-person shooter. Stack items, fight bosses.', estimatedPrice: 999, playerCount: '1-4', tags: ['roguelike', 'shooter', 'co-op'], genre: ['roguelike', 'shooter'] },
  { name: 'Halo Infinite', description: 'Classic sci-fi FPS with multiplayer arena combat. Free multiplayer.', estimatedPrice: 0, playerCount: '1-24', tags: ['fps', 'sci-fi', 'arena'], genre: ['fps', 'arena'] },
];

// ============================================================
// Recommendation Engine
// ============================================================

/**
 * Find similar games based on shared tags and genre
 */
export function getGameRecommendations(gameName: string): GameRecommendation[] {
  const normalName = gameName.toLowerCase().trim();

  // Find the target game
  const targetGame = GAME_DATABASE.find(g =>
    g.name.toLowerCase() === normalName ||
    g.name.toLowerCase().includes(normalName) ||
    normalName.includes(g.name.toLowerCase())
  );

  if (!targetGame) {
    // Return general popular multiplayer games
    return GAME_DATABASE
      .filter(g => g.estimatedPrice <= 2400)
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map(g => ({
        name: g.name,
        description: g.description,
        estimatedPrice: g.estimatedPrice,
        playerCount: g.playerCount,
        tags: g.tags,
      }));
  }

  // Score all other games by similarity
  const scored = GAME_DATABASE
    .filter(g => g.name !== targetGame.name)
    .map(g => {
      let score = 0;
      // Genre overlap
      const genreOverlap = g.genre.filter(genre => targetGame.genre.includes(genre)).length;
      score += genreOverlap * 30;
      // Tag overlap
      const tagOverlap = g.tags.filter(tag => targetGame.tags.includes(tag)).length;
      score += tagOverlap * 15;
      // Price similarity (bonus for cheaper alternatives)
      if (g.estimatedPrice < targetGame.estimatedPrice) score += 10;
      if (g.estimatedPrice === 0) score += 5; // Free games get a bonus

      return { game: g, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return scored.map(s => ({
    name: s.game.name,
    description: s.game.description,
    estimatedPrice: s.game.estimatedPrice,
    playerCount: s.game.playerCount,
    tags: s.game.tags,
  }));
}

/**
 * Get cheaper alternatives for a specific game
 */
export function getCheaperAlternatives(gameName: string, maxPrice: number): GameRecommendation[] {
  const recommendations = getGameRecommendations(gameName);
  return recommendations
    .filter(r => r.estimatedPrice < maxPrice && r.estimatedPrice >= 0)
    .sort((a, b) => a.estimatedPrice - b.estimatedPrice);
}

// ============================================================
// Cost Optimizer
// ============================================================

/**
 * Calculate optimal group size and cost per person
 */
export function optimizeCost(gamePrice: number, userBudget: number): CostOptimization {
  // Calculate minimum group size needed
  const minGroupSize = Math.ceil(gamePrice / userBudget);
  const suggestedGroupSize = Math.max(2, minGroupSize);
  const costPerPerson = Math.ceil((gamePrice / suggestedGroupSize) * 100) / 100;
  const savings = gamePrice - costPerPerson;

  const tips: string[] = [];

  if (gamePrice === 0) {
    tips.push('🎉 This game is free to play! No cost splitting needed.');
  } else {
    if (costPerPerson <= userBudget) {
      tips.push(`✅ With ${suggestedGroupSize} players, each person pays just ₹${costPerPerson.toFixed(2)}`);
    }
    if (suggestedGroupSize <= 4) {
      tips.push('👥 Small group = easier to coordinate schedules');
    }
    if (savings > 0) {
      tips.push(`💰 You save ₹${savings.toFixed(2)} compared to buying alone`);
    }
    if (gamePrice > 3200) {
      tips.push('🏷️ Check Steam sales — the price might drop during seasonal sales');
      tips.push('📦 Look for bundle deals that include this game');
    }
    if (suggestedGroupSize > 4) {
      tips.push('⚠️ Large groups can be hard to coordinate. Consider finding a sale instead.');
    }
    tips.push('💡 Each person buys their own copy — SquadUp never shares accounts');
  }

  return {
    gamePrice,
    userBudget,
    suggestedGroupSize,
    costPerPerson,
    savings,
    tips,
  };
}
