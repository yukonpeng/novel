import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--nr-accent)] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--nr-button-bg)] text-[var(--nr-button-fg)] hover:bg-[var(--nr-button-active-bg)] active:bg-[var(--nr-button-active-bg)]',
        ghost:
          'bg-transparent text-[var(--nr-titlebar-fg)] hover:bg-[var(--nr-hover-bg)]',
        outline:
          'border border-[var(--nr-border-color)] bg-transparent text-[var(--nr-fg)] hover:bg-[var(--nr-hover-bg)]',
      },
      size: {
        default: 'h-8 px-3 compact:h-10 compact:px-4',
        sm: 'h-7 px-2 text-xs compact:h-9 compact:px-3 compact:text-sm',
        icon: 'h-8 w-8 shrink-0 compact:h-10 compact:w-10',
        iconSm: 'h-7 w-7 shrink-0 compact:h-9 compact:w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type ?? 'button'}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
