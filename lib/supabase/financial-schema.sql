-- Supabase Financial Intelligence Schema
-- Optimized for the AI Toolkit notebook integration

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Portfolio Analysis Table
create table if not exists portfolio_analysis (
    id uuid primary key default gen_random_uuid(),
    tenant_id text not null default 'abaco_financial',
    analysis_date date not null default current_date,
    analysis_type text not null,
    kpis jsonb not null default '{}',
    insights text[] default '{}',
    recommendations text[] default '{}',
    metadata jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Customer Features Table  
create table if not exists customer_features (
    id uuid primary key default gen_random_uuid(),
    tenant_id text not null default 'abaco_financial',
    customer_id text not null,
    analysis_date date not null default current_date,
    features jsonb not null default '{}',
    risk_metrics jsonb default '{}',
    alerts jsonb default '[]',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Financial Alerts Table
create table if not exists financial_alerts (
    id uuid primary key default gen_random_uuid(),
    tenant_id text not null default 'abaco_financial',
    customer_id text not null,
    alert_type text not null,
    severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
    message text not null,
    details jsonb default '{}',
    is_resolved boolean default false,
    resolved_at timestamptz,
    created_at timestamptz default now()
);

-- Model Evaluations Table
create table if not exists model_evaluations (
    id uuid primary key default gen_random_uuid(),
    tenant_id text not null default 'abaco_financial',
    model_version text not null,
    evaluation_date date not null default current_date,
    scenario text not null,
    metrics jsonb not null default '{}',
    pass_rate decimal(5,4),
    status text check (status in ('PASS', 'FAIL', 'WARNING')),
    recommendations jsonb default '[]',
    created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_portfolio_analysis_tenant_date on portfolio_analysis(tenant_id, analysis_date desc);
create index if not exists idx_customer_features_tenant_customer on customer_features(tenant_id, customer_id, analysis_date desc);
create index if not exists idx_financial_alerts_customer_severity on financial_alerts(customer_id, severity, created_at desc);
create index if not exists idx_model_evaluations_date_status on model_evaluations(evaluation_date desc, status);

-- JSONB indexes
create index if not exists idx_portfolio_analysis_kpis_gin on portfolio_analysis using gin (kpis);
create index if not exists idx_customer_features_gin on customer_features using gin (features);

-- Row Level Security
alter table portfolio_analysis enable row level security;
alter table customer_features enable row level security;
alter table financial_alerts enable row level security;
alter table model_evaluations enable row level security;

-- RLS Policies
create policy "tenant_isolation_portfolio" on portfolio_analysis for all using (tenant_id = 'abaco_financial');
create policy "tenant_isolation_features" on customer_features for all using (tenant_id = 'abaco_financial');
create policy "tenant_isolation_alerts" on financial_alerts for all using (tenant_id = 'abaco_financial');
create policy "tenant_isolation_evaluations" on model_evaluations for all using (tenant_id = 'abaco_financial');

-- Functions for updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Apply update triggers
drop trigger if exists update_portfolio_analysis_updated_at on portfolio_analysis;
create trigger update_portfolio_analysis_updated_at
    before update on portfolio_analysis
    for each row execute function update_updated_at_column();

drop trigger if exists update_customer_features_updated_at on customer_features;
create trigger update_customer_features_updated_at
    before update on customer_features
    for each row execute function update_updated_at_column();
