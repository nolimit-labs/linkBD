import React from 'react';
import { View, type ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils';
import { Text } from './text';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full px-2.5 py-0.5',
  {
    variants: {
      variant: {
        default:
          'bg-primary',
        secondary:
          'bg-secondary',
        destructive:
          'bg-destructive',
        outline:
          'border border-input bg-background',
        success:
          'bg-emerald-100 dark:bg-emerald-900',
        warning:
          'bg-yellow-100 dark:bg-yellow-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends ViewProps,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <View
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {children}
    </View>
  );
}

// Text-specific badge component for convenience
export function BadgeText({ 
  children, 
  className,
  variant = 'default',
  ...props 
}: BadgeProps & { children: React.ReactNode }) {
  const textColorClass = React.useMemo(() => {
    switch (variant) {
      case 'default':
        return 'text-primary-foreground';
      case 'secondary':
        return 'text-secondary-foreground';
      case 'destructive':
        return 'text-destructive-foreground';
      case 'outline':
        return 'text-foreground';
      case 'success':
        return 'text-emerald-700 dark:text-emerald-100';
      case 'warning':
        return 'text-yellow-700 dark:text-yellow-100';
      default:
        return 'text-foreground';
    }
  }, [variant]);

  return (
    <Badge variant={variant} className={className} {...props}>
      <Text className={cn('text-xs font-medium', textColorClass)}>
        {children}
      </Text>
    </Badge>
  );
}