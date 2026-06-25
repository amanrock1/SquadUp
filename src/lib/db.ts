// ============================================================
// Firestore Database Helpers — CRUD Operations
// Clean abstraction over Firestore for all collections
// ============================================================

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import type { UserProfile, WishlistEntry, GameGroup } from './types';
import { normalizeGameName } from './similarity';

// Helper to get Firestore instance lazily
const getDb = () => {
  const database = getFirebaseDb();
  if (!database) throw new Error('Firebase DB not initialized');
  return database;
};

// ======================== USERS ========================

export async function createUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await setDoc(doc(getDb(), 'users', uid), {
    uid,
    username: data.username || 'Gamer',
    email: data.email || '',
    budgetMin: data.budgetMin || 0,
    budgetMax: data.budgetMax || 50,
    region: data.region || '',
    rating: 5.0,
    ratingCount: 0,
    createdAt: Date.now(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(getDb(), 'users', uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(getDb(), 'users', uid), data);
}

// ======================== WISHLIST ========================

export async function createWishlistEntry(data: Omit<WishlistEntry, 'id' | 'createdAt' | 'gameNameNormalized' | 'status'>): Promise<string> {
  const docRef = doc(collection(getDb(), 'wishlistEntries'));
  await setDoc(docRef, {
    ...data,
    id: docRef.id,
    gameNameNormalized: normalizeGameName(data.gameName),
    status: 'active',
    createdAt: Date.now(),
  });
  return docRef.id;
}

export async function getUserWishlist(userId: string): Promise<WishlistEntry[]> {
  const q = query(
    collection(getDb(), 'wishlistEntries'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  const entries = snap.docs.map(d => d.data() as WishlistEntry);
  return entries.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllActiveEntries(): Promise<WishlistEntry[]> {
  const q = query(
    collection(getDb(), 'wishlistEntries'),
    where('status', '==', 'active'),
    limit(200)
  );
  const snap = await getDocs(q);
  const entries = snap.docs.map(d => d.data() as WishlistEntry);
  return entries.sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateWishlistEntry(id: string, data: Partial<WishlistEntry>): Promise<void> {
  if (data.gameName) {
    data.gameNameNormalized = normalizeGameName(data.gameName);
  }
  await updateDoc(doc(getDb(), 'wishlistEntries', id), data);
}

export async function deleteWishlistEntry(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), 'wishlistEntries', id));
}

// ======================== GROUPS ========================

export async function createGroup(data: Omit<GameGroup, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const docRef = doc(collection(getDb(), 'groups'));
  const group: GameGroup = {
    ...data,
    id: docRef.id,
    status: data.members.length >= data.maxPlayers ? 'complete' : 'forming',
    createdAt: Date.now(),
  };
  await setDoc(docRef, group);
  return docRef.id;
}

export async function getUserGroups(userId: string): Promise<GameGroup[]> {
  const q = query(
    collection(getDb(), 'groups'),
    where('members', 'array-contains', userId)
  );
  const snap = await getDocs(q);
  const groups = snap.docs.map(d => d.data() as GameGroup);
  return groups.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getGroup(groupId: string): Promise<GameGroup | null> {
  const snap = await getDoc(doc(getDb(), 'groups', groupId));
  if (!snap.exists()) return null;
  return snap.data() as GameGroup;
}

export async function joinGroup(groupId: string, userId: string, username: string): Promise<void> {
  const group = await getGroup(groupId);
  if (!group) throw new Error('Group not found');
  if (group.members.includes(userId)) throw new Error('Already in group');
  if (group.members.length >= group.maxPlayers) throw new Error('Group is full');

  const newMembers = [...group.members, userId];
  const newNames = [...group.memberNames, username];
  await updateDoc(doc(getDb(), 'groups', groupId), {
    members: newMembers,
    memberNames: newNames,
    status: newMembers.length >= group.maxPlayers ? 'complete' : 'forming',
  });
}

export async function leaveGroup(groupId: string, userId: string): Promise<void> {
  const group = await getGroup(groupId);
  if (!group) throw new Error('Group not found');

  const idx = group.members.indexOf(userId);
  if (idx === -1) throw new Error('Not in group');

  const newMembers = group.members.filter(m => m !== userId);
  const newNames = group.memberNames.filter((_, i) => i !== idx);

  if (newMembers.length === 0) {
    await deleteDoc(doc(getDb(), 'groups', groupId));
  } else {
    await updateDoc(doc(getDb(), 'groups', groupId), {
      members: newMembers,
      memberNames: newNames,
      status: 'forming',
    });
  }
}

export async function getAllFormingGroups(): Promise<GameGroup[]> {
  const q = query(
    collection(getDb(), 'groups'),
    where('status', '==', 'forming'),
    limit(50)
  );
  const snap = await getDocs(q);
  const groups = snap.docs.map(d => d.data() as GameGroup);
  return groups.sort((a, b) => b.createdAt - a.createdAt);
}

export async function seedMockData(): Promise<void> {
  const dbInst = getDb();
  
  const mockUsers = [
    { uid: 'mock_user_1', username: 'RohanGamer', email: 'rohan@example.com', region: 'Mumbai', budgetMin: 500, budgetMax: 3000, rating: 4.8 },
    { uid: 'mock_user_2', username: 'Priya_Playz', email: 'priya@example.com', region: 'Delhi', budgetMin: 800, budgetMax: 2000, rating: 4.9 },
    { uid: 'mock_user_3', username: 'Amit_Sky', email: 'amit@example.com', region: 'Bangalore', budgetMin: 1000, budgetMax: 4000, rating: 4.7 },
    { uid: 'mock_user_4', username: 'Sneha_10', email: 'sneha@example.com', region: 'Pune', budgetMin: 400, budgetMax: 1500, rating: 5.0 },
    { uid: 'mock_user_5', username: 'Vikram_op', email: 'vikram@example.com', region: 'Chennai', budgetMin: 1200, budgetMax: 5000, rating: 4.6 },
    { uid: 'mock_user_6', username: 'Rahul_op', email: 'rahul@example.com', region: 'Kolkata', budgetMin: 0, budgetMax: 2500, rating: 4.5 },
    { uid: 'mock_user_7', username: 'Sonia_Gamer', email: 'sonia@example.com', region: 'Hyderabad', budgetMin: 500, budgetMax: 3500, rating: 4.9 },
    { uid: 'mock_user_8', username: 'Karan_CS', email: 'karan@example.com', region: 'Ahmedabad', budgetMin: 0, budgetMax: 4000, rating: 4.4 },
    { uid: 'mock_user_9', username: 'Danish_V', email: 'danish@example.com', region: 'Goa', budgetMin: 1000, budgetMax: 3000, rating: 4.7 },
    { uid: 'mock_user_10', username: 'Neha_Play', email: 'neha@example.com', region: 'Jaipur', budgetMin: 500, budgetMax: 2000, rating: 4.8 }
  ];

  // Seed users
  for (const user of mockUsers) {
    await setDoc(doc(dbInst, 'users', user.uid), {
      ...user,
      ratingCount: 5,
      createdAt: Date.now() - 100000,
    });
  }

  // Seed wishlist items
  const mockWishlist = [
    { id: 'mock_wish_1', userId: 'mock_user_1', username: 'RohanGamer', gameName: 'Minecraft', budget: 1999, playersNeeded: 4, preferredPlayTime: 'Weekends', status: 'active' },
    { id: 'mock_wish_2', userId: 'mock_user_2', username: 'Priya_Playz', gameName: 'Minecraft', budget: 1800, playersNeeded: 4, preferredPlayTime: 'Evenings', status: 'active' },
    { id: 'mock_wish_3', userId: 'mock_user_7', username: 'Sonia_Gamer', gameName: 'Minecraft', budget: 1999, playersNeeded: 4, preferredPlayTime: 'Weekends', status: 'active' },
    { id: 'mock_wish_4', userId: 'mock_user_3', username: 'Amit_Sky', gameName: 'Valheim', budget: 500, playersNeeded: 5, preferredPlayTime: 'Late Night', status: 'active' },
    { id: 'mock_wish_5', userId: 'mock_user_4', username: 'Sneha_10', gameName: 'Stardew Valley', budget: 400, playersNeeded: 4, preferredPlayTime: 'Anytime', status: 'active' },
    { id: 'mock_wish_6', userId: 'mock_user_5', username: 'Vikram_op', gameName: 'Helldivers 2', budget: 2400, playersNeeded: 4, preferredPlayTime: 'Weekends', status: 'active' },
    { id: 'mock_wish_7', userId: 'mock_user_1', username: 'RohanGamer', gameName: 'Helldivers 2', budget: 2000, playersNeeded: 4, preferredPlayTime: 'Weekends', status: 'active' },
    { id: 'mock_wish_8', userId: 'mock_user_9', username: 'Danish_V', gameName: 'Helldivers 2', budget: 2200, playersNeeded: 4, preferredPlayTime: 'Evenings', status: 'active' },
    { id: 'mock_wish_9', userId: 'mock_user_2', username: 'Priya_Playz', gameName: 'Lethal Company', budget: 400, playersNeeded: 4, preferredPlayTime: 'Evenings', status: 'active' },
    { id: 'mock_wish_10', userId: 'mock_user_7', username: 'Sonia_Gamer', gameName: 'Lethal Company', budget: 450, playersNeeded: 4, preferredPlayTime: 'Anytime', status: 'active' },
    { id: 'mock_wish_11', userId: 'mock_user_4', username: 'Sneha_10', gameName: 'Terraria', budget: 300, playersNeeded: 8, preferredPlayTime: 'Weekends', status: 'active' },
    { id: 'mock_wish_12', userId: 'mock_user_6', username: 'Rahul_op', gameName: 'Counter-Strike 2', budget: 0, playersNeeded: 5, preferredPlayTime: 'Late Night', status: 'active' }
  ];

  for (const wish of mockWishlist) {
    await setDoc(doc(dbInst, 'wishlistEntries', wish.id), {
      ...wish,
      gameNameNormalized: normalizeGameName(wish.gameName),
      createdAt: Date.now() - 50000,
    });
  }

  // Seed groups with varying member counts to test sorting
  const mockGroups = [
    // Minecraft Groups
    {
      id: 'mock_group_1',
      gameName: 'Minecraft',
      members: ['mock_user_1', 'mock_user_2', 'mock_user_7'],
      memberNames: ['RohanGamer', 'Priya_Playz', 'Sonia_Gamer'],
      maxPlayers: 4,
      createdBy: 'mock_user_1',
      status: 'forming',
      createdAt: Date.now() - 50000,
    },
    {
      id: 'mock_group_2',
      gameName: 'Minecraft',
      members: ['mock_user_6'],
      memberNames: ['Rahul_op'],
      maxPlayers: 4,
      createdBy: 'mock_user_6',
      status: 'forming',
      createdAt: Date.now() - 40000,
    },
    // Helldivers 2 Groups
    {
      id: 'mock_group_3',
      gameName: 'Helldivers 2',
      members: ['mock_user_5', 'mock_user_1', 'mock_user_9'],
      memberNames: ['Vikram_op', 'RohanGamer', 'Danish_V'],
      maxPlayers: 4,
      createdBy: 'mock_user_5',
      status: 'forming',
      createdAt: Date.now() - 30000,
    },
    {
      id: 'mock_group_4',
      gameName: 'Helldivers 2',
      members: ['mock_user_2', 'mock_user_3'],
      memberNames: ['Priya_Playz', 'Amit_Sky'],
      maxPlayers: 4,
      createdBy: 'mock_user_2',
      status: 'forming',
      createdAt: Date.now() - 25000,
    },
    // Lethal Company Groups
    {
      id: 'mock_group_5',
      gameName: 'Lethal Company',
      members: ['mock_user_2', 'mock_user_7', 'mock_user_4'],
      memberNames: ['Priya_Playz', 'Sonia_Gamer', 'Sneha_10'],
      maxPlayers: 4,
      createdBy: 'mock_user_2',
      status: 'forming',
      createdAt: Date.now() - 20000,
    },
    // CS2 Groups
    {
      id: 'mock_group_6',
      gameName: 'Counter-Strike 2',
      members: ['mock_user_6', 'mock_user_8'],
      memberNames: ['Rahul_op', 'Karan_CS'],
      maxPlayers: 5,
      createdBy: 'mock_user_6',
      status: 'forming',
      createdAt: Date.now() - 15000,
    }
  ];

  for (const group of mockGroups) {
    await setDoc(doc(dbInst, 'groups', group.id), group);
  }

  // Seed chat messages for group 1 (Minecraft)
  const chatMessagesGroup1 = [
    { id: 'msg1_1', senderId: 'mock_user_1', senderName: 'RohanGamer', text: 'Hey guys! Ready to split the cost of a Minecraft server?', createdAt: Date.now() - 3600000 * 3 },
    { id: 'msg1_2', senderId: 'mock_user_2', senderName: 'Priya_Playz', text: 'Yes! Im down. It will be around ₹550 each if we get 4 people.', createdAt: Date.now() - 3600000 * 2 },
    { id: 'msg1_3', senderId: 'mock_user_7', senderName: 'Sonia_Gamer', text: 'I just joined. That budget sounds perfect to me!', createdAt: Date.now() - 3600000 }
  ];

  for (const msg of chatMessagesGroup1) {
    await setDoc(doc(dbInst, 'groups', 'mock_group_1', 'messages', msg.id), {
      senderId: msg.senderId,
      senderName: msg.senderName,
      text: msg.text,
      createdAt: msg.createdAt
    });
  }

  // Seed chat messages for group 3 (Helldivers 2)
  const chatMessagesGroup3 = [
    { id: 'msg3_1', senderId: 'mock_user_5', senderName: 'Vikram_op', text: 'Spill oil! Need squadmates for Helldive difficulty.', createdAt: Date.now() - 3600000 * 4 },
    { id: 'msg3_2', senderId: 'mock_user_9', senderName: 'Danish_V', text: 'I can cover the heavy armor/support weapon slot.', createdAt: Date.now() - 3600000 * 2 },
    { id: 'msg3_3', senderId: 'mock_user_1', senderName: 'RohanGamer', text: 'Count me in, spreading managed democracy!', createdAt: Date.now() - 3600000 }
  ];

  for (const msg of chatMessagesGroup3) {
    await setDoc(doc(dbInst, 'groups', 'mock_group_3', 'messages', msg.id), {
      senderId: msg.senderId,
      senderName: msg.senderName,
      text: msg.text,
      createdAt: msg.createdAt
    });
  }
}

// ======================== CHATROOMS ========================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function subscribeToMessages(groupId: string, callback: (messages: any[]) => void) {
  const dbInst = getFirebaseDb();
  if (!dbInst) return () => {};

  // Limit to messages from the last 2 days (48 hours)
  const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
  
  const q = query(
    collection(dbInst, 'groups', groupId, 'messages'),
    where('createdAt', '>=', twoDaysAgo),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(msgs);
  });
}

export async function sendMessage(groupId: string, senderId: string, senderName: string, text: string): Promise<void> {
  const dbInst = getDb();
  await addDoc(collection(dbInst, 'groups', groupId, 'messages'), {
    senderId,
    senderName,
    text,
    createdAt: Date.now(),
  });
}
