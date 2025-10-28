export function SignUpUserSteps() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-purple-500/10 bg-slate-900/40 p-6">
      <h3 className="text-lg font-semibold text-white">Provision your first operator</h3>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-purple-100/90">
        <li>Run <code>npm run dev</code> and open the app at <code>http://localhost:3000</code>.</li>
        <li>Use the sign-up form to create an operator account with your corporate email domain.</li>
        <li>Verify the confirmation email sent by Supabase and sign in.</li>
        <li>Assign <strong>admin</strong> role via Supabase Auth &rarr; Users to unlock analytics administration features.</li>
      </ol>
      <p className="text-xs text-purple-200/70">
        Continue with the <strong>ABACO_IMPLEMENTATION_SUMMARY.md</strong> milestone checklist to configure provider credentials, deploy to Cloud Run, and schedule the nightly ingestion job.
      </p>
    </div>
  );
}
