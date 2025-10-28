declare type DoneCallback = (error?: unknown) => void;

declare interface JestMatchers<T> {
  toBe(expected: T): void;
  toBeDefined(): void;
  toBeUndefined(): void;
  toEqual(expected: unknown): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeNull(): void;
  toBeInTheDocument(): void;
  toHaveClass(className: string): void;
  toHaveAttribute(attr: string, value?: string): void;
  not: JestMatchers<T>;
}

declare function expect<T = unknown>(actual: T): JestMatchers<T>;

declare function describe(name: string, fn: () => void): void;
declare function describe(name: string, fn: (done: DoneCallback) => void): void;
declare namespace describe {
  function skip(name: string, fn: () => void): void;
  function only(name: string, fn: () => void): void;
}

declare function test(name: string, fn: () => void | Promise<void>): void;
declare function test(name: string, fn: (done: DoneCallback) => void): void;
declare namespace test {
  function skip(name: string, fn: () => void): void;
  function only(name: string, fn: () => void): void;
}

declare const it: typeof test;
declare function beforeEach(fn: () => void | Promise<void>): void;
declare function afterEach(fn: () => void | Promise<void>): void;

