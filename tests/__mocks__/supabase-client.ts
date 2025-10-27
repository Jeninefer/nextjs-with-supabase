export type SignInArgs = { email: string; password: string };

type AuthResult = { error: { message: string } | null };

let signInCalls: SignInArgs[] = [];
let signUpCalls: SignInArgs[] = [];
let passwordResetEmails: string[] = [];
let nextResult: AuthResult | null = { error: null };

export function __setNextSignInResult(result: { error: { message: string } | null } | null) {
  nextResult = result;
}

export function __getSignInCalls() {
  return [...signInCalls];
}

export function resetSupabaseMock() {
  signInCalls = [];
  signUpCalls = [];
  passwordResetEmails = [];
  nextResult = { error: null };
}

export function createClient() {
  return {
    auth: {
      async signInWithPassword(args: SignInArgs) {
        signInCalls.push(args);
        return nextResult ?? { error: null };
      },
      async signUp(args: SignInArgs & { options?: Record<string, unknown> }) {
        signUpCalls.push(args);
        return nextResult ?? { error: null };
      },
      async resetPasswordForEmail(email: string, _options?: Record<string, unknown>) {
        passwordResetEmails.push(email);
        return nextResult ?? { error: null };
      },
      async updateUser(_payload?: Record<string, unknown>) {
        return nextResult ?? { error: null };
      },
      async signOut() {
        return { error: null };
      },
    },
  };
}
