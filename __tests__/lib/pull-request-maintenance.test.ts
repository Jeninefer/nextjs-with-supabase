import {
    closeDuplicatePullRequests,
    DEFAULT_AI_IDENTIFIERS,
    PullRequestRecord,
} from "@/lib/maintenance/pullRequestMaintenance";

describe("closeDuplicatePullRequests", () => {
    const createRecord = (overrides: Partial<PullRequestRecord> = {}): PullRequestRecord => ({
        number: overrides.number ?? 1,
        title: overrides.title ?? "Refactor module",
        author: overrides.author ?? "alex.johnson",
        assignees: overrides.assignees ?? ["casey.taylor"],
        status: overrides.status ?? "open",
        duplicateOf: overrides.duplicateOf,
        closureReason: overrides.closureReason,
    });

    it("closes AI-owned duplicates and records summary information", () => {
        const pullRequests: PullRequestRecord[] = [
            createRecord({ number: 102, title: "Fix login redirect loop" }),
            createRecord({
                number: 103,
                title: "Fix   login redirect loop  ",
                author: "openai-actions",
                assignees: ["quality.review"],
            }),
            createRecord({
                number: 104,
                title: "fix login redirect loop",
                assignees: ["Copilot"],
            }),
        ];

        const originalSnapshot = JSON.parse(JSON.stringify(pullRequests));

        const result = closeDuplicatePullRequests(pullRequests);

        // Original collection remains unchanged
        expect(pullRequests).toEqual(originalSnapshot);

        const canonical = result.updated.find((pr) => pr.number === 102)!;
        const duplicate103 = result.updated.find((pr) => pr.number === 103)!;
        const duplicate104 = result.updated.find((pr) => pr.number === 104)!;

        expect(canonical.status).toBe("open");

        expect(duplicate103.status).toBe("closed");
        expect(duplicate103.duplicateOf).toBe(102);
        expect(duplicate103.closureReason).toBe("duplicate-ai-assignee");

        expect(duplicate104.status).toBe("closed");
        expect(duplicate104.duplicateOf).toBe(102);
        expect(duplicate104.closureReason).toBe("duplicate-ai-assignee");

        expect(result.closed.map((pr) => pr.number).sort()).toEqual([103, 104]);
        expect(result.summary.totalClosed).toBe(2);
        expect(result.summary.titles).toEqual(["Fix login redirect loop"]);
        expect(result.summary.canonicalNumbers).toEqual([102]);
    });

    it("skips duplicates when no AI identifiers match", () => {
        const pullRequests: PullRequestRecord[] = [
            createRecord({ number: 201, title: "Improve onboarding flow" }),
            createRecord({ number: 202, title: "Improve onboarding flow" }),
        ];

        const result = closeDuplicatePullRequests(pullRequests, {
            aiIdentifiers: ["automation-team"],
        });

        expect(result.closed).toHaveLength(0);
        expect(result.updated.every((pr) => pr.status === "open")).toBe(true);
        expect(result.summary.totalClosed).toBe(0);
        expect(result.summary.titles).toHaveLength(0);
    });

    it("respects canonical strategy and preserves existing closure metadata", () => {
        const pullRequests: PullRequestRecord[] = [
            createRecord({ number: 301, title: "Optimize reports pipeline" }),
            createRecord({
                number: 302,
                title: "Optimize reports pipeline",
                status: "closed",
                closureReason: "duplicate",
                duplicateOf: 301,
                author: "copilot",
            }),
            createRecord({
                number: 303,
                title: "Optimize reports pipeline",
                assignees: ["Claude"],
            }),
        ];

        const onClose = jest.fn();

        const result = closeDuplicatePullRequests(pullRequests, {
            canonicalStrategy: "latest",
            onClose,
        });

        const canonical = result.updated.find((pr) => pr.number === 303)!;
        const duplicate = result.updated.find((pr) => pr.number === 302)!;

        expect(canonical.number).toBe(303);
        expect(canonical.status).toBe("open");

        expect(duplicate.status).toBe("closed");
        expect(duplicate.duplicateOf).toBe(303);
        expect(duplicate.closureReason).toBe("duplicate");

        expect(onClose).not.toHaveBeenCalled();

        // Ensure assignee arrays are not shared references
        const updatedRecord = result.updated.find((pr) => pr.number === 301)!;
        expect(updatedRecord.assignees).not.toBe(pullRequests[0].assignees);
    });

    it("returns default identifiers when options omit them", () => {
        const identifiers = [...DEFAULT_AI_IDENTIFIERS];
        expect(identifiers.length).toBeGreaterThan(0);
        expect(identifiers.every((id) => id === id.toLowerCase())).toBe(true);
    });
});
