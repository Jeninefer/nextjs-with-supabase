import type { JestMatcherResult } from "./jest-stubs";

/**
 * Minimal module declaration for @testing-library/jest-dom to expose the custom matchers used in the tests.
 */
declare module "@testing-library/jest-dom" {
  import "@testing-library/jest-dom/matchers";
  const jestDomMatchers: typeof import("@testing-library/jest-dom/matchers");
  export default jestDomMatchers;
}

declare module "@testing-library/jest-dom/matchers" {
  interface TestingLibraryMatchers<R = JestMatcherResult> {
    toBeInTheDocument(): R;
    toHaveClass(className: string | RegExp): R;
    toHaveAttribute(attr: string, value?: string | RegExp): R;
  }

  interface TestingLibraryMatchersShape<TMatchers extends {}, TNot extends {}> {
    toBeInTheDocument(): TMatchers;
    toHaveClass(className: string | RegExp): TMatchers;
    toHaveAttribute(attr: string, value?: string | RegExp): TMatchers;
  }

  const matchers: TestingLibraryMatchers;

  export { matchers, TestingLibraryMatchers, TestingLibraryMatchersShape };
  export default matchers;
}

declare global {
  namespace jest {
    interface Matchers<R = JestMatcherResult> extends import("./testing-library__jest-dom").TestingLibraryMatchers<R> {}
  }

  interface Expect extends import("./testing-library__jest-dom").TestingLibraryMatchers<JestMatcherResult> {}
}
