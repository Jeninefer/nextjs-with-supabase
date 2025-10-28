// Minimal stub for financial intelligence dataset used by API and components.

export type FinancialMetric = { id: string; name: string; value: number; change?: number };

export const financialIntelligence: {
    metrics: FinancialMetric[];
    insights: { id: string; title: string; confidence?: number }[];
} = {
    metrics: [
        { id: "m1", name: "revenue", value: 0, change: 0 },
        { id: "m2", name: "cost", value: 0, change: 0 }
    ],
    insights: [
        { id: "i1", title: "Placeholder insight", confidence: 0.5 }
    ]
};

export default financialIntelligence;
