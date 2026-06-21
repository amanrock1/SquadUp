'use client';

import React, { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[12px] font-medium" style={{ color: 'var(--color-text-2)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-3)' }}>
            {icon}
          </div>
        )}
        <input
          className={`w-full hud-input ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[11px]" style={{ color: 'var(--color-red)' }}>{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[12px] font-medium" style={{ color: 'var(--color-text-2)' }}>
          {label}
        </label>
      )}
      <select className={`w-full hud-input ${className}`} {...props}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: 'var(--color-bg-raised)', color: 'var(--color-text-1)' }}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[11px]" style={{ color: 'var(--color-red)' }}>{error}</p>}
    </div>
  );
}
