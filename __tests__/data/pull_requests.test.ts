const pullRequests = require("../../data/pull_requests.json");

describe("data/pull_requests.json", () => {
    it("marks pull request #240 as a closed AI-owned duplicate", () => {
        const pr240 = pullRequests.find((entry: any) => entry.number === 240);
        const pr242 = pullRequests.find((entry: any) => entry.number === 242);

        expect(pr240).toBeDefined();
        expect(pr240.status).toBe("closed");
        expect(pr240.duplicateOf).toBe(242);
        expect(pr240.closureReason).toBe("duplicate-ai-assignee");
        expect(pr240.assignees).toContain("chatgpt");

        expect(pr242).toBeDefined();
        expect(pr242.status).toBe("open");
    });

    it("lists pull requests in descending order", () => {
        const numbers = pullRequests.map((entry: any) => entry.number);
        const sorted = [...numbers].sort((a, b) => b - a);
        expect(numbers).toEqual(sorted);
    });
});
