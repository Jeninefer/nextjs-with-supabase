export type PullRequestStatus = 'open' | 'closed';

export interface PullRequestRecord {
  number: number;
  title: string;
  status: PullRequestStatus;
  assignees: string[];
  author?: string;
  duplicateOf?: number;
  closureReason?: string;
}

export interface CloseDuplicateSummary {
  closedCount: number;
  deduplicatedTitles: string[];
}

export interface CloseDuplicateOptions {
  aiIdentifiers?: readonly string[];
  canonicalStrategy?: 'earliest' | 'latest';
  closureReason?: string;
  onClose?: (duplicate: PullRequestRecord, canonical: PullRequestRecord) => void | Promise<void>;
}

export interface CloseDuplicateResult {
  updated: PullRequestRecord[];
  closed: PullRequestRecord[];
  summary: CloseDuplicateSummary;
}

export const DEFAULT_AI_IDENTIFIERS: readonly string[] = Object.freeze([
  'chatgpt',
  'openai',
  'copilot',
  'gpt',
  'cursor',
  'claude',
  'grok',
]);

const TITLE_NORMALIZER = /\s+/g;

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildIdentifierPatterns = (identifiers: readonly string[]): RegExp[] =>
  identifiers.map((identifier) => {
    const trimmed = identifier.trim().toLowerCase();
    return new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(trimmed)}([^\\p{L}\\p{N}]|$)`, 'iu');
  });

const normalizeTitle = (title: string): string => title.trim().replace(TITLE_NORMALIZER, ' ').toLowerCase();

const cloneRecord = (record: PullRequestRecord): PullRequestRecord => ({
  ...record,
  assignees: [...record.assignees],
});

const isAiOwned = (record: PullRequestRecord, patterns: RegExp[]): boolean => {
  const fields = [record.author ?? '', ...record.assignees];
  return fields.some((value) => patterns.some((pattern) => pattern.test(value.toLowerCase())));
};

const selectCanonical = (
  records: PullRequestRecord[],
  strategy: 'earliest' | 'latest',
  patterns: RegExp[],
): PullRequestRecord => {
  const humanOwned = records.filter((record) => !isAiOwned(record, patterns));
  const candidates = humanOwned.length > 0 ? humanOwned : records;

  if (strategy === 'latest') {
    return candidates.reduce((latest, record) => (record.number > latest.number ? record : latest));
  }

  return candidates.reduce((earliest, record) => (record.number < earliest.number ? record : earliest));
};

const invokeOnClose = (
  callback: CloseDuplicateOptions['onClose'],
  duplicate: PullRequestRecord,
  canonical: PullRequestRecord,
): void => {
  if (!callback) {
    return;
  }

  try {
    const result = callback(duplicate, canonical);
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      (result as Promise<unknown>).catch(() => undefined);
    }
  } catch (error) {
    console.warn('[PR Maintenance] onClose callback failed', error);
  }
};

export function closeDuplicatePullRequests(
  pullRequests: PullRequestRecord[],
  options: CloseDuplicateOptions = {},
): CloseDuplicateResult {
  const {
    aiIdentifiers = DEFAULT_AI_IDENTIFIERS,
    canonicalStrategy = 'earliest',
    closureReason = 'duplicate-ai-assignee',
    onClose,
  } = options;

  const sanitizedIdentifiers = aiIdentifiers
    .map((identifier) => identifier.trim().toLowerCase())
    .filter(Boolean);
  const identifierPatterns = buildIdentifierPatterns(sanitizedIdentifiers);

  const grouped = new Map<string, PullRequestRecord[]>();
  const updated = pullRequests.map((record) => {
    const clone = cloneRecord(record);
    const key = normalizeTitle(clone.title);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(clone);
    return clone;
  });

  const closed: PullRequestRecord[] = [];
  const deduplicatedTitles = new Set<string>();

  for (const [titleKey, records] of grouped.entries()) {
    if (records.length < 2) {
      continue;
    }

    const canonical = selectCanonical(records, canonicalStrategy, identifierPatterns);

    for (const record of records) {
      if (record.number === canonical.number) {
        continue;
      }

      if (!isAiOwned(record, identifierPatterns)) {
        continue;
      }

      const hasStatusChanged = record.status !== 'closed';
      record.status = 'closed';
      if (canonical.number && record.duplicateOf === undefined) {
        record.duplicateOf = canonical.number;
      }
      if (closureReason && !record.closureReason) {
        record.closureReason = closureReason;
      }

      closed.push(record);
      deduplicatedTitles.add(titleKey);

      if (hasStatusChanged || record.duplicateOf === canonical.number) {
        invokeOnClose(onClose, record, canonical);
      }
    }
  }

  return {
    updated,
    closed,
    summary: {
      closedCount: closed.length,
      deduplicatedTitles: Array.from(deduplicatedTitles),
    },
  };
}
