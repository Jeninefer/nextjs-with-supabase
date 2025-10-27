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

  it("handles empty array input", () => {
    const { updated, closed, summary } = closeDuplicatePullRequests([]);

    expect(updated).toEqual([]);
    expect(closed).toEqual([]);
    expect(summary.closedCount).toBe(0);
    expect(summary.deduplicatedTitles).toEqual([]);
  });

  it("handles single pull request without duplicates", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Unique pull request",
        assignees: ["user1"],
        status: "open",
      },
    ];

    const { updated, closed, summary } = closeDuplicatePullRequests(pullRequests);

    expect(updated).toHaveLength(1);
    expect(closed).toHaveLength(0);
    expect(summary.closedCount).toBe(0);
    expect(updated[0].status).toBe("open");
    expect(updated[0].duplicateOf).toBeUndefined();
  });

  it("closes multiple duplicates of the same title", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug in authentication",
        assignees: ["human-dev"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix bug in authentication",
        assignees: ["chatgpt-bot"],
        status: "open",
      },
      {
        number: 102,
        title: "Fix bug in authentication",
        assignees: ["openai-assistant"],
        status: "open",
      },
      {
        number: 103,
        title: "Fix bug in authentication",
        assignees: ["grok-ai"],
        status: "open",
      },
    ];

    const { updated, closed, summary } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(3);
    expect(closed.map((pr) => pr.number)).toEqual([101, 102, 103]);
    expect(summary.closedCount).toBe(3);
    expect(summary.deduplicatedTitles).toEqual(["fix bug in authentication"]);

    const canonical = updated.find((pr) => pr.number === 100);
    expect(canonical?.status).toBe("open");
    expect(canonical?.duplicateOf).toBeUndefined();
  });

  it("normalizes titles with case sensitivity", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix Bug In Authentication",
        assignees: ["human-dev"],
        status: "open",
      },
      {
        number: 101,
        title: "fix bug in authentication",
        assignees: ["chatgpt-bot"],
        status: "open",
      },
      {
        number: 102,
        title: "FIX BUG IN AUTHENTICATION",
        assignees: ["openai-assistant"],
        status: "open",
      },
    ];

    const { closed, summary } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(2);
    expect(summary.closedCount).toBe(2);
    expect(closed.every((pr) => pr.duplicateOf === 100)).toBe(true);
  });

  it("normalizes titles with whitespace variations", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "  Fix   bug   in   auth  ",
        assignees: ["human-dev"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix bug in auth",
        assignees: ["chatgpt-bot"],
        status: "open",
      },
      {
        number: 102,
        title: "Fix\tbug\tin\tauth",
        assignees: ["openai-assistant"],
        status: "open",
      },
    ];

    const { closed, summary } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(2);
    expect(summary.closedCount).toBe(2);
  });

  it("handles multiple different titles with duplicates", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix authentication bug",
        assignees: ["human-dev"],
        status: "open",
      },
      {
        number: 101,
        title: "Update documentation",
        assignees: ["human-dev"],
        status: "open",
      },
      {
        number: 102,
        title: "Fix authentication bug",
        assignees: ["chatgpt-bot"],
        status: "open",
      },
      {
        number: 103,
        title: "Update documentation",
        assignees: ["openai-assistant"],
        status: "open",
      },
    ];

    const { closed, summary } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(2);
    expect(summary.closedCount).toBe(2);
    expect(summary.deduplicatedTitles).toHaveLength(2);
    expect(summary.deduplicatedTitles).toContain("fix authentication bug");
    expect(summary.deduplicatedTitles).toContain("update documentation");
  });

  it("selects the lowest numbered PR as canonical", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 105,
        title: "Same title",
        assignees: ["human-dev"],
        status: "open",
      },
      {
        number: 101,
        title: "Same title",
        assignees: ["human-dev"],
        status: "open",
      },
      {
        number: 103,
        title: "Same title",
        assignees: ["chatgpt-bot"],
        status: "open",
      },
    ];

    const { closed, updated } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(1);
    expect(closed[0].number).toBe(103);
    expect(closed[0].duplicateOf).toBe(101);

    const canonical = updated.find((pr) => pr.number === 101);
    expect(canonical?.status).toBe("open");
    expect(canonical?.duplicateOf).toBeUndefined();
  });

  it("does not close already closed duplicate PRs but includes them in results", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug",
        assignees: ["human-dev"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix bug",
        assignees: ["chatgpt-bot"],
        status: "closed",
      },
    ];

    const { closed, updated } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(1);
    expect(closed[0].number).toBe(101);

    const duplicate = updated.find((pr) => pr.number === 101);
    expect(duplicate?.status).toBe("closed");
    expect(duplicate?.duplicateOf).toBe(100);
  });

  it("preserves existing duplicateOf field if already set", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug",
        assignees: ["human-dev"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix bug",
        assignees: ["chatgpt-bot"],
        status: "open",
        duplicateOf: 99,
      },
    ];

    const { closed, updated } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(1);
    const duplicate = updated.find((pr) => pr.number === 101);
    expect(duplicate?.duplicateOf).toBe(99);
  });

  it("preserves existing closureReason if already set", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug",
        assignees: ["human-dev"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix bug",
        assignees: ["chatgpt-bot"],
        status: "open",
        closureReason: "manual-close",
      },
    ];

    const { closed, updated } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(1);
    const duplicate = updated.find((pr) => pr.number === 101);
    expect(duplicate?.closureReason).toBe("manual-close");
  });

  it("handles empty aiIdentifiers array gracefully", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug",
        assignees: ["human-dev"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix bug",
        assignees: ["chatgpt-bot"],
        status: "open",
      },
    ];

    const { closed, summary } = closeDuplicatePullRequests(pullRequests, {
      aiIdentifiers: [],
    });

    expect(closed).toHaveLength(0);
    expect(summary.closedCount).toBe(0);
  });

  it("handles aiIdentifiers with whitespace", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug",
        assignees: ["human-dev"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix bug",
        assignees: ["my-bot"],
        status: "open",
      },
    ];

    const { closed } = closeDuplicatePullRequests(pullRequests, {
      aiIdentifiers: ["  my-bot  ", "  another-bot  "],
    });

    expect(closed).toHaveLength(1);
    expect(closed[0].number).toBe(101);
  });

  it("filters out empty strings from aiIdentifiers", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug",
        assignees: ["human-dev"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix bug",
        assignees: ["chatgpt-bot"],
        status: "open",
      },
    ];

    const { closed } = closeDuplicatePullRequests(pullRequests, {
      aiIdentifiers: ["", "  ", "chatgpt"],
    });

    expect(closed).toHaveLength(1);
    expect(closed[0].number).toBe(101);
  });

  it("matches AI identifiers case-insensitively", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug",
        assignees: ["human-dev"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix bug",
        assignees: ["ChatGPT-Bot"],
        status: "open",
      },
      {
        number: 102,
        title: "Fix bug",
        assignees: ["OPENAI-Assistant"],
        status: "open",
      },
    ];

    const { closed } = closeDuplicatePullRequests(pullRequests, {
      aiIdentifiers: ["chatgpt", "openai"],
    });

    expect(closed).toHaveLength(2);
    expect(closed.map((pr) => pr.number)).toEqual([101, 102]);
  });

  it("matches AI identifiers as substrings", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug",
        assignees: ["human-dev"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix bug",
        assignees: ["my-chatgpt-bot-v2"],
        status: "open",
      },
      {
        number: 102,
        title: "Fix bug",
        assignees: ["super-openai-assistant"],
        status: "open",
      },
    ];

    const { closed } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(2);
    expect(closed.map((pr) => pr.number)).toEqual([101, 102]);
  });

  it("closes PR when any assignee matches AI identifier", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug",
        assignees: ["human-dev"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix bug",
        assignees: ["human1", "human2", "chatgpt-bot", "human3"],
        status: "open",
      },
    ];

    const { closed } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(1);
    expect(closed[0].number).toBe(101);
  });

  it("handles scenario with no duplicates", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix authentication",
        assignees: ["dev1"],
        status: "open",
      },
      {
        number: 101,
        title: "Update documentation",
        assignees: ["chatgpt-bot"],
        status: "open",
      },
      {
        number: 102,
        title: "Add new feature",
        assignees: ["openai-assistant"],
        status: "open",
      },
    ];

    const { updated, closed, summary } = closeDuplicatePullRequests(pullRequests);

    expect(updated).toHaveLength(3);
    expect(closed).toHaveLength(0);
    expect(summary.closedCount).toBe(0);
    expect(summary.deduplicatedTitles).toEqual([]);
    expect(updated.every((pr) => pr.status === "open")).toBe(true);
  });

  it("handles all PRs assigned to AI with different titles", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix authentication",
        assignees: ["chatgpt-bot"],
        status: "open",
      },
      {
        number: 101,
        title: "Update documentation",
        assignees: ["openai-assistant"],
        status: "open",
      },
      {
        number: 102,
        title: "Add new feature",
        assignees: ["grok-ai"],
        status: "open",
      },
    ];

    const { closed, summary } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(0);
    expect(summary.closedCount).toBe(0);
  });

  it("returns unique deduplicatedTitles even with multiple closures", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug",
        assignees: ["human"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix bug",
        assignees: ["chatgpt-1"],
        status: "open",
      },
      {
        number: 102,
        title: "Fix bug",
        assignees: ["chatgpt-2"],
        status: "open",
      },
      {
        number: 103,
        title: "Fix bug",
        assignees: ["chatgpt-3"],
        status: "open",
      },
    ];

    const { summary } = closeDuplicatePullRequests(pullRequests);

    expect(summary.closedCount).toBe(3);
    expect(summary.deduplicatedTitles).toEqual(["fix bug"]);
    expect(summary.deduplicatedTitles).toHaveLength(1);
  });

  it("maintains correct updated array length", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug",
        assignees: ["human"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix bug",
        assignees: ["chatgpt-bot"],
        status: "open",
      },
    ];

    const { updated } = closeDuplicatePullRequests(pullRequests);

    expect(updated).toHaveLength(pullRequests.length);
    expect(updated).toHaveLength(2);
  });

  it("handles titles with special characters", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix: Bug #123 @user [urgent]",
        assignees: ["human"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix: Bug #123 @user [urgent]",
        assignees: ["chatgpt-bot"],
        status: "open",
      },
    ];

    const { closed, summary } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(1);
    expect(summary.deduplicatedTitles).toEqual(["fix: bug #123 @user [urgent]"]);
  });

  it("handles very long titles", () => {
    const longTitle = "A".repeat(500);
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: longTitle,
        assignees: ["human"],
        status: "open",
      },
      {
        number: 101,
        title: longTitle,
        assignees: ["chatgpt-bot"],
        status: "open",
      },
    ];

    const { closed } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(1);
    expect(closed[0].number).toBe(101);
  });

  it("handles titles with only whitespace differences", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix\n\nbug",
        assignees: ["human"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix     bug",
        assignees: ["chatgpt-bot"],
        status: "open",
      },
    ];

    const { closed } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(1);
    expect(closed[0].duplicateOf).toBe(100);
  });

  it("verifies DEFAULT_AI_IDENTIFIERS constant is exported correctly", () => {
    expect(DEFAULT_AI_IDENTIFIERS).toBeDefined();
    expect(Array.isArray(DEFAULT_AI_IDENTIFIERS)).toBe(true);
    expect(DEFAULT_AI_IDENTIFIERS).toContain("chatgpt");
    expect(DEFAULT_AI_IDENTIFIERS).toContain("openai");
    expect(DEFAULT_AI_IDENTIFIERS).toContain("grok");
  });

  it("does not modify original input array references", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug",
        assignees: ["human"],
        status: "open",
      },
    ];

    const originalLength = pullRequests.length;
    const originalFirstPR = pullRequests[0];

    const { updated } = closeDuplicatePullRequests(pullRequests);

    expect(pullRequests.length).toBe(originalLength);
    expect(pullRequests[0]).toBe(originalFirstPR);
    expect(updated[0]).not.toBe(originalFirstPR);
  });

  it("handles mixed open and closed status PRs", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug",
        assignees: ["human"],
        status: "closed",
      },
      {
        number: 101,
        title: "Fix bug",
        assignees: ["chatgpt-bot"],
        status: "open",
      },
      {
        number: 102,
        title: "Fix bug",
        assignees: ["openai-bot"],
        status: "closed",
      },
    ];

    const { closed, summary } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(2);
    expect(summary.closedCount).toBe(2);
  });

  it("processes PRs in number order regardless of input order", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 105,
        title: "Fix bug",
        assignees: ["chatgpt-bot-3"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix bug",
        assignees: ["human"],
        status: "open",
      },
      {
        number: 103,
        title: "Fix bug",
        assignees: ["chatgpt-bot-2"],
        status: "open",
      },
    ];

    const { closed } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(2);
    expect(closed.every((pr) => pr.duplicateOf === 101)).toBe(true);
  });

  it("handles PR with empty assignees array", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug",
        assignees: ["human"],
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

  it("handles complex real-world scenario", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 95,
        title: "Update dependencies",
        assignees: ["dev-team"],
        status: "open",
      },
      {
        number: 96,
        title: "Fix authentication bug",
        assignees: ["senior-dev"],
        status: "open",
      },
      {
        number: 97,
        title: "UPDATE DEPENDENCIES",
        assignees: ["chatgpt-code-assistant"],
        status: "open",
      },
      {
        number: 98,
        title: "Add new API endpoint",
        assignees: ["api-team"],
        status: "open",
      },
      {
        number: 99,
        title: "Fix   authentication   bug",
        assignees: ["openai-coder"],
        status: "open",
      },
      {
        number: 100,
        title: "update dependencies",
        assignees: ["grok-assistant"],
        status: "open",
      },
    ];

    const { closed, summary, updated } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(3);
    expect(closed.map((pr) => pr.number)).toContain(97);
    expect(closed.map((pr) => pr.number)).toContain(99);
    expect(closed.map((pr) => pr.number)).toContain(100);
    expect(summary.closedCount).toBe(3);
    expect(summary.deduplicatedTitles).toHaveLength(2);
    expect(updated).toHaveLength(6);

    const canonical95 = updated.find((pr) => pr.number === 95);
    const canonical96 = updated.find((pr) => pr.number === 96);
    expect(canonical95?.status).toBe("open");
    expect(canonical96?.status).toBe("open");
  });

  it("verifies closureReason is set correctly on newly closed PRs", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug",
        assignees: ["human"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix bug",
        assignees: ["chatgpt-bot"],
        status: "open",
      },
    ];

    const { closed } = closeDuplicatePullRequests(pullRequests);

    expect(closed[0].closureReason).toBe("duplicate-ai-assignee");
  });

  it("handles undefined options parameter", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "Fix bug",
        assignees: ["human"],
        status: "open",
      },
      {
        number: 101,
        title: "Fix bug",
        assignees: ["chatgpt-bot"],
        status: "open",
      },
    ];

    const { closed } = closeDuplicatePullRequests(pullRequests, undefined);

    expect(closed).toHaveLength(1);
  });

  it("handles titles that are identical after normalization but different before", () => {
    const pullRequests: PullRequestRecord[] = [
      {
        number: 100,
        title: "   Title   With   Spaces   ",
        assignees: ["human"],
        status: "open",
      },
      {
        number: 101,
        title: "Title With Spaces",
        assignees: ["chatgpt-bot"],
        status: "open",
      },
      {
        number: 102,
        title: "TITLE WITH SPACES",
        assignees: ["openai-bot"],
        status: "open",
      },
    ];

    const { closed, summary } = closeDuplicatePullRequests(pullRequests);

    expect(closed).toHaveLength(2);
    expect(summary.closedCount).toBe(2);
    expect(summary.deduplicatedTitles).toEqual(["title with spaces"]);
  });

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

  it("matches AI identifiers as substrings when duplicates exist", () => {
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

  it("handles empty assignees array without closing the PR", () => {
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

  it("trims whitespace from AI identifiers before matching", () => {
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

  it("closes multiple duplicates of the same title across groups", () => {
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

  it("preserves non-AI duplicates as open if they have the lowest PR number", () => {
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

  it("handles single pull request without duplicates even when assigned to AI", () => {
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

  it("handles empty aiIdentifiers array without closing duplicates", () => {
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

  it("returns all expected properties from the result", () => {
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

describe("data/pull_requests.json validation", () => {
  it("validates the JSON structure", () => {
    const pullRequestsData = require("@/data/pull_requests.json");

    expect(Array.isArray(pullRequestsData)).toBe(true);
    expect(pullRequestsData.length).toBeGreaterThan(0);

    pullRequestsData.forEach((pr: any) => {
      expect(pr).toHaveProperty("number");
      expect(pr).toHaveProperty("title");
      expect(pr).toHaveProperty("assignees");
      expect(pr).toHaveProperty("status");

      expect(typeof pr.number).toBe("number");
      expect(typeof pr.title).toBe("string");
      expect(Array.isArray(pr.assignees)).toBe(true);
      expect(["open", "closed"]).toContain(pr.status);
    });
  });

  it("ensures all PR numbers are unique", () => {
    const pullRequestsData = require("@/data/pull_requests.json");
    const numbers = pullRequestsData.map((pr: any) => pr.number);
    const uniqueNumbers = new Set(numbers);

    expect(numbers.length).toBe(uniqueNumbers.size);
  });

  it("validates optional fields when present", () => {
    const pullRequestsData = require("@/data/pull_requests.json");

    pullRequestsData.forEach((pr: any) => {
      if (pr.duplicateOf !== undefined) {
        expect(typeof pr.duplicateOf).toBe("number");
      }
      if (pr.closureReason !== undefined) {
        expect(typeof pr.closureReason).toBe("string");
      }
    });
  });

  it("ensures closed PRs have proper closure information", () => {
    const pullRequestsData = require("@/data/pull_requests.json");
    const closedPRs = pullRequestsData.filter((pr: any) => pr.status === "closed");

    closedPRs.forEach((pr: any) => {
      if (pr.closureReason === "duplicate-ai-assignee") {
        expect(pr.duplicateOf).toBeDefined();
        expect(typeof pr.duplicateOf).toBe("number");
      }
    });
  });

  it("validates assignees array is not empty for open PRs", () => {
    const pullRequestsData = require("@/data/pull_requests.json");
    const openPRs = pullRequestsData.filter((pr: any) => pr.status === "open");

    openPRs.forEach((pr: any) => {
      expect(pr.assignees.length).toBeGreaterThan(0);
    });
  });

  it("ensures all assignees are strings", () => {
    const pullRequestsData = require("@/data/pull_requests.json");

    pullRequestsData.forEach((pr: any) => {
      pr.assignees.forEach((assignee: any) => {
        expect(typeof assignee).toBe("string");
        expect(assignee.length).toBeGreaterThan(0);
      });
    });
  });

  it("validates titles are non-empty strings", () => {
    const pullRequestsData = require("@/data/pull_requests.json");

    pullRequestsData.forEach((pr: any) => {
      expect(pr.title.length).toBeGreaterThan(0);
      expect(pr.title.trim().length).toBeGreaterThan(0);
    });
  });

  it("checks for expected structure after deduplication", () => {
    const pullRequestsData = require("@/data/pull_requests.json");
    const duplicatePRs = pullRequestsData.filter((pr: any) => pr.duplicateOf !== undefined);

    duplicatePRs.forEach((pr: any) => {
      const canonical = pullRequestsData.find((p: any) => p.number === pr.duplicateOf);
      expect(canonical).toBeDefined();
      if (canonical) {
        expect(canonical.number).toBeLessThan(pr.number);
      }
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
