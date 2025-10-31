create extension if not exists "uuid-ossp";

-- Tenant helper to avoid literal duplication
create or replace function get_default_tenant()
returns text
language sql
immutable
as
$$
    select 'abaco_financial'::text;
$$;

-- Portfolio Analysis Table
create table if not exists portfolio_analysis (
    id uuid primary key default gen_random_uuid(),
    tenant_id text not null default get_default_tenant(),
    customer_id text not null,
    "timestamp" timestamptz not null default now(),
    data jsonb not null default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Customer Features Table
create table if not exists customer_features (
    id uuid primary key default gen_random_uuid(),
    tenant_id text not null default get_default_tenant(),
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
    tenant_id text not null default get_default_tenant(),
    customer_id text not null,
    alert_type text not null,
    severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
    message text not null,
    details jsonb default '{}',
    is_resolved boolean default false,
    resolved_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Model Evaluations Table
create table if not exists model_evaluations (
    id uuid primary key default gen_random_uuid(),
    tenant_id text not null default get_default_tenant(),
    model_version text not null,
    evaluation_date date not null default current_date,
    scenario text not null,
    metrics jsonb not null default '{}',
    pass_rate decimal(5,4),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table portfolio_analysis enable row level security;
alter table customer_features enable row level security;
alter table financial_alerts enable row level security;
alter table model_evaluations enable row level security;

-- RLS Policies
drop policy if exists tenant_isolation_portfolio on portfolio_analysis;
drop policy if exists tenant_isolation_features on customer_features;
drop policy if exists tenant_isolation_alerts on financial_alerts;
drop policy if exists tenant_isolation_evaluations on model_evaluations;

create policy tenant_isolation_portfolio on portfolio_analysis for all using (tenant_id = get_default_tenant());
create policy tenant_isolation_features on customer_features for all using (tenant_id = get_default_tenant());
create policy tenant_isolation_alerts on financial_alerts for all using (tenant_id = get_default_tenant());
create policy tenant_isolation_evaluations on model_evaluations for all using (tenant_id = get_default_tenant());

-- Functions for updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Triggers
create or replace trigger set_timestamp_portfolio
before update on portfolio_analysis
for each row
execute function update_updated_at_column();

create or replace trigger set_timestamp_features
before update on customer_features
for each row
execute function update_updated_at_column();

create or replace trigger set_timestamp_alerts
before update on financial_alerts
for each row
execute function update_updated_at_column();

create or replace trigger set_timestamp_evaluations
before update on model_evaluations
for each row
execute function update_updated_at_column();
