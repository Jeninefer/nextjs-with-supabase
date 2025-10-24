-- Financial Intelligence Platform Schema with AI Toolkit Integration
set search_path to public;

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Financial Intelligence Tables for AI Agent Development

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
  trace_data jsonb default '{}'::jsonb, -- AI Toolkit tracing information
  performance_metrics jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

-- Financial data for analysis
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

-- AI agent execution logs for tracing
create table if not exists agent_execution_logs (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  agent_type text not null, -- 'financial_intelligence', 'risk_assessment', etc.
  operation text not null,
  status text not null check (status in ('started', 'completed', 'failed')),
  input_data jsonb,
  output_data jsonb,
  error_message text,
  duration_ms integer,
  tokens_used integer,
  cost_usd numeric(10,4),
  trace_id text, -- For distributed tracing
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

-- Indexes for performance
create index if not exists idx_user_profiles_auth_user_id on user_profiles(auth_user_id);
create index if not exists idx_portfolio_analysis_session on portfolio_analysis(session_id);
create index if not exists idx_portfolio_analysis_tenant_date on portfolio_analysis(tenant_id, analysis_date desc);
create index if not exists idx_financial_data_tenant_segment on financial_data(tenant_id, customer_segment);
create index if not exists idx_financial_data_analysis_date on financial_data(analysis_date desc);
create index if not exists idx_financial_data_customer on financial_data(customer_id);
create index if not exists idx_agent_logs_session on agent_execution_logs(session_id);
create index if not exists idx_agent_logs_trace on agent_execution_logs(trace_id);
create index if not exists idx_kpi_results_analysis on kpi_results(analysis_id);

-- Trigger to update timestamps
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

-- Row Level Security
alter table user_profiles enable row level security;
alter table portfolio_analysis enable row level security;
alter table financial_data enable row level security;
alter table agent_execution_logs enable row level security;
alter table kpi_results enable row level security;

-- User profile policies
create policy "Users can view their own profile" on user_profiles
  for select using (auth.uid() = auth_user_id);

create policy "Users can insert their own profile" on user_profiles
  for insert with check (auth.uid() = auth_user_id);

create policy "Users can update their own profile" on user_profiles
  for update using (auth.uid() = auth_user_id);

-- Portfolio analysis policies - users can access based on their role and tenant
create policy "Analysts can view portfolio analysis" on portfolio_analysis
  for select using (
    exists (
      select 1 from user_profiles 
      where auth_user_id = auth.uid() 
      and role = any(array['analyst', 'manager', 'admin'])
    )
  );

create policy "Analysts can create portfolio analysis" on portfolio_analysis
  for insert with check (
    analyst_id = (
      select id from user_profiles where auth_user_id = auth.uid()
    )
  );

create policy "Analysts can update their portfolio analysis" on portfolio_analysis
  for update using (
    analyst_id = (
      select id from user_profiles where auth_user_id = auth.uid()
    )
  );

-- Financial data policies - read-only for analysts
create policy "Analysts can view financial data" on financial_data
  for select using (
    exists (
      select 1 from user_profiles 
      where auth_user_id = auth.uid() 
      and role = any(array['analyst', 'manager', 'admin'])
    )
  );

-- Agent execution logs - for tracing and monitoring
create policy "Authenticated users can view agent logs" on agent_execution_logs
  for select using (
    exists (
      select 1 from user_profiles 
      where auth_user_id = auth.uid()
    )
  );

create policy "System can insert agent logs" on agent_execution_logs
  for insert with check (true); -- Allow system inserts

-- KPI results policies
create policy "Analysts can view KPI results" on kpi_results
  for select using (
    exists (
      select 1 from user_profiles 
      where auth_user_id = auth.uid() 
      and role = any(array['analyst', 'manager', 'admin'])
    )
  );

create policy "System can insert KPI results" on kpi_results
  for insert with check (true); -- Allow system inserts

-- Create views for common queries
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

-- Function to get hierarchical partition key for Cosmos DB integration
create or replace function get_cosmos_partition_key(
  tenant_id text,
  customer_segment text,
  analysis_date date
) returns text as $$
begin
  return tenant_id || '/' || customer_segment || '/' || analysis_date::text;
end;
$$ language plpgsql immutable;

-- Optimized sample data insertion function following PostgreSQL best practices
create or replace function insert_sample_financial_data(sample_size integer default 100)
returns void as $$
declare
  segments text[] := array['ENTERPRISE', 'CORPORATE', 'SME', 'RETAIL'];
  industries text[] := array['TECHNOLOGY', 'MANUFACTURING', 'HEALTHCARE', 'FINANCE', 'ENERGY'];
  regions text[] := array['NORTH', 'SOUTH', 'EAST', 'WEST', 'CENTRAL'];
  products text[] := array['CC', 'PL', 'CL', 'OD'];
  risk_grades text[] := array['A', 'B', 'C', 'D'];
  batch_size constant integer := 100;
  total_batches integer;
  current_batch integer;
  start_id integer;
  end_id integer;
  batch_report_interval constant integer := 10;
  min_batch_num constant integer := 1;
begin
  -- Calculate batches for efficient bulk inserts
  total_batches := ceil(sample_size::decimal / batch_size);
  
  -- Use dynamic loop bounds based on calculated batches - PostgreSQL best practice
  for current_batch in min_batch_num..total_batches loop
    start_id := (current_batch - min_batch_num) * batch_size + min_batch_num;
    end_id := least(current_batch * batch_size, sample_size);
    
    -- Bulk insert using generate_series and arrays - PostgreSQL best practice
    insert into financial_data (
      customer_id,
      tenant_id,
      balance,
      credit_limit,
      days_past_due,
      customer_segment,
      industry,
      region,
      kam_owner,
      product_code,
      risk_grade,
      apr,
      origination_date,
      analysis_date
    )
    select 
      'CUST' || lpad(gs.i::text, 7, '0'),
      'abaco_financial',
      (random() * 1000000 + 10000)::numeric(15,2),
      (random() * 2000000 + 50000)::numeric(15,2),
      (random() * 120)::integer,
      segments[ceil(random() * array_length(segments, 1))],
      industries[ceil(random() * array_length(industries, 1))],
      regions[ceil(random() * array_length(regions, 1))],
      'KAM' || lpad((ceil(random() * 10))::text, 3, '0'),
      products[ceil(random() * array_length(products, 1))],
      risk_grades[ceil(random() * array_length(risk_grades, 1))],
      (random() * 0.25 + 0.05)::numeric(5,4),
      current_date - interval '1 year' * random(),
      current_date
    from generate_series(start_id, end_id) as gs(i);
    
    -- Progress reporting using dynamic interval
    if current_batch % batch_report_interval = 0 then
      raise notice 'Inserted batch % of % (% records)', current_batch, total_batches, end_id;
    end if;
  end loop;
  
  raise notice 'Successfully inserted % sample financial records', sample_size;
end;
$$ language plpgsql;

-- Enhanced function to create AI agent tracing data following AI Toolkit best practices
create or replace function create_agent_trace_session(
  p_analyst_id uuid,
  p_customer_segment text default 'PORTFOLIO',
  p_tenant_id text default 'abaco_financial'
) returns uuid as $$
declare
  session_uuid uuid;
  trace_session_id text;
  current_timestamp_epoch numeric;
  agent_version constant text := '1.0.0';
  toolkit_version constant text := 'ai-toolkit-v1';
  session_status constant text := 'processing';
  agent_type constant text := 'financial_intelligence';
  operation_name constant text := 'session_created';
  completed_status constant text := 'completed';
begin
  -- Generate unique session identifiers for AI Toolkit tracing
  session_uuid := uuid_generate_v4();
  trace_session_id := 'trace_' || replace(session_uuid::text, '-', '');
  current_timestamp_epoch := extract(epoch from now());
  
  -- Create portfolio analysis session with AI Toolkit tracing support
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
    session_status,
    jsonb_build_object(
      'trace_id', trace_session_id,
      'start_time', current_timestamp_epoch,
      'agent_version', agent_version,
      'toolkit_version', toolkit_version,
      'session_metadata', jsonb_build_object(
        'tenant_id', p_tenant_id,
        'customer_segment', p_customer_segment,
        'created_by', p_analyst_id
      )
    )
  );
  
  -- Log the session creation in agent execution logs
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
    agent_type,
    operation_name,
    completed_status,
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

-- Function to bulk insert agent execution traces for performance
create or replace function bulk_insert_agent_traces(
  trace_data jsonb[]
) returns integer as $$
declare
  inserted_count integer := 0;
  trace_record jsonb;
  array_lower_bound integer;
  array_upper_bound integer;
  trace_index integer;
begin
  -- Get dynamic array bounds - PostgreSQL best practice
  array_lower_bound := array_lower(trace_data, 1);
  array_upper_bound := array_upper(trace_data, 1);
  
  -- Validate array bounds
  if array_lower_bound is null or array_upper_bound is null then
    raise notice 'Empty or invalid trace data array provided';
    return 0;
  end if;
  
  -- Use unnest for bulk processing - PostgreSQL best practice
  insert into agent_execution_logs (
    session_id,
    agent_type,
    operation,
    status,
    input_data,
    output_data,
    duration_ms,
    tokens_used,
    cost_usd,
    trace_id,
    parent_span_id,
    span_id
  )
  select 
    (trace->>'session_id')::text,
    (trace->>'agent_type')::text,
    (trace->>'operation')::text,
    (trace->>'status')::text,
    trace->'input_data',
    trace->'output_data',
    (trace->>'duration_ms')::integer,
    (trace->>'tokens_used')::integer,
    (trace->>'cost_usd')::numeric(10,4),
    (trace->>'trace_id')::text,
    (trace->>'parent_span_id')::text,
    (trace->>'span_id')::text
  from unnest(trace_data) as trace;
  
  get diagnostics inserted_count = row_count;
  
  raise notice 'Bulk inserted % agent execution traces (array bounds: % to %)', 
    inserted_count, array_lower_bound, array_upper_bound;
  return inserted_count;
end;
$$ language plpgsql;

-- Function to process financial data with dynamic batch sizing for AI Toolkit integration
create or replace function process_financial_data_batches(
  p_tenant_id text default 'abaco_financial',
  p_analysis_date date default current_date,
  p_batch_size integer default 1000
) returns jsonb as $$
declare
  total_records integer;
  batch_count integer;
  current_batch_num integer;
  batch_start_offset integer;
  batch_end_offset integer;
  processing_results jsonb[];
  final_result jsonb;
  min_batch_index constant integer := 1;
begin
  -- Get total record count dynamically
  select count(*) into total_records
  from financial_data
  where tenant_id = p_tenant_id
    and analysis_date = p_analysis_date;
  
  if total_records = 0 then
    return jsonb_build_object(
      'status', 'completed',
      'message', 'No financial data found for processing',
      'total_records', 0,
      'batches_processed', 0
    );
  end if;
  
  -- Calculate batch count dynamically
  batch_count := ceil(total_records::decimal / p_batch_size);
  
  -- Process data in dynamic batches following AI Toolkit best practices
  for current_batch_num in min_batch_index..batch_count loop
    batch_start_offset := (current_batch_num - min_batch_index) * p_batch_size;
    batch_end_offset := least(current_batch_num * p_batch_size, total_records);
    
    -- Process current batch (placeholder for actual AI processing logic)
    processing_results := processing_results || jsonb_build_object(
      'batch_number', current_batch_num,
      'start_offset', batch_start_offset,
      'end_offset', batch_end_offset,
      'records_in_batch', batch_end_offset - batch_start_offset,
      'processed_at', extract(epoch from now())
    );
    
    -- Log progress for AI Toolkit tracing
    if current_batch_num % 10 = 0 or current_batch_num = batch_count then
      raise notice 'Processed batch % of % (records: % to %)', 
        current_batch_num, batch_count, batch_start_offset + 1, batch_end_offset;
    end if;
  end loop;
  
  -- Compile final results
  final_result := jsonb_build_object(
    'status', 'completed',
    'total_records', total_records,
    'batch_size', p_batch_size,
    'batches_processed', batch_count,
    'processing_results', processing_results,
    'tenant_id', p_tenant_id,
    'analysis_date', p_analysis_date,
    'completed_at', extract(epoch from now())
  );
  
  return final_result;
end;
$$ language plpgsql;

-- Comment with metadata for AI Toolkit integration
comment on table portfolio_analysis is 'AI agent analysis sessions with tracing support for financial intelligence';
comment on table agent_execution_logs is 'Comprehensive logging for AI Toolkit tracing and monitoring';
comment on table financial_data is 'Financial portfolio data optimized for AI analysis and Azure Cosmos DB integration';
comment on function insert_sample_financial_data(integer) is 'Optimized bulk data insertion using dynamic loop bounds and PostgreSQL generate_series for performance';
comment on function create_agent_trace_session(uuid, text, text) is 'Creates AI agent tracing session following AI Toolkit best practices with dynamic session management';
comment on function bulk_insert_agent_traces(jsonb[]) is 'Bulk insert agent traces using PostgreSQL unnest with dynamic array bounds for optimal performance';
comment on function process_financial_data_batches(text, date, integer) is 'AI Toolkit compatible batch processing with dynamic sizing and comprehensive tracing';
