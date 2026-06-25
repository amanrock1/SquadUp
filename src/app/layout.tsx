// ============================================================
// Root Layout — Wraps entire app with providers
// ============================================================

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'GamePool — Buy multiplayer games together',
  description: 'Find players planning to buy the same game and split the cost before checkout.',
  keywords: ['gaming', 'multiplayer', 'cost splitting', 'game matching', 'wishlist'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-bg-base text-text-primary" suppressHydrationWarning>
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
