-- Questionnaires table: stores the questionnaire JSON per language
create table if not exists public.questionnaires (
  id uuid primary key default gen_random_uuid(),
  language text not null,
  content jsonb not null,
  inserted_at timestamptz not null default now()
);

create index if not exists questionnaires_language_idx
  on public.questionnaires (language);

-- Submissions table: stores each completed questionnaire run
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  language text not null,
  questionnaire_language text not null,
  responses jsonb not null,
  email text,
  created_at timestamptz not null default now()
);

