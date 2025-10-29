import { CONFIG } from "@/lib/config";
import { GrokIntegration } from "@/lib/integrations/grok-integration";
import type { FeedbackInput, PredictionInput, PredictionRecord } from "@/types/ml";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_ROLE_KEY ?? CONFIG.SUPABASE_ANON_KEY);

export class ContinueLearning {
    private grok = new GrokIntegration();

    async predictAndLog(input: PredictionInput) {
        const score = await this.grok.scoreHeuristic(input.features);
        const label = score >= (input.thresholds?.high ?? 0.5) ? "HIGH" :
            score >= (input.thresholds?.medium ?? 0.25) ? "MEDIUM" : "LOW";
        const summary = await this.grok.riskSummary(input.features);

        const { data, error } = await supabase
            .from("ml.predictions")
            .insert({
                loan_id: input.loanId,
                transfer_id: input.transferId ?? null,
                prediction_type: input.predictionType,
                score,
                label,
                model_name: CONFIG.ML_MODEL_NAME,
                model_version: CONFIG.ML_MODEL_VERSION,
                thresholds: input.thresholds ?? null,
                features: input.features as any,
                decision: { summary },
                source: "api",
            })
            .select()
            .single();

        if (error) throw error;
        return data as PredictionRecord;
    }

    async recordFeedback(fb: FeedbackInput) {
        const { error } = await supabase.from("ml.feedback").insert({
            prediction_id: fb.predictionId,
            loan_id: fb.loanId ?? null,
            outcome_label: fb.outcomeLabel ?? null,
            outcome_score: fb.outcomeScore ?? null,
            correct: fb.correct ?? null,
            comments: fb.comments ?? null,
        });
        if (error) throw error;
    }

    // Simple online calibration: update moving thresholds monthly based on accuracy
    async updateMetrics(windowDays = 30) {
        const { data: preds } = await supabase
            .from("ml.predictions")
            .select("id, score, created_at")
            .gte("created_at", new Date(Date.now() - windowDays * 864e5).toISOString());

        const { data: fbs } = await supabase
            .from("ml.feedback")
            .select("prediction_id, correct");

        const fbById = new Map<string, boolean>();
        (fbs ?? []).forEach((r) => { if (r.correct !== null) fbById.set(r.prediction_id, !!r.correct); });

        let n = 0, brier = 0, acc = 0;
        for (const p of preds ?? []) {
            const y = fbById.get(p.id);
            if (typeof y === "boolean") {
                n += 1;
                brier += (p.score - (y ? 1 : 0)) ** 2;
                acc += (p.score >= 0.5) === y ? 1 : 0;
            }
        }
        const metrics = { windowDays, samples: n, brier: n ? brier / n : null, acc: n ? acc / n : null };

        await supabase.from("ml.learning_metrics").insert({
            model_name: CONFIG.ML_MODEL_NAME,
            model_version: CONFIG.ML_MODEL_VERSION,
            window: `${windowDays}d`,
            metrics,
        });

        return metrics;
    }
}