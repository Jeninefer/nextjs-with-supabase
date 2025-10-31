import { Hero } from "@/components/hero";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";

/**
 * Renders the page hero and contextual "Next steps" content for onboarding.
 *
 * @returns A React element containing the Hero and a main section that shows `SignUpUserSteps` when required environment variables are present, otherwise `ConnectSupabaseSteps`.
 */
export default function Index() {
  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">Next steps</h2>
        {hasEnvVars() ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
      </main>
    </>
  );
}