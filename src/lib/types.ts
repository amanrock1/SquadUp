// ============================================================
// GamePool — Type Definitions
// All shared TypeScript types for the application
// ============================================================

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  budgetMin: number;
  budgetMax: number;
  region: string;
  rating: number;
  ratingCount: number;
  createdAt: number;
}

export interface WishlistEntry {
  id: string;
  userId: string;
  gameName: string;
  gameNameNormalized: string;
  budget: number;
  playersNeeded: number;
  preferredPlayTime: string;
  status: 'active' | 'matched' | 'grouped';
  createdAt: number;
}

export interface GameGroup {
  id: string;
  gameName: string;
  members: string[];
  memberNames: string[];
  maxPlayers: number;
  status: 'forming' | 'complete';
  createdAt: number;
  createdBy: string;
}

export interface MatchResult {
  entry: WishlistEntry;
  user: UserProfile;
  score: number;
  reasons: string[];
}

export interface GameRecommendation {
  name: string;
  description: string;
  estimatedPrice: number;
  playerCount: string;
  tags: string[];
}

export interface CostOptimization {
  gamePrice: number;
  userBudget: number;
  suggestedGroupSize: number;
  costPerPerson: number;
  savings: number;
  tips: string[];
}
