import Link from "next/link";

import { Button } from "./ui/button";

const deployUrl =
  "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJeninefer%2Fnextjs-with-supabase&project-name=abaco-financial-intelligence&repository-name=abaco-financial-intelligence&demo-title=ABACO%20Financial%20Intelligence%20Platform&demo-description=Enterprise%20analytics%20for%20secured%20lending&demo-image=https%3A%2F%2Fraw.githubusercontent.com%2FJeninefer%2Fnextjs-with-supabase%2Fmain%2Fapp%2Fopengraph-image.png";

export function DeployButton() {
  return (
    <Link href={deployUrl} target="_blank" rel="noreferrer">
      <Button className="flex items-center gap-2" size="sm">
        <svg className="h-3 w-3" viewBox="0 0 76 65" fill="hsl(var(--background)/1)" xmlns="http://www.w3.org/2000/svg">
          <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="inherit" />
        </svg>
        <span>Deploy to Vercel</span>
      </Button>
    </Link>
  );
}
