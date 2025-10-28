export interface PullRequestRecord {
  number: number;
  title: string;
  assignees: string[];
  status: "open" | "closed";
  duplicateOf?: number;
  closureReason?: string;
}

export interface CloseDuplicatePullRequestsOptions {
  aiIdentifiers?: string[];
}

export interface CloseDuplicatePullRequestsSummary {
  closedCount: number;
  deduplicatedTitles: string[];
}

export interface CloseDuplicatePullRequestsResult {
  updated: PullRequestRecord[];
  closed: PullRequestRecord[];
  summary: CloseDuplicatePullRequestsSummary;
}

export const DEFAULT_AI_IDENTIFIERS = [
  "chatgpt",
  "openai",
  "grok",
  "copilot",
  "claude",
];

const DUPLICATE_CLOSURE_REASON = "duplicate-ai-assignee" as const;

const normalizeTitle = (title: string): string =>
  title.replace(/\s+/g, " ").trim().toLowerCase();

const normalizeIdentifierList = (identifiers: string[] | undefined): string[] =>
  (identifiers ?? DEFAULT_AI_IDENTIFIERS)
    .map((identifier) => identifier.trim().toLowerCase())
    .filter((identifier) => identifier.length > 0);

const hasAiAssignee = (assignees: string[], aiIdentifiers: string[]): boolean => {
  if (aiIdentifiers.length === 0) {
    return false;
  }

  return assignees.some((assignee) => {
    const normalizedAssignee = assignee.trim().toLowerCase();
    if (normalizedAssignee.length === 0) {
      return false;
    }

    return aiIdentifiers.some((identifier) =>
      normalizedAssignee.includes(identifier)
    );
  });
};

export const closeDuplicatePullRequests = (
  pullRequests: PullRequestRecord[],
  options?: CloseDuplicatePullRequestsOptions
): CloseDuplicatePullRequestsResult => {
  const aiIdentifiers = normalizeIdentifierList(options?.aiIdentifiers);

  const updated = pullRequests.map((pr) => ({
    ...pr,
    assignees: [...pr.assignees],
  }));

  if (updated.length === 0 || aiIdentifiers.length === 0) {
    return {
      updated,
      closed: [],
      summary: { closedCount: 0, deduplicatedTitles: [] },
    };
  }

  const normalizedTitles = updated.map((pr) => normalizeTitle(pr.title));

  const canonicalIndexByTitle = new Map<string, number>();

  normalizedTitles.forEach((title, index) => {
    const existingIndex = canonicalIndexByTitle.get(title);
    if (existingIndex === undefined || updated[index].number < updated[existingIndex].number) {
      canonicalIndexByTitle.set(title, index);
    }
  });

  const closed: PullRequestRecord[] = [];
  const deduplicatedTitles = new Set<string>();

  updated.forEach((pr, index) => {
    const normalizedTitle = normalizedTitles[index];
    const canonicalIndex = canonicalIndexByTitle.get(normalizedTitle);

    if (canonicalIndex === undefined || canonicalIndex === index) {
      return;
    }

    if (!hasAiAssignee(pr.assignees, aiIdentifiers)) {
      return;
    }

    const canonical = updated[canonicalIndex];

    if (pr.duplicateOf === undefined) {
      pr.duplicateOf = canonical.number;
    }

    if (pr.closureReason === undefined) {
      pr.closureReason = DUPLICATE_CLOSURE_REASON;
    }

    pr.status = "closed";

    closed.push(pr);
    deduplicatedTitles.add(normalizedTitle);
  });

  return {
    updated,
    closed,
    summary: {
      closedCount: closed.length,
      deduplicatedTitles: Array.from(deduplicatedTitles),
    },
  };
};

