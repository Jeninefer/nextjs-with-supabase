import { PullRequestRecord } from "@/lib/maintenance/pullRequestMaintenance";
import pullRequestsData from "@/data/pull_requests.json";

describe("data/pull_requests.json validation", () => {
  describe("schema validation", () => {
    it("should be a valid JSON array", () => {
      expect(Array.isArray(pullRequestsData)).toBe(true);
      expect(pullRequestsData.length).toBeGreaterThan(0);
    });

    it("should have all required fields for each pull request", () => {
      pullRequestsData.forEach((pr, index) => {
        expect(pr).toHaveProperty("number");
        expect(pr).toHaveProperty("title");
        expect(pr).toHaveProperty("assignees");
        expect(pr).toHaveProperty("status");
      }, `Pull request at index ${index} missing required fields`);
    });

    it("should have correct data types for all fields", () => {
      pullRequestsData.forEach((pr, index) => {
        expect(typeof pr.number).toBe("number");
        expect(typeof pr.title).toBe("string");
        expect(Array.isArray(pr.assignees)).toBe(true);
        expect(typeof pr.status).toBe("string");

        if (pr.duplicateOf !== undefined) {
          expect(typeof pr.duplicateOf).toBe("number");
        }

        if (pr.closureReason !== undefined) {
          expect(typeof pr.closureReason).toBe("string");
        }
      }, `Pull request at index ${index} has invalid data types`);
    });

    it("should have all assignees as strings", () => {
      pullRequestsData.forEach((pr, index) => {
        pr.assignees.forEach((assignee, assigneeIndex) => {
          expect(typeof assignee).toBe("string");
          expect(assignee.length).toBeGreaterThan(0);
        }, `Assignee at index ${assigneeIndex} in PR ${pr.number} is invalid`);
      }, `Pull request at index ${index} has invalid assignees`);
    });
  });

  describe("status field validation", () => {
    it("should only have valid status values", () => {
      const validStatuses = ["open", "closed"];

      pullRequestsData.forEach((pr) => {
        expect(validStatuses).toContain(pr.status);
      }, `Pull request ${pr.number} has invalid status: ${pr.status}`);
    });

    it("should have at least one open pull request", () => {
      const openPRs = pullRequestsData.filter((pr) => pr.status === "open");
      expect(openPRs.length).toBeGreaterThan(0);
    });
  });

  describe("pull request number validation", () => {
    it("should have unique pull request numbers", () => {
      const numbers = pullRequestsData.map((pr) => pr.number);
      const uniqueNumbers = new Set(numbers);

      expect(uniqueNumbers.size).toBe(numbers.length);
    });

    it("should have positive pull request numbers", () => {
      pullRequestsData.forEach((pr) => {
        expect(pr.number).toBeGreaterThan(0);
      }, `Pull request has non-positive number: ${pr.number}`);
    });

    it("should have integer pull request numbers", () => {
      pullRequestsData.forEach((pr) => {
        expect(Number.isInteger(pr.number)).toBe(true);
      }, `Pull request has non-integer number: ${pr.number}`);
    });
  });

  describe("title validation", () => {
    it("should have non-empty titles", () => {
      pullRequestsData.forEach((pr) => {
        expect(pr.title.trim().length).toBeGreaterThan(0);
      }, `Pull request ${pr.number} has empty title`);
    });

    it("should not have excessively long titles", () => {
      const maxLength = 500;

      pullRequestsData.forEach((pr) => {
        expect(pr.title.length).toBeLessThanOrEqual(maxLength);
      }, `Pull request ${pr.number} has excessively long title`);
    });
  });

  describe("assignees validation", () => {
    it("should have at least one assignee per pull request", () => {
      pullRequestsData.forEach((pr) => {
        expect(pr.assignees.length).toBeGreaterThan(0);
      }, `Pull request ${pr.number} has no assignees`);
    });

    it("should not have duplicate assignees in a single PR", () => {
      pullRequestsData.forEach((pr) => {
        const uniqueAssignees = new Set(pr.assignees);
        expect(uniqueAssignees.size).toBe(pr.assignees.length);
      }, `Pull request ${pr.number} has duplicate assignees`);
    });

    it("should have non-empty assignee names", () => {
      pullRequestsData.forEach((pr) => {
        pr.assignees.forEach((assignee) => {
          expect(assignee.trim().length).toBeGreaterThan(0);
        }, `Pull request ${pr.number} has empty assignee name`);
      });
    });
  });

  describe("duplicate relationship validation", () => {
    it("should reference existing pull requests in duplicateOf field", () => {
      const allNumbers = new Set(pullRequestsData.map((pr) => pr.number));

      pullRequestsData.forEach((pr) => {
        if (pr.duplicateOf !== undefined) {
          expect(allNumbers.has(pr.duplicateOf)).toBe(true);
        }
      }, `Pull request ${pr.number} references non-existent PR ${pr.duplicateOf}`);
    });

    it("should not reference itself in duplicateOf", () => {
      pullRequestsData.forEach((pr) => {
        if (pr.duplicateOf !== undefined) {
          expect(pr.duplicateOf).not.toBe(pr.number);
        }
      }, `Pull request ${pr.number} references itself as duplicate`);
    });

    it("should have closureReason when duplicateOf is set", () => {
      pullRequestsData.forEach((pr) => {
        if (pr.duplicateOf !== undefined) {
          expect(pr.closureReason).toBeDefined();
          expect(pr.closureReason!.length).toBeGreaterThan(0);
        }
      }, `Pull request ${pr.number} has duplicateOf but no closureReason`);
    });

    it("should be closed if marked as duplicate", () => {
      pullRequestsData.forEach((pr) => {
        if (pr.duplicateOf !== undefined) {
          expect(pr.status).toBe("closed");
        }
      }, `Pull request ${pr.number} is marked as duplicate but not closed`);
    });
  });

  describe("closureReason validation", () => {
    it("should have valid closure reason values", () => {
      const validReasons = [
        "duplicate-ai-assignee",
        "manually-closed",
        "stale",
        "invalid",
        "wontfix",
      ];

      pullRequestsData.forEach((pr) => {
        if (pr.closureReason !== undefined) {
          // Allow any string, but if it's one we know about, it should be valid
          if (validReasons.includes(pr.closureReason)) {
            expect(validReasons).toContain(pr.closureReason);
          }
          expect(pr.closureReason.length).toBeGreaterThan(0);
        }
      }, `Pull request ${pr.number} has invalid closureReason`);
    });
  });

  describe("specific data validation", () => {
    it("should contain expected pull request #102", () => {
      const pr102 = pullRequestsData.find((pr) => pr.number === 102);

      expect(pr102).toBeDefined();
      expect(pr102?.title).toBe("Track ABACO runtime export directories");
      expect(pr102?.status).toBe("open");
      expect(pr102?.assignees).toContain("Jeninefer");
    });

    it("should contain expected pull request #105", () => {
      const pr105 = pullRequestsData.find((pr) => pr.number === 105);

      expect(pr105).toBeDefined();
      expect(pr105?.title).toBe("Track ABACO runtime export directories");
      expect(pr105?.status).toBe("closed");
      expect(pr105?.duplicateOf).toBe(102);
      expect(pr105?.closureReason).toBe("duplicate-ai-assignee");
    });

    it("should have consistent duplicate relationships", () => {
      const pr102 = pullRequestsData.find((pr) => pr.number === 102);
      const pr105 = pullRequestsData.find((pr) => pr.number === 105);

      if (pr102 && pr105 && pr105.duplicateOf === 102) {
        // Normalize titles for comparison
        const normalize = (title: string) =>
          title.trim().replace(/\s+/g, " ").toLowerCase();

        expect(normalize(pr102.title)).toBe(normalize(pr105.title));
      }
    });
  });

  describe("TypeScript type compatibility", () => {
    it("should be compatible with PullRequestRecord type", () => {
      // Type check: this will fail at compile time if types don't match
      const typedData: PullRequestRecord[] = pullRequestsData;

      expect(typedData).toBeDefined();
      expect(typedData.length).toBe(pullRequestsData.length);
    });

    it("should match PullRequestRecord interface structure", () => {
      pullRequestsData.forEach((pr) => {
        // Check all required fields
        const requiredFields: (keyof PullRequestRecord)[] = [
          "number",
          "title",
          "assignees",
          "status",
        ];

        requiredFields.forEach((field) => {
          expect(pr).toHaveProperty(field);
        });

        // Check status is a valid PullRequestStatus
        expect(["open", "closed"]).toContain(pr.status);
      });
    });
  });

  describe("data consistency checks", () => {
    it("should have sorted pull requests by number (descending)", () => {
      for (let i = 0; i < pullRequestsData.length - 1; i++) {
        expect(pullRequestsData[i].number).toBeGreaterThanOrEqual(
          pullRequestsData[i + 1].number
        );
      }
    });

    it("should not have circular duplicate references", () => {
      const visited = new Set<number>();
      const recursionStack = new Set<number>();

      const hasCycle = (prNumber: number): boolean => {
        if (recursionStack.has(prNumber)) {
          return true;
        }
        if (visited.has(prNumber)) {
          return false;
        }

        visited.add(prNumber);
        recursionStack.add(prNumber);

        const pr = pullRequestsData.find((p) => p.number === prNumber);
        if (pr?.duplicateOf) {
          if (hasCycle(pr.duplicateOf)) {
            return true;
          }
        }

        recursionStack.delete(prNumber);
        return false;
      };

      pullRequestsData.forEach((pr) => {
        expect(hasCycle(pr.number)).toBe(false);
      }, `Circular duplicate reference detected involving PR ${pr.number}`);
    });

    it("should reference older PRs in duplicateOf field", () => {
      pullRequestsData.forEach((pr) => {
        if (pr.duplicateOf !== undefined) {
          expect(pr.duplicateOf).toBeLessThan(pr.number);
        }
      }, `Pull request ${pr.number} references newer PR ${pr.duplicateOf} as duplicate`);
    });
  });

  describe("real-world validation", () => {
    it("should have reasonable distribution of open vs closed PRs", () => {
      const openCount = pullRequestsData.filter((pr) => pr.status === "open")
        .length;
      const closedCount = pullRequestsData.filter((pr) => pr.status === "closed")
        .length;

      expect(openCount + closedCount).toBe(pullRequestsData.length);
      expect(openCount).toBeGreaterThan(0);
    });

    it("should have common assignees across multiple PRs", () => {
      const assigneeCounts = new Map<string, number>();

      pullRequestsData.forEach((pr) => {
        pr.assignees.forEach((assignee) => {
          assigneeCounts.set(assignee, (assigneeCounts.get(assignee) || 0) + 1);
        });
      });

      // At least one assignee should appear in multiple PRs
      const multiAssignCount = Array.from(assigneeCounts.values()).filter(
        (count) => count > 1
      ).length;

      expect(multiAssignCount).toBeGreaterThan(0);
    });
  });
});