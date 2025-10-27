export type CommandName =
  | "supabase:start"
  | "supabase:stop"
  | "supabase:status"
  | "supabase:db-reset"
  | "supabase:studio"
  | "project:lint"
  | "project:build";

export interface CommandDefinition {
  id: CommandName;
  description: string;
  command: string;
  category: "supabase" | "project";
  requiresProjectPath?: boolean;
}

export interface CommandOptions {
  projectPath?: string;
  env?: Record<string, string>;
}

const COMMAND_REGISTRY: Record<CommandName, CommandDefinition> = {
  "supabase:start": {
    id: "supabase:start",
    description: "Start the local Supabase stack (Docker required).",
    command: "supabase start",
    category: "supabase",
    requiresProjectPath: true,
  },
  "supabase:stop": {
    id: "supabase:stop",
    description: "Stop the local Supabase stack and remove containers.",
    command: "supabase stop",
    category: "supabase",
    requiresProjectPath: true,
  },
  "supabase:status": {
    id: "supabase:status",
    description: "Show the status of the Supabase services.",
    command: "supabase status",
    category: "supabase",
    requiresProjectPath: true,
  },
  "supabase:db-reset": {
    id: "supabase:db-reset",
    description: "Reset the local Supabase database to a clean state.",
    command: "supabase db reset",
    category: "supabase",
    requiresProjectPath: true,
  },
  "supabase:studio": {
    id: "supabase:studio",
    description: "Open the Supabase Studio in the browser.",
    command: "supabase studio",
    category: "supabase",
    requiresProjectPath: true,
  },
  "project:lint": {
    id: "project:lint",
    description: "Run the Next.js lint command.",
    command: "npm run lint",
    category: "project",
  },
  "project:build": {
    id: "project:build",
    description: "Build the Next.js application for production.",
    command: "npm run build",
    category: "project",
  },
};

function shellEscape(value: string): string {
  if (/^[A-Za-z0-9_@%+=:,./-]+$/.test(value)) {
    return value;
  }
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

export function formatEnv(env?: Record<string, string>): string {
  if (!env || Object.keys(env).length === 0) {
    return "";
  }

  return Object.keys(env)
    .sort()
    .map((key) => `${key}=${shellEscape(env[key])}`)
    .join(" ");
}

export function getCommandDefinition(name: CommandName): CommandDefinition {
  const definition = COMMAND_REGISTRY[name];
  if (!definition) {
    throw new Error(`Unknown command: ${name}`);
  }
  return definition;
}

export function isCommandAvailable(name: CommandName, options: CommandOptions = {}): boolean {
  const definition = getCommandDefinition(name);
  if (!definition.requiresProjectPath) {
    return true;
  }
  return Boolean(options.projectPath && options.projectPath.trim().length > 0);
}

export function buildCommand(name: CommandName, options: CommandOptions = {}): string {
  const definition = getCommandDefinition(name);
  const envPrefix = formatEnv(options.env);
  const projectPrefix = options.projectPath ? `cd ${options.projectPath} && ` : "";

  const segments = [envPrefix, projectPrefix + definition.command].filter(Boolean);
  return segments.join(" ").trim();
}

export function listCommands(category?: CommandDefinition["category"]): CommandDefinition[] {
  return Object.values(COMMAND_REGISTRY)
    .filter((command) => (category ? command.category === category : true))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export const commands = {
  buildCommand,
  formatEnv,
  getCommandDefinition,
  isCommandAvailable,
  listCommands,
};
