'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Gamepad2, Mail, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, signup, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Minimum 6 characters';
    if (isSignup && !username.trim()) errs.username = 'Username is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password, username);
        toast('success', 'Account created! Welcome to SquadUp 🎮');
      } else {
        await login(email, password);
        toast('success', 'Welcome back!');
      }
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('email-already-in-use')) toast('error', 'Email already registered. Try logging in.');
      else if (msg.includes('wrong-password') || msg.includes('invalid-credential')) toast('error', 'Invalid email or password.');
      else if (msg.includes('user-not-found')) toast('error', 'No account found. Sign up instead?');
      else toast('error', msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast('success', 'Signed in with Google!');
      router.push('/dashboard');
    } catch (err: any) {
      toast('error', err?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg-base)' }}>
      <div className="w-full max-w-sm animate-fade-in">

        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--color-accent)', boxShadow: '0 0 24px rgba(255,107,53,0.35)' }}
          >
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isSignup ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-2)' }}>
            {isSignup
              ? 'Sign up to find your squad and split game costs.'
              : 'Sign in to continue your gaming journey.'}
          </p>
        </div>

        {/* Card */}
        <div className="hud-panel p-6 space-y-5">

          {/* Google */}
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleGoogle}
            loading={loading}
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            }
          >
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--color-bg-border)' }} />
            <span className="text-[11px]" style={{ color: 'var(--color-text-3)' }}>or with email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-bg-border)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <Input
                label="Username"
                placeholder="Choose a username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                error={errors.username}
                icon={<User className="w-4 h-4" />}
              />
            )}
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock className="w-4 h-4" />}
            />

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {isSignup ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm" style={{ color: 'var(--color-text-2)' }}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignup(!isSignup); setErrors({}); }}
              className="font-semibold transition-colors hover:opacity-80"
              style={{ color: 'var(--color-accent)' }}
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
