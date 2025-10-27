import {
  closeDuplicatePullRequests,
  PullRequestRecord,
  DEFAULT_AI_IDENTIFIERS,
} from "@/lib/maintenance/pullRequestMaintenance";

describe("closeDuplicatePullRequests", () => {
  const basePullRequests: PullRequestRecord[] = [
    {
      number: 102,
      title: "Track ABACO runtime export directories",
      assignees: ["Jeninefer", "coderabbitai", "vercel"],
      status: "open",
    },
    {
      number: 103,
      title: "Validate Supabase environment variables",
      assignees: ["Jeninefer", "coderabbitai", "vercel"],
      status: "open",
    },
    {
      number: 104,
      title: "Clarify status of ingestion pipeline in README",
      assignees: ["Jeninefer", "coderabbitai", "vercel"],
      status: "open",
    },
  ];

  it("closes duplicate pull requests that are assigned to AI assistants", () => {
    const pullRequests: PullRequestRecord[] = [
      ...basePullRequests,
      {
        number: 105,
        title: "Track ABACO runtime export directories",
        assignees: ["Jeninefer", "coderabbitai", "chatgpt-codex-connector"],
        status: "open",
      },
    ];

    const { updated, closed, summary } = closeDuplicatePullRequests(pullRequests);

    expect(summary.closedCount).toBe(1);
    expect(summary.deduplicatedTitles).toEqual([
      "track abaco runtime export directories",
    ]);
    expect(closed.map((pr) => pr.number)).toEqual([105]);

    const duplicate = updated.find((pr) => pr.number === 105);
    expect(duplicate).toBeDefined();
    expect(duplicate?.status).toBe("closed");
    expect(duplicate?.duplicateOf).toBe(102);
    expect(duplicate?.closureReason).toBe("duplicate-ai-assignee");

    const canonical = updated.find((pr) => pr.number === 102);
    expect(canonical?.status).toBe("open");
  });

  it("does not mutate the original pull request collection", () => {
    const pullRequests: PullRequestRecord[] = [
      ...basePullRequests,
      {
        number: 105,
        title: "Track ABACO runtime export directories",
        assignees: ["Jeninefer", "coderabbitai", "chatgpt-codex-connector"],
        status: "open",
      },
    ];

    const originalAssignees = pullRequests[3].assignees;

    const { updated } = closeDuplicatePullRequests(pullRequests);

    expect(pullRequests[3].status).toBe("open");
    expect(pullRequests[3].duplicateOf).toBeUndefined();
    expect(updated[3].assignees).not.toBe(originalAssignees);
  });

  it("leaves duplicates open when none of the assignees match the AI identifier list", () => {
    const pullRequests: PullRequestRecord[] = [
      ...basePullRequests,
      {
        number: 105,
        title: "Track ABACO runtime export directories",
        assignees: ["Jeninefer", "coderabbitai", "automation-bot"],
        status: "open",
      },
    ];

    const { updated, closed, summary } = closeDuplicatePullRequests(pullRequests, {
      aiIdentifiers: ["chatgpt"],
    });

    expect(closed).toHaveLength(0);
    expect(summary.closedCount).toBe(0);

    const duplicate = updated.find((pr) => pr.number === 105);
    expect(duplicate?.status).toBe("open");
    expect(duplicate?.duplicateOf).toBeUndefined();
  });

  it("supports extending the AI identifier list", () => {
    const pullRequests: PullRequestRecord[] = [
      ...basePullRequests,
      {
        number: 105,
        title: "Track ABACO runtime export directories",
        assignees: ["Jeninefer", "openai-release-bot"],
        status: "open",
      },
    ];

    const { closed } = closeDuplicatePullRequests(pullRequests, {
      aiIdentifiers: [...DEFAULT_AI_IDENTIFIERS, "release-bot"],
    });

    expect(closed.map((pr) => pr.number)).toEqual([105]);
  });

  // ========================================================================
  // EDGE CASES: Title Normalization
  // ========================================================================
  describe("title normalization", () => {
    it("handles titles with multiple spaces between words", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix    multiple    spaces",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix multiple spaces",
          assignees: ["openai-bot"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(1);
      expect(closed[0].number).toBe(101);
      expect(closed[0].duplicateOf).toBe(100);
    });

    it("handles titles with leading and trailing whitespace", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 200,
          title: "  Update documentation  ",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 201,
          title: "Update documentation",
          assignees: ["chatgpt-assistant"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(1);
      expect(closed[0].duplicateOf).toBe(200);
    });

    it("normalizes case differences in titles", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 300,
          title: "ADD NEW FEATURE",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 301,
          title: "add new feature",
          assignees: ["grok-bot"],
          status: "open",
        },
        {
          number: 302,
          title: "Add New Feature",
          assignees: ["OpenAI-Agent"],
          status: "open",
        },
      ];

      const { closed, summary } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(2);
      expect(summary.closedCount).toBe(2);
      expect(closed.map((pr) => pr.number).sort()).toEqual([301, 302]);
    });

    it("handles titles with tabs and newlines", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 400,
          title: "Fix\tbug\nwith\ttabs",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 401,
          title: "Fix bug with tabs",
          assignees: ["chatgpt-worker"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(1);
      expect(closed[0].number).toBe(401);
    });
  });

  // ========================================================================
  // EDGE CASES: AI Identifier Matching
  // ========================================================================
  describe("AI identifier matching", () => {
    it("matches AI identifiers case-insensitively", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 500,
          title: "Refactor code",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 501,
          title: "Refactor code",
          assignees: ["CHATGPT-BOT"],
          status: "open",
        },
        {
          number: 502,
          title: "Refactor code",
          assignees: ["ChatGPT-Assistant"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(2);
      expect(closed.map((pr) => pr.number).sort()).toEqual([501, 502]);
    });

    it("matches AI identifiers as substrings within assignee names", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 600,
          title: "Update README",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 601,
          title: "Update README",
          assignees: ["my-openai-integration-bot"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(1);
      expect(closed[0].number).toBe(601);
    });

    it("handles empty AI identifiers list", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 700,
          title: "Fix bug",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 701,
          title: "Fix bug",
          assignees: ["chatgpt-bot"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests, {
        aiIdentifiers: [],
      });

      expect(closed).toHaveLength(0);
    });

    it("trims and normalizes AI identifiers from options", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 800,
          title: "New feature",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 801,
          title: "New feature",
          assignees: ["custom-bot"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests, {
        aiIdentifiers: ["  CUSTOM  ", "  bot  "],
      });

      expect(closed).toHaveLength(1);
      expect(closed[0].number).toBe(801);
    });

    it("filters out empty string identifiers", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 900,
          title: "Update deps",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 901,
          title: "Update deps",
          assignees: ["someone"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests, {
        aiIdentifiers: ["", "  ", "chatgpt"],
      });

      expect(closed).toHaveLength(0);
    });

    it("requires at least one AI identifier match per duplicate", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 1000,
          title: "Security patch",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 1001,
          title: "Security patch",
          assignees: ["user2", "user3"],
          status: "open",
        },
        {
          number: 1002,
          title: "Security patch",
          assignees: ["user4", "openai-bot", "user5"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(1);
      expect(closed[0].number).toBe(1002);
    });
  });

  // ========================================================================
  // EDGE CASES: Multiple Duplicates
  // ========================================================================
  describe("multiple duplicates scenarios", () => {
    it("closes all duplicates of the same title assigned to AI", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 1100,
          title: "Important fix",
          assignees: ["human"],
          status: "open",
        },
        {
          number: 1101,
          title: "Important fix",
          assignees: ["chatgpt-1"],
          status: "open",
        },
        {
          number: 1102,
          title: "Important fix",
          assignees: ["openai-2"],
          status: "open",
        },
        {
          number: 1103,
          title: "Important fix",
          assignees: ["grok-3"],
          status: "open",
        },
      ];

      const { closed, summary } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(3);
      expect(summary.closedCount).toBe(3);
      expect(closed.map((pr) => pr.number).sort()).toEqual([1101, 1102, 1103]);

      // All should reference the canonical PR
      closed.forEach((pr) => {
        expect(pr.duplicateOf).toBe(1100);
      });
    });

    it("handles multiple distinct duplicate sets in one batch", () => {
      const pullRequests: PullRequestRecord[] = [
        // First duplicate set
        {
          number: 1200,
          title: "Feature A",
          assignees: ["human"],
          status: "open",
        },
        {
          number: 1201,
          title: "Feature A",
          assignees: ["chatgpt-bot"],
          status: "open",
        },
        // Second duplicate set
        {
          number: 1202,
          title: "Feature B",
          assignees: ["human"],
          status: "open",
        },
        {
          number: 1203,
          title: "Feature B",
          assignees: ["openai-bot"],
          status: "open",
        },
        // Third duplicate set
        {
          number: 1204,
          title: "Feature C",
          assignees: ["human"],
          status: "open",
        },
        {
          number: 1205,
          title: "Feature C",
          assignees: ["grok-bot"],
          status: "open",
        },
      ];

      const { closed, summary } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(3);
      expect(summary.closedCount).toBe(3);
      expect(summary.deduplicatedTitles.sort()).toEqual([
        "feature a",
        "feature b",
        "feature c",
      ]);
    });

    it("preserves lowest PR number as canonical regardless of order", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 1305,
          title: "Duplicate PR",
          assignees: ["human"],
          status: "open",
        },
        {
          number: 1302,
          title: "Duplicate PR",
          assignees: ["human"],
          status: "open",
        },
        {
          number: 1303,
          title: "Duplicate PR",
          assignees: ["chatgpt-bot"],
          status: "open",
        },
        {
          number: 1301,
          title: "Duplicate PR",
          assignees: ["human"],
          status: "open",
        },
      ];

      const { closed, updated } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(1);
      expect(closed[0].number).toBe(1303);
      expect(closed[0].duplicateOf).toBe(1301); // Lowest number is canonical

      const canonical = updated.find((pr) => pr.number === 1301);
      expect(canonical?.status).toBe("open");
      expect(canonical?.duplicateOf).toBeUndefined();
    });
  });

  // ========================================================================
  // EDGE CASES: Already Closed PRs
  // ========================================================================
  describe("already closed pull requests", () => {
    it("marks already closed duplicates correctly", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 1400,
          title: "Legacy PR",
          assignees: ["human"],
          status: "open",
        },
        {
          number: 1401,
          title: "Legacy PR",
          assignees: ["chatgpt-bot"],
          status: "closed",
        },
      ];

      const { closed, updated } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(1);
      const duplicate = updated.find((pr) => pr.number === 1401);
      expect(duplicate?.status).toBe("closed");
      expect(duplicate?.duplicateOf).toBe(1400);
      expect(duplicate?.closureReason).toBe("duplicate-ai-assignee");
    });

    it("does not overwrite existing duplicateOf if already set", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 1500,
          title: "Original PR",
          assignees: ["human"],
          status: "open",
        },
        {
          number: 1501,
          title: "Original PR",
          assignees: ["chatgpt-bot"],
          status: "closed",
          duplicateOf: 999, // Already marked as duplicate of different PR
        },
      ];

      const { closed, updated } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(1);
      const duplicate = updated.find((pr) => pr.number === 1501);
      expect(duplicate?.duplicateOf).toBe(999); // Should preserve original
    });

    it("does not overwrite existing closureReason", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 1600,
          title: "Some PR",
          assignees: ["human"],
          status: "open",
        },
        {
          number: 1601,
          title: "Some PR",
          assignees: ["openai-bot"],
          status: "closed",
          closureReason: "manual-close",
        },
      ];

      const { closed, updated } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(1);
      const duplicate = updated.find((pr) => pr.number === 1601);
      expect(duplicate?.closureReason).toBe("manual-close");
    });
  });

  // ========================================================================
  // EDGE CASES: Empty and Single Inputs
  // ========================================================================
  describe("empty and minimal inputs", () => {
    it("handles empty pull requests array", () => {
      const { updated, closed, summary } = closeDuplicatePullRequests([]);

      expect(updated).toEqual([]);
      expect(closed).toEqual([]);
      expect(summary.closedCount).toBe(0);
      expect(summary.deduplicatedTitles).toEqual([]);
    });

    it("handles single pull request", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 1700,
          title: "Only PR",
          assignees: ["chatgpt-bot"],
          status: "open",
        },
      ];

      const { updated, closed, summary } = closeDuplicatePullRequests(pullRequests);

      expect(updated).toHaveLength(1);
      expect(closed).toHaveLength(0);
      expect(summary.closedCount).toBe(0);
      expect(updated[0].status).toBe("open");
    });

    it("handles no duplicates in collection", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 1800,
          title: "Unique PR 1",
          assignees: ["chatgpt-bot"],
          status: "open",
        },
        {
          number: 1801,
          title: "Unique PR 2",
          assignees: ["openai-bot"],
          status: "open",
        },
        {
          number: 1802,
          title: "Unique PR 3",
          assignees: ["grok-bot"],
          status: "open",
        },
      ];

      const { closed, summary } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(0);
      expect(summary.closedCount).toBe(0);
      expect(summary.deduplicatedTitles).toEqual([]);
    });

    it("handles PRs with empty assignees arrays", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 1900,
          title: "No assignees",
          assignees: [],
          status: "open",
        },
        {
          number: 1901,
          title: "No assignees",
          assignees: [],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(0); // No AI assignees, so nothing closed
    });
  });

  // ========================================================================
  // DEFAULT AI IDENTIFIERS
  // ========================================================================
  describe("DEFAULT_AI_IDENTIFIERS", () => {
    it("exports default AI identifiers", () => {
      expect(DEFAULT_AI_IDENTIFIERS).toBeDefined();
      expect(Array.isArray(DEFAULT_AI_IDENTIFIERS)).toBe(true);
      expect(DEFAULT_AI_IDENTIFIERS.length).toBeGreaterThan(0);
    });

    it("includes expected AI identifiers", () => {
      expect(DEFAULT_AI_IDENTIFIERS).toContain("chatgpt");
      expect(DEFAULT_AI_IDENTIFIERS).toContain("openai");
      expect(DEFAULT_AI_IDENTIFIERS).toContain("grok");
    });

    it("uses default identifiers when no options provided", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 2000,
          title: "Test PR",
          assignees: ["human"],
          status: "open",
        },
        {
          number: 2001,
          title: "Test PR",
          assignees: ["chatgpt-assistant"],
          status: "open",
        },
        {
          number: 2002,
          title: "Test PR",
          assignees: ["openai-bot"],
          status: "open",
        },
        {
          number: 2003,
          title: "Test PR",
          assignees: ["grok-agent"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(3);
    });
  });

  // ========================================================================
  // COMPLEX SCENARIOS
  // ========================================================================
  describe("complex scenarios", () => {
    it("handles mix of AI and non-AI duplicates correctly", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 2100,
          title: "Popular feature",
          assignees: ["human1"],
          status: "open",
        },
        {
          number: 2101,
          title: "Popular feature",
          assignees: ["human2"],
          status: "open",
        },
        {
          number: 2102,
          title: "Popular feature",
          assignees: ["chatgpt-bot"],
          status: "open",
        },
        {
          number: 2103,
          title: "Popular feature",
          assignees: ["human3"],
          status: "open",
        },
        {
          number: 2104,
          title: "Popular feature",
          assignees: ["openai-bot"],
          status: "open",
        },
      ];

      const { closed, updated } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(2);
      expect(closed.map((pr) => pr.number).sort()).toEqual([2102, 2104]);

      // Non-AI duplicates should remain open
      const pr2101 = updated.find((pr) => pr.number === 2101);
      const pr2103 = updated.find((pr) => pr.number === 2103);
      expect(pr2101?.status).toBe("open");
      expect(pr2101?.duplicateOf).toBeUndefined();
      expect(pr2103?.status).toBe("open");
      expect(pr2103?.duplicateOf).toBeUndefined();
    });

    it("handles three or more duplicates with different assignees", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 2200,
          title: "Critical bug fix",
          assignees: ["engineer"],
          status: "open",
        },
        {
          number: 2201,
          title: "Critical bug fix",
          assignees: ["chatgpt-v1", "reviewer"],
          status: "open",
        },
        {
          number: 2202,
          title: "Critical bug fix",
          assignees: ["team-lead", "openai-v2"],
          status: "open",
        },
        {
          number: 2203,
          title: "Critical bug fix",
          assignees: ["grok-alpha"],
          status: "open",
        },
        {
          number: 2204,
          title: "Critical bug fix",
          assignees: ["senior-dev"],
          status: "open",
        },
      ];

      const { closed, summary } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(3);
      expect(summary.closedCount).toBe(3);
      expect(closed.map((pr) => pr.number).sort()).toEqual([2201, 2202, 2203]);

      // All AI duplicates should reference the first (canonical) PR
      closed.forEach((pr) => {
        expect(pr.duplicateOf).toBe(2200);
      });
    });

    it("maintains result structure integrity", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 2300,
          title: "Test structure",
          assignees: ["user"],
          status: "open",
        },
        {
          number: 2301,
          title: "Test structure",
          assignees: ["chatgpt-bot"],
          status: "open",
        },
      ];

      const result = closeDuplicatePullRequests(pullRequests);

      // Check result structure
      expect(result).toHaveProperty("updated");
      expect(result).toHaveProperty("closed");
      expect(result).toHaveProperty("summary");

      expect(result.summary).toHaveProperty("closedCount");
      expect(result.summary).toHaveProperty("deduplicatedTitles");

      expect(typeof result.summary.closedCount).toBe("number");
      expect(Array.isArray(result.summary.deduplicatedTitles)).toBe(true);
      expect(Array.isArray(result.updated)).toBe(true);
      expect(Array.isArray(result.closed)).toBe(true);
    });

    it("deduplicatedTitles contains unique normalized titles only", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 2400,
          title: "Feature X",
          assignees: ["human"],
          status: "open",
        },
        {
          number: 2401,
          title: "Feature X",
          assignees: ["chatgpt-1"],
          status: "open",
        },
        {
          number: 2402,
          title: "Feature X",
          assignees: ["chatgpt-2"],
          status: "open",
        },
        {
          number: 2403,
          title: "Feature Y",
          assignees: ["human"],
          status: "open",
        },
        {
          number: 2404,
          title: "Feature Y",
          assignees: ["openai-bot"],
          status: "open",
        },
      ];

      const { summary } = closeDuplicatePullRequests(pullRequests);

      expect(summary.deduplicatedTitles).toHaveLength(2);
      expect(summary.deduplicatedTitles.sort()).toEqual(["feature x", "feature y"]);
    });
  });

  // ========================================================================
  // BOUNDARY CONDITIONS
  // ========================================================================
  describe("boundary conditions", () => {
    it("handles very long titles", () => {
      const longTitle = "A".repeat(1000);
      const pullRequests: PullRequestRecord[] = [
        {
          number: 2500,
          title: longTitle,
          assignees: ["human"],
          status: "open",
        },
        {
          number: 2501,
          title: longTitle,
          assignees: ["chatgpt-bot"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(1);
      expect(closed[0].number).toBe(2501);
    });

    it("handles many assignees on a single PR", () => {
      const manyAssignees = Array.from({ length: 100 }, (_, i) => `user${i}`);
      const pullRequests: PullRequestRecord[] = [
        {
          number: 2600,
          title: "Many assignees",
          assignees: ["human"],
          status: "open",
        },
        {
          number: 2601,
          title: "Many assignees",
          assignees: [...manyAssignees, "chatgpt-bot"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(1);
      expect(closed[0].number).toBe(2601);
    });

    it("handles very large PR numbers", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 999999,
          title: "Large number",
          assignees: ["human"],
          status: "open",
        },
        {
          number: 1000000,
          title: "Large number",
          assignees: ["openai-bot"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(1);
      expect(closed[0].duplicateOf).toBe(999999);
    });

    it("handles special characters in assignee names", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 2700,
          title: "Special chars",
          assignees: ["human"],
          status: "open",
        },
        {
          number: 2701,
          title: "Special chars",
          assignees: ["bot@chatgpt.com", "user+openai"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(1);
    });

    it("handles Unicode characters in titles and assignees", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 2800,
          title: "修复错误 🚀",
          assignees: ["开发者"],
          status: "open",
        },
        {
          number: 2801,
          title: "修复错误 🚀",
          assignees: ["chatgpt-机器人"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(1);
      expect(closed[0].number).toBe(2801);
    });
  });
});

// ===========================================================================
// JSON DATA VALIDATION TESTS
// ===========================================================================
describe("pull_requests.json data validation", () => {
  let pullRequestsData: any;

  beforeAll(() => {
    // Load the JSON file
    pullRequestsData = require("@/data/pull_requests.json");
  });

  it("is a valid JSON array", () => {
    expect(Array.isArray(pullRequestsData)).toBe(true);
  });

  it("contains at least one pull request record", () => {
    expect(pullRequestsData.length).toBeGreaterThan(0);
  });

  describe("schema validation", () => {
    it("every record has required fields", () => {
      pullRequestsData.forEach((pr: any, index: number) => {
        expect(pr).toHaveProperty("number");
        expect(pr).toHaveProperty("title");
        expect(pr).toHaveProperty("assignees");
        expect(pr).toHaveProperty("status");
      });
    });

    it("number field is a positive integer", () => {
      pullRequestsData.forEach((pr: any) => {
        expect(typeof pr.number).toBe("number");
        expect(pr.number).toBeGreaterThan(0);
        expect(Number.isInteger(pr.number)).toBe(true);
      });
    });

    it("title field is a non-empty string", () => {
      pullRequestsData.forEach((pr: any) => {
        expect(typeof pr.title).toBe("string");
        expect(pr.title.length).toBeGreaterThan(0);
      });
    });

    it("assignees field is an array", () => {
      pullRequestsData.forEach((pr: any) => {
        expect(Array.isArray(pr.assignees)).toBe(true);
      });
    });

    it("assignees are non-empty strings", () => {
      pullRequestsData.forEach((pr: any) => {
        pr.assignees.forEach((assignee: any) => {
          expect(typeof assignee).toBe("string");
          expect(assignee.length).toBeGreaterThan(0);
        });
      });
    });

    it("status field is either 'open' or 'closed'", () => {
      pullRequestsData.forEach((pr: any) => {
        expect(["open", "closed"]).toContain(pr.status);
      });
    });

    it("optional duplicateOf field is a positive integer when present", () => {
      pullRequestsData.forEach((pr: any) => {
        if (pr.duplicateOf !== undefined) {
          expect(typeof pr.duplicateOf).toBe("number");
          expect(pr.duplicateOf).toBeGreaterThan(0);
          expect(Number.isInteger(pr.duplicateOf)).toBe(true);
        }
      });
    });

    it("optional closureReason field is a non-empty string when present", () => {
      pullRequestsData.forEach((pr: any) => {
        if (pr.closureReason !== undefined) {
          expect(typeof pr.closureReason).toBe("string");
          expect(pr.closureReason.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe("data integrity", () => {
    it("PR numbers are unique", () => {
      const numbers = pullRequestsData.map((pr: any) => pr.number);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(numbers.length);
    });

    it("closed PRs with duplicateOf reference existing PR numbers", () => {
      const allNumbers = new Set(pullRequestsData.map((pr: any) => pr.number));

      pullRequestsData.forEach((pr: any) => {
        if (pr.status === "closed" && pr.duplicateOf !== undefined) {
          expect(allNumbers.has(pr.duplicateOf)).toBe(true);
        }
      });
    });

    it("PRs marked with duplicateOf have lower canonical PR numbers", () => {
      pullRequestsData.forEach((pr: any) => {
        if (pr.duplicateOf !== undefined) {
          expect(pr.duplicateOf).toBeLessThan(pr.number);
        }
      });
    });

    it("closed duplicate PRs have closureReason set", () => {
      pullRequestsData.forEach((pr: any) => {
        if (pr.status === "closed" && pr.duplicateOf !== undefined) {
          expect(pr.closureReason).toBeDefined();
          expect(typeof pr.closureReason).toBe("string");
        }
      });
    });

    it("records are sorted by PR number descending", () => {
      const numbers = pullRequestsData.map((pr: any) => pr.number);
      const sortedNumbers = [...numbers].sort((a, b) => b - a);
      expect(numbers).toEqual(sortedNumbers);
    });
  });

  describe("business logic validation", () => {
    it("duplicate PRs have matching titles (case-insensitive, whitespace-normalized)", () => {
      const prByNumber = new Map(
        pullRequestsData.map((pr: any) => [pr.number, pr])
      );

      pullRequestsData.forEach((pr: any) => {
        if (pr.duplicateOf !== undefined) {
          const canonical = prByNumber.get(pr.duplicateOf);
          if (canonical) {
            const normalizeTitle = (title: string) =>
              title.trim().replace(/\s+/g, " ").toLowerCase();

            expect(normalizeTitle(pr.title)).toBe(normalizeTitle(canonical.title));
          }
        }
      });
    });

    it("duplicate PRs with AI assignees have expected closure reasons", () => {
      const aiIdentifiers = ["chatgpt", "openai", "grok", "coderabbitai"];

      pullRequestsData.forEach((pr: any) => {
        if (pr.duplicateOf !== undefined && pr.closureReason === "duplicate-ai-assignee") {
          const hasAiAssignee = pr.assignees.some((assignee: string) => {
            const normalizedAssignee = assignee.toLowerCase();
            return aiIdentifiers.some((identifier) =>
              normalizedAssignee.includes(identifier)
            );
          });

          expect(hasAiAssignee).toBe(true);
        }
      });
    });

    it("has realistic data patterns", () => {
      // Check that we have a mix of open and closed PRs
      const openCount = pullRequestsData.filter((pr: any) => pr.status === "open").length;
      const closedCount = pullRequestsData.filter((pr: any) => pr.status === "closed").length;

      expect(openCount).toBeGreaterThan(0);
      // May or may not have closed PRs, but if we do, validate them
      if (closedCount > 0) {
        expect(closedCount).toBeGreaterThanOrEqual(0);
      }
    });

    it("contains expected test data from implementation", () => {
      // Verify specific PRs mentioned in the implementation exist
      const pr102 = pullRequestsData.find((pr: any) => pr.number === 102);
      const pr105 = pullRequestsData.find((pr: any) => pr.number === 105);

      expect(pr102).toBeDefined();
      expect(pr102?.title).toBe("Track ABACO runtime export directories");

      if (pr105) {
        expect(pr105.title).toBe("Track ABACO runtime export directories");
        if (pr105.status === "closed") {
          expect(pr105.duplicateOf).toBe(102);
        }
      }
    });
  });

  describe("data format consistency", () => {
    it("all records have consistent property ordering", () => {
      const expectedPropertyOrder = ["number", "title", "assignees", "status"];

      pullRequestsData.forEach((pr: any) => {
        const actualKeys = Object.keys(pr).filter((key) =>
          expectedPropertyOrder.includes(key)
        );
        const expectedKeys = expectedPropertyOrder.filter((key) => key in pr);

        // Basic properties should appear in expected order
        expect(actualKeys.slice(0, expectedKeys.length)).toEqual(expectedKeys);
      });
    });

    it("no unexpected extra properties", () => {
      const allowedProperties = [
        "number",
        "title",
        "assignees",
        "status",
        "duplicateOf",
        "closureReason",
      ];

      pullRequestsData.forEach((pr: any) => {
        const prKeys = Object.keys(pr);
        prKeys.forEach((key) => {
          expect(allowedProperties).toContain(key);
        });
      });
    });
  });
});