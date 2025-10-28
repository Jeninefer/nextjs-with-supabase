export function ConnectSupabaseSteps() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-purple-500/10 bg-slate-900/40 p-6">
      <h3 className="text-lg font-semibold text-white">Configure production Supabase credentials</h3>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-purple-100/90">
        <li>Open your Supabase project &rarr; Settings &rarr; API.</li>
        <li>Copy the project URL and anon key.</li>
        <li>
          Create an <code>.env.local</code> file in the repository root with the following entries and restart the dev server:
          <pre className="mt-2 rounded bg-slate-950/70 p-3 text-xs text-purple-200/80">
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
          </pre>
        </li>
        <li>Run <code>npm run dev</code> and confirm the authentication flow works end-to-end.</li>
      </ol>
      <p className="text-xs text-purple-200/70">
        Need a checklist? Review <strong>SUPABASE_SETUP.md</strong> for regional settings, row level security policies, and webhook configuration.
      </p>
    </div>
  );
}
