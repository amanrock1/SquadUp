// ============================================================
// Root Layout — Wraps entire app with providers
// ============================================================

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'SquadUp — Find Gamers to Split Game Costs',
  description: 'SquadUp matches you with other gamers who want the same multiplayer games. Split costs, find your squad, and play together. Powered by smart AI matching.',
  keywords: ['gaming', 'multiplayer', 'cost splitting', 'game matching', 'wishlist'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-surface-900" suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="pt-[58px]">
              {children}
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
