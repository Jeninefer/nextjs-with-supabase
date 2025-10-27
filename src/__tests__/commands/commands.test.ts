import { describe, expect, it } from "vitest";

import {
  buildCommand,
  formatEnv,
  getCommandDefinition,
  isCommandAvailable,
  listCommands,
} from "@/commands/commands";

describe("commands", () => {
  it("formats environment variables in a stable order", () => {
    expect(formatEnv({ B: "two", A: "one" })).toBe("A=one B=two");
    expect(formatEnv({ PATH: "/tmp/bin:/usr/bin" })).toBe("PATH='/tmp/bin:/usr/bin'");
  });

  it("builds commands with optional project path and environment", () => {
    const command = buildCommand("supabase:start", {
      projectPath: "/repo",
      env: { NODE_ENV: "development" },
    });
    expect(command).toBe("NODE_ENV=development cd /repo && supabase start");
  });

  it("exposes command definitions and availability information", () => {
    const definition = getCommandDefinition("project:build");
    expect(definition.command).toBe("npm run build");
    expect(isCommandAvailable("project:build")).toBe(true);
    expect(isCommandAvailable("supabase:start", { projectPath: "" })).toBe(false);
    expect(isCommandAvailable("supabase:start", { projectPath: "." })).toBe(true);
  });

  it("lists commands by category", () => {
    const supabaseCommands = listCommands("supabase");
    expect(supabaseCommands.every((command) => command.category === "supabase")).toBe(true);
    expect(() => getCommandDefinition("invalid" as never)).toThrow(/Unknown command/);
  });
});
