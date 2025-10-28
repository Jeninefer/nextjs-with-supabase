import { TutorialStep } from "./tutorial-step";
import { CodeBlock } from "./code-block";

const sampleQuery = `select
  snapshot_date,
  total_customers,
  outstanding_balance,
  avg_days_past_due
from analytics_portfolio_overview
order by snapshot_date desc
limit 20;`.trim();

const rls = `alter table analytics_portfolio_overview enable row level security;
create policy "Allow analyst read access" on analytics_portfolio_overview
for select
to authenticated
using (true);`.trim();

const server = `import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('analytics_portfolio_overview')
    .select()
    .order('snapshot_date', { ascending: false })
    .limit(20)

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
`.trim();

const client = `'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Page() {
  const [portfolio, setPortfolio] = useState<any[] | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase
        .from('analytics_portfolio_overview')
        .select()
        .order('snapshot_date', { ascending: false })
        .limit(20)

      setPortfolio(data)
    }
    getData()
  }, [])

  return <pre>{JSON.stringify(portfolio, null, 2)}</pre>
}
`.trim();

export function FetchDataSteps() {
  return (
    <ol className="flex flex-col gap-6">
      <TutorialStep title="Inspect the governed analytics view">
        <p>
          Open the{" "}
          <a
            href="https://supabase.com/dashboard/project/_/editor"
            className="font-bold hover:underline text-foreground/80"
            target="_blank"
            rel="noreferrer"
          >
            Table Editor
          </a>{" "}
          for your Supabase project and confirm that the
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            analytics_portfolio_overview
          </code>
          view is populated.  Run the production validation query below in the{" "}
          <a
            href="https://supabase.com/dashboard/project/_/sql/new"
            className="font-bold hover:underline text-foreground/80"
            target="_blank"
            rel="noreferrer"
          >
            SQL Editor
          </a>{" "}
          and verify that the most recent snapshot_date matches the nightly ETL
          run.
        </p>
        <CodeBlock code={sampleQuery} />
      </TutorialStep>

      <TutorialStep title="Enable Row Level Security (RLS)">
        <p>
          Supabase enables Row Level Security (RLS) by default.  Grant read
          access to the analytics team by creating the policy below in the{" "}
          <a
            href="https://supabase.com/dashboard/project/_/sql/new"
            className="font-bold hover:underline text-foreground/80"
            target="_blank"
            rel="noreferrer"
          >
            SQL Editor
          </a>
          .  This matches the production deployment policy.
        </p>
        <CodeBlock code={rls} />
        <p>
          Review the{" "}
          <a
            href="https://supabase.com/docs/guides/auth/row-level-security"
            className="font-bold hover:underline text-foreground/80"
            target="_blank"
            rel="noreferrer"
          >
            Supabase documentation
          </a>{" "}
          for advanced authorization patterns.
        </p>
      </TutorialStep>

      <TutorialStep title="Query Supabase data from Next.js">
        <p>
          To create a Supabase client and query production data from an Async
          Server Component, create a new page.tsx file at{" "}
          <span className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-medium text-secondary-foreground border">
            /app/portfolio/page.tsx
          </span>{" "}
          and add the following.
        </p>
        <CodeBlock code={server} />
        <p>Alternatively, you can use a Client Component.</p>
        <CodeBlock code={client} />
      </TutorialStep>

      <TutorialStep title="Explore the Supabase UI Library">
        <p>
          Head over to the{" "}
          <a
            href="https://supabase.com/ui"
            className="font-bold hover:underline text-foreground/80"
          >
            Supabase UI library
          </a>{" "}
          and install the blocks that match your ABACO workflows.  For instance,
          add the Realtime Chat block by running:
        </p>
        <CodeBlock
          code={
            "npx shadcn@latest add https://supabase.com/ui/r/realtime-chat-nextjs.json"
          }
        />
      </TutorialStep>

      <TutorialStep title="Build in a weekend and scale to millions!">
        <p>You&apos;re ready to launch your product to the world! 🚀</p>
      </TutorialStep>
    </ol>
  );
}
