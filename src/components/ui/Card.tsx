// ============================================================
// Card Component — Glassmorphic card with hover effects
// ============================================================

'use client';

import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'interactive';
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const variants = {
    default: 'hud-panel',
    glow: 'hud-panel shadow-[0_0_25px_rgba(210,252,0,0.1)] border-brand-500/20',
    interactive: 'hud-panel hud-panel-interactive',
  };

  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`${variants[variant]} ${paddings[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
}
