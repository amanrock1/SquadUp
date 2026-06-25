// ============================================================
// Landing Page — GamePool
// Modern, premium startup aesthetic (Stripe/Linear/Discord Inspired)
// ============================================================

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Gamepad2, Users, Shield, Zap, Globe, ChevronRight, CheckCircle2, MessageSquare, IndianRupee } from 'lucide-react';

export default function LandingPage() {
  // Interactive Hero Card State
  const [joinedHero, setJoinedHero] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-white relative">
      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left: Headline & CTAs */}
          <div className="lg:col-span-7 text-left space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
              <span className="text-[11px] font-medium tracking-wide text-[var(--color-accent)] font-subheading">
                Social Multiplayer Marketplace
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Buy multiplayer <br />
              games together.
            </h1>

            <p className="text-base sm:text-lg text-[var(--color-text-2)] max-w-lg leading-relaxed">
              Find players planning to buy the same game and split the cost before checkout. Form your group, connect, and play together.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/login">
                <button className="btn-hud-volt font-medium text-sm px-6 py-3 flex items-center gap-1">
                  Find Players
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
              <a href="#how-it-works">
                <button className="btn-hud-steel font-medium text-sm px-6 py-3">
                  See How It Works
                </button>
              </a>
            </div>
          </div>

          {/* Right: Beautiful Interactive Card */}
          <div className="lg:col-span-5 flex justify-center animate-fade-in-scale">
            <div className="w-full max-w-sm bg-[var(--color-bg-card)] border border-[var(--color-bg-border)] rounded-xl overflow-hidden shadow-2xl">
              {/* Game Header Graphic */}
              <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
                <img 
                  src="https://cdn.akamai.steamstatic.com/steam/apps/553850/header.jpg" 
                  alt="Helldivers 2" 
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-card)] to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                    joinedHero 
                      ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                      : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                  }`}>
                    {joinedHero ? 'Completed' : 'Looking'}
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">Helldivers 2</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-[var(--color-text-3)] font-medium">Total Cost</span>
                    <span className="text-sm font-semibold text-white">₹2,499</span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[var(--color-text-2)]">
                      {joinedHero ? '4 / 4 Players Joined' : '3 / 4 Players Joined'}
                    </span>
                    <span className="text-[var(--color-accent)]">
                      {joinedHero ? '0 slots left' : '1 slot left'}
                    </span>
                  </div>
                  <div className="cap-bar">
                    <div 
                      className={`cap-bar-fill transition-all duration-300 ${joinedHero ? 'bg-green-500' : 'bg-[var(--color-accent)]'}`} 
                      style={{ width: joinedHero ? '100%' : '75%' }} 
                    />
                  </div>
                </div>

                {/* Split Calculation Panel */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--color-bg-raised)] border border-[var(--color-bg-border)] rounded-lg">
                  <div>
                    <p className="text-[10px] text-[var(--color-text-3)] uppercase tracking-wider font-semibold">Your Share</p>
                    <p className="text-lg font-bold text-white mt-1">₹625</p>
                  </div>
                  <div className="border-l border-[var(--color-bg-border)] pl-4">
                    <p className="text-[10px] text-[var(--color-text-3)] uppercase tracking-wider font-semibold">Discord Server</p>
                    <p className="text-xs font-semibold text-[var(--color-text-2)] mt-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Ready
                    </p>
                  </div>
                </div>

                {/* Interactive CTA */}
                <button 
                  onClick={() => setJoinedHero(!joinedHero)}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all duration-200 border ${
                    joinedHero 
                      ? 'bg-transparent border-[var(--color-bg-border)] text-[var(--color-text-3)] hover:text-white' 
                      : 'bg-[var(--color-accent)] border-transparent text-white hover:bg-[var(--color-brand-600)]'
                  }`}
                >
                  {joinedHero ? 'Leave Group' : 'Join Group'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 border-t border-[var(--color-bg-border)] bg-[var(--color-bg-raised)]/30 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How GamePool Works</h2>
            <p className="text-sm text-[var(--color-text-2)]">Five simple steps to multiplayer savings and instant matches.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Step 1 */}
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-bg-border)] rounded-xl p-5 space-y-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] flex items-center justify-center text-xs font-bold text-[var(--color-accent)]">
                01
              </div>
              <h3 className="text-sm font-bold text-white">Choose a Game</h3>
              <p className="text-xs text-[var(--color-text-2)] leading-relaxed">
                Search or browse the Steam catalog and select any multiplayer game you want to buy.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-bg-border)] rounded-xl p-5 space-y-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] flex items-center justify-center text-xs font-bold text-[var(--color-accent)]">
                02
              </div>
              <h3 className="text-sm font-bold text-white">Set Your Budget</h3>
              <p className="text-xs text-[var(--color-text-2)] leading-relaxed">
                Decide the maximum price you want to pay. We handle the split calculation instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-bg-border)] rounded-xl p-5 space-y-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-dim)] border border(--color-accent-border)] flex items-center justify-center text-xs font-bold text-[var(--color-accent)]">
                03
              </div>
              <h3 className="text-sm font-bold text-white">Get Matched</h3>
              <p className="text-xs text-[var(--color-text-2)] leading-relaxed">
                Our algorithm matches you with real players seeking the same game with similar budgets.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-bg-border)] rounded-xl p-5 space-y-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] flex items-center justify-center text-xs font-bold text-[var(--color-accent)]">
                04
              </div>
              <h3 className="text-sm font-bold text-white">Join Group Chat</h3>
              <p className="text-xs text-[var(--color-text-2)] leading-relaxed">
                Connect inside a secure group channel or jump into integrated Discord or WhatsApp rooms.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-bg-border)] rounded-xl p-5 space-y-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] flex items-center justify-center text-xs font-bold text-[var(--color-accent)]">
                05
              </div>
              <h3 className="text-sm font-bold text-white">Buy Together</h3>
              <p className="text-xs text-[var(--color-text-2)] leading-relaxed">
                Split the cost, pool the purchase through Steam family features, and start playing!
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-[var(--color-bg-border)] px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="mb-12 text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Designed for Modern PC Gamers</h2>
          <p className="text-sm text-[var(--color-text-2)] mt-2">Zero gamer culture noise. Just pure functionality to get you matching and playing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-bg-border)] rounded-xl p-6 space-y-4">
            <Globe className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="text-base font-bold text-white">Region Matching</h3>
            <p className="text-xs text-[var(--color-text-2)] leading-relaxed">
              Match with squadmates in your local timezone to coordinate game times, avoid high latency issues, and play on matching server locations.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-bg-border)] rounded-xl p-6 space-y-4">
            <MessageSquare className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="text-base font-bold text-white">Instant Group Creation</h3>
            <p className="text-xs text-[var(--color-text-2)] leading-relaxed">
              Skip setup friction. Once matched, a private room opens with instant links to WhatsApp, Telegram, or Discord server invitations.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-bg-border)] rounded-xl p-6 space-y-4">
            <Shield className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="text-base font-bold text-white">Split Trust Protocol</h3>
            <p className="text-xs text-[var(--color-text-2)] leading-relaxed">
              We never touch your money or store payment accounts. We match verified profiles, letting players settle splits directly on their terms.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 border-t border-[var(--color-bg-border)] relative">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <Gamepad2 className="w-12 h-12 text-[var(--color-accent)] mx-auto opacity-80" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Find your split group today
          </h2>
          <p className="text-sm text-[var(--color-text-2)] max-w-md mx-auto">
            Stop paying full price for multiplayer. Connect with active gamers and pool your next Steam checkout.
          </p>
          <Link href="/login">
            <button className="btn-hud-volt font-semibold text-sm px-8 py-3">
              Find Players
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-bg-border)] bg-[var(--color-bg-base)] px-4 sm:px-6 lg:px-8 py-12 text-xs text-[var(--color-text-3)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-white" />
            <span className="font-bold text-white tracking-wide">GamePool</span>
            <span className="px-2 py-0.5 bg-[var(--color-bg-subtle)] text-[10px] rounded">v1.0.0</span>
          </div>
          <div>
            © 2026 GamePool. All rights reserved. Not affiliated with Valve Corporation or any game publisher.
          </div>
          <div className="flex gap-4 font-medium">
            <span>Status: Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
