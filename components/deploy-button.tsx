import Link from "next/link";
import { Button } from "./ui/button";

/**
 * Render a button that opens Vercel's "Create New Project" page with repository and demo metadata prefilled.
 *
 * @returns A React element (link-wrapped button) that opens the Vercel new project flow in a new tab for the configured repository and demo details.
 */
export function DeployButton() {
  return (
    <>
      <Link
        href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJeninefer%2Fnextjs-with-supabase&project-name=abaco-financial-intelligence&repository-name=abaco-financial-intelligence"
        target="_blank"
      >
        <Button className="flex items-center gap-2" size="sm">
          <svg
            className="h-3 w-3"
            viewBox="0 0 76 65"
            fill="hsl(var(--background)/1)"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="inherit" />
          </svg>
          <span>Deploy to Vercel</span>
        </Button>
      </Link>
    </>
  );
}
