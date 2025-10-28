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

// Define or import PullRequestRecord type
export type PullRequestRecord = {
    author: string;
    assignees: string[];
    // Add other relevant fields as needed
};

// Define CloseDuplicateOptions type
export type CloseDuplicateOptions = {
    aiIdentifiers?: readonly string[];
    canonicalStrategy?: "earliest" | "latest";
    onClose?: (duplicate: PullRequestRecord, canonical: PullRequestRecord) => void;
};

// Define CloseDuplicateResult type (stub, update as needed)
export type CloseDuplicateResult = unknown;

/**
 * Identifies and closes pull requests that appear to be created or owned by AI accounts, keeping a single canonical PR.
 *
 * @param options - Configuration options. `aiIdentifiers` supplies identifiers used to detect AI-owned authors/assignees (defaults to DEFAULT_AI_IDENTIFIERS). `canonicalStrategy` chooses which PR to keep (`"earliest"` or `"latest"`, default `"earliest"`). `onClose` is invoked for each duplicate detected with the duplicate and the chosen canonical PR.
 * @returns The result of the duplicate-close operation; currently returns `null` as a placeholder.
 */
export function closeDuplicatePullRequests(
    pullRequests: PullRequestRecord[],
    options: CloseDuplicateOptions = {}
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
        pr.assignees.some((a: string) => matchesAnyIdentifier(a, identifierPatterns));

    // Example logic using canonicalStrategy to select the canonical PR
    let canonical: PullRequestRecord | undefined;
    if (pullRequests.length > 0) {
        if (canonicalStrategy === "earliest") {
            canonical = pullRequests[0];
        } else if (canonicalStrategy === "latest") {
            canonical = pullRequests[pullRequests.length - 1];
        }
    }

    for (const pr of pullRequests) {
        if (!canonical || pr === canonical) continue;
        try {
            onClose?.(pr, canonical);
        } catch {
            /* no-op */
        }
        // ...existing code...
    }
    // ...existing code...
    // Since CloseDuplicateResult is unknown, return null as a stub.
    return null;
}