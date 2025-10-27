import type { PropsWithChildren } from 'react';

type LinkProps = PropsWithChildren<{
  href: string;
  className?: string;
  title?: string;
}> & Record<string, unknown>;

export default function Link({ href, children, ...rest }: LinkProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
