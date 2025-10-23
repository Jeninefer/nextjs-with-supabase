-- ABACO Financial Intelligence Platform
-- Database Schema for Customer Financial Data
-- Migration: 001_create_abaco_schema.sql
-- Created: 2025-01-27

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create abaco_customers table
CREATE TABLE IF NOT EXISTS public.abaco_customers (
    -- Primary identifier
    id BIGSERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL UNIQUE,
    
    -- Financial metrics
    account_balance DECIMAL(12, 2) NOT NULL,
    credit_limit DECIMAL(12, 2) NOT NULL,
    monthly_spending DECIMAL(12, 2) NOT NULL,
    -- Credit score is assumed to be a FICO score (range: 300-850)
    credit_score INTEGER NOT NULL CHECK (credit_score >= 300 AND credit_score <= 850),
    monthly_income DECIMAL(12, 2) NOT NULL,
    loan_amount DECIMAL(12, 2) NOT NULL,
    
    -- Account information
    account_type VARCHAR(50) NOT NULL,
    risk_category VARCHAR(50) NOT NULL,
    years_with_bank INTEGER NOT NULL CHECK (years_with_bank >= 0),
    
    -- Risk and performance metrics
    payment_history_score DECIMAL(5, 4) NOT NULL CHECK (payment_history_score >= 0 AND payment_history_score <= 1),
    utilization_ratio DECIMAL(5, 3) NOT NULL CHECK (utilization_ratio >= 0),
    debt_to_income DECIMAL(5, 3) NOT NULL CHECK (debt_to_income >= 0),
    risk_score DECIMAL(5, 2) NOT NULL,
    profit_margin DECIMAL(5, 2) NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_customer_id ON public.abaco_customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_risk_category ON public.abaco_customers(risk_category);
CREATE INDEX IF NOT EXISTS idx_credit_score ON public.abaco_customers(credit_score);
CREATE INDEX IF NOT EXISTS idx_account_balance ON public.abaco_customers(account_balance);
CREATE INDEX IF NOT EXISTS idx_account_type ON public.abaco_customers(account_type);
CREATE INDEX IF NOT EXISTS idx_risk_score ON public.abaco_customers(risk_score);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.abaco_customers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.abaco_customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow authenticated users to read data
CREATE POLICY "Allow authenticated read access" ON public.abaco_customers
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access" ON public.abaco_customers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create a view for summary statistics
CREATE OR REPLACE VIEW public.abaco_customer_stats AS
SELECT
    COUNT(*) as total_customers,
    AVG(account_balance) as avg_balance,
    AVG(credit_score) as avg_credit_score,
    AVG(risk_score) as avg_risk_score,
    COUNT(CASE WHEN risk_category = 'High' THEN 1 END) as high_risk_count,
    COUNT(CASE WHEN risk_category = 'Medium' THEN 1 END) as medium_risk_count,
    COUNT(CASE WHEN risk_category = 'Low' THEN 1 END) as low_risk_count
FROM public.abaco_customers;

-- Grant access to the view
GRANT SELECT ON public.abaco_customer_stats TO authenticated;
GRANT SELECT ON public.abaco_customer_stats TO service_role;

-- Add comments for documentation
COMMENT ON TABLE public.abaco_customers IS 'ABACO Financial Intelligence Platform - Customer financial data and risk metrics';
COMMENT ON COLUMN public.abaco_customers.customer_id IS 'Unique customer identifier';
COMMENT ON COLUMN public.abaco_customers.account_balance IS 'Current account balance in USD';
COMMENT ON COLUMN public.abaco_customers.credit_limit IS 'Maximum credit limit in USD';
COMMENT ON COLUMN public.abaco_customers.credit_score IS 'FICO credit score (300-850)';
COMMENT ON COLUMN public.abaco_customers.risk_category IS 'Risk classification: Low, Medium, High';
COMMENT ON COLUMN public.abaco_customers.risk_score IS 'Calculated risk score based on multiple factors';
COMMENT ON COLUMN public.abaco_customers.profit_margin IS 'Expected profit margin percentage';
