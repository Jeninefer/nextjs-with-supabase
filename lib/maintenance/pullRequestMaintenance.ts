// ...existing code...

// Harden DEFAULT_AI_IDENTIFIERS typing and export inline
export const DEFAULT_AI_IDENTIFIERS = ["chatgpt", "openai", "grok"] as const;

// Escape regex metacharacters in identifiers.
const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Boundary-aware AI matching to avoid false positives (e.g., “grokowski”).
const isAssignedToAi = (assignees: string[], aiIdentifiers: readonly string[]): boolean => {
    if (aiIdentifiers.length === 0) return false;
    const patterns = aiIdentifiers.map((id) =>
        // token-boundary match: start/end or non-alphanumeric on each side
        new RegExp(`(^|[^a-z0-9])${escapeRegExp(id)}([^a-z0-9]|$)`, "i")
    );
    return assignees.some((assignee) => {
        const s = assignee.trim().toLowerCase();
        return patterns.some((re) => re.test(s));
    });
};

// ...existing code...

export function closeDuplicatePullRequests(
    pullRequests: PullRequestRecord[],
    options?: { aiIdentifiers?: readonly string[] }
): CloseDuplicateResult {
    // ...existing code...
    const aiIdentifiers =
        options?.aiIdentifiers?.filter((id) => id.trim()) ??
        Array.from(DEFAULT_AI_IDENTIFIERS);

    // ...existing code...

    // Keep the human PR as canonical; close AI “canonical” when a human arrives.
    for (const pullRequest of sortedByNumber) {
        const normalizedTitle = normalizeTitle(pullRequest.title);
        const canonical = canonicalByTitle.get(normalizedTitle);

        if (!canonical) {
            canonicalByTitle.set(normalizedTitle, pullRequest);
            continue;
        }

        const currentIsAi = isAssignedToAi(pullRequest.assignees, aiIdentifiers);
        const canonicalIsAi = isAssignedToAi(canonical.assignees, aiIdentifiers);

        // Prefer human-owned PRs as canonical.
        if (!currentIsAi && canonicalIsAi) {
            // Close previous AI canonical as duplicate of the human PR.
            if (canonical.status !== "closed") canonical.status = "closed";
            if (canonical.duplicateOf === undefined) canonical.duplicateOf = pullRequest.number;
            if (!canonical.closureReason) canonical.closureReason = "duplicate-ai-assignee";
            closed.push(canonical);
            canonicalByTitle.set(normalizedTitle, pullRequest);
            continue;
        }

        // Non-AI duplicate of non-AI canonical: leave open per policy.
        if (!currentIsAi) continue;

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
    }

    // ...existing code...
}