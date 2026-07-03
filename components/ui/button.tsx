import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 disabled:pointer-events-none disabled:opacity-50 min-h-touch",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-text-on-primary hover:bg-primary-700",
        secondary: "bg-surface-secondary text-text-primary hover:bg-border",
        outline:
          "border border-border bg-transparent hover:bg-surface-secondary",
        ghost: "hover:bg-surface-secondary",
        danger: "bg-error-500 text-white hover:bg-error-700",
      },
      size: {
        default: "px-4 py-3",
        sm: "px-3 py-2 text-xs",
        lg: "px-8 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
