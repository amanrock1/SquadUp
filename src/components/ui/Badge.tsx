'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neon';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-[var(--color-bg-hover)] text-[var(--color-text-2)] border border-[var(--color-bg-border)]',
    success: 'bg-[rgba(61,220,132,0.1)] text-[var(--color-green)] border border-[rgba(61,220,132,0.22)]',
    warning: 'bg-[rgba(255,214,10,0.1)] text-[var(--color-yellow)] border border-[rgba(255,214,10,0.22)]',
    error:   'bg-[rgba(255,69,58,0.1)] text-[var(--color-red)] border border-[rgba(255,69,58,0.22)]',
    info:    'bg-[var(--color-blue-dim)] text-[var(--color-blue)] border border-[var(--color-blue-border)]',
    neon:    'bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent-border)]',
  };

  const sizes: Record<string, string> = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-md ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}

// Match percentage badge with dynamic color
interface MatchBadgeProps {
  percentage: number;
  className?: string;
}

export function MatchBadge({ percentage, className = '' }: MatchBadgeProps) {
  let variant: BadgeProps['variant'] = 'default';
  if (percentage >= 80)      variant = 'success';
  else if (percentage >= 60) variant = 'info';
  else if (percentage >= 40) variant = 'warning';
  else                       variant = 'error';

  return (
    <Badge variant={variant} size="md" className={className}>
      {percentage}% Match
    </Badge>
  );
}
