'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}
      <input
        ref={ref}
        className={`w-full rounded-lg border border-border bg-white px-3 py-2 text-sm
          placeholder:text-secondary/60
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
          disabled:bg-gray-50 disabled:text-secondary
          ${error ? 'border-danger' : ''}
          ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';
