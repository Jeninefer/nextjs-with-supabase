export type PullRequestStatus = "open" | "closed";

export interface PullRequestRecord {
  number: number;
  title: string;
  assignees: string[];
  status: PullRequestStatus;
  duplicateOf?: number;
  closureReason?: string;
}

export interface CloseDuplicateOptions {
  aiIdentifiers?: string[];
}

export interface CloseDuplicateResult {
  /**
   * Updated pull request records with duplicate information applied.
   */
  updated: PullRequestRecord[];
  /**
   * Pull requests that were closed because they were duplicates assigned to AI assistants.
   */
  closed: PullRequestRecord[];
  /**
   * Summary information describing the deduplication outcome.
   */
  summary: {
    closedCount: number;
    deduplicatedTitles: string[];
  };
}

const DEFAULT_AI_IDENTIFIERS = ["chatgpt", "openai", "grok"];

const normalizeTitle = (title: string): string =>
  title
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const isAssignedToAi = (assignees: string[], aiIdentifiers: string[]): boolean =>
  assignees.some((assignee) => {
    const normalizedAssignee = assignee.toLowerCase();
    return aiIdentifiers.some((identifier) =>
      normalizedAssignee.includes(identifier)
    );
  });

const clonePullRequest = (pullRequest: PullRequestRecord): PullRequestRecord => ({
  ...pullRequest,
  assignees: [...pullRequest.assignees],
});

export const closeDuplicatePullRequests = (
  pullRequests: PullRequestRecord[],
  options: CloseDuplicateOptions = {}
): CloseDuplicateResult => {
  const aiIdentifiers = (options.aiIdentifiers ?? DEFAULT_AI_IDENTIFIERS)
    .map((identifier) => identifier.trim().toLowerCase())
    .filter((identifier) => identifier.length > 0);

  const updated = pullRequests.map(clonePullRequest);
  const closed: PullRequestRecord[] = [];
  const canonicalByTitle = new Map<string, PullRequestRecord>();

  const sortedByNumber = [...updated].sort((a, b) => a.number - b.number);

  for (const pullRequest of sortedByNumber) {
    const normalizedTitle = normalizeTitle(pullRequest.title);
    const canonical = canonicalByTitle.get(normalizedTitle);

    if (!canonical) {
      canonicalByTitle.set(normalizedTitle, pullRequest);
      continue;
    }

    if (!isAssignedToAi(pullRequest.assignees, aiIdentifiers)) {
      continue;
    }

    if (pullRequest.status !== "closed") {
      pullRequest.status = "closed";
    }

    if (pullRequest.duplicateOf === undefined) {
      pullRequest.duplicateOf = canonical.number;
    }

    if (!pullRequest.closureReason) {
      pullRequest.closureReason = "duplicate-ai-assignee";
    }

    closed.push(pullRequest);
  }

  const deduplicatedTitles = Array.from(
    new Set(closed.map((pullRequest) => normalizeTitle(pullRequest.title)))
  );

  return {
    updated,
    closed,
    summary: {
      closedCount: closed.length,
      deduplicatedTitles,
    },
  };
};

export { DEFAULT_AI_IDENTIFIERS };
