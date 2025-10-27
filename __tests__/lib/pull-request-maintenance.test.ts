import pullRequests from "../../data/pull_requests.json";
import {
  DEFAULT_AI_IDENTIFIERS,
  PullRequestRecord,
  closeDuplicatePullRequests,
  isAiOwnedPullRequest,
  isAssignedToAi,
  normalizeTitle,
} from "../../lib/maintenance/pullRequestMaintenance";

describe("normalizeTitle", () => {
  it("removes duplicate whitespace and diacritics for consistent comparisons", () => {
    expect(normalizeTitle("  Improve   search accuracy  ")).toBe("improve search accuracy");
    expect(normalizeTitle("Añadir informe de costos")).toBe("anadir informe de costos");
  });
});

describe("isAssignedToAi", () => {
  it("matches identifiers on token boundaries to avoid false positives", () => {
    expect(isAssignedToAi(["OpenAI Release Bot"], ["openai"])).toBe(true);
    expect(isAssignedToAi(["grokowski"], ["grok"])).toBe(false);
    expect(isAssignedToAi(["release-openai"], ["openai"])).toBe(true);
  });
});

describe("closeDuplicatePullRequests", () => {
  const sample = pullRequests as PullRequestRecord[];

  it("closes AI-owned duplicates and skips human-maintained pull requests by default", () => {
    const closures: Array<[number, number]> = [];
    const result = closeDuplicatePullRequests(sample, {
      onClose: (duplicate, canonical) => closures.push([duplicate.number, canonical.number]),
    });

    expect(result.canonicalByTitle["improve search accuracy"].number).toBe(101);
    expect(result.canonicalByTitle["anadir informe de costos"].number).toBe(201);

    const closedNumbers = result.closed.map(({ pullRequest }) => pullRequest.number);
    expect(closedNumbers).toContain(102);
    expect(closedNumbers).not.toContain(103);
    expect(result.skipped.map(({ number }) => number)).toEqual(expect.arrayContaining([103, 202, 302]));

    expect(closures).toContainEqual([102, 101]);
  });

  it("prefers open human-maintained pull requests when requested", () => {
    const result = closeDuplicatePullRequests(sample, {
      canonicalStrategy: "preferHuman",
    });

    expect(result.canonicalByTitle["fix nightly deployment"].number).toBe(402);
  });

  it("can select the earliest open pull request as the canonical entry", () => {
    const result = closeDuplicatePullRequests(sample, {
      canonicalStrategy: "earliestOpen",
    });

    expect(result.canonicalByTitle["fix nightly deployment"].number).toBe(402);
  });

  it("allows callers to extend AI identifiers for ownership detection", () => {
    const customIdentifiers = [...DEFAULT_AI_IDENTIFIERS, "qa-automation"];
    const result = closeDuplicatePullRequests(sample, {
      aiIdentifiers: customIdentifiers,
    });

    const closedNumbers = result.closed.map(({ pullRequest }) => pullRequest.number);
    expect(closedNumbers).toContain(302);
  });

  it("can close human-maintained duplicates when configured", () => {
    const result = closeDuplicatePullRequests(sample, {
      requireAiOwner: false,
    });

    const closure = result.closed.find(({ pullRequest }) => pullRequest.number === 103);
    expect(closure?.reason).toBe("duplicate detected via title normalisation");
  });

  it("does not mutate the original pull request records", () => {
    const snapshot = JSON.parse(JSON.stringify(sample));

    closeDuplicatePullRequests(sample);

    expect(sample).toEqual(snapshot);
  });
});

describe("isAiOwnedPullRequest", () => {
  it("treats authors with AI identifiers as automated", () => {
    const pr: PullRequestRecord = {
      number: 555,
      title: "Demo",
      state: "open",
      author: "ChatGPT Agent",
      assignees: [],
    };
    expect(isAiOwnedPullRequest(pr, DEFAULT_AI_IDENTIFIERS)).toBe(true);
  });

  it("ignores human contributors whose names merely contain AI-like substrings", () => {
    const pr: PullRequestRecord = {
      number: 556,
      title: "Demo",
      state: "open",
      author: "Maya Grokowski",
      assignees: ["Sam"],
    };

    expect(isAiOwnedPullRequest(pr, DEFAULT_AI_IDENTIFIERS)).toBe(false);
  });
});
