// ============================================================
// Landing Page — Hero, Features, How It Works, CTA
// Modern dark gaming aesthetic with animations
// ============================================================

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Gamepad2, Users, Sparkles, Shield, IndianRupee, Zap,
  ArrowRight, ListPlus, UserCheck, PartyPopper, Star,
  Globe, TrendingUp, Heart
} from 'lucide-react';

// Animated counter hook
function useCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, start: () => setStarted(true) };
}

export default function LandingPage() {
  const users = useCounter(2847);
  const games = useCounter(156);
  const groups = useCounter(432);

  useEffect(() => {
    // Start counters when component mounts (visible)
    const timer = setTimeout(() => {
      users.start();
      games.start();
      groups.start();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-grid">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-16 pb-24">
        {/* Background effects */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-neon-purple/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-surface-900 to-transparent" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-1 mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Smart Cost-Split Lobby</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-6 animate-slide-up">
            Find Your
            <span className="gradient-text"> Squad</span>
            <br />
            Split The Cost
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-slide-up stagger-1">
            GamePool matches you with gamers who want the same multiplayer games.
            Team up, split costs, and start playing together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-2">
            <Link href="/login">
              <Button size="lg" icon={<Gamepad2 className="w-5 h-5" />}>
                Start Matching — It&apos;s Free
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="secondary" size="lg">
                See How It Works
              </Button>
            </a>
          </div>

          {/* Floating game cards (decorative) */}
          <div className="relative mt-16 max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'Minecraft', price: '₹1999', players: '2-10', color: 'from-green-500/20 to-green-600/5' },
                { name: 'Helldivers 2', price: '₹2499', players: '1-4', color: 'from-brand-500/20 to-brand-600/5' },
                { name: 'Lethal Company', price: '₹480', players: '1-4', color: 'from-purple-500/20 to-purple-600/5' },
              ].map((game, i) => (
                <Card key={game.name} variant="interactive" padding="sm" className={`animate-slide-up stagger-${i + 3}`}>
                  <div className={`w-full h-20 rounded-xl bg-gradient-to-br ${game.color} mb-3 flex items-center justify-center`}>
                    <Gamepad2 className="w-8 h-8 text-white/40" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">{game.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-neon-green">{game.price}</span>
                    <span className="text-xs text-text-muted">{game.players} players</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: users.count, label: 'Gamers Joined', suffix: '+', icon: Users },
              { value: games.count, label: 'Games Tracked', suffix: '+', icon: Gamepad2 },
              { value: groups.count, label: 'Groups Formed', suffix: '+', icon: Heart },
            ].map(stat => (
              <Card key={stat.label} padding="md" className="text-center">
                <stat.icon className="w-6 h-6 text-brand-400 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-black gradient-text">
                  {stat.value.toLocaleString()}{stat.suffix}
                </p>
                <p className="text-xs sm:text-sm text-text-muted mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="px-4 sm:px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Three Steps to Your <span className="gradient-text">Squad</span>
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              No complicated setup. Just add your games, get matched, and start playing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: ListPlus,
                title: 'Add Your Games',
                desc: 'Create your wishlist with games you want to play, your budget, and how many players you need.',
                color: 'text-neon-cyan',
                glow: 'glow-cyan',
              },
              {
                step: '02',
                icon: UserCheck,
                title: 'Get Matched',
                desc: 'Our smart matching system finds gamers with similar interests, budgets, and player counts.',
                color: 'text-brand-400',
                glow: 'glow-brand',
              },
              {
                step: '03',
                icon: PartyPopper,
                title: 'Play Together',
                desc: 'Join groups, connect on Discord or WhatsApp, and start your multiplayer adventure!',
                color: 'text-neon-purple',
                glow: 'glow-purple',
              },
            ].map(item => (
              <Card key={item.step} padding="lg" className={`relative overflow-hidden group hover:${item.glow} transition-all duration-500`}>
                <span className="absolute top-4 right-4 text-5xl font-black text-white/[0.03]">
                  {item.step}
                </span>
                <div className={`w-12 h-12 rounded-xl bg-surface-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="px-4 sm:px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Packed With <span className="gradient-text">Features</span>
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              Everything you need to find your gaming crew.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, title: 'Smart Recommendations', desc: 'Get game suggestions and cheaper alternatives based on your interests.', color: 'text-neon-cyan' },
              { icon: Users, title: 'Smart Matching', desc: 'Advanced matching by game, budget, and player count. Even handles abbreviations!', color: 'text-brand-400' },
              { icon: IndianRupee, title: 'Cost Optimizer', desc: 'See exactly how much each player pays when you split the cost.', color: 'text-neon-green' },
              { icon: Shield, title: 'Safe & Secure', desc: 'No credentials shared, no payments processed. Just matching and fun.', color: 'text-neon-purple' },
              { icon: Globe, title: 'Region Matching', desc: 'Find gamers in your region for better ping and play times.', color: 'text-neon-orange' },
              { icon: Zap, title: 'Instant Groups', desc: 'Create groups and share invite links for Discord or WhatsApp instantly.', color: 'text-neon-yellow' },
            ].map(feature => (
              <Card key={feature.title} variant="interactive" padding="md">
                <feature.icon className={`w-8 h-8 ${feature.color} mb-3`} />
                <h3 className="text-base font-bold text-text-primary mb-1">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="px-4 sm:px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 via-neon-purple/10 to-neon-cyan/20 rounded-3xl blur-xl" />
            <Card padding="lg" className="relative">
              <Gamepad2 className="w-12 h-12 text-brand-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Ready to Find Your Squad?
              </h2>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                Join thousands of gamers already matching on GamePool.
                It&apos;s completely free to get started.
              </p>
              <Link href="/login">
                <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                  Get Started Now
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-brand-400" />
            <span className="text-sm font-bold text-text-primary">GamePool</span>
          </div>
          <p className="text-xs text-text-muted">
            © 2026 GamePool. Made with ❤️ for gamers. Not affiliated with any game publisher.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-text-muted">No account sharing • No piracy • Just matching</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
