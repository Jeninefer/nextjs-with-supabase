-- Abaco Financial Intelligence Platform - Production Database Schema
-- AI Toolkit Integrated Financial Intelligence Platform

set search_path to public;

-- Enable required extensions for financial intelligence platform
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_stat_statements";

-- Financial Intelligence Platform Core Tables

-- User profiles for Abaco Financial Intelligence Platform
create table if not exists user_profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  role text default 'analyst' 
    check (role in ('analyst', 'manager', 'admin', 'executive')),
  department text check (department in ('RISK', 'PORTFOLIO', 'ANALYTICS', 'EXECUTIVE')),
  tenant_id text not null default 'abaco_financial',
  permissions jsonb default '[]'::jsonb,
  last_login timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Portfolio analysis sessions with AI agent tracing
create table if not exists portfolio_analysis (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null unique,
  analyst_id uuid references user_profiles(id) on delete set null,
  tenant_id text not null default 'abaco_financial',
  customer_segment text not null 
    check (customer_segment in ('ENTERPRISE', 'CORPORATE', 'SME', 'RETAIL', 'PORTFOLIO')),
  analysis_date date not null default current_date,
  status text default 'processing' 
    check (status in ('processing', 'completed', 'failed', 'archived')),
  kpis jsonb default '{}'::jsonb,
  insights jsonb default '[]'::jsonb,
  alerts jsonb default '[]'::jsonb,
  trace_data jsonb default '{}'::jsonb, -- AI Toolkit tracing
  performance_metrics jsonb default '{}'::jsonb,
  cosmos_partition_key text generated always as (
    tenant_id || '/' || customer_segment || '/' || analysis_date::text
  ) stored,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

-- Financial data for Abaco platform analysis
create table if not exists financial_data (
  id uuid primary key default uuid_generate_v4(),
  customer_id text not null,
  tenant_id text not null default 'abaco_financial',
  balance numeric(15,2) not null check (balance >= 0),
  credit_limit numeric(15,2) not null check (credit_limit >= 0),
  days_past_due integer not null default 0 check (days_past_due >= 0),
  utilization_ratio numeric(5,4) generated always as (
    case when credit_limit > 0 then balance / credit_limit else 0 end
  ) stored,
  customer_segment text not null 
    check (customer_segment in ('ENTERPRISE', 'CORPORATE', 'SME', 'RETAIL')),
  industry text not null,
  region text not null,
  kam_owner text,
  product_code text not null,
  currency text not null default 'USD',
  risk_grade text check (risk_grade in ('A', 'B', 'C', 'D')),
  apr numeric(5,4) check (apr >= 0 and apr <= 1),
  origination_date date,
  analysis_date date not null default current_date,
  data_source text default 'ABACO_CORE' 
    check (data_source in ('ABACO_CORE', 'EXTERNAL_API', 'MANUAL_ENTRY')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI agent execution logs for comprehensive tracing
create table if not exists agent_execution_logs (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  agent_type text not null check (
    agent_type in ('financial_intelligence', 'risk_assessment', 'portfolio_optimization', 'compliance_checker')
  ),
  operation text not null,
  status text not null check (status in ('started', 'completed', 'failed', 'timeout')),
  input_data jsonb,
  output_data jsonb,
  error_message text,
  duration_ms integer check (duration_ms >= 0),
  tokens_used integer check (tokens_used >= 0),
  cost_usd numeric(10,4) check (cost_usd >= 0),
  trace_id text not null,
  parent_span_id text,
  span_id text not null,
  tenant_id text not null default 'abaco_financial',
  created_at timestamptz default now()
);

-- KPI results for financial intelligence platform
create table if not exists kpi_results (
  id uuid primary key default uuid_generate_v4(),
  analysis_id uuid references portfolio_analysis(id) on delete cascade,
  tenant_id text not null default 'abaco_financial',
  analysis_date date not null default current_date,
  kpi_data jsonb not null,
  insights jsonb default '[]'::jsonb,
  benchmarks jsonb default '{}'::jsonb,
  risk_metrics jsonb default '{}'::jsonb,
  performance_score numeric(5,2) check (performance_score >= 0 and performance_score <= 100),
  created_at timestamptz default now()
);

-- Performance indexes for financial intelligence queries
create index if not exists idx_user_profiles_tenant on user_profiles(tenant_id, role);
create index if not exists idx_portfolio_analysis_session on portfolio_analysis(session_id);
create index if not exists idx_portfolio_analysis_tenant_date on portfolio_analysis(tenant_id, analysis_date desc);
create index if not exists idx_portfolio_analysis_status on portfolio_analysis(status) where status != 'completed';
create index if not exists idx_financial_data_tenant_segment on financial_data(tenant_id, customer_segment);
create index if not exists idx_financial_data_analysis_date on financial_data(analysis_date desc);
create index if not exists idx_financial_data_customer on financial_data(customer_id);
create index if not exists idx_financial_data_risk_grade on financial_data(risk_grade) where risk_grade in ('C', 'D');
create index if not exists idx_agent_logs_session on agent_execution_logs(session_id);
create index if not exists idx_agent_logs_trace on agent_execution_logs(trace_id);
create index if not exists idx_agent_logs_tenant_date on agent_execution_logs(tenant_id, created_at desc);
create index if not exists idx_kpi_results_analysis on kpi_results(analysis_id);
create index if not exists idx_kpi_results_date on kpi_results(analysis_date desc);

-- Trigger functions for maintaining data integrity
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function validate_financial_data()
returns trigger as $$
declare
  -- Use a named constant for maximum days past due.
  -- Calculation: 7 years * 365.25 days/year = 2556.75 days.
  -- Rounded up to 2557 days to ensure a full 7-year period is always allowed, even in cases with multiple leap years.
  -- This aligns with US credit reporting standards (e.g., FCRA, 15 U.S.C. § 1681c), which require most negative information to be removed after 7 years.
  -- Choosing 2557 (instead of 2556) ensures no valid 7-year period is ever excluded due to leap year variations.
  MAX_DAYS_PAST_DUE constant integer := 2557;
begin
  -- Validate utilization ratio doesn't exceed 150%
  if new.balance > new.credit_limit * 1.5 then
    raise exception 'Balance exceeds 150%% of credit limit for customer %', new.customer_id;
  end if;
  
  -- Validate days past due is reasonable (max 7 years)
  if new.days_past_due > MAX_DAYS_PAST_DUE then
    raise exception 'Days past due exceeds maximum allowed (%s) for customer %', MAX_DAYS_PAST_DUE, new.customer_id;
  end if;
  
  return new;
end;
$$ language plpgsql;

-- Apply triggers
create trigger update_user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at_column();

create trigger update_portfolio_analysis_updated_at
  before update on portfolio_analysis
  for each row execute function update_updated_at_column();

create trigger update_financial_data_updated_at
  before update on financial_data
  for each row execute function update_updated_at_column();

create trigger validate_financial_data_trigger
  before insert or update on financial_data
  for each row execute function validate_financial_data();

-- Row Level Security for multi-tenant financial platform
alter table user_profiles enable row level security;
alter table portfolio_analysis enable row level security;
alter table financial_data enable row level security;
alter table agent_execution_logs enable row level security;
alter table kpi_results enable row level security;

-- RLS Policies for Abaco Financial Intelligence Platform

-- User profile policies
create policy "Users can view their own profile" on user_profiles
  for select using (auth.uid() = auth_user_id);

create policy "Users can update their own profile" on user_profiles
  for update using (auth.uid() = auth_user_id);

create policy "Admins can manage all profiles" on user_profiles
  for all using (
    exists (
      select 1 from user_profiles 
      where auth_user_id = auth.uid() 
      and role = 'admin'
    )
  );

-- Portfolio analysis policies with tenant isolation
create policy "Analysts can view portfolio analysis" on portfolio_analysis
  for select using (
    exists (
      select 1 from user_profiles 
      where auth_user_id = auth.uid() 
      and role = any(array['analyst', 'manager', 'admin', 'executive'])
      and tenant_id = portfolio_analysis.tenant_id
    )
  );

create policy "Analysts can create portfolio analysis" on portfolio_analysis
  for insert with check (
    analyst_id = (
      select id from user_profiles 
      where auth_user_id = auth.uid()
      and tenant_id = new.tenant_id
    )
  );

-- Financial data policies with strict tenant isolation
create policy "Financial data access by tenant and role" on financial_data
  for select using (
    exists (
      select 1 from user_profiles 
      where auth_user_id = auth.uid() 
      and role = any(array['analyst', 'manager', 'admin', 'executive'])
      and tenant_id = financial_data.tenant_id
    )
  );

-- Agent execution logs policies
create policy "Agent logs access by tenant" on agent_execution_logs
  for select using (
    exists (
      select 1 from user_profiles 
      where auth_user_id = auth.uid()
      and tenant_id = agent_execution_logs.tenant_id
    )
  );

-- System policies for AI agents
create policy "System can insert agent logs" on agent_execution_logs
  for insert with check (true);

create policy "System can insert KPI results" on kpi_results
  for insert with check (true);

-- Financial intelligence views for reporting
create or replace view portfolio_summary as
select 
  tenant_id,
  customer_segment,
  analysis_date,
  count(*) as customer_count,
  sum(balance) as total_aum,
  avg(balance) as avg_balance,
  sum(credit_limit) as total_credit_limit,
  avg(utilization_ratio) as avg_utilization,
  count(*) filter (where days_past_due >= 30) as delinquent_30_plus,
  count(*) filter (where days_past_due >= 60) as delinquent_60_plus,
  count(*) filter (where days_past_due >= 90) as delinquent_90_plus,
  avg(apr) as avg_apr,
  count(*) filter (where risk_grade = 'A') as grade_a_count,
  count(*) filter (where risk_grade = 'B') as grade_b_count,
  count(*) filter (where risk_grade in ('C', 'D')) as high_risk_count
from financial_data
group by tenant_id, customer_segment, analysis_date;

create or replace view agent_performance_summary as
select 
  tenant_id,
  agent_type,
  date_trunc('day', created_at) as analysis_day,
  count(*) as total_executions,
  count(*) filter (where status = 'completed') as successful_executions,
  count(*) filter (where status = 'failed') as failed_executions,
  avg(duration_ms) as avg_duration_ms,
  percentile_cont(0.95) within group (order by duration_ms) as p95_duration_ms,
  sum(cost_usd) as total_cost_usd
from agent_execution_logs
group by tenant_id, agent_type, date_trunc('day', created_at);

-- Utility functions for financial intelligence platform

-- Function to get Azure Cosmos DB hierarchical partition key
create or replace function get_cosmos_partition_key(
  p_tenant_id text,
  p_customer_segment text,
  p_analysis_date date
) returns text as $$
begin
  return p_tenant_id || '/' || p_customer_segment || '/' || p_analysis_date::text;
end;
$$ language plpgsql immutable;

-- Function to calculate portfolio risk score
create or replace function calculate_portfolio_risk_score(
  p_tenant_id text,
  p_analysis_date date default current_date
) returns numeric as $$
declare
  risk_score numeric := 0;
  total_aum numeric;
  delinquent_ratio numeric;
  high_util_ratio numeric;
begin
  select 
    sum(balance),
    count(*) filter (where days_past_due >= 30)::numeric / count(*),
    count(*) filter (where utilization_ratio > 0.8)::numeric / count(*)
  into total_aum, delinquent_ratio, high_util_ratio
  from financial_data
  where tenant_id = p_tenant_id 
    and analysis_date = p_analysis_date;
  
  -- Calculate composite risk score (0-100)
  risk_score := (delinquent_ratio * 50) + (high_util_ratio * 30) + 
                case when total_aum < 1000000 then 20 else 0 end;
  
  return least(100, greatest(0, risk_score));
end;
$$ language plpgsql;

-- Function to create AI agent tracing session
create or replace function create_agent_trace_session(
  p_analyst_id uuid,
  p_customer_segment text default 'PORTFOLIO',
  p_tenant_id text default 'abaco_financial'
) returns uuid as $$
declare
  session_uuid uuid;
  trace_session_id text;
  current_timestamp_epoch numeric;
begin
  session_uuid := uuid_generate_v4();
  trace_session_id := 'abaco_trace_' || replace(session_uuid::text, '-', '');
  current_timestamp_epoch := extract(epoch from now());
  
  insert into portfolio_analysis (
    id,
    session_id,
    analyst_id,
    tenant_id,
    customer_segment,
    analysis_date,
    status,
    trace_data
  ) values (
    session_uuid,
    trace_session_id,
    p_analyst_id,
    p_tenant_id,
    p_customer_segment,
    current_date,
    'processing',
    jsonb_build_object(
      'trace_id', trace_session_id,
      'start_time', current_timestamp_epoch,
      'agent_version', '2.0.0',
      'toolkit_version', 'ai-toolkit-v2',
      'platform', 'abaco-financial-intelligence',
      'session_metadata', jsonb_build_object(
        'tenant_id', p_tenant_id,
        'customer_segment', p_customer_segment,
        'created_by', p_analyst_id
      )
    )
  );
  
  insert into agent_execution_logs (
    session_id,
    agent_type,
    operation,
    status,
    input_data,
    trace_id,
    span_id,
    tenant_id
  ) values (
    trace_session_id,
    'financial_intelligence',
    'session_created',
    'completed',
    jsonb_build_object(
      'analyst_id', p_analyst_id,
      'tenant_id', p_tenant_id,
      'customer_segment', p_customer_segment
    ),
    trace_session_id,
    'span_' || replace(uuid_generate_v4()::text, '-', ''),
    p_tenant_id
  );
  
  return session_uuid;
end;
$$ language plpgsql;

-- Comments for AI Toolkit integration
comment on table portfolio_analysis is 'Abaco Financial Intelligence - AI agent analysis sessions with comprehensive tracing';
comment on table agent_execution_logs is 'AI Toolkit tracing logs for financial intelligence agents';
comment on table financial_data is 'Financial portfolio data optimized for AI analysis and Azure Cosmos DB integration';
comment on function calculate_portfolio_risk_score(text, date) is 'Calculates composite risk score for Abaco financial portfolios';
comment on function create_agent_trace_session(uuid, text, text) is 'Creates AI agent tracing session for financial intelligence platform';
