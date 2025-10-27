import type { LabelHTMLAttributes, PropsWithChildren } from 'react';

type LabelProps = PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>;

export function Label({ children, ...props }: LabelProps) {
  return <label {...props}>{children}</label>;
}
