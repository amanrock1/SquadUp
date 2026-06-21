// ============================================================
// String Similarity — Levenshtein Distance + Game Name Matching
// Used by the matching engine to find similar game names
// ============================================================

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate normalized similarity score (0-1) between two strings
 * 1 = identical, 0 = completely different
 */
export function stringSimilarity(a: string, b: string): number {
  const normalA = a.toLowerCase().trim();
  const normalB = b.toLowerCase().trim();

  if (normalA === normalB) return 1;
  if (normalA.length === 0 || normalB.length === 0) return 0;

  const distance = levenshteinDistance(normalA, normalB);
  const maxLength = Math.max(normalA.length, normalB.length);
  return 1 - distance / maxLength;
}

// ============================================================
// Game Alias Database — Maps abbreviations to canonical names
// This is the "free AI" — no API key needed!
// ============================================================

const GAME_ALIASES: Record<string, string[]> = {
  'minecraft': ['mc', 'minecraft java', 'minecraft bedrock', 'minecraft java edition', 'minecraft pe', 'mcpe', 'mcbe', 'mcje'],
  'fortnite': ['fn', 'fort', 'fortnite battle royale', 'fortnite br'],
  'valorant': ['valo', 'val'],
  'counter-strike 2': ['cs2', 'cs', 'counter strike', 'csgo', 'cs:go', 'counter-strike'],
  'apex legends': ['apex', 'apex leg'],
  'call of duty': ['cod', 'call of duty warzone', 'cod warzone', 'warzone', 'cod mw', 'cod mw2', 'cod mw3'],
  'grand theft auto v': ['gta', 'gta v', 'gta 5', 'gta online', 'gtav', 'gta5'],
  'league of legends': ['lol', 'league'],
  'dota 2': ['dota', 'dota2'],
  'overwatch 2': ['ow', 'ow2', 'overwatch'],
  'rocket league': ['rl', 'rocket'],
  'among us': ['among', 'amogus', 'sus'],
  'pubg': ['playerunknown', 'playerunknowns battlegrounds', 'pubg mobile', 'pubg pc', 'battlegrounds'],
  'rainbow six siege': ['r6', 'r6s', 'siege', 'rainbow six', 'rainbow 6'],
  'destiny 2': ['d2', 'destiny'],
  'the forest': ['forest', 'sons of the forest', 'sotf'],
  'terraria': ['terra'],
  'rust': ['rust game'],
  'ark survival evolved': ['ark', 'ark se', 'ark survival'],
  'dead by daylight': ['dbd', 'dead by'],
  'phasmophobia': ['phasmo', 'phas'],
  'sea of thieves': ['sot', 'sea of'],
  'fall guys': ['fall', 'fall guys ultimate knockout'],
  'elden ring': ['elden', 'er'],
  'no mans sky': ['nms', 'no man sky', "no man's sky"],
  'stardew valley': ['stardew', 'sdv'],
  'deep rock galactic': ['drg', 'deep rock'],
  'lethal company': ['lethal', 'lc'],
  'helldivers 2': ['helldivers', 'hd2'],
  'palworld': ['pal', 'palworld game'],
  'it takes two': ['itt', 'it takes 2'],
  'a way out': ['awo'],
  'left 4 dead 2': ['l4d2', 'l4d', 'left 4 dead', 'left for dead'],
  'monster hunter world': ['mhw', 'monster hunter', 'mh world'],
  'borderlands 3': ['bl3', 'borderlands'],
  'diablo iv': ['d4', 'diablo 4', 'diablo'],
  'path of exile': ['poe', 'path of exile 2', 'poe2'],
  'world of warcraft': ['wow', 'warcraft'],
  'final fantasy xiv': ['ff14', 'ffxiv', 'final fantasy 14'],
  'genshin impact': ['genshin', 'gi'],
};

/**
 * Normalize a game name using the alias database
 * Returns the canonical name if found, otherwise the cleaned input
 */
export function normalizeGameName(input: string): string {
  const cleaned = input.toLowerCase().trim();

  // Check exact match first
  if (GAME_ALIASES[cleaned]) return cleaned;

  // Check if input is an alias
  for (const [canonical, aliases] of Object.entries(GAME_ALIASES)) {
    if (aliases.includes(cleaned)) return canonical;
  }

  // Return cleaned input if no alias found
  return cleaned;
}

/**
 * Calculate match score between two game names (0-100)
 * Uses alias database + fuzzy matching
 */
export function gameNameMatchScore(nameA: string, nameB: string): number {
  const normA = normalizeGameName(nameA);
  const normB = normalizeGameName(nameB);

  // Exact canonical match
  if (normA === normB) return 100;

  // Check if one contains the other
  if (normA.includes(normB) || normB.includes(normA)) return 85;

  // Fuzzy string similarity
  const similarity = stringSimilarity(normA, normB);

  if (similarity > 0.8) return 75;
  if (similarity > 0.6) return 50;
  if (similarity > 0.4) return 25;

  return 0;
}
