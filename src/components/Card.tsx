'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  variant?: 'default' | 'elevated';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, description, variant = 'default', children, ...props }, ref) => {
    const baseClasses = 'rounded-lg p-6';
    const variantClasses = {
      default: 'bg-white border border-neutral-200',
      elevated: 'bg-white shadow-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      >
        {title && <h2 className="text-xl font-bold text-neutral-900 mb-2">{title}</h2>}
        {description && <p className="text-neutral-600 mb-4">{description}</p>}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ===== Badge =====
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-primary-100 text-primary-700',
      success: 'bg-success-100 text-success-700',
      warning: 'bg-warning-100 text-warning-700',
      danger: 'bg-red-100 text-red-700',
    };

    return (
      <span
        ref={ref}
        className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', variantClasses[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// ===== ProgressBar =====
interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, className }) => {
  const percentage = (current / total) * 100;

  return (
    <div className={cn('w-full', className)}>
      <div className="bg-neutral-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-sm text-neutral-600 mt-2 text-center">
        質問 {current} / {total}
      </p>
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';
