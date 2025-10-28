import {
  DEFAULT_AI_IDENTIFIERS,
  closeDuplicatePullRequests,
  type CloseDuplicateResult,
  type PullRequestRecord,
} from "@/lib/maintenance/pullRequestMaintenance";
import pullRequestInventory from "@/data/pull_requests.json";

describe("closeDuplicatePullRequests", () => {
  it("closes AI-owned duplicates and annotates them with metadata", () => {
    const input: PullRequestRecord[] = [
      {
        number: 1,
        title: "Refine telemetry dashboards",
        status: "open",
        assignees: ["alice"],
      },
      {
        number: 2,
        title: "Refine telemetry dashboards",
        status: "open",
        assignees: ["chatgpt-preview"],
      },
      {
        number: 3,
        title: "Refine telemetry dashboards",
        status: "closed",
        assignees: ["openai-release"],
      },
    ];

    const original = JSON.parse(JSON.stringify(input));

    const result = closeDuplicatePullRequests(input);

    expect(result.closed).toHaveLength(2);
    expect(result.summary.closedCount).toBe(2);
    expect(result.summary.deduplicatedTitles).toEqual([
      "refine telemetry dashboards",
    ]);

    const duplicateNumbers = result.closed.map((pr) => pr.number).sort();
    expect(duplicateNumbers).toEqual([2, 3]);

    result.closed.forEach((pr) => {
      expect(pr.status).toBe("closed");
      expect(pr.duplicateOf).toBe(1);
      expect(pr.closureReason).toBe("duplicate-ai-assignee");
    });

    expect(result.updated[0].status).toBe("open");
    expect(result.updated[0].duplicateOf).toBeUndefined();

    // Ensure the original collection was not mutated.
    expect(input).toEqual(original);
  });

  it("prefers human-authored pull requests as canonicals", () => {
    const input: PullRequestRecord[] = [
      {
        number: 10,
        title: "Improve rate limiter",
        status: "open",
        assignees: ["chatgpt-codex-connector[bot]"],
      },
      {
        number: 11,
        title: "Improve rate limiter",
        status: "open",
        assignees: ["sarah"],
      },
    ];

    const { updated, closed, summary } = closeDuplicatePullRequests(input);

    expect(summary.closedCount).toBe(1);
    expect(closed[0].number).toBe(10);
    expect(closed[0].duplicateOf).toBe(11);

    const canonical = updated.find((pr) => pr.number === 11);
    expect(canonical?.status).toBe("open");
    expect(canonical?.duplicateOf).toBeUndefined();
  });

  it("uses boundary-aware matching to avoid false positives", () => {
    const input: PullRequestRecord[] = [
      {
        number: 20,
        title: "Update onboarding copy",
        status: "open",
        assignees: ["marketing"],
      },
      {
        number: 21,
        title: "Update onboarding copy",
        status: "open",
        assignees: ["megachatgptrelease"],
      },
      {
        number: 22,
        title: "Update onboarding copy",
        status: "open",
        assignees: ["chatgpt-release"],
      },
      {
        number: 23,
        title: "Update onboarding copy",
        status: "open",
        assignees: ["openai-team"],
      },
    ];

    const { closed } = closeDuplicatePullRequests(input);

    const closedNumbers = closed.map((pr) => pr.number).sort();
    expect(closedNumbers).toEqual([22, 23]);

    const unaffected = closedNumbers.includes(21);
    expect(unaffected).toBe(false);
  });

  it("supports custom identifier lists for extendability", () => {
    const input: PullRequestRecord[] = [
      {
        number: 30,
        title: "Refactor analytics pipeline",
        status: "open",
        assignees: ["kelly"],
      },
      {
        number: 31,
        title: "Refactor analytics pipeline",
        status: "open",
        assignees: ["internal-assistant"],
      },
    ];

    const { closed } = closeDuplicatePullRequests(input, {
      aiIdentifiers: [...DEFAULT_AI_IDENTIFIERS, "assistant"],
    });

    expect(closed).toHaveLength(1);
    expect(closed[0].number).toBe(31);
    expect(closed[0].duplicateOf).toBe(30);
  });

  it("invokes the onClose callback for each duplicate", () => {
    const input: PullRequestRecord[] = [
      {
        number: 40,
        title: "Synchronise billing hooks",
        status: "open",
        assignees: ["product"],
      },
      {
        number: 41,
        title: "Synchronise billing hooks",
        status: "open",
        assignees: ["grok-ops"],
      },
      {
        number: 42,
        title: "Synchronise billing hooks",
        status: "open",
        assignees: ["chatgpt-worker"],
      },
    ];

    const onClose = jest.fn();

    closeDuplicatePullRequests(input, { onClose });

    expect(onClose).toHaveBeenCalledTimes(2);
    const duplicateNumbers = onClose.mock.calls.map(([duplicate]) => duplicate.number);
    expect(duplicateNumbers.sort()).toEqual([41, 42]);
  });

  it("produces deterministic metadata for deduplicated titles", () => {
    const input: PullRequestRecord[] = [
      {
        number: 50,
        title: "   Harmonise API error responses   ",
        status: "open",
        assignees: ["lena"],
      },
      {
        number: 51,
        title: "Harmonise   API   error   responses",
        status: "open",
        assignees: ["chatgpt-release"],
      },
    ];

    const { summary } = closeDuplicatePullRequests(input);

    expect(summary.deduplicatedTitles).toEqual([
      "harmonise api error responses",
    ]);
  });
});

describe("pull request inventory", () => {
  it("remains internally consistent after running maintenance", () => {
    const inventory = pullRequestInventory as PullRequestRecord[];
    const result: CloseDuplicateResult = closeDuplicatePullRequests(inventory);

    expect(result.summary.closedCount).toBeGreaterThan(0);
    result.closed.forEach((pr) => {
      expect(pr.status).toBe("closed");
      expect(pr.duplicateOf).toBeDefined();
      expect(pr.closureReason).toBe("duplicate-ai-assignee");
    });

    result.summary.deduplicatedTitles.forEach((title) => {
      expect(title).toBe(title.trim());
    });
  });
});
