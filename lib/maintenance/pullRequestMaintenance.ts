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

// Unicode-aware boundary regex for identifier matching.
const buildIdentifierPatterns = (identifiers: string[]): RegExp[] => {
    // Unicode-aware boundaries: any non-letter/number is a boundary.
    const before = String.raw`(^|[^\p{L}\p{N}])`;
    const after = String.raw`([^\p{L}\p{N}]|$)`;
    return identifiers.map((identifier) =>
        new RegExp(`${before}${escapeRegExp(identifier.toLowerCase())}${after}`, "u"),
    );
};

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function matchesAnyIdentifier(str: string, patterns: RegExp[]): boolean {
    const s = str.trim().toLowerCase();
    return patterns.some((re) => re.test(s));
}

export type PullRequestRecord = {
    number: number;
    title: string;
    author: string;
    assignees: string[];
    createdAt?: string | Date;
    htmlUrl?: string;
};

export type CloseDuplicateOptions = {
    aiIdentifiers?: readonly string[];
    canonicalStrategy?: "earliest" | "latest";
    onClose?: (duplicate: PullRequestRecord, canonical: PullRequestRecord) => void;
};

export type CloseDuplicateResult = {
    canonical: PullRequestRecord | null;
    duplicatesClosed: PullRequestRecord[];
};

const toTimestamp = (record: PullRequestRecord): number | null => {
    if (!record.createdAt) {
        return null;
    }

    if (record.createdAt instanceof Date) {
        const time = record.createdAt.getTime();
        return Number.isNaN(time) ? null : time;
    }

    const parsed = Date.parse(record.createdAt);
    return Number.isNaN(parsed) ? null : parsed;
};

const pickEarliest = (
    current: PullRequestRecord | undefined,
    candidate: PullRequestRecord,
): PullRequestRecord => {
    if (!current) {
        return candidate;
    }

    const currentTime = toTimestamp(current);
    const candidateTime = toTimestamp(candidate);

    if (candidateTime === null && currentTime === null) {
        return current;
    }

    if (candidateTime === null) {
        return current;
    }

    if (currentTime === null) {
        return candidate;
    }

    return candidateTime < currentTime ? candidate : current;
};

const pickLatest = (
    current: PullRequestRecord | undefined,
    candidate: PullRequestRecord,
): PullRequestRecord => {
    if (!current) {
        return candidate;
    }

    const currentTime = toTimestamp(current);
    const candidateTime = toTimestamp(candidate);

    if (candidateTime === null && currentTime === null) {
        return current;
    }

    if (candidateTime === null) {
        return current;
    }

    if (currentTime === null) {
        return candidate;
    }

    return candidateTime > currentTime ? candidate : current;
};

export function closeDuplicatePullRequests(
    pullRequests: PullRequestRecord[],
    options: CloseDuplicateOptions = {},
): CloseDuplicateResult {
    const {
        aiIdentifiers = DEFAULT_AI_IDENTIFIERS,
        canonicalStrategy = "earliest",
        onClose,
    } = options;

    const identifierPatterns = buildIdentifierPatterns(
        aiIdentifiers.map((id) => id.toLowerCase())
    );

    const isAiOwned = (pr: PullRequestRecord): boolean =>
        matchesAnyIdentifier(pr.author, identifierPatterns) ||
        pr.assignees.some((assignee: string) => matchesAnyIdentifier(assignee, identifierPatterns));

    const aiPullRequests = pullRequests.filter(isAiOwned);

    if (aiPullRequests.length === 0) {
        return {
            canonical: null,
            duplicatesClosed: [],
        };
    }

    const canonical = aiPullRequests.reduce(
        canonicalStrategy === "latest" ? pickLatest : pickEarliest,
        undefined as PullRequestRecord | undefined,
    ) ?? null;

    if (!canonical) {
        return {
            canonical: null,
            duplicatesClosed: [],
        };
    }

    const duplicatesClosed: PullRequestRecord[] = [];

    for (const pr of aiPullRequests) {
        if (pr === canonical) {
            continue;
        }

        duplicatesClosed.push(pr);

        try {
            onClose?.(pr, canonical);
        } catch {
            // Swallow callback errors to avoid interrupting maintenance automation.
        }
    }

    return {
        canonical,
        duplicatesClosed,
    };
}