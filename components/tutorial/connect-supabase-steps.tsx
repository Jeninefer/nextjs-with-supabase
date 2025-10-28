export function ConnectSupabaseSteps() {
  return (
    <div className="flex flex-col gap-4 bg-slate-900/60 border border-purple-500/20 rounded-xl p-6 text-sm text-purple-100">
      <h3 className="text-lg font-semibold text-white font-['Lato']">Connect to Supabase</h3>
      <ol className="list-decimal list-inside space-y-2 font-['Poppins']">
        <li>
          In the Supabase dashboard, create a project and enable the <strong>financial_metrics</strong> and
          <strong>portfolio_risk</strong> tables using the SQL in <code>supabase/</code>.
        </li>
        <li>
          Copy the project URL and anon key into <code>.env.local</code> as <code>NEXT_PUBLIC_SUPABASE_URL</code> and
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </li>
        <li>
          Restart the Next.js dev server so the new environment variables are loaded, then run
          <code>curl /api/test-supabase</code> to verify connectivity.
        </li>
        <li>
          Once the API responds with <em>ok: true</em>, return to this page — the operational checklist will switch to the
          user provisioning steps automatically.
        </li>
      </ol>
    </div>
  );
}
