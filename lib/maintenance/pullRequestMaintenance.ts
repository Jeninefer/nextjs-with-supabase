export type PullRequestStatus = "open" | "closed";

export interface PullRequestRecord {
  number: number;
  title: string;
  status: PullRequestStatus;
  assignees: string[];
  author?: string;
  duplicateOf?: number;
  closureReason?: string;
}

export interface CloseDuplicateOptions {
  aiIdentifiers?: readonly string[];
  closureReason?: string;
  onClose?: (duplicate: PullRequestRecord, canonical: PullRequestRecord) => void;
}

export interface CloseDuplicateSummary {
  closedCount: number;
  deduplicatedTitles: string[];
}

export interface CloseDuplicateResult {
  updated: PullRequestRecord[];
  closed: PullRequestRecord[];
  summary: CloseDuplicateSummary;
}

export const DEFAULT_AI_IDENTIFIERS = Object.freeze([
  "chatgpt",
  "openai",
  "grok",
]);

const beforeBoundary = String.raw`(^|[^\p{L}\p{N}])`;
const afterBoundary = String.raw`([^\p{L}\p{N}]|$)`;

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildIdentifierPatterns = (identifiers: readonly string[]): RegExp[] =>
  identifiers.map(
    (identifier) =>
      new RegExp(
        `${beforeBoundary}${escapeRegExp(identifier)}${afterBoundary}`,
        "iu",
      ),
  );

const normalizeIdentifierList = (
  identifiers: readonly string[] | undefined,
): readonly string[] => {
  const cleaned = (identifiers ?? DEFAULT_AI_IDENTIFIERS)
    .map((identifier) => identifier.trim().toLowerCase())
    .filter((identifier) => identifier.length > 0);

  return Array.from(new Set(cleaned));
};

const normalizeTitle = (title: string): string =>
  title.trim().replace(/\s+/g, " ").toLowerCase();

const isAiOwned = (
  record: PullRequestRecord,
  patterns: readonly RegExp[],
): boolean => {
  const valuesToCheck = [record.author, ...record.assignees];
  return valuesToCheck.some((value) => {
    if (!value) return false;
    const normalized = value.trim().toLowerCase();
    return patterns.some((pattern) => pattern.test(normalized));
  });
};

const clonePullRequest = (record: PullRequestRecord): PullRequestRecord => ({
  ...record,
  assignees: [...record.assignees],
});

const chooseCanonicalPullRequest = (
  records: PullRequestRecord[],
  patterns: readonly RegExp[],
): PullRequestRecord => {
  const sorted = [...records].sort((a, b) => a.number - b.number);

  const openHuman = sorted.find(
    (record) => record.status === "open" && !isAiOwned(record, patterns),
  );
  if (openHuman) return openHuman;

  const anyHuman = sorted.find((record) => !isAiOwned(record, patterns));
  if (anyHuman) return anyHuman;

  const openAi = sorted.find((record) => record.status === "open");
  if (openAi) return openAi;

  return sorted[0];
};

const assertValidRecord = (record: PullRequestRecord): void => {
  if (!Number.isInteger(record.number) || record.number <= 0) {
    throw new Error(`Invalid pull request number: ${record.number}`);
  }
  if (typeof record.title !== "string" || record.title.trim().length === 0) {
    throw new Error(`Invalid pull request title for #${record.number}`);
  }
  if (!Array.isArray(record.assignees)) {
    throw new Error(`Assignees must be an array for pull request #${record.number}`);
  }
  record.assignees.forEach((assignee) => {
    if (typeof assignee !== "string") {
      throw new Error(`Invalid assignee entry for pull request #${record.number}`);
    }
  });
  if (record.status !== "open" && record.status !== "closed") {
    throw new Error(`Invalid status for pull request #${record.number}`);
  }
  if (
    record.duplicateOf !== undefined &&
    (!Number.isInteger(record.duplicateOf) || record.duplicateOf <= 0)
  ) {
    throw new Error(`Invalid duplicateOf value for pull request #${record.number}`);
  }
};

export function closeDuplicatePullRequests(
  pullRequests: PullRequestRecord[],
  options: CloseDuplicateOptions = {},
): CloseDuplicateResult {
  pullRequests.forEach(assertValidRecord);

  const identifiers = normalizeIdentifierList(options.aiIdentifiers);
  const patterns = buildIdentifierPatterns(identifiers);
  const closureReason = options.closureReason ?? "duplicate-ai-assignee";

  const updatedRecords = pullRequests.map(clonePullRequest);

  const groupedByTitle = new Map<string, PullRequestRecord[]>();
  updatedRecords.forEach((record) => {
    const normalizedTitle = normalizeTitle(record.title);
    const existing = groupedByTitle.get(normalizedTitle);
    if (existing) {
      existing.push(record);
    } else {
      groupedByTitle.set(normalizedTitle, [record]);
    }
  });

  const closedRecords: PullRequestRecord[] = [];
  const deduplicatedTitles = new Set<string>();

  groupedByTitle.forEach((records, normalizedTitle) => {
    if (records.length < 2) return;

    const canonical = chooseCanonicalPullRequest(records, patterns);

    records.forEach((record) => {
      if (record.number === canonical.number) return;
      if (!isAiOwned(record, patterns)) return;

      deduplicatedTitles.add(normalizedTitle);

      record.status = "closed";
      record.duplicateOf = canonical.number;
      if (!record.closureReason) {
        record.closureReason = closureReason;
      }

      closedRecords.push(record);

      if (options.onClose) {
        try {
          options.onClose(record, canonical);
        } catch {
          // ignore callback failures
        }
      }
    });
  });

  return {
    updated: updatedRecords,
    closed: closedRecords,
    summary: {
      closedCount: closedRecords.length,
      deduplicatedTitles: Array.from(deduplicatedTitles),
    },
  };
}
