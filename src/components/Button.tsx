'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseClasses = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2';

    const variantClasses = {
      primary: 'bg-primary-500 hover:bg-primary-600 text-white disabled:bg-neutral-400',
      secondary: 'bg-success-500 hover:bg-success-600 text-white disabled:bg-neutral-400',
      ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-900 disabled:text-neutral-400',
      outline: 'border border-primary-500 text-primary-500 hover:bg-primary-50 disabled:border-neutral-400 disabled:text-neutral-400',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-6 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <span className="animate-spin">⟳</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
