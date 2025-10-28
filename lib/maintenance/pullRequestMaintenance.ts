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

type PullRequestStatus = "open" | "closed";

export type PullRequestRecord = {
    number: number;
    title: string;
    author: string;
    assignees: readonly string[];
    status: PullRequestStatus;
    duplicateOf?: number;
    closureReason?: string;
};

export type CloseDuplicateOptions = {
    aiIdentifiers?: readonly string[];
    canonicalStrategy?: "earliest" | "latest";
    onClose?: (duplicate: PullRequestRecord, canonical: PullRequestRecord) => void;
};

export type CloseDuplicateSummary = {
    totalClosed: number;
    titles: string[];
    canonicalNumbers: number[];
};

export type CloseDuplicateResult = {
    updated: PullRequestRecord[];
    closed: PullRequestRecord[];
    summary: CloseDuplicateSummary;
};

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildIdentifierPatterns = (identifiers: readonly string[]): RegExp[] => {
    const before = String.raw`(^|[^\p{L}\p{N}])`;
    const after = String.raw`([^\p{L}\p{N}]|$)`;

    return identifiers
        .map((identifier) => identifier?.trim().toLowerCase())
        .filter((identifier): identifier is string => Boolean(identifier))
        .map((identifier) =>
            new RegExp(`${before}${escapeRegExp(identifier)}${after}`, "u")
        );
};

const matchesAnyIdentifier = (
    value: string | undefined | null,
    patterns: readonly RegExp[],
): boolean => {
    if (!value) {
        return false;
    }

    const normalized = value.trim().toLowerCase();
    if (!normalized) {
        return false;
    }

    return patterns.some((pattern) => pattern.test(normalized));
};

const normalizeWhitespace = (value: string): string => value.trim().replace(/\s+/g, " ");

const normalizeTitle = (title: string): string => normalizeWhitespace(title).toLowerCase();

const cloneRecord = (record: PullRequestRecord): PullRequestRecord => ({
    ...record,
    assignees: [...record.assignees],
});

const createEmptySummary = (): CloseDuplicateSummary => ({
    totalClosed: 0,
    titles: [],
    canonicalNumbers: [],
});

export function closeDuplicatePullRequests(
    pullRequests: readonly PullRequestRecord[],
    options: CloseDuplicateOptions = {},
): CloseDuplicateResult {
    const clonedRecords = pullRequests.map(cloneRecord);

    if (clonedRecords.length === 0) {
        return {
            updated: [],
            closed: [],
            summary: createEmptySummary(),
        };
    }

    const {
        aiIdentifiers = DEFAULT_AI_IDENTIFIERS,
        canonicalStrategy = "earliest",
        onClose,
    } = options;

    const identifierPatterns = buildIdentifierPatterns(aiIdentifiers);

    if (identifierPatterns.length === 0) {
        return {
            updated: clonedRecords,
            closed: [],
            summary: createEmptySummary(),
        };
    }

    const groupedByTitle = new Map<string, PullRequestRecord[]>();
    clonedRecords.forEach((record) => {
        const key = normalizeTitle(record.title);
        const collection = groupedByTitle.get(key);
        if (collection) {
            collection.push(record);
        } else {
            groupedByTitle.set(key, [record]);
        }
    });

    const closedRecords: PullRequestRecord[] = [];
    const closedTitles = new Set<string>();
    const canonicalNumbers = new Set<number>();

    groupedByTitle.forEach((group) => {
        if (group.length <= 1) {
            return;
        }

        const sortedByNumber = [...group].sort((a, b) => a.number - b.number);
        const canonical =
            canonicalStrategy === "latest"
                ? sortedByNumber[sortedByNumber.length - 1]
                : sortedByNumber[0];

        group.forEach((record) => {
            if (record.number === canonical.number) {
                return;
            }

            const aiOwned =
                matchesAnyIdentifier(record.author, identifierPatterns) ||
                record.assignees.some((assignee) =>
                    matchesAnyIdentifier(assignee, identifierPatterns)
                );

            if (!aiOwned) {
                return;
            }

            const wasClosed = record.status === "closed";
            record.status = "closed";
            record.duplicateOf = canonical.number;
            if (!record.closureReason) {
                record.closureReason = "duplicate-ai-assignee";
            }

            closedRecords.push(record);
            closedTitles.add(normalizeWhitespace(canonical.title));
            canonicalNumbers.add(canonical.number);

            if (!wasClosed) {
                try {
                    onClose?.(record, canonical);
                } catch {
                    // Swallow callback errors to keep processing deterministic.
                }
            }
        });
    });

    const summary: CloseDuplicateSummary = {
        totalClosed: closedRecords.length,
        titles: Array.from(closedTitles),
        canonicalNumbers: Array.from(canonicalNumbers).sort((a, b) => a - b),
    };

    return {
        updated: clonedRecords,
        closed: closedRecords,
        summary,
    };
}
