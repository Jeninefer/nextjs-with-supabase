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

  describe("Title normalization", () => {
    it("handles titles with different whitespace", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix  multiple   spaces",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix multiple spaces",
          assignees: ["chatgpt"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed.map((pr) => pr.number)).toEqual([101]);
      expect(closed[0].duplicateOf).toBe(100);
    });

    it("handles titles with leading and trailing whitespace", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "  Fix bug  ",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug",
          assignees: ["openai"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed.map((pr) => pr.number)).toEqual([101]);
      expect(closed[0].duplicateOf).toBe(100);
    });

    it("is case-insensitive when matching titles", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix Bug In Authentication",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "FIX BUG IN AUTHENTICATION",
          assignees: ["chatgpt"],
          status: "open",
        },
        {
          number: 102,
          title: "fix bug in authentication",
          assignees: ["grok"],
          status: "open",
        },
      ];

      const { closed, summary } = closeDuplicatePullRequests(pullRequests);

      expect(closed.map((pr) => pr.number)).toEqual([101, 102]);
      expect(summary.closedCount).toBe(2);
      expect(summary.deduplicatedTitles).toEqual(["fix bug in authentication"]);
    });

    it("handles titles with tabs and newlines", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix\ttab\nproblem",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix tab problem",
          assignees: ["chatgpt"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed.map((pr) => pr.number)).toEqual([101]);
    });
  });

  describe("AI identifier matching", () => {
    it("is case-insensitive when matching AI identifiers", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug",
          assignees: ["ChatGPT-Assistant"],
          status: "open",
        },
        {
          number: 102,
          title: "Fix bug",
          assignees: ["OPENAI-bot"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed.map((pr) => pr.number)).toEqual([101, 102]);
    });

    it("matches AI identifiers as substrings", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug",
          assignees: ["chatgpt-codex-connector"],
          status: "open",
        },
        {
          number: 102,
          title: "Fix bug",
          assignees: ["openai-release-bot"],
          status: "open",
        },
        {
          number: 103,
          title: "Fix bug",
          assignees: ["grok-assistant"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed.map((pr) => pr.number)).toEqual([101, 102, 103]);
    });

    it("handles multiple assignees where at least one is an AI", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug",
          assignees: ["user1", "user2"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug",
          assignees: ["user1", "chatgpt", "user2"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed.map((pr) => pr.number)).toEqual([101]);
    });

    it("handles empty assignees array", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug",
          assignees: [],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(0);
    });

    it("filters out empty AI identifiers", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug",
          assignees: ["testbot"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests, {
        aiIdentifiers: ["", "  ", "testbot", "  \t  "],
      });

      expect(closed.map((pr) => pr.number)).toEqual([101]);
    });

    it("trims whitespace from AI identifiers", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug",
          assignees: ["testbot"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests, {
        aiIdentifiers: ["  testbot  "],
      });

      expect(closed.map((pr) => pr.number)).toEqual([101]);
    });
  });

  describe("Multiple duplicates", () => {
    it("closes multiple duplicates of the same title", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug",
          assignees: ["chatgpt"],
          status: "open",
        },
        {
          number: 102,
          title: "Fix bug",
          assignees: ["openai"],
          status: "open",
        },
        {
          number: 103,
          title: "Fix bug",
          assignees: ["grok"],
          status: "open",
        },
      ];

      const { closed, summary } = closeDuplicatePullRequests(pullRequests);

      expect(closed.map((pr) => pr.number)).toEqual([101, 102, 103]);
      expect(summary.closedCount).toBe(3);
      expect(summary.deduplicatedTitles).toEqual(["fix bug"]);
      
      closed.forEach((pr) => {
        expect(pr.duplicateOf).toBe(100);
      });
    });

    it("handles multiple different duplicate title groups", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug A",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug A",
          assignees: ["chatgpt"],
          status: "open",
        },
        {
          number: 102,
          title: "Fix bug B",
          assignees: ["user2"],
          status: "open",
        },
        {
          number: 103,
          title: "Fix bug B",
          assignees: ["openai"],
          status: "open",
        },
      ];

      const { closed, summary } = closeDuplicatePullRequests(pullRequests);

      expect(closed.map((pr) => pr.number)).toEqual([101, 103]);
      expect(summary.closedCount).toBe(2);
      expect(summary.deduplicatedTitles).toContain("fix bug a");
      expect(summary.deduplicatedTitles).toContain("fix bug b");
      expect(summary.deduplicatedTitles).toHaveLength(2);
    });
  });

  describe("PR ordering and canonical selection", () => {
    it("uses the lowest PR number as canonical regardless of input order", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 105,
          title: "Fix bug",
          assignees: ["chatgpt"],
          status: "open",
        },
        {
          number: 102,
          title: "Fix bug",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 103,
          title: "Fix bug",
          assignees: ["openai"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed.map((pr) => pr.number).sort()).toEqual([103, 105]);
      closed.forEach((pr) => {
        expect(pr.duplicateOf).toBe(102);
      });
    });

    it("preserves non-AI duplicates as open and makes them canonical if they have lowest number", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 105,
          title: "Fix bug",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 102,
          title: "Fix bug",
          assignees: ["user2"],
          status: "open",
        },
        {
          number: 103,
          title: "Fix bug",
          assignees: ["chatgpt"],
          status: "open",
        },
      ];

      const { closed, updated } = closeDuplicatePullRequests(pullRequests);

      expect(closed.map((pr) => pr.number)).toEqual([103]);
      
      const pr102 = updated.find((pr) => pr.number === 102);
      const pr105 = updated.find((pr) => pr.number === 105);
      
      expect(pr102?.status).toBe("open");
      expect(pr102?.duplicateOf).toBeUndefined();
      expect(pr105?.status).toBe("open");
      expect(pr105?.duplicateOf).toBeUndefined();
    });
  });

  describe("Already closed PRs", () => {
    it("keeps already closed PRs closed even if they are not duplicates", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug",
          assignees: ["user1"],
          status: "closed",
        },
      ];

      const { updated } = closeDuplicatePullRequests(pullRequests);

      expect(updated[0].status).toBe("closed");
    });

    it("does not change status of already closed duplicates", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug",
          assignees: ["chatgpt"],
          status: "closed",
        },
      ];

      const { closed, updated } = closeDuplicatePullRequests(pullRequests);

      expect(closed.map((pr) => pr.number)).toEqual([101]);
      const pr101 = updated.find((pr) => pr.number === 101);
      expect(pr101?.status).toBe("closed");
      expect(pr101?.duplicateOf).toBe(100);
    });
  });

  describe("Existing metadata preservation", () => {
    it("does not overwrite existing duplicateOf field", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug",
          assignees: ["chatgpt"],
          status: "open",
          duplicateOf: 99,
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed[0].duplicateOf).toBe(99);
    });

    it("does not overwrite existing closureReason field", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug",
          assignees: ["chatgpt"],
          status: "open",
          closureReason: "manual-review",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed[0].closureReason).toBe("manual-review");
    });
  });

  describe("Edge cases", () => {
    it("handles empty pull request array", () => {
      const { updated, closed, summary } = closeDuplicatePullRequests([]);

      expect(updated).toEqual([]);
      expect(closed).toEqual([]);
      expect(summary.closedCount).toBe(0);
      expect(summary.deduplicatedTitles).toEqual([]);
    });

    it("handles single pull request", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug",
          assignees: ["chatgpt"],
          status: "open",
        },
      ];

      const { updated, closed } = closeDuplicatePullRequests(pullRequests);

      expect(updated).toHaveLength(1);
      expect(closed).toHaveLength(0);
      expect(updated[0].status).toBe("open");
      expect(updated[0].duplicateOf).toBeUndefined();
    });

    it("handles pull requests with no duplicates", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug A",
          assignees: ["chatgpt"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug B",
          assignees: ["openai"],
          status: "open",
        },
        {
          number: 102,
          title: "Fix bug C",
          assignees: ["grok"],
          status: "open",
        },
      ];

      const { closed, summary } = closeDuplicatePullRequests(pullRequests);

      expect(closed).toHaveLength(0);
      expect(summary.closedCount).toBe(0);
      expect(summary.deduplicatedTitles).toEqual([]);
    });

    it("handles empty options object", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug",
          assignees: ["chatgpt"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests, {});

      expect(closed.map((pr) => pr.number)).toEqual([101]);
    });

    it("handles undefined options", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug",
          assignees: ["chatgpt"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests, undefined);

      expect(closed.map((pr) => pr.number)).toEqual([101]);
    });

    it("handles empty aiIdentifiers array", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug",
          assignees: ["chatgpt"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests, {
        aiIdentifiers: [],
      });

      expect(closed).toHaveLength(0);
    });

    it("handles pull requests with empty titles", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "",
          assignees: ["chatgpt"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed.map((pr) => pr.number)).toEqual([101]);
      expect(closed[0].duplicateOf).toBe(100);
    });

    it("handles pull requests with only whitespace titles", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "   ",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "  \t  ",
          assignees: ["chatgpt"],
          status: "open",
        },
      ];

      const { closed } = closeDuplicatePullRequests(pullRequests);

      expect(closed.map((pr) => pr.number)).toEqual([101]);
    });
  });

  describe("Result structure", () => {
    it("returns all three expected properties", () => {
      const result = closeDuplicatePullRequests([]);

      expect(result).toHaveProperty("updated");
      expect(result).toHaveProperty("closed");
      expect(result).toHaveProperty("summary");
      expect(result.summary).toHaveProperty("closedCount");
      expect(result.summary).toHaveProperty("deduplicatedTitles");
    });

    it("includes all PRs in updated array", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug A",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug B",
          assignees: ["chatgpt"],
          status: "open",
        },
      ];

      const { updated } = closeDuplicatePullRequests(pullRequests);

      expect(updated).toHaveLength(2);
      expect(updated.map((pr) => pr.number).sort()).toEqual([100, 101]);
    });

    it("deduplicates titles in summary", () => {
      const pullRequests: PullRequestRecord[] = [
        {
          number: 100,
          title: "Fix bug",
          assignees: ["user1"],
          status: "open",
        },
        {
          number: 101,
          title: "Fix bug",
          assignees: ["chatgpt"],
          status: "open",
        },
        {
          number: 102,
          title: "Fix bug",
          assignees: ["openai"],
          status: "open",
        },
      ];

      const { summary } = closeDuplicatePullRequests(pullRequests);

      expect(summary.deduplicatedTitles).toEqual(["fix bug"]);
      expect(summary.deduplicatedTitles).toHaveLength(1);
    });
  });
});

describe("DEFAULT_AI_IDENTIFIERS", () => {
  it("exports the default AI identifiers constant", () => {
    expect(DEFAULT_AI_IDENTIFIERS).toBeDefined();
    expect(Array.isArray(DEFAULT_AI_IDENTIFIERS)).toBe(true);
  });

  it("contains expected default identifiers", () => {
    expect(DEFAULT_AI_IDENTIFIERS).toContain("chatgpt");
    expect(DEFAULT_AI_IDENTIFIERS).toContain("openai");
    expect(DEFAULT_AI_IDENTIFIERS).toContain("grok");
  });

  it("has at least three default identifiers", () => {
    expect(DEFAULT_AI_IDENTIFIERS.length).toBeGreaterThanOrEqual(3);
  });

  it("contains only lowercase identifiers", () => {
    DEFAULT_AI_IDENTIFIERS.forEach((identifier) => {
      expect(identifier).toBe(identifier.toLowerCase());
    });
  });
});