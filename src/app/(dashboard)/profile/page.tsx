// ============================================================
// Profile Page — Edit user profile, view stats
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { updateUserProfile, getUserWishlist, getUserGroups } from '@/lib/db';
import {
  UserCircle, Save, Star, Gamepad2, Users,
  MapPin, IndianRupee, Calendar, Shield
} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [region, setRegion] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ wishlistCount: 0, groupCount: 0 });

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setBudgetMin(profile.budgetMin?.toString() || '0');
      setBudgetMax(profile.budgetMax?.toString() || '3000');
      setRegion(profile.region || '');
    }
    if (user) loadStats();
  }, [profile, user]);

  const loadStats = async () => {
    try {
      const [wl, gr] = await Promise.all([
        getUserWishlist(user!.uid),
        getUserGroups(user!.uid),
      ]);
      setStats({ wishlistCount: wl.length, groupCount: gr.length });
    } catch (err) {
      // ignore
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      toast('warning', 'Username is required');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(user!.uid, {
        username: username.trim(),
        budgetMin: Number(budgetMin) || 0,
        budgetMax: Number(budgetMax) || 3000,
        region: region.trim(),
      });
      await refreshProfile();
      toast('success', 'Profile saved! ✨');
    } catch (err) {
      toast('error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 font-heading tracking-tight text-white">
          <UserCircle className="w-6 h-6 text-[var(--color-accent)]" />
          Your Profile
        </h1>
        <p className="text-xs text-[var(--color-text-3)] font-medium mt-1">
          Manage your account preferences, region, and budget thresholds.
        </p>
      </div>

      {/* Profile Card */}
      <div className="border border-[var(--color-bg-border)] bg-[var(--color-bg-card)] rounded-xl p-6 relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6 pb-6 border-b border-[var(--color-bg-border)]">
          <div className="w-16 h-16 bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] rounded-xl flex items-center justify-center shrink-0 relative group">
            <span className="text-2xl font-bold text-white font-heading">
              {(profile?.username || 'U')[0].toUpperCase()}
            </span>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[var(--color-green)] border-2 border-[var(--color-bg-card)] rounded-full" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-wide leading-none">{profile?.username}</h2>
            </div>
            <p className="text-xs text-[var(--color-text-3)] font-semibold mt-2">{user?.email}</p>
            <div className="flex items-center gap-4 mt-2.5 text-xs text-[var(--color-text-2)] font-semibold">
              <div className="flex items-center gap-1 font-subheading">
                <Star className="w-3.5 h-3.5 text-[var(--color-yellow)]" />
                <span className="text-white">{profile?.rating?.toFixed(1) || '5.0'}</span>
              </div>
              <span className="text-white/10">|</span>
              <span className="flex items-center gap-1 font-subheading text-[11px] text-[var(--color-text-3)]">
                <Calendar className="w-3.5 h-3.5" /> Member since {memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3.5 rounded-lg border border-[var(--color-bg-border)] bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
            <Gamepad2 className="w-4.5 h-4.5 text-[var(--color-accent)] mx-auto mb-1.5" />
            <p className="text-lg font-bold text-white font-heading">{stats.wishlistCount}</p>
            <p className="text-[10px] font-semibold text-[var(--color-text-3)] uppercase tracking-wider mt-0.5">Games</p>
          </div>
          <div className="text-center p-3.5 rounded-lg border border-[var(--color-bg-border)] bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
            <Users className="w-4.5 h-4.5 text-[var(--color-accent-light)] mx-auto mb-1.5" />
            <p className="text-lg font-bold text-white font-heading">{stats.groupCount}</p>
            <p className="text-[10px] font-semibold text-[var(--color-text-3)] uppercase tracking-wider mt-0.5">Groups</p>
          </div>
          <div className="text-center p-3.5 rounded-lg border border-[var(--color-bg-border)] bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
            <Star className="w-4.5 h-4.5 text-[var(--color-yellow)] mx-auto mb-1.5" />
            <p className="text-lg font-bold text-white font-heading">{profile?.rating?.toFixed(1) || '5.0'}</p>
            <p className="text-[10px] font-semibold text-[var(--color-text-3)] uppercase tracking-wider mt-0.5">Reputation</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-5 pt-3 border-t border-[var(--color-bg-border)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-3)]">Profile Settings</h3>
          
          <Input
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            icon={<UserCircle className="w-4 h-4 text-[var(--color-text-3)]" />}
            className="hud-input text-sm"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Split Budget (₹)"
              type="number"
              value={budgetMin}
              onChange={e => setBudgetMin(e.target.value)}
              icon={<IndianRupee className="w-4 h-4 text-[var(--color-text-3)]" />}
              min="0"
              className="hud-input text-sm"
            />
            <Input
              label="Max Split Budget (₹)"
              type="number"
              value={budgetMax}
              onChange={e => setBudgetMax(e.target.value)}
              icon={<IndianRupee className="w-4 h-4 text-[var(--color-text-3)]" />}
              min="0"
              className="hud-input text-sm"
            />
          </div>

          <Select
            label="Region"
            value={region}
            onChange={e => setRegion(e.target.value)}
            options={[
              { value: '', label: 'Select region...' },
              { value: 'NA', label: 'North America' },
              { value: 'EU', label: 'Europe' },
              { value: 'ASIA', label: 'Asia' },
              { value: 'SA', label: 'South America' },
              { value: 'OCE', label: 'Oceania' },
              { value: 'MEA', label: 'Middle East & Africa' },
              { value: 'IN', label: 'India' },
            ]}
          />

          <Button 
            onClick={handleSave} 
            loading={saving} 
            icon={<Save className="w-3.5 h-3.5" />}
            className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-brand-600)] text-white border-none font-semibold mt-2"
          >
            Save Profile Settings
          </Button>
        </div>
      </div>

      {/* Security info */}
      <div className="p-4 border border-[var(--color-bg-border)] bg-[var(--color-bg-card)] rounded-xl opacity-90">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[var(--color-green)] shrink-0" />
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">Secure Cost Splits</p>
            <p className="text-[11px] text-[var(--color-text-3)] mt-0.5 leading-relaxed font-semibold">
              GamePool matches you with other players. Settle checkouts directly through Steam Family or preferred payment apps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
