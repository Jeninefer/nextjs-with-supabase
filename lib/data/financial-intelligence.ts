export type MetricUnit = "currency" | "percentage" | "count" | "ratio";

export interface MetricChange {
    direction: "up" | "down";
    percentage: number;
    absolute?: number;
    period: "MoM" | "QoQ" | "YoY";
}

export interface FinancialMetric {
    id: string;
    label: string;
    description: string;
    value: number;
    unit: MetricUnit;
    currency?: string;
    change: MetricChange;
    target?: number;
}

export interface GrowthPoint {
    month: string;
    netAssetValue: number;
    newAssets: number;
    retentionRate: number;
}

export interface SectorExposure {
    sector: string;
    allocation: number;
    changeBps: number;
}

export interface StressScenario {
    scenario: string;
    lossImpact: number;
    probability: number;
}

export interface EarlyWarning {
    id: string;
    label: string;
    severity: "low" | "moderate" | "high";
    detail: string;
}

export interface RiskOverview {
    summary: string;
    score: number;
    status: "low" | "moderate" | "high";
    valueAtRisk: {
        amount: number;
        horizon: string;
        confidence: number;
    };
    expectedShortfall: number;
    defaultRate: number;
    exposures: SectorExposure[];
    stressScenarios: StressScenario[];
    earlyWarnings: EarlyWarning[];
}

export interface ProviderStatus {
    name: string;
    status: "operational" | "degraded" | "offline";
    responseTimeMs: number;
    lastSync: string;
    coverage: string[];
}

export interface Insight {
    id: string;
    title: string;
    summary: string;
    confidence: number;
    impact: "high" | "medium" | "low";
    recommendedAction: string;
    tags: string[];
}

export interface FinancialDashboardDataset {
    metrics: FinancialMetric[];
    growthSeries: GrowthPoint[];
    risk: RiskOverview;
    providers: ProviderStatus[];
    insights: Insight[];
    generatedAt: string;
    refreshIntervalMinutes: number;
}

const now = new Date();

function formatShortMonth(date: Date): string {
    return date.toLocaleString("en-US", { month: "short", year: "2-digit" });
}

function addMonths(date: Date, months: number): Date {
    const clone = new Date(date.getTime());
    clone.setMonth(clone.getMonth() + months);
    return clone;
}

function toIsoString(date: Date): string {
    return date.toISOString();
}

const growthSeries: GrowthPoint[] = Array.from({ length: 12 }).map((_, index) => {
    const date = addMonths(now, index - 11);
    const nav = 18_000_000 + index * 650_000;
    const inflows = 380_000 + index * 15_000;
    const retention = Math.min(0.985, 0.9 + index * 0.003);

    return {
        month: formatShortMonth(date),
        netAssetValue: nav,
        newAssets: inflows,
        retentionRate: Number(retention.toFixed(3)),
    } satisfies GrowthPoint;
});

export const financialDashboardDataset: FinancialDashboardDataset = {
    metrics: [
        {
            id: "aum",
            label: "Assets Under Management",
            description: "Total assets actively managed across lending programs.",
            value: 25_400_000,
            unit: "currency",
            currency: "USD",
            change: {
                direction: "up",
                percentage: 4.2,
                absolute: 1_020_000,
                period: "MoM",
            },
            target: 26_000_000,
        },
        {
            id: "activeClients",
            label: "Active Institutional Clients",
            description: "Institutions with funds deployed in the last 30 days.",
            value: 1_247,
            unit: "count",
            change: {
                direction: "up",
                percentage: 2.6,
                absolute: 32,
                period: "MoM",
            },
            target: 1_300,
        },
        {
            id: "defaultRate",
            label: "Portfolio Default Rate",
            description: "Trailing 90-day default rate across originations.",
            value: 3.2,
            unit: "percentage",
            change: {
                direction: "down",
                percentage: 0.4,
                absolute: 0.1,
                period: "QoQ",
            },
            target: 2.9,
        },
        {
            id: "apr",
            label: "Weighted APR",
            description: "Blended annualised yield across all active facilities.",
            value: 18.5,
            unit: "percentage",
            change: {
                direction: "up",
                percentage: 0.7,
                absolute: 0.3,
                period: "MoM",
            },
            target: 19.0,
        },
        {
            id: "turnaround",
            label: "Credit Decision Turnaround",
            description: "Median decisioning time across intake pipeline (minutes).",
            value: 42,
            unit: "count",
            change: {
                direction: "down",
                percentage: 6.1,
                absolute: 3,
                period: "MoM",
            },
            target: 36,
        },
    ],
    growthSeries,
    risk: {
        summary: "Portfolio risk remains comfortably within operating guardrails with improved collateral coverage and lower defaults in growth sectors.",
        score: 27,
        status: "low",
        valueAtRisk: {
            amount: 1_240_000,
            horizon: "10-day",
            confidence: 0.95,
        },
        expectedShortfall: 1_780_000,
        defaultRate: 0.032,
        exposures: [
            { sector: "SaaS Lending", allocation: 0.28, changeBps: -18 },
            { sector: "SMB Working Capital", allocation: 0.22, changeBps: 9 },
            { sector: "Healthcare", allocation: 0.19, changeBps: 4 },
            { sector: "Climate & ESG", allocation: 0.16, changeBps: -6 },
            { sector: "Fintech Partnerships", allocation: 0.15, changeBps: 2 },
        ],
        stressScenarios: [
            { scenario: "Recessionary Shock", lossImpact: 0.072, probability: 0.12 },
            { scenario: "Credit Tightening", lossImpact: 0.054, probability: 0.18 },
            { scenario: "FX Dislocation", lossImpact: 0.031, probability: 0.08 },
        ],
        earlyWarnings: [
            {
                id: "ew-1",
                label: "North America SMB",
                severity: "moderate",
                detail: "Delinquency creeping above 4.5% threshold in Q4 cohorts.",
            },
            {
                id: "ew-2",
                label: "FX Hedging Buffer",
                severity: "low",
                detail: "Coverage ratio at 1.08× versus 1.1× policy floor.",
            },
        ],
    },
    providers: [
        {
            name: "Supabase Analytics Lake",
            status: "operational",
            responseTimeMs: 183,
            lastSync: toIsoString(now),
            coverage: ["portfolio_metrics", "risk_events"],
        },
        {
            name: "Global Market Data Feed",
            status: "degraded",
            responseTimeMs: 412,
            lastSync: toIsoString(addMonths(now, -1 / 3)),
            coverage: ["fx_rates", "volatility_index"],
        },
        {
            name: "Credit Bureau Bridge",
            status: "operational",
            responseTimeMs: 205,
            lastSync: toIsoString(now),
            coverage: ["bureau_scores", "early_warnings"],
        },
    ],
    insights: [
        {
            id: "insight-aum",
            title: "Growth concentration in SaaS lending",
            summary: "SaaS facilities delivered 46% of net new assets this quarter while maintaining sub-3% defaults.",
            confidence: 0.92,
            impact: "high",
            recommendedAction: "Expand underwriting capacity for recurring revenue facilities and uplift marketing budget by 12%.",
            tags: ["growth", "saas", "portfolio"],
        },
        {
            id: "insight-risk",
            title: "Stress resilience improving",
            summary: "Updated collateral waterfall reduces expected losses by 180 bps under the recessionary scenario.",
            confidence: 0.84,
            impact: "medium",
            recommendedAction: "Publish revised stress test deck for risk committee and reduce reserve buffer guidance by 0.5%.",
            tags: ["risk", "stress-testing"],
        },
        {
            id: "insight-ops",
            title: "Decision turnaround opportunity",
            summary: "Workflow automation trimmed median decisioning time by 6% but queue backlog spikes on Mondays.",
            confidence: 0.78,
            impact: "medium",
            recommendedAction: "Introduce staggered underwriting shifts early in the week and extend task automation to KYC reviews.",
            tags: ["operations", "automation"],
        },
    ],
    generatedAt: toIsoString(now),
    refreshIntervalMinutes: 5,
};

export const financialIntelligence = financialDashboardDataset;

export default financialDashboardDataset;
