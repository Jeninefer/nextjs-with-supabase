
-- Financial Intelligence Schema for Abaco
-- Extending existing Supabase setup with financial analytics tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Portfolio Analysis Table
CREATE TABLE IF NOT EXISTS portfolio_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL DEFAULT 'abaco_financial',
    customer_id TEXT NOT NULL,
    analysis_type TEXT NOT NULL,
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    data JSONB NOT NULL DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Features Table
CREATE TABLE IF NOT EXISTS customer_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL DEFAULT 'abaco_financial',
    customer_id TEXT NOT NULL,
    analysis_type TEXT NOT NULL,
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    data JSONB NOT NULL DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Alerts Table
CREATE TABLE IF NOT EXISTS financial_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL DEFAULT 'abaco_financial',
    customer_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Model Evaluation Results Table
CREATE TABLE IF NOT EXISTS model_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL DEFAULT 'abaco_financial',
    model_version TEXT NOT NULL,
    evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    scenario TEXT NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}',
    pass_rate DECIMAL(5,4),
    status TEXT CHECK (status IN ('PASS', 'FAIL', 'WARNING')),
    recommendations JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_portfolio_analysis_tenant_date 
    ON portfolio_analysis(tenant_id, analysis_date DESC);

CREATE INDEX IF NOT EXISTS idx_portfolio_analysis_customer 
    ON portfolio_analysis(customer_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_portfolio_analysis_type 
    ON portfolio_analysis(analysis_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_customer_features_tenant_customer 
    ON customer_features(tenant_id, customer_id, analysis_date DESC);

CREATE INDEX IF NOT EXISTS idx_customer_features_date 
    ON customer_features(analysis_date DESC, customer_id);

CREATE INDEX IF NOT EXISTS idx_financial_alerts_customer_severity 
    ON financial_alerts(customer_id, severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_financial_alerts_unresolved 
    ON financial_alerts(tenant_id, is_resolved, created_at DESC) 
    WHERE is_resolved = FALSE;

CREATE INDEX IF NOT EXISTS idx_model_evaluations_date_status 
    ON model_evaluations(evaluation_date DESC, status);

-- JSONB indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_portfolio_analysis_data_gin 
    ON portfolio_analysis USING GIN (data);

CREATE INDEX IF NOT EXISTS idx_customer_features_data_gin 
    ON customer_features USING GIN (data);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
DROP TRIGGER IF EXISTS update_portfolio_analysis_updated_at ON portfolio_analysis;
CREATE TRIGGER update_portfolio_analysis_updated_at
    BEFORE UPDATE ON portfolio_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_features_updated_at ON customer_features;
CREATE TRIGGER update_customer_features_updated_at
    BEFORE UPDATE ON customer_features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE portfolio_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for multi-tenant security
CREATE POLICY portfolio_analysis_tenant_policy ON portfolio_analysis
    FOR ALL TO authenticated
    USING (tenant_id = 'abaco_financial');

CREATE POLICY customer_features_tenant_policy ON customer_features
    FOR ALL TO authenticated
    USING (tenant_id = 'abaco_financial');

CREATE POLICY financial_alerts_tenant_policy ON financial_alerts
    FOR ALL TO authenticated
    USING (tenant_id = 'abaco_financial');

CREATE POLICY model_evaluations_tenant_policy ON model_evaluations
    FOR ALL TO authenticated
    USING (tenant_id = 'abaco_financial');

-- Performance views for common queries
CREATE OR REPLACE VIEW portfolio_summary AS
SELECT 
    analysis_date,
    COUNT(*) as total_analyses,
    AVG(CAST(data->>'aum' AS NUMERIC)) as avg_aum,
    AVG(CAST(data->>'default_rate' AS NUMERIC)) as avg_default_rate,
    MAX(timestamp) as last_updated
FROM portfolio_analysis
WHERE analysis_type = 'portfolio_analysis'
    AND tenant_id = 'abaco_financial'
GROUP BY analysis_date
ORDER BY analysis_date DESC;

CREATE OR REPLACE VIEW critical_alerts AS
SELECT 
    customer_id,
    alert_type,
    message,
    details,
    created_at
FROM financial_alerts
WHERE severity = 'critical' 
    AND is_resolved = FALSE
    AND tenant_id = 'abaco_financial'
ORDER BY created_at DESC;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
