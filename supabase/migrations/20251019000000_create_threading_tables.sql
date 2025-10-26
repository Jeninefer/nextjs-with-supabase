-- ABACO Financial Intelligence Platform - Production Database Schema
-- Following AI Toolkit best practices and Azure Cosmos DB integration patterns

set search_path to public;

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- User profiles for financial platform
create table if not exists user_profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  role text default 'analyst' check (role in ('analyst', 'manager', 'admin')),
  department text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Portfolio analysis sessions for AI agent tracing
create table if not exists portfolio_analysis (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null unique,
  analyst_id uuid references user_profiles(id) on delete set null,
  tenant_id text not null default 'abaco_financial',
  customer_segment text not null check (customer_segment in ('ENTERPRISE', 'CORPORATE', 'SME', 'RETAIL', 'PORTFOLIO')),
  analysis_date date not null default current_date,
  status text default 'processing' check (status in ('processing', 'completed', 'failed')),
  kpis jsonb default '{}'::jsonb,
  insights jsonb default '[]'::jsonb,
  alerts jsonb default '[]'::jsonb,
  trace_data jsonb default '{}'::jsonb,
  performance_metrics jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

-- Financial data for analysis (production ready)
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
  customer_segment text not null check (customer_segment in ('ENTERPRISE', 'CORPORATE', 'SME', 'RETAIL')),
  industry text not null,
  region text not null,
  kam_owner text,
  product_code text not null,
  currency text not null default 'USD',
  risk_grade text check (risk_grade in ('A', 'B', 'C', 'D')),
  apr numeric(5,4) check (apr >= 0 and apr <= 1),
  origination_date date,
  analysis_date date not null default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI agent execution logs for comprehensive tracing
create table if not exists agent_execution_logs (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  agent_type text not null,
  operation text not null,
  status text not null check (status in ('started', 'completed', 'failed')),
  input_data jsonb,
  output_data jsonb,
  error_message text,
  duration_ms integer,
  tokens_used integer,
  cost_usd numeric(10,4),
  trace_id text,
  parent_span_id text,
  span_id text,
  created_at timestamptz default now()
);

-- KPI results storage
create table if not exists kpi_results (
  id uuid primary key default uuid_generate_v4(),
  analysis_id uuid references portfolio_analysis(id) on delete cascade,
  tenant_id text not null default 'abaco_financial',
  analysis_date date not null default current_date,
  kpi_data jsonb not null,
  insights jsonb default '[]'::jsonb,
  benchmarks jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Add SonarQube alternative analysis tracking without Docker dependency
create table if not exists code_quality_metrics (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  analysis_type text not null check (analysis_type in ('eslint', 'typescript', 'custom')),
  file_path text not null,
  issues_found integer default 0,
  issues_fixed integer default 0,
  quality_score numeric(5,2) check (quality_score >= 0 and quality_score <= 100),
  analysis_data jsonb default '{}'::jsonb,
  trace_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Index for quality metrics queries
create index if not exists idx_quality_metrics_session on code_quality_metrics(session_id);
create index if not exists idx_quality_metrics_type on code_quality_metrics(analysis_type);
create index if not exists idx_quality_metrics_score on code_quality_metrics(quality_score desc);

-- Enhanced code quality tracking with Azure Cosmos DB integration
create or replace function track_code_quality_improvement(
  p_session_id text,
  p_analysis_type text,
  p_file_path text,
  p_issues_found integer,
  p_issues_fixed integer
) returns uuid as $$
declare
  quality_id uuid;
  quality_score numeric(5,2);
begin
  -- Calculate quality score (percentage of issues fixed)
  quality_score := case 
    when p_issues_found = 0 then 100.0
    else round((p_issues_fixed::numeric / p_issues_found::numeric) * 100, 2)
  end;
  
  insert into code_quality_metrics (
    session_id,
    analysis_type,
    file_path,
    issues_found,
    issues_fixed,
    quality_score,
    analysis_data,
    trace_data
  ) values (
    p_session_id,
    p_analysis_type,
    p_file_path,
    p_issues_found,
    p_issues_fixed,
    quality_score,
    jsonb_build_object(
      'timestamp', now(),
      'improvement_rate', quality_score,
      'platform', 'abaco_financial_intelligence',
      'cleanup_operation', true
    ),
    jsonb_build_object(
      'trace_id', 'quality_' || gen_random_uuid()::text,
      'operation', 'comprehensive_cleanup',
      'ai_toolkit_enabled', true
    )
  ) returning id into quality_id;
  
  return quality_id;
end;
$$ language plpgsql;

-- Azure Cosmos DB document for code quality tracking
create or replace function code_quality_to_cosmos_document(
  p_quality_id uuid
) returns jsonb as $$
declare
  quality_record record;
  cosmos_doc jsonb;
begin
  select * into quality_record
  from code_quality_metrics 
  where id = p_quality_id;
  
  if not found then
    return null;
  end if;
  
  -- Create optimized Cosmos DB document following HPK patterns
  cosmos_doc := jsonb_build_object(
    'id', 'quality_' || quality_record.id::text,
    'partitionKey', 'abaco_financial/CODE_QUALITY/' || quality_record.created_at::date::text,
    'tenantId', 'abaco_financial',
    'customerSegment', 'code_quality',
    'analysisDate', quality_record.created_at::date,
    'documentType', 'code_quality_analysis',
    'createdAt', quality_record.created_at,
    'updatedAt', quality_record.created_at,
    'ttl', 90 * 24 * 60 * 60, -- 90 days TTL for code quality data
    'qualityMetrics', jsonb_build_object(
      'sessionId', quality_record.session_id,
      'analysisType', quality_record.analysis_type,
      'filePath', quality_record.file_path,
      'issuesFound', quality_record.issues_found,
      'issuesFixed', quality_record.issues_fixed,
      'qualityScore', quality_record.quality_score,
      'improvementRate', quality_record.quality_score
    ),
    'traceData', quality_record.trace_data,
    'analysisData', quality_record.analysis_data
  );
  
  return cosmos_doc;
end;
$$ language plpgsql;

-- Optimized indexes for production performance
create index if not exists idx_user_profiles_auth_user_id on user_profiles(auth_user_id);
create index if not exists idx_portfolio_analysis_session on portfolio_analysis(session_id);
create index if not exists idx_portfolio_analysis_tenant_date on portfolio_analysis(tenant_id, analysis_date desc);
create index if not exists idx_financial_data_tenant_segment on financial_data(tenant_id, customer_segment);
create index if not exists idx_financial_data_analysis_date on financial_data(analysis_date desc);
create index if not exists idx_financial_data_customer on financial_data(customer_id);
create index if not exists idx_agent_logs_session on agent_execution_logs(session_id);
create index if not exists idx_agent_logs_trace on agent_execution_logs(trace_id);
create index if not exists idx_kpi_results_analysis on kpi_results(analysis_id);

-- Optimized update trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at_column();

create trigger update_portfolio_analysis_updated_at
  before update on portfolio_analysis
  for each row execute function update_updated_at_column();

create trigger update_financial_data_updated_at
  before update on financial_data
  for each row execute function update_updated_at_column();

-- Production-ready Row Level Security
alter table user_profiles enable row level security;
alter table portfolio_analysis enable row level security;
alter table financial_data enable row level security;
alter table agent_execution_logs enable row level security;
alter table kpi_results enable row level security;
alter table code_quality_metrics enable row level security;

-- Secure RLS policies for production
create policy "Users can manage their own profile" on user_profiles
  for all using (auth.uid() = auth_user_id);

create policy "Analysts can access portfolio analysis" on portfolio_analysis
  for all using (
    exists (
      select 1 from user_profiles 
      where auth_user_id = auth.uid() 
      and role in ('analyst', 'manager', 'admin')
    )
  );

create policy "Analysts can view financial data" on financial_data
  for select using (
    exists (
      select 1 from user_profiles 
      where auth_user_id = auth.uid() 
      and role in ('analyst', 'manager', 'admin')
    )
  );

create policy "System can manage agent logs" on agent_execution_logs
  for all using (true);

create policy "Analysts can view KPI results" on kpi_results
  for select using (
    exists (
      select 1 from user_profiles 
      where auth_user_id = auth.uid() 
      and role in ('analyst', 'manager', 'admin')
    )
  );

create policy "System can manage code quality metrics" on code_quality_metrics
  for all using (true);

-- Production analytics view
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
  count(*) filter (where days_past_due >= 90) as delinquent_90_plus,
  avg(apr) as avg_apr
from financial_data
group by tenant_id, customer_segment, analysis_date;

-- Azure Cosmos DB integration helper
create or replace function get_cosmos_partition_key(
  tenant_id text,
  customer_segment text,
  analysis_date date
) returns text as $$
begin
  return tenant_id || '/' || customer_segment || '/' || analysis_date::text;
end;
$$ language plpgsql immutable;

-- Production agent session creator
create or replace function create_agent_trace_session(
  p_analyst_id uuid,
  p_customer_segment text default 'PORTFOLIO',
  p_tenant_id text default 'abaco_financial'
) returns uuid as $$
declare
  session_uuid uuid;
  trace_session_id text;
begin
  session_uuid := uuid_generate_v4();
  trace_session_id := 'trace_' || replace(session_uuid::text, '-', '');
  
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
      'start_time', extract(epoch from now()),
      'agent_version', '2.0.0',
      'platform', 'abaco_financial_intelligence'
    )
  );
  
  insert into agent_execution_logs (
    session_id,
    agent_type,
    operation,
    status,
    input_data,
    trace_id,
    span_id
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
    'span_' || replace(uuid_generate_v4()::text, '-', '')
  );
  
  return session_uuid;
end;
$$ language plpgsql;

-- Production comments for documentation
comment on table portfolio_analysis is 'AI agent analysis sessions with comprehensive tracing for financial intelligence';
comment on table agent_execution_logs is 'AI Toolkit tracing and monitoring for production observability';
comment on table financial_data is 'Financial portfolio data optimized for AI analysis and Azure Cosmos DB integration';
comment on function track_code_quality_improvement is 'AI Toolkit integrated quality tracking with Azure Cosmos DB HPK optimization for ABACO Financial Intelligence Platform';

-- Production data seeding removed for security
-- Use proper data migration scripts for production data

-- Azure Cosmos DB document converter function
create or replace function financial_data_to_cosmos_document(
  p_customer_id text,
  p_tenant_id text default 'abaco_financial'
)
returns jsonb as $$
declare
  financial_record record;
  cosmos_doc jsonb;
begin
  -- Get financial data record
  select * into financial_record
  from financial_data 
  where customer_id = p_customer_id and tenant_id = p_tenant_id
  limit 1;
  
  if not found then
    return null;
  end if;
  
  -- Create Azure Cosmos DB optimized document
  cosmos_doc := jsonb_build_object(
    'id', 'customer_' || financial_record.id::text,
    'partitionKey', get_cosmos_partition_key(
      financial_record.tenant_id,
      financial_record.customer_segment, 
      financial_record.analysis_date
    ),
    'tenantId', financial_record.tenant_id,
    'customerSegment', lower(financial_record.customer_segment),
    'analysisDate', financial_record.analysis_date,
    'documentType', 'customer_profile',
    'createdAt', financial_record.created_at,
    'updatedAt', financial_record.updated_at,
    'ttl', 365 * 24 * 60 * 60, -- 1 year TTL
    'customerId', financial_record.customer_id,
    'profile', jsonb_build_object(
      'displayName', financial_record.customer_id,
      'industry', financial_record.industry,
      'kamOwner', financial_record.kam_owner,
      'creditLimit', financial_record.credit_limit,
      'balance', financial_record.balance,
      'dpd', financial_record.days_past_due,
      'utilizationRatio', financial_record.utilization_ratio,
      'segmentCode', financial_record.customer_segment,
      'delinquencyBucket', case 
        when financial_record.days_past_due = 0 then 'Current'
        when financial_record.days_past_due <= 30 then '1-30 DPD'
        when financial_record.days_past_due <= 60 then '31-60 DPD' 
        when financial_record.days_past_due <= 90 then '61-90 DPD'
        else '90+ DPD'
      end
    ),
    'features', jsonb_build_object(
      'weightedApr', financial_record.apr,
      'balanceZscore', 0.0, -- Would be calculated
      'daysSinceOrigination', 
        case 
          when financial_record.origination_date is not null 
          then extract(days from current_date - financial_record.origination_date)
          else 0
        end,
      'rollRateDirection', 'stable',
      'b2gFlag', false,
      'customerType', financial_record.product_code
    ),
    'alerts', '[]'::jsonb
  );
  
  return cosmos_doc;
end;
$$ language plpgsql;

-- Real-time financial metrics function for dashboards
create or replace function get_realtime_portfolio_metrics(
  p_tenant_id text default 'abaco_financial',
  p_analysis_date date default current_date
)
returns jsonb as $$
declare
  metrics jsonb;
begin
  select jsonb_build_object(
    'timestamp', now(),
    'tenant_id', p_tenant_id,
    'analysis_date', p_analysis_date,
    'portfolio_overview', jsonb_build_object(
      'total_aum', coalesce(sum(balance), 0),
      'active_customers', count(*),
      'total_credit_lines', coalesce(sum(credit_limit), 0),
      'avg_balance', coalesce(avg(balance), 0),
      'avg_utilization', coalesce(avg(utilization_ratio), 0)
    ),
    'risk_metrics', jsonb_build_object(
      'default_rate_30plus', 
        round((count(*) filter (where days_past_due >= 30))::numeric / 
              nullif(count(*), 0) * 100, 2),
      'default_rate_90plus',
        round((count(*) filter (where days_past_due >= 90))::numeric / 
              nullif(count(*), 0) * 100, 2),
      'avg_days_past_due', coalesce(avg(days_past_due), 0),
      'weighted_apr', 
        coalesce((sum(apr * balance) / nullif(sum(balance), 0)), 0)
    ),
    'segment_breakdown', (
      select jsonb_object_agg(
        customer_segment,
        jsonb_build_object(
          'count', segment_count,
          'total_aum', segment_aum,
          'avg_balance', segment_avg
        )
      )
      from (
        select 
          customer_segment,
          count(*) as segment_count,
          sum(balance) as segment_aum,
          avg(balance) as segment_avg
        from financial_data 
        where tenant_id = p_tenant_id 
          and analysis_date = p_analysis_date
        group by customer_segment
      ) segments
    )
  ) into metrics
  from financial_data
  where tenant_id = p_tenant_id 
    and analysis_date = p_analysis_date;
    
  return coalesce(metrics, '{}'::jsonb);
end;
$$ language plpgsql;

-- AI Toolkit trace aggregation for performance monitoring
create or replace view agent_performance_metrics as
select 
  agent_type,
  operation,
  date_trunc('hour', created_at) as hour_bucket,
  count(*) as total_operations,
  count(*) filter (where status = 'completed') as successful_operations,
  count(*) filter (where status = 'failed') as failed_operations,
  avg(duration_ms) as avg_duration_ms,
  percentile_cont(0.5) within group (order by duration_ms) as median_duration_ms,
  percentile_cont(0.95) within group (order by duration_ms) as p95_duration_ms,
  sum(tokens_used) as total_tokens,
  sum(cost_usd) as total_cost_usd
from agent_execution_logs
where created_at >= current_date - interval '7 days'
group by agent_type, operation, date_trunc('hour', created_at)
order by hour_bucket desc;
