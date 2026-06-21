// ============================================================
// Profile Page — Edit user profile, view stats
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
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
        <h1 className="text-2xl font-black flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-brand-400" />
          Profile
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile card */}
      <Card padding="lg">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="w-16 h-16 bg-brand-600/30 border-2 border-brand-500/30 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-black text-brand-300">
              {(profile?.username || 'G')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">{profile?.username}</h2>
            <p className="text-sm text-text-secondary">{user?.email}</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-neon-yellow" />
                <span className="text-xs font-medium text-text-primary">{profile?.rating?.toFixed(1) || '5.0'}</span>
              </div>
              <span className="text-xs text-text-muted">·</span>
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Member since {memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-xl bg-surface-800/50">
            <Gamepad2 className="w-5 h-5 text-brand-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-text-primary">{stats.wishlistCount}</p>
            <p className="text-xs text-text-muted">Games</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-surface-800/50">
            <Users className="w-5 h-5 text-neon-purple mx-auto mb-1" />
            <p className="text-lg font-bold text-text-primary">{stats.groupCount}</p>
            <p className="text-xs text-text-muted">Groups</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-surface-800/50">
            <Star className="w-5 h-5 text-neon-yellow mx-auto mb-1" />
            <p className="text-lg font-bold text-text-primary">{profile?.rating?.toFixed(1) || '5.0'}</p>
            <p className="text-xs text-text-muted">Rating</p>
          </div>
        </div>

        {/* Edit form */}
        <div className="space-y-4">
          <Input
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            icon={<UserCircle className="w-4 h-4" />}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Budget (₹)"
              type="number"
              value={budgetMin}
              onChange={e => setBudgetMin(e.target.value)}
              icon={<IndianRupee className="w-4 h-4" />}
              min="0"
            />
            <Input
              label="Max Budget (₹)"
              type="number"
              value={budgetMax}
              onChange={e => setBudgetMax(e.target.value)}
              icon={<IndianRupee className="w-4 h-4" />}
              min="0"
            />
          </div>

          <Select
            label="Region (optional)"
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

          <Button onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </Card>

      {/* Security info */}
      <Card padding="md" className="opacity-80">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-neon-green" />
          <div>
            <p className="text-sm font-medium text-text-primary">Your data is safe</p>
            <p className="text-xs text-text-muted">
              GamePool never stores passwords, game credentials, or payment info. We only store what&apos;s needed for matching.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
