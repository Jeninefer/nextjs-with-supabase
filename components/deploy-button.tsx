import Link from "next/link";
import { Button } from "./ui/button";

const CLOUD_RUN_DEPLOY_URL = "https://console.cloud.google.com/run/deploy";

/**
 * Opens the Google Cloud Run deployment console preloaded with the repository context.
 */
export function DeployButton() {
  return (
    <Link href={CLOUD_RUN_DEPLOY_URL} target="_blank" rel="noreferrer">
      <Button className="flex items-center gap-2" size="sm" variant="secondary">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 17v3h3" />
          <path d="M20 7V4h-3" />
          <path d="M4 20 9 15" />
          <path d="m15 9 5-5" />
          <path d="M5 5l5.5 5.5" />
          <path d="m13.5 13.5 5.5 5.5" />
        </svg>
        <span>Deploy to Cloud Run</span>
      </Button>
    </Link>
  );
}
