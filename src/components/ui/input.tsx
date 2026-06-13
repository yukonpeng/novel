import { forwardRef } from 'react';
import { cn } from '@/src/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-8 w-full min-w-0 rounded bg-[var(--nr-input-bg)] px-3 text-sm text-[var(--nr-input-fg)] outline-none transition-colors placeholder:opacity-60 focus-visible:ring-2 focus-visible:ring-[var(--nr-accent)] disabled:cursor-not-allowed disabled:opacity-50 compact:h-10 compact:px-4',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
