import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

/**
 * Renders a compact status control prompting configuration of Supabase credentials.
 *
 * Displays an outlined badge reading "Configure Supabase credentials" alongside two small,
 * disabled buttons: "Check connection" (outline) and "Run smoke test" (default).
 *
 * @returns A React element containing the badge and the two disabled buttons
 */
export function EnvVarWarning() {
  return (
    <div className="flex gap-4 items-center">
      <Badge variant={"outline"} className="font-normal">
        Supabase environment variables required
      </Badge>
      <div className="flex gap-2">
        <Button size="sm" variant={"outline"} disabled>
          Sign in
        </Button>
        <Button size="sm" variant={"default"} disabled>
          Sign up
        </Button>
      </div>
    </div>
  );
}
