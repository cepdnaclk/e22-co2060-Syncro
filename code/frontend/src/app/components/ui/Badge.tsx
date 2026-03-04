import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary border-primary/20',
    success: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 border-yellow-500/20',
    error: 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-red-400 border-destructive/20',
    info: 'bg-accent/20 text-accent-foreground dark:bg-accent/30 border-accent/30',
    secondary: 'bg-secondary text-secondary-foreground border-secondary/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}