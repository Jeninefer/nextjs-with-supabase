import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  asChild?: boolean;
  variant?: string;
  size?: string;
};

export function Button({ children, asChild, ...props }: ButtonProps) {
  if (asChild) {
    return <span {...props}>{children}</span>;
  }

  return (
    <button {...props}>
      {children}
    </button>
  );
}
