import { GrokIntegration } from "@/lib/integrations/grok-integration";
import { LoanFeatures } from "@/types/ml";

describe("GrokIntegration", () => {
    let grok: GrokIntegration;

    beforeEach(() => {
        grok = new GrokIntegration();
    });

    describe("scoreHeuristic", () => {
        it("should return score between 0 and 1", async () => {
            const features: LoanFeatures = {
                dpd: 15,
                utilization: 0.6,
                apr: 18,
                equifax_score: 700,
            };

            const score = await grok.scoreHeuristic(features);
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(1);
        });

        it("should score higher for risky features", async () => {
            const lowRisk: LoanFeatures = {
                dpd: 0,
                utilization: 0.3,
                apr: 12,
                equifax_score: 800,
            };

            const highRisk: LoanFeatures = {
                dpd: 60,
                utilization: 0.95,
                apr: 24,
                equifax_score: 500,
            };

            const lowScore = await grok.scoreHeuristic(lowRisk);
            const highScore = await grok.scoreHeuristic(highRisk);

            expect(highScore).toBeGreaterThan(lowScore);
        });

        it("should handle missing features", async () => {
            const features: LoanFeatures = {};
            const score = await grok.scoreHeuristic(features);
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(1);
        });

        it("should handle edge case: all zeros", async () => {
            const features: LoanFeatures = {
                dpd: 0,
                utilization: 0,
                apr: 0,
                equifax_score: 0,
                term_months: 0,
                outstanding_balance: 0,
            };

            const score = await grok.scoreHeuristic(features);
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(1);
        });
    });

    describe("riskSummary", () => {
        it("should return non-empty summary", async () => {
            const features: LoanFeatures = {
                dpd: 20,
                utilization: 0.7,
                equifax_score: 680,
            };

            const summary = await grok.riskSummary(features);
            expect(summary).toBeTruthy();
            expect(typeof summary).toBe("string");
        });

        it("should include bullet points in rules fallback", async () => {
            const features: LoanFeatures = {
                dpd: 5,
                utilization: 0.5,
            };

            const summary = await grok.riskSummary(features);
            expect(summary).toContain("•");
        });

        it("should include decision guidance", async () => {
            const features: LoanFeatures = {
                dpd: 0,
                utilization: 0.4,
                equifax_score: 750,
            };

            const summary = await grok.riskSummary(features);
            expect(summary).toContain("Drivers");
            expect(summary).toContain("Decision");
        });

        it("should flag high-risk scenarios", async () => {
            const highRisk: LoanFeatures = {
                dpd: 40,
                utilization: 0.92,
                equifax_score: 550,
            };

            const summary = await grok.riskSummary(highRisk);
            expect(summary).toBeTruthy();
        });
    });
});