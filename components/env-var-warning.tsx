import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export function EnvVarWarning() {
  return (
    <div className="flex gap-4 items-center">
      <Badge variant={"outline"} className="font-normal">
        Configure Supabase credentials
      </Badge>
      <div className="flex gap-2">
        <Button size="sm" variant={"outline"} disabled>
          Check connection
        </Button>
        <Button size="sm" variant={"default"} disabled>
          Run smoke test
        </Button>
      </div>
    </div>
  );
}
