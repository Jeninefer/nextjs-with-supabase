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

// ...existing code...

export function closeDuplicatePullRequests(
    pullRequests: PullRequestRecord[],
    options: CloseDuplicateOptions = {}
): CloseDuplicateResult {
    // ...existing code...
    const {
        aiIdentifiers = DEFAULT_AI_IDENTIFIERS,
        canonicalStrategy = "earliest",
        requireAiOwner = true,
        onClose,
    } = options;
    const loweredIdentifiers = Array.from(new Set(aiIdentifiers.map((id) => id.toLowerCase())));
    const identifierPatterns = buildIdentifierPatterns(loweredIdentifiers);
    const isAiOwned = (pr: PullRequestRecord): boolean =>
        matchesAnyIdentifier(pr.author, identifierPatterns) ||
        pr.assignees.some((a) => matchesAnyIdentifier(a, identifierPatterns));

    // ...existing code...

    for (const pr of pullRequests) {
        // ...existing code...
        const aiOwned = isAiOwned(pr);
        // ...existing code...
        const reason = aiOwned
            ? "duplicate handled by AI maintainer"
            : "duplicate detected via title normalisation";
        // ...existing code...
        try {
            onClose?.(pr, canonical);
        } catch {
            /* no-op */
        }
        // ...existing code...
    }
    // ...existing code...
}