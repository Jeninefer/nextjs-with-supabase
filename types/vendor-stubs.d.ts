declare module 'next' {
  export type Metadata = Record<string, unknown>;
}

declare module 'next/link' {
  import type { ReactNode } from 'react';

  export type LinkProps = {
    href: string;
    className?: string;
    children?: ReactNode;
    target?: string;
    rel?: string;
    [key: string]: unknown;
  };

  export default function Link(props: LinkProps): JSX.Element;
}

declare module 'next/navigation' {
  export type AppRouterInstance = {
    push(path: string): void;
    replace(path: string): void;
    prefetch(path: string): Promise<void>;
    back(): void;
    forward(): void;
    refresh(): void;
  };

  export function useRouter(): AppRouterInstance;
  export function redirect(path: string): never;
}

declare module 'next/server' {
  export type NextURL = {
    pathname: string;
    href: string;
    clone(): NextURL;
  };

  export type NextRequest = {
    url: string;
    nextUrl: NextURL;
    cookies: {
      get(name: string): { value: string } | undefined;
      getAll(): Array<{ name: string; value: string }>;
      set(name: string, value: string, options?: Record<string, unknown>): void;
    };
  };

  export class NextResponse {
    static json(body: unknown, init?: Record<string, unknown>): NextResponse;
    static redirect(url: string): NextResponse;
    static next(options?: { request?: NextRequest }): NextResponse;
    cookies: {
      set(name: string, value: string, options?: Record<string, unknown>): void;
    };
  }
}

declare module 'next/headers' {
  import type { NextRequest } from 'next/server';

  export function cookies(): Promise<Pick<NextRequest['cookies'], 'getAll' | 'set'>>;
}

declare module 'next-themes' {
  import type { PropsWithChildren, ReactNode } from 'react';

  export type ThemeProviderProps = PropsWithChildren<{
    attribute?: string;
    defaultTheme?: string;
    enableSystem?: boolean;
    forcedTheme?: string;
    disableTransitionOnChange?: boolean;
  }>;

  export const ThemeProvider: (props: ThemeProviderProps) => ReactNode;
  export function useTheme(): { theme?: string; setTheme: (theme: string) => void };
}

declare module 'lucide-react' {
  import type { ComponentType, SVGProps } from 'react';
  export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };
  export type Icon = ComponentType<IconProps>;
  export const InfoIcon: Icon;
  export const Check: Icon;
  export const ChevronRight: Icon;
  export const Circle: Icon;
  export const SunMedium: Icon;
  export const Moon: Icon;
  export const Laptop: Icon;
  export const Sun: Icon;
}

declare module '@supabase/ssr' {
  export function createBrowserClient(...args: unknown[]): any;
  export function createServerClient(...args: unknown[]): any;
}

declare module '@radix-ui/react-slot' {
  export const Slot: any;
}

declare module '@radix-ui/react-checkbox' {
  export const Root: any;
  export const Indicator: any;
}

declare module '@radix-ui/react-dropdown-menu' {
  export const Root: any;
  export const Trigger: any;
  export const Content: any;
  export const Item: any;
  export const Sub: any;
  export const SubTrigger: any;
  export const SubContent: any;
  export const Group: any;
  export const Label: any;
  export const Separator: any;
  export const CheckboxItem: any;
  export const Portal: any;
  export const RadioGroup: any;
  export const RadioItem: any;
  export const ItemIndicator: any;
}

declare module '@radix-ui/react-label' {
  export const Root: any;
}

declare module 'class-variance-authority' {
  export type ClassValue = string | number | null | undefined | Record<string, boolean>;
  export function cva(base: string, options?: Record<string, unknown>): (...inputs: ClassValue[]) => string;
  export type VariantProps<T> = Record<string, any>;
}

declare module 'tailwind-merge' {
  export function twMerge(...classes: Array<string | undefined | null | false>): string;
}
