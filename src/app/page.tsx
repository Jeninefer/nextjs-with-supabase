import { Hero } from "@/components/hero";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasSupabaseEnvVars } from "@/supabase/config";

export function HomePage({ hasConfiguredSupabase }: { hasConfiguredSupabase?: boolean } = {}) {
  const configured = hasConfiguredSupabase ?? hasSupabaseEnvVars();

  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">Next steps</h2>
        {configured ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
      </main>
    </>
  );
}

export default function Index() {
  return <HomePage />;
}
