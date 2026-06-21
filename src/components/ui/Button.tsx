'use client';

import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg';

  const variants: Record<string, string> = {
    primary:   'btn-hud-volt',
    secondary: 'btn-hud-steel',
    ghost:     'bg-transparent text-[var(--color-text-2)] hover:text-[var(--color-text-1)] hover:bg-[var(--color-bg-hover)] border border-transparent',
    danger:    'bg-[rgba(255,69,58,0.1)] text-[var(--color-red)] border border-[rgba(255,69,58,0.2)] hover:bg-[rgba(255,69,58,0.18)] active:scale-95',
    success:   'bg-[rgba(61,220,132,0.1)] text-[var(--color-green)] border border-[rgba(61,220,132,0.2)] hover:bg-[rgba(61,220,132,0.18)] active:scale-95',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-[12px]',
    md: 'px-4 py-2 text-[13px]',
    lg: 'px-6 py-2.5 text-sm',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}
