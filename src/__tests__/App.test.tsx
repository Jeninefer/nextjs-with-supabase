import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "@/App";

describe("App", () => {
  it("encourages the developer to configure Supabase when credentials are missing", () => {
    render(<App hasSupabaseConfig={false} />);
    expect(screen.queryByText(/Connect to Supabase/i)).not.toBeNull();
  });

  it("shows the success steps once Supabase is configured", () => {
    render(<App hasSupabaseConfig />);
    expect(screen.queryByText(/ABACO Platform Ready/i)).not.toBeNull();
  });
});
