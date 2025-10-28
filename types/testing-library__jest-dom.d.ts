declare module "@testing-library/jest-dom" {
  import "@testing-library/jest-dom/matchers";
}

declare module "@testing-library/jest-dom/matchers" {
  type ExpectationResult = { pass: boolean; message(): string };

  interface Matchers<R = ExpectationResult> {
    toBeInTheDocument(): R;
    toHaveClass(className: string): R;
    toHaveAttribute(attr: string, value?: string): R;
  }

  interface JestMatchersShape<TMatchers extends {}, TAndNot extends {}> {
    toBeInTheDocument(): TMatchers;
    toHaveClass(className: string): TMatchers;
    toHaveAttribute(attr: string, value?: string): TMatchers;
  }

  const matchers: Matchers;
  export default matchers;
}
