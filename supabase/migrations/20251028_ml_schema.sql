-- Enable UUIDs
create extension if not exists "pgcrypto";

-- Schema
create schema if not exists ml;

-- Types
do $$ begin
  create type ml.prediction_type as enum ('pd','churn','fraud');
exception when duplicate_object then null; end $$;

-- Tables
create table if not exists ml.predictions (
  id uuid primary key default gen_random_uuid(),
  loan_id text not null,
  transfer_id text,
  prediction_type ml.prediction_type not null default 'pd',
  score numeric not null check (score >= 0 and score <= 1),
  label text,
  model_name text not null,
  model_version text not null,
  thresholds jsonb,
  features jsonb not null,
  decision jsonb,
  source text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ml.feedback (
  id uuid primary key default gen_random_uuid(),
  prediction_id uuid not null references ml.predictions(id) on delete cascade,
  loan_id text,
  outcome_label text,
  outcome_score numeric,
  correct boolean,
  comments text,
  user_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists ml.weight_adjustments (
  id uuid primary key default gen_random_uuid(),
  model_name text not null,
  model_version text not null,
  weights jsonb not null,
  reason text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists ml.learning_metrics (
  id bigserial primary key,
  model_name text not null,
  model_version text not null,
  window text not null,             -- e.g. '30d'
  metrics jsonb not null,           -- {brier:..., auc:..., acc:...}
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_ml_predictions_loan on ml.predictions(loan_id);
create index if not exists idx_ml_predictions_created on ml.predictions(created_at desc);
create index if not exists idx_ml_feedback_prediction on ml.feedback(prediction_id);

-- RLS (service role will bypass; authenticated can read/insert)
alter table ml.predictions enable row level security;
alter table ml.feedback enable row level security;
alter table ml.weight_adjustments enable row level security;
alter table ml.learning_metrics enable row level security;

do $$ begin
  create policy "pred_read" on ml.predictions for select to authenticated using (true);
  create policy "pred_write" on ml.predictions for insert to authenticated with check (true);
  create policy "fb_read"   on ml.feedback    for select to authenticated using (true);
  create policy "fb_write"  on ml.feedback    for insert to authenticated with check (true);
exception when duplicate_object then null; end $$;