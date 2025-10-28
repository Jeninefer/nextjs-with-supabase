import { z } from "zod";

export const LoanFeaturesSchema = z.object({
    utilization: z.number().optional(),
    dpd: z.number().optional(),
    apr: z.number().optional(),
    eir: z.number().optional(),
    equifax_score: z.number().optional(),
    internal_score: z.number().optional(),
    term_months: z.number().optional(),
    outstanding_balance: z.number().optional(),
    disbursement_amount: z.number().optional(),
    tpv: z.number().optional(),
});

export type LoanFeatures = z.infer<typeof LoanFeaturesSchema>;

export const PredictionInputSchema = z.object({
    loanId: z.string(),
    transferId: z.string().optional(),
    features: LoanFeaturesSchema,
    predictionType: z.enum(["pd", "churn", "fraud"]).default("pd"),
    thresholds: z.object({ high: z.number().optional(), medium: z.number().optional() }).optional(),
});

export type PredictionInput = z.infer<typeof PredictionInputSchema>;

export type PredictionRecord = {
    id: string;
    loan_id: string;
    score: number;
    label: string | null;
    model_name: string;
    model_version: string;
    thresholds: Record<string, unknown> | null;
    features: Record<string, unknown>;
    decision: Record<string, unknown> | null;
    created_at: string;
};

export const FeedbackInputSchema = z.object({
    predictionId: z.string(),
    loanId: z.string().optional(),
    outcomeLabel: z.string().optional(),
    outcomeScore: z.number().min(0).max(1).optional(),
    correct: z.boolean().optional(),
    comments: z.string().optional(),
});

export type FeedbackInput = z.infer<typeof FeedbackInputSchema>;