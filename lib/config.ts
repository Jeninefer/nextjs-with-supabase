export const CONFIG = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY, // optional for server
    XAI_BASE_URL: process.env.XAI_BASE_URL ?? "https://api.x.ai/v1",
    XAI_API_KEY: process.env.XAI_API_KEY,
    XAI_MODEL: process.env.XAI_MODEL ?? "grok-2-latest",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    HF_API_KEY: process.env.HF_API_KEY,
    HF_MODEL: process.env.HF_MODEL ?? "meta-llama/Llama-3.1-8B-Instruct",
    ML_MODEL_NAME: "abaco-risk",
    ML_MODEL_VERSION: "v0.1.0",
};