export type PullRequestState = "open" | "closed" | "merged";

/**
 * Lightweight representation of a pull request used for duplicate detection
 * and planning maintenance actions.
 */
export interface PullRequestRecord {
  number: number;
  title: string;
  state: PullRequestState;
  author: string;
  assignees: string[];
  createdAt?: string;
  updatedAt?: string;
  duplicateOf?: number | null;
  closureReason?: string | null;
}

export interface CloseDuplicateOptions {
  /**
   * Additional AI identifiers to use when determining whether a pull request
   * is owned by an automated agent. The identifiers are matched on
   * token boundaries in a case-insensitive manner.
   */
  aiIdentifiers?: string[];
  /**
   * Strategy for selecting the canonical pull request when multiple entries
   * share an equivalent title.
   */
  canonicalStrategy?: "earliest" | "earliestOpen" | "preferHuman";
  /**
   * When true, duplicate pull requests that are not owned by an AI are not
   * automatically closed. Defaults to true to minimise the risk of impacting
   * human contributors.
   */
  requireAiOwner?: boolean;
  /**
   * Optional callback that will be invoked for every duplicate that is
   * scheduled for closure.
   */
  onClose?: (duplicate: PullRequestRecord, canonical: PullRequestRecord) => void;
}

/** Describes a duplicate pull request earmarked for closure. */
export interface DuplicateClosure {
  pullRequest: PullRequestRecord;
  canonical: PullRequestRecord;
  reason: string;
}

/**
 * Detailed result emitted by {@link closeDuplicatePullRequests}, including the
 * canonical pull request for each normalised title and the actions to take on
 * duplicates.
 */
export interface CloseDuplicateResult {
  canonicalByTitle: Record<string, PullRequestRecord>;
  closed: DuplicateClosure[];
  skipped: PullRequestRecord[];
}

/**
 * Baseline set of identifiers commonly used by AI assistants when raising pull
 * requests. Teams can extend this list through {@link CloseDuplicateOptions.aiIdentifiers}.
 */
export const DEFAULT_AI_IDENTIFIERS: string[] = [
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
];

/**
 * Normalises a pull request title into a canonical form that allows reliable
 * comparisons by removing diacritics, collapsing whitespace and applying a
 * consistent case.
 */
export const normalizeTitle = (title: string): string =>
  title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

/** Escapes a string so that it can be safely interpolated into a RegExp. */
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildIdentifierPatterns = (identifiers: string[]): RegExp[] =>
  identifiers.map((identifier) =>
    new RegExp(`(^|[^a-z0-9])${escapeRegExp(identifier.toLowerCase())}([^a-z0-9]|$)`),
  );

const matchesAnyIdentifier = (value: string, patterns: RegExp[]): boolean =>
  patterns.some((pattern) => pattern.test(value.trim().toLowerCase()));

/**
 * Determines whether any of the assignees correspond to a known AI agent,
 * matching identifiers on token boundaries to avoid false positives for human
 * contributors whose names may contain AI-like substrings.
 */
export const isAssignedToAi = (assignees: string[], aiIdentifiers: string[]): boolean => {
  if (aiIdentifiers.length === 0) return false;
  const patterns = buildIdentifierPatterns(aiIdentifiers);
  return assignees.some((assignee) => matchesAnyIdentifier(assignee, patterns));
};

/**
 * Determines whether the author or assignees indicate that a pull request is
 * maintained by an automated agent.
 */
export const isAiOwnedPullRequest = (
  pr: PullRequestRecord,
  aiIdentifiers: string[],
): boolean => {
  if (aiIdentifiers.length === 0) return false;
  const loweredIdentifiers = aiIdentifiers.map((identifier) => identifier.toLowerCase());
  const patterns = buildIdentifierPatterns(loweredIdentifiers);
  if (matchesAnyIdentifier(pr.author, patterns)) {
    return true;
  }
  return pr.assignees.some((assignee) => matchesAnyIdentifier(assignee, patterns));
};

const selectCanonicalPullRequest = (
  prs: PullRequestRecord[],
  strategy: CloseDuplicateOptions["canonicalStrategy"],
  aiIdentifiers: string[],
): PullRequestRecord => {
  const sorted = [...prs].sort((a, b) => a.number - b.number);
  if (strategy === "preferHuman") {
    const humanOwned = sorted.find((pr) => !isAiOwnedPullRequest(pr, aiIdentifiers));
    if (humanOwned) return humanOwned;
  }
  if (strategy === "earliestOpen") {
    const open = sorted.filter((pr) => pr.state === "open");
    if (open.length > 0) {
      const humanOpen = open.find((pr) => !isAiOwnedPullRequest(pr, aiIdentifiers));
      return humanOpen ?? open[0];
    }
  }
  return sorted[0];
};

/**
 * Analyses a list of pull requests and determines which duplicates should be
 * closed, returning the set of canonical pull requests along with the closure
 * plan. The function does not perform any remote operations; callers can use
 * the returned metadata to drive API requests or audits.
 */
export const closeDuplicatePullRequests = (
  pullRequests: PullRequestRecord[],
  options: CloseDuplicateOptions = {},
): CloseDuplicateResult => {
  const {
    aiIdentifiers = DEFAULT_AI_IDENTIFIERS,
    canonicalStrategy = "earliest",
    requireAiOwner = true,
    onClose,
  } = options;
  const loweredIdentifiers = Array.from(new Set(aiIdentifiers.map((id) => id.toLowerCase())));

  const groups = new Map<string, PullRequestRecord[]>();
  for (const pr of pullRequests) {
    const key = normalizeTitle(pr.title);
    const group = groups.get(key);
    if (group) {
      group.push(pr);
    } else {
      groups.set(key, [pr]);
    }
  }

  const canonicalByTitle: Record<string, PullRequestRecord> = {};
  const closed: DuplicateClosure[] = [];
  const skipped: PullRequestRecord[] = [];

  for (const [title, prs] of groups.entries()) {
    if (prs.length <= 1) {
      canonicalByTitle[title] = prs[0];
      continue;
    }
    const canonical = selectCanonicalPullRequest(prs, canonicalStrategy, loweredIdentifiers);
    canonicalByTitle[title] = canonical;
    for (const pr of prs) {
      if (pr.number === canonical.number) continue;
      const aiOwned = isAiOwnedPullRequest(pr, loweredIdentifiers);
      if (requireAiOwner && !aiOwned) {
        skipped.push(pr);
        continue;
      }
      const reason = aiOwned
        ? "duplicate handled by AI maintainer"
        : "duplicate detected via title normalisation";
      const record: DuplicateClosure = {
        pullRequest: pr,
        canonical,
        reason,
      };
      closed.push(record);
      onClose?.(pr, canonical);
    }
  }

  return { canonicalByTitle, closed, skipped };
};
