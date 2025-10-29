import { LoanFeatures } from "@/types/ml";
import { CONFIG } from "../config";
import { BaseIntegration } from "./base-integration";

export class GrokIntegration extends BaseIntegration {
    protected serviceName(): string { return "xAI"; }

    async riskSummary(features: LoanFeatures): Promise<string> {
        const prompt = [
            "You are a risk analyst. Output a terse, CFO-ready summary.",
            "Return 2 bullets: (1) drivers, (2) decision.",
            "Context JSON:", JSON.stringify(features)
        ].join("\n");

        // try Grok → OpenAI → rules
        try {
            if (CONFIG.XAI_API_KEY) {
                const r = await this.fetchJson<any>(`${CONFIG.XAI_BASE_URL}/chat/completions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${CONFIG.XAI_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: CONFIG.XAI_MODEL,
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.1,
                    }),
                });
                const txt = r?.choices?.[0]?.message?.content;
                if (txt) return txt;
            }
        } catch (_) {/* fall through */ }

        try {
            if (CONFIG.OPENAI_API_KEY) {
                const r = await this.fetchJson<any>("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${CONFIG.OPENAI_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: CONFIG.OPENAI_MODEL,
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.1,
                    }),
                });
                const txt = r?.choices?.[0]?.message?.content;
                if (txt) return txt;
            }
        } catch (_) {/* fall through */ }

        // Rules fallback
        const dpd = features.dpd ?? 0;
        const util = features.utilization ?? 0;
        const eqf = features.equifax_score ?? 650;
        const drivers = [
            `DPD ${dpd}`,
            `Util ${Math.round(util * 100)}%`,
            `Equifax ${Math.round(eqf)}`
        ].join(" | ");
        const decision =
            dpd > 30 || util > 0.9 || eqf < 580 ? "Tighten exposure and trigger collections" :
                dpd > 0 || util > 0.7 ? "Monitor weekly. Cap new credit" :
                    "On plan";
        return `• Drivers: ${drivers}\n• Decision: ${decision}`;
    }

    async scoreHeuristic(features: LoanFeatures): Promise<number> {
        // Simple logistic risk score 0..1
        const w = {
            dpd: 0.9, utilization: 0.6, apr: 0.2, equifax_score: -0.003,
            term_months: 0.01, outstanding_balance: 0.0000004
        };
        const x =
            (features.dpd ?? 0) * w.dpd +
            (features.utilization ?? 0) * 100 * w.utilization +
            (features.apr ?? 0) * w.apr +
            (features.equifax_score ?? 650) * w.equifax_score +
            (features.term_months ?? 0) * w.term_months +
            (features.outstanding_balance ?? 0) * w.outstanding_balance;
        const z = 1 / (1 + Math.exp(-(x - 8))); // calibrated shift
        return Math.max(0, Math.min(1, z));
    }
}