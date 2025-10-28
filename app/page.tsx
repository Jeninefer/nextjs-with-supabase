import { Hero } from "@/components/hero";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";

export default function Index() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col gap-6 px-4 max-w-3xl mx-auto pb-12">
        <h2 className="font-medium text-xl mb-2 text-white/90">Operational checklist</h2>
        {supabaseConfigured ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
      </main>
    </>
  );
}
