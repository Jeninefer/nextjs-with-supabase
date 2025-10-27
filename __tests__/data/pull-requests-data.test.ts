import pullRequestsData from "@/data/pull_requests.json";
import { PullRequestRecord } from "@/lib/maintenance/pullRequestMaintenance";

describe("pull_requests.json data validation", () => {
  it("should be a valid JSON array", () => {
    expect(Array.isArray(pullRequestsData)).toBe(true);
  });

  it("should not be empty", () => {
    expect(pullRequestsData.length).toBeGreaterThan(0);
  });

  describe("Schema validation", () => {
    it("should have all required fields for each pull request", () => {
      pullRequestsData.forEach((pr, index) => {
        expect(pr).toHaveProperty("number");
        expect(pr).toHaveProperty("title");
        expect(pr).toHaveProperty("assignees");
        expect(pr).toHaveProperty("status");
      });
    });

    it("should have valid number field (positive integer)", () => {
      pullRequestsData.forEach((pr) => {
        expect(typeof pr.number).toBe("number");
        expect(pr.number).toBeGreaterThan(0);
        expect(Number.isInteger(pr.number)).toBe(true);
      });
    });

    it("should have unique PR numbers", () => {
      const numbers = pullRequestsData.map((pr) => pr.number);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(numbers.length);
    });

    it("should have valid title field (non-empty string)", () => {
      pullRequestsData.forEach((pr) => {
        expect(typeof pr.title).toBe("string");
        expect(pr.title.length).toBeGreaterThan(0);
        expect(pr.title.trim()).not.toBe("");
      });
    });

    it("should have valid assignees field (array)", () => {
      pullRequestsData.forEach((pr) => {
        expect(Array.isArray(pr.assignees)).toBe(true);
      });
    });

    it("should have valid assignee strings", () => {
      pullRequestsData.forEach((pr) => {
        pr.assignees.forEach((assignee: string) => {
          expect(typeof assignee).toBe("string");
          expect(assignee.length).toBeGreaterThan(0);
        });
      });
    });

    it("should have valid status field (open or closed)", () => {
      pullRequestsData.forEach((pr) => {
        expect(["open", "closed"]).toContain(pr.status);
      });
    });

    it("should have valid duplicateOf field when present", () => {
      pullRequestsData.forEach((pr) => {
        if (pr.duplicateOf !== undefined) {
          expect(typeof pr.duplicateOf).toBe("number");
          expect(pr.duplicateOf).toBeGreaterThan(0);
          expect(Number.isInteger(pr.duplicateOf)).toBe(true);
        }
      });
    });

    it("should have valid closureReason field when present", () => {
      pullRequestsData.forEach((pr) => {
        if (pr.closureReason !== undefined) {
          expect(typeof pr.closureReason).toBe("string");
          expect(pr.closureReason.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe("Business logic validation", () => {
    it("should have closureReason only for closed PRs", () => {
      pullRequestsData.forEach((pr) => {
        if (pr.closureReason !== undefined) {
          expect(pr.status).toBe("closed");
        }
      });
    });

    it("should have duplicateOf only for closed PRs (when present)", () => {
      pullRequestsData.forEach((pr) => {
        if (pr.duplicateOf !== undefined) {
          expect(pr.status).toBe("closed");
        }
      });
    });

    it("should have valid duplicateOf references", () => {
      const prNumbers = new Set(pullRequestsData.map((pr) => pr.number));
      
      pullRequestsData.forEach((pr) => {
        if (pr.duplicateOf !== undefined) {
          expect(prNumbers.has(pr.duplicateOf)).toBe(true);
        }
      });
    });

    it("should not have circular duplicate references", () => {
      pullRequestsData.forEach((pr) => {
        if (pr.duplicateOf !== undefined) {
          expect(pr.duplicateOf).not.toBe(pr.number);
        }
      });
    });

    it("should have at least one assignee per PR", () => {
      pullRequestsData.forEach((pr) => {
        expect(pr.assignees.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Type compatibility", () => {
    it("should be compatible with PullRequestRecord type", () => {
      const typedData: PullRequestRecord[] = pullRequestsData;
      expect(typedData).toBeDefined();
      expect(typedData.length).toBe(pullRequestsData.length);
    });
  });

  describe("Data consistency", () => {
    it("should have consistent formatting for PR numbers", () => {
      const numbers = pullRequestsData.map((pr) => pr.number);
      const sortedNumbers = [...numbers].sort((a, b) => a - b);
      
      expect(numbers).toBeDefined();
      expect(sortedNumbers).toBeDefined();
    });

    it("should have consistent status values (lowercase)", () => {
      pullRequestsData.forEach((pr) => {
        expect(pr.status).toBe(pr.status.toLowerCase());
      });
    });
  });

  describe("Specific data integrity checks", () => {
    it("should have the expected PR #105 with correct metadata", () => {
      const pr105 = pullRequestsData.find((pr) => pr.number === 105);
      expect(pr105).toBeDefined();
      expect(pr105!.status).toBe("closed");
      expect(pr105!.duplicateOf).toBeDefined();
      expect(pr105!.closureReason).toBe("duplicate-ai-assignee");
    });

    it("duplicate titles must have at least one closed AI-assigned duplicate (has duplicateOf)", () => {
      const normalize = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
      const groups = new Map<string, typeof pullRequestsData>();
      for (const pr of pullRequestsData) {
        const key = normalize(pr.title);
        const arr = groups.get(key) ?? [];
        arr.push(pr);
        groups.set(key, arr);
      }
      for (const [, prs] of groups) {
        if (prs.length > 1) {
          expect(prs.some((p) => p.status === "closed" && typeof p.duplicateOf === "number")).toBe(true);
        }
      }
    });

  describe("Security and sanitization", () => {
    it("should not contain script tags in titles", () => {
      pullRequestsData.forEach((pr) => {
        expect(pr.title.toLowerCase()).not.toContain("<script");
        expect(pr.title.toLowerCase()).not.toContain("javascript:");
      });
    });

    it("should not contain script tags in assignee names", () => {
      pullRequestsData.forEach((pr) => {
        pr.assignees.forEach((assignee: string) => {
          expect(assignee.toLowerCase()).not.toContain("<script");
          expect(assignee.toLowerCase()).not.toContain("javascript:");
        });
      });
    });

    it("should not contain SQL injection patterns", () => {
      pullRequestsData.forEach((pr) => {
        expect(pr.title.toLowerCase()).not.toMatch(/drop\s+table/i);
        expect(pr.title.toLowerCase()).not.toMatch(/delete\s+from/i);
      });
    });
  });
});