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
});
