import type { HTMLAttributes, PropsWithChildren } from 'react';

type DivProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

type HeadingProps = PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>;

export function Card(props: DivProps) {
  return <section {...props} />;
}

export function CardHeader(props: DivProps) {
  return <header {...props} />;
}

export function CardContent(props: DivProps) {
  return <div {...props} />;
}

export function CardDescription(props: DivProps) {
  return <p {...props} />;
}

export function CardTitle(props: HeadingProps) {
  return <h1 {...props} />;
}
