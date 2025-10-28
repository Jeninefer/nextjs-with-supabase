export function SignUpUserSteps() {
  return (
    <div className="flex flex-col gap-4 bg-slate-900/60 border border-purple-500/20 rounded-xl p-6 text-sm text-purple-100">
      <h3 className="text-lg font-semibold text-white font-['Lato']">Provision platform operators</h3>
      <ol className="list-decimal list-inside space-y-2 font-['Poppins']">
        <li>
          Invite the treasury lead and credit risk manager via Supabase Auth with the <code>operations_admin</code> role.
        </li>
        <li>
          Run <code>npm run db:migrate</code> to ensure the <code>user_access_audit</code> and <code>portfolio_limits</code>
          tables are current.
        </li>
        <li>
          In the dashboard, confirm each new operator can load the financial analytics page without errors and that the AI
          insights card is populated.
        </li>
        <li>
          Document the onboarding in your change log and archive the deployment artefacts in the compliance SharePoint site.
        </li>
      </ol>
    </div>
  );
}
