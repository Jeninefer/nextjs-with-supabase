/* Reusable integration base: retries, rate limit, error normalization */
type Req = RequestInit & { timeoutMs?: number };

export class IntegrationError extends Error {
    constructor(message: string, public cause?: unknown, public status?: number) {
        super(message);
    }
}

export abstract class BaseIntegration {
    private limiter = new Map<string, { tokens: number; ts: number }>();
    protected abstract serviceName(): string;

    protected async fetchJson<T>(url: string, init: Req, rlKey?: string): Promise<T> {
        await this.rateLimit(rlKey ?? this.serviceName(), 5, 1000); // 5 rps token bucket
        const timeoutMs = init.timeoutMs ?? 30_000;

        const doFetch = async () => {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), timeoutMs);
            try {
                const res = await fetch(url, { ...init, signal: ctrl.signal });
                if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    throw new IntegrationError(
                        `${this.serviceName()} HTTP ${res.status}`,
                        txt || undefined,
                        res.status
                    );
                }
                return (await res.json()) as T;
            } finally {
                clearTimeout(t);
            }
        };

        // retries with exponential backoff + jitter
        let attempt = 0;
        let lastErr: unknown;
        while (attempt < 4) {
            try {
                return await doFetch();
            } catch (e) {
                lastErr = e;
                attempt += 1;
                const delay = Math.min(2000 * 2 ** attempt, 10_000) + Math.random() * 200;
                await new Promise((r) => setTimeout(r, delay));
            }
        }
        throw new IntegrationError(`${this.serviceName()} request failed`, lastErr);
    }

    private async rateLimit(key: string, rate: number, perMs: number) {
        const now = Date.now();
        const b = this.limiter.get(key) ?? { tokens: rate, ts: now };
        const elapsed = now - b.ts;
        const refill = Math.floor((elapsed / perMs) * rate);
        b.tokens = Math.min(rate, b.tokens + (refill > 0 ? refill : 0));
        b.ts = refill > 0 ? now : b.ts;
        if (b.tokens <= 0) {
            const wait = perMs / rate;
            await new Promise((r) => setTimeout(r, wait));
        } else {
            b.tokens -= 1;
        }
        this.limiter.set(key, b);
    }
}