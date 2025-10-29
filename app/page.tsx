import { Hero } from "@/components/hero";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";

const hasSupabaseConfiguration = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
);

export default function Index() {
    return (
        <>
            <Hero />
            <main className="flex-1 px-4">
                <h2 className="mb-4 text-xl font-medium">Next steps</h2>
                {hasSupabaseConfiguration ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
            </main>
        </>
    );
}
