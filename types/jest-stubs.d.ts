/**
 * Minimal Jest ambient declarations to enable TypeScript tooling without pulling the full @types/jest package.
 * These definitions intentionally cover only the APIs used throughout the repo's tests.
 */
export type JestMatcherResult = {
  pass: boolean;
  message(): string;
};

export interface JestMatchers<T = unknown> {
  toBe(expected: T): JestMatcherResult;
  toEqual(expected: unknown): JestMatcherResult;
  toStrictEqual(expected: unknown): JestMatcherResult;
  toBeTruthy(): JestMatcherResult;
  toBeFalsy(): JestMatcherResult;
  toBeNull(): JestMatcherResult;
  toBeDefined(): JestMatcherResult;
  toBeUndefined(): JestMatcherResult;
  toHaveBeenCalled(): JestMatcherResult;
  toHaveBeenCalledTimes(times: number): JestMatcherResult;
  toHaveBeenCalledWith(...args: unknown[]): JestMatcherResult;
  toHaveLength(length: number): JestMatcherResult;
  toContain(item: unknown): JestMatcherResult;
  not: JestMatchers<T>;
}

export interface JestMock<TArgs extends unknown[] = unknown[], TReturn = unknown> {
  (...args: TArgs): TReturn;
  mock: {
    calls: TArgs[];
    results: { value: unknown }[];
    lastCall?: TArgs;
  };
  mockClear(): void;
  mockImplementation(impl: (...args: TArgs) => TReturn): JestMock<TArgs, TReturn>;
}

export type DoneCallback = (error?: unknown) => void;

export interface JestGlobal {
  fn<TArgs extends unknown[] = unknown[], TReturn = unknown>(
    implementation?: (...args: TArgs) => TReturn,
  ): JestMock<TArgs, TReturn>;
  spyOn<T extends object, K extends keyof T>(object: T, method: K): JestMock;
  clearAllMocks(): void;
}

declare global {
  const jest: JestGlobal;

  function expect<T = unknown>(actual: T): JestMatchers<T>;
  namespace expect {
    function extend(customMatchers: Record<string, (...args: unknown[]) => JestMatcherResult>): void;
  }

  function describe(name: string, fn: () => void | Promise<void>): void;
  function describe(name: string, fn: (done: DoneCallback) => void): void;
  namespace describe {
    function skip(name: string, fn: () => void | Promise<void>): void;
    function only(name: string, fn: () => void | Promise<void>): void;
  }

  function test(name: string, fn: () => void | Promise<void>): void;
  function test(name: string, fn: (done: DoneCallback) => void): void;
  namespace test {
    function skip(name: string, fn: () => void | Promise<void>): void;
    function only(name: string, fn: () => void | Promise<void>): void;
  }

  const it: typeof test;

  function beforeAll(fn: () => void | Promise<void>, timeout?: number): void;
  function beforeEach(fn: () => void | Promise<void>, timeout?: number): void;
  function afterAll(fn: () => void | Promise<void>, timeout?: number): void;
  function afterEach(fn: () => void | Promise<void>, timeout?: number): void;
}

export {};
