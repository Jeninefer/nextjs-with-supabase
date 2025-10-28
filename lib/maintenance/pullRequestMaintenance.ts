export type PullRequestStatus = "open" | "closed";

export interface PullRequestRecord {
  number: number;
  title: string;
  assignees: string[];
  status: PullRequestStatus;
  author?: string;
  duplicateOf?: number;
  closureReason?: string;
}

export interface CloseDuplicateOptions {
  aiIdentifiers?: readonly string[];
  canonicalStrategy?: "earliest" | "latest";
  onClose?: (duplicate: PullRequestRecord, canonical: PullRequestRecord) => void;
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

// Harden DEFAULT_AI_IDENTIFIERS typing and export inline
export const DEFAULT_AI_IDENTIFIERS: readonly string[] = Object.freeze([
  "chatgpt",
  "openai",
  "copilot",
  "cursor",
  "claude",
  "gemini",
  "codeium",
  "gpt",
  "aider",
  "swe-agent",
  "blackbox",
  "cody",
  "tabnine",
]);

const clonePullRequest = (pullRequest: PullRequestRecord): PullRequestRecord => ({
  ...pullRequest,
  assignees: [...pullRequest.assignees],
});

const normalizeTitle = (title: string): string =>
  title
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Unicode-aware boundary regex for identifier matching.
const buildIdentifierPatterns = (identifiers: string[]): RegExp[] => {
  // Unicode-aware boundaries: any non-letter/number is a boundary.
  const before = String.raw`(^|[^\p{L}\p{N}])`;
  const after = String.raw`([^\p{L}\p{N}]|$)`;
  return identifiers.map((identifier) =>
    new RegExp(`${before}${escapeRegExp(identifier.toLowerCase())}${after}`, "u")
  );
};

const matchesAnyIdentifier = (value: string | undefined, patterns: RegExp[]): boolean => {
  if (!value) {
    return false;
  }

  const candidate = value.trim().toLowerCase();
  return patterns.some((pattern) => pattern.test(candidate));
};

const isAssignedToAi = (
  pullRequest: PullRequestRecord,
  identifierPatterns: RegExp[]
): boolean => {
  if (matchesAnyIdentifier(pullRequest.author, identifierPatterns)) {
    return true;
  }

  return pullRequest.assignees.some((assignee) =>
    matchesAnyIdentifier(assignee, identifierPatterns)
  );
};

export const closeDuplicatePullRequests = (
  pullRequests: PullRequestRecord[],
  options: CloseDuplicateOptions = {}
): CloseDuplicateResult => {
  const {
    aiIdentifiers = DEFAULT_AI_IDENTIFIERS,
    canonicalStrategy = "earliest",
    onClose,
  } = options;

  const normalizedIdentifiers = aiIdentifiers
    .map((identifier) => identifier.trim().toLowerCase())
    .filter((identifier) => identifier.length > 0);

  const identifierPatterns = buildIdentifierPatterns(normalizedIdentifiers);

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

    if (canonicalStrategy === "latest") {
      // For the latest strategy, the current pull request becomes canonical.
      canonicalByTitle.set(normalizedTitle, pullRequest);

      if (!isAssignedToAi(canonical, identifierPatterns)) {
        continue;
      }

      if (canonical.status !== "closed") {
        canonical.status = "closed";
      }

      if (canonical.duplicateOf === undefined) {
        canonical.duplicateOf = pullRequest.number;
      }

      if (!canonical.closureReason) {
        canonical.closureReason = "duplicate-ai-assignee";
      }

      closed.push(canonical);

      if (onClose) {
        try {
          onClose(canonical, pullRequest);
        } catch {
          // Swallow callback errors to avoid breaking the deduplication flow.
        }
      }

      continue;
    }

    if (!isAssignedToAi(pullRequest, identifierPatterns)) {
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

    if (onClose) {
      try {
        onClose(pullRequest, canonical);
      } catch {
        // Swallow callback errors to avoid breaking the deduplication flow.
      }
    }
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

