import {
  closeDuplicatePullRequests,
  DEFAULT_AI_IDENTIFIERS,
  type PullRequestRecord,
} from "@/lib/maintenance/pullRequestMaintenance";

describe("closeDuplicatePullRequests", () => {
  const basePullRequest = (overrides: Partial<PullRequestRecord>): PullRequestRecord => ({
    number: 1,
    title: "Example",
    assignees: ["human"],
    status: "open",
    ...overrides,
  });

  it("closes AI duplicates while keeping the human canonical", () => {
    const pullRequests: PullRequestRecord[] = [
      basePullRequest({ number: 101, title: "Fix login" }),
      basePullRequest({
        number: 102,
        title: "Fix login",
        assignees: ["chatgpt-helper"],
      }),
      basePullRequest({
        number: 103,
        title: "Fix login",
        assignees: ["openai-release-bot"],
      }),
    ];

    const { updated, closed, summary } = closeDuplicatePullRequests(pullRequests);

    expect(updated).toHaveLength(3);
    const canonical = updated.find((pr) => pr.number === 101);
    expect(canonical?.status).toBe("open");

    const closedNumbers = closed.map((pr) => pr.number).sort((a, b) => a - b);
    expect(closedNumbers).toEqual([102, 103]);
    expect(closed.every((pr) => pr.duplicateOf === 101)).toBe(true);
    expect(summary.closedCount).toBe(2);
    expect(summary.deduplicatedTitles).toEqual(["fix login"]);
  });

  it("treats human PRs as canonical when they appear after an AI PR", () => {
    const pullRequests: PullRequestRecord[] = [
      basePullRequest({
        number: 200,
        title: "Improve docs",
        assignees: ["grok"],
      }),
      basePullRequest({
        number: 201,
        title: "Improve docs",
        assignees: ["Human Maintainer"],
      }),
    ];

    const { updated, closed } = closeDuplicatePullRequests(pullRequests);

    const canonical = updated.find((pr) => pr.number === 201);
    expect(canonical?.status).toBe("open");

    const closedCanonical = closed.find((pr) => pr.number === 200);
    expect(closedCanonical?.status).toBe("closed");
    expect(closedCanonical?.duplicateOf).toBe(201);
  });

  it("avoids false positives using boundary-aware identifier matching", () => {
    const pullRequests: PullRequestRecord[] = [
      basePullRequest({ number: 10, title: "Update config" }),
      basePullRequest({
        number: 11,
        title: "Update config",
        assignees: ["grokowski"],
      }),
      basePullRequest({
        number: 12,
        title: "Update config",
        assignees: ["openai-release-bot"],
      }),
    ];

    const { closed } = closeDuplicatePullRequests(pullRequests);

    const closedNumbers = closed.map((pr) => pr.number).sort((a, b) => a - b);
    expect(closedNumbers).toEqual([12]);
  });

  it("supports custom AI identifier lists", () => {
    const pullRequests: PullRequestRecord[] = [
      basePullRequest({ number: 51, title: "Add feature" }),
      basePullRequest({
        number: 52,
        title: "Add feature",
        assignees: ["robot"],
      }),
    ];

    const { closed } = closeDuplicatePullRequests(pullRequests, {
      aiIdentifiers: ["robot"],
    });

    expect(closed.map((pr) => pr.number)).toEqual([52]);
  });

  it("normalizes titles when determining duplicates", () => {
    const pullRequests: PullRequestRecord[] = [
      basePullRequest({
        number: 31,
        title: "FiX   API",
      }),
      basePullRequest({
        number: 32,
        title: " fïx api \t",
        assignees: ["ChatGPT"],
      }),
    ];

    const { summary } = closeDuplicatePullRequests(pullRequests);

    expect(summary.deduplicatedTitles).toEqual(["fix api"]);
  });
});

describe("DEFAULT_AI_IDENTIFIERS", () => {
  it("exposes the default identifier list", () => {
    expect(DEFAULT_AI_IDENTIFIERS).toEqual(["chatgpt", "openai", "grok"]);
  });
});
