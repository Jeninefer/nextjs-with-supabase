export type PullRequestStatus = "open" | "closed";

export interface PullRequestRecord {
  number: number;
  title: string;
  assignees: string[];
  status: PullRequestStatus;
  duplicateOf?: number;
  closureReason?: string;
}

export interface CloseDuplicateSummary {
  closedCount: number;
  deduplicatedTitles: string[];
}

export interface CloseDuplicateOptions {
  aiIdentifiers?: readonly string[];
}

export interface CloseDuplicateResult {
  updated: PullRequestRecord[];
  closed: PullRequestRecord[];
  summary: CloseDuplicateSummary;
}

export const DEFAULT_AI_IDENTIFIERS = ["chatgpt", "openai", "grok"] as const;

const normalizeTitle = (title: string): string =>
  title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createAiIdentifierPatterns = (identifiers: readonly string[]): RegExp[] =>
  identifiers
    .map((identifier) => identifier.trim().toLowerCase())
    .filter((identifier) => identifier.length > 0)
    .map((identifier) =>
      new RegExp(
        `(^|[^a-z0-9])${escapeRegExp(identifier)}([^a-z0-9]|$)`,
        "i",
      ),
    );

const isAssignedToAi = (
  assignees: string[],
  patterns: RegExp[],
): boolean => {
  if (patterns.length === 0) {
    return false;
  }

  return assignees.some((assignee) => {
    const normalized = assignee.trim().toLowerCase();
    if (normalized.length === 0) {
      return false;
    }

    return patterns.some((pattern) => pattern.test(normalized));
  });
};

const clonePullRequest = (
  pullRequest: PullRequestRecord,
): PullRequestRecord => ({
  ...pullRequest,
  assignees: [...pullRequest.assignees],
});

const closePullRequestAsDuplicate = (
  duplicate: PullRequestRecord,
  canonicalNumber: number,
): void => {
  if (duplicate.status !== "closed") {
    duplicate.status = "closed";
  }

  if (duplicate.duplicateOf === undefined) {
    duplicate.duplicateOf = canonicalNumber;
  }

  if (!duplicate.closureReason) {
    duplicate.closureReason = "duplicate-ai-assignee";
  }
};

export const closeDuplicatePullRequests = (
  pullRequests: PullRequestRecord[],
  options: CloseDuplicateOptions = {},
): CloseDuplicateResult => {
  const aiIdentifiers = options.aiIdentifiers ?? DEFAULT_AI_IDENTIFIERS;
  const aiPatterns = createAiIdentifierPatterns(aiIdentifiers);
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

    const currentIsAi = isAssignedToAi(pullRequest.assignees, aiPatterns);
    const canonicalIsAi = isAssignedToAi(canonical.assignees, aiPatterns);

    if (!currentIsAi && canonicalIsAi) {
      closePullRequestAsDuplicate(canonical, pullRequest.number);
      if (!closed.includes(canonical)) {
        closed.push(canonical);
      }
      canonicalByTitle.set(normalizedTitle, pullRequest);
      continue;
    }

    if (!currentIsAi) {
      continue;
    }

    closePullRequestAsDuplicate(pullRequest, canonical.number);
    closed.push(pullRequest);
  }

  const deduplicatedTitleSet = new Set<string>();
  closed.forEach((pullRequest) => {
    deduplicatedTitleSet.add(normalizeTitle(pullRequest.title));
  });

  const summary: CloseDuplicateSummary = {
    closedCount: closed.length,
    deduplicatedTitles: Array.from(deduplicatedTitleSet).sort(),
  };

  return {
    updated,
    closed,
    summary,
  };
};

