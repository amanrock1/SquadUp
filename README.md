# 🎮 GamePool — AI Game Pooling Wishlist Finder

> Find gamers to split the cost of multiplayer games. Powered by smart matching and AI recommendations.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase-Auth+Firestore-orange?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

- **🔐 Authentication** — Email/Password + Google Sign-in via Firebase
- **📝 Wishlist System** — Add games with budget, player count, and play time preferences
- **🤖 Smart Matching** — Fuzzy name matching with alias database (MC → Minecraft)
- **📊 Match Scoring** — Weighted algorithm considering game name, budget, and player count
- **👥 Group Creation** — Form groups and share links for Discord, WhatsApp, or Telegram
- **🧠 AI Recommendations** — Built-in game database with genre/tag-based suggestions (FREE)
- **💰 Cost Optimizer** — Calculate optimal group sizes and per-person costs
- **🌙 Dark Mode** — Premium gaming aesthetic with glassmorphism and neon accents
- **📱 Responsive** — Full mobile support with bottom navigation

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) 18+ installed
- A [Firebase](https://console.firebase.google.com) account (free tier)

### 1. Clone & Install

```bash
cd gamepool
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** → name it anything → create
3. Go to **Project Settings** → **General** → scroll to **"Your apps"**
4. Click the web icon (`</>`) → register app → copy the config values
5. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable **Email/Password**
   - Enable **Google** (add your email as support email)
6. Enable **Firestore**:
   - Go to Firestore Database → Create database
   - Start in **test mode** (or production with the rules from `firestore.rules`)
   - Choose the closest region

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase config values from step 2.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
gamepool/
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── page.tsx               # Landing page
│   │   ├── layout.tsx             # Root layout (providers, navbar)
│   │   ├── globals.css            # Design system & styles
│   │   ├── login/                 # Login/Signup page
│   │   └── (dashboard)/           # Protected dashboard pages
│   │       ├── layout.tsx         # Dashboard layout (sidebar)
│   │       ├── dashboard/         # Dashboard home
│   │       ├── wishlist/          # Wishlist management
│   │       ├── matches/           # View matches
│   │       ├── groups/            # Groups management
│   │       └── profile/           # User profile
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       └── Sidebar.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx        # Firebase auth provider
│   └── lib/
│       ├── firebase.ts            # Firebase initialization
│       ├── db.ts                  # Firestore CRUD helpers
│       ├── types.ts               # TypeScript types
│       ├── similarity.ts          # Game name matching engine
│       ├── ai.ts                  # AI recommendations (free)
│       └── links.ts               # Share link generators
├── firestore.rules                # Firestore security rules
├── .env.local.example             # Env template
└── README.md
```

---

## 🧠 How Matching Works

1. **Game Name Matching (50% weight)**
   - Exact match → 100 points
   - Alias match (e.g., "MC" → "Minecraft") → 100 points
   - Contains match → 85 points
   - Fuzzy match (Levenshtein) → 25-75 points

2. **Budget Proximity (30% weight)**
   - Similar budgets score higher

3. **Player Count Match (20% weight)**
   - Exact count match → 20 points
   - Off by 1 → 10 points

### Game Alias Database
The matching engine knows 40+ popular games and their abbreviations:
- `MC`, `MCPE` → Minecraft
- `CS2`, `CSGO` → Counter-Strike 2
- `PUBG` → PLAYERUNKNOWN'S BATTLEGROUNDS
- `R6`, `R6S` → Rainbow Six Siege
- And many more...

---

## 🤖 AI Features (Free!)

No API key required! All AI features use a built-in game database:

- **Game Recommendations** — Find similar games based on genre and tags
- **Cheaper Alternatives** — Discover budget-friendly options
- **Cost Optimizer** — Calculate optimal group sizes
- **Smart Aliases** — Automatic normalization of game names

---

## 🔒 Safety & Ethics

- ❌ No game credential sharing
- ❌ No payment processing
- ❌ No piracy support
- ✅ Users buy their own copies
- ✅ Platform is for matching only
- ✅ No sensitive data stored

---

## 🚢 Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add environment variables from `.env.local`
4. Deploy! 🎉

---

## 📝 License

MIT — Made with ❤️ for gamers.
