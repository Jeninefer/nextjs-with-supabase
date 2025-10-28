import Link from "next/link";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export function EnvVarWarning() {
  return (
    <div className="flex flex-col gap-2 text-xs text-slate-200 md:flex-row md:items-center md:gap-4">
      <Badge variant="outline" className="font-normal uppercase tracking-wide">
        Environment audit required
      </Badge>
      <p className="leading-relaxed max-w-sm">
        Populate <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY</code> before enabling customer access.
      </p>
      <Button size="sm" variant="link" asChild>
        <Link href="https://github.com/Jeninefer/nextjs-with-supabase/blob/work/VERCEL_DEPLOY.md" target="_blank">
          View deployment checklist
        </Link>
      </Button>
    </div>
  );
}
