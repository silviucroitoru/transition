-- Questionnaires table: stores the questionnaire JSON per language
create table if not exists public.questionnaires (
  id uuid primary key default gen_random_uuid(),
  language text not null unique,
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

-- RLS: questionnaires — public read, anon insert and update (for seed)
alter table public.questionnaires enable row level security;
create policy "Allow public read" on public.questionnaires for select using (true);
create policy "Allow anon insert" on public.questionnaires for insert with check (true);
create policy "Allow anon update" on public.questionnaires for update using (true) with check (true);

-- RLS: submissions — enabled with no policies (locked down by default).
-- Inserts go through a SECURITY DEFINER function so the app can write but
-- nobody can read/update/delete submissions via the public API.
alter table public.submissions enable row level security;

-- Function: insert a submission (bypasses RLS via SECURITY DEFINER)
create or replace function public.insert_submission(
  p_language text,
  p_questionnaire_language text,
  p_responses jsonb,
  p_email text default null
)
returns uuid
language sql
security definer
set search_path = public
as $$
  insert into submissions (language, questionnaire_language, responses, email)
  values (p_language, p_questionnaire_language, p_responses, p_email)
  returning id;
$$;

grant execute on function public.insert_submission to anon, authenticated;

-- Submission results: computed transition result per submission (single source of truth for results screen, email, analytics)
create table if not exists public.submission_results (
  submission_id uuid primary key references public.submissions(id) on delete cascade,
  phase text not null,
  experience_state text not null,
  phase_score_breakdown jsonb not null,
  strain_score numeric not null,
  computed_at timestamptz not null default now()
);

alter table public.submission_results enable row level security;

-- Save transition result for a submission. Idempotent: does not overwrite existing result unless p_force is true.
create or replace function public.save_submission_result(
  p_submission_id uuid,
  p_phase text,
  p_experience_state text,
  p_phase_score_breakdown jsonb,
  p_strain_score numeric,
  p_force boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_force then
    insert into submission_results (submission_id, phase, experience_state, phase_score_breakdown, strain_score, computed_at)
    values (p_submission_id, p_phase, p_experience_state, p_phase_score_breakdown, p_strain_score, now())
    on conflict (submission_id) do update set
      phase = excluded.phase,
      experience_state = excluded.experience_state,
      phase_score_breakdown = excluded.phase_score_breakdown,
      strain_score = excluded.strain_score,
      computed_at = now();
  else
    insert into submission_results (submission_id, phase, experience_state, phase_score_breakdown, strain_score, computed_at)
    values (p_submission_id, p_phase, p_experience_state, p_phase_score_breakdown, p_strain_score, now())
    on conflict (submission_id) do nothing;
  end if;
end;
$$;

-- Fetch stored transition result by submission id. Returns null if none.
create or replace function public.get_submission_result(p_submission_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  select phase, experience_state, phase_score_breakdown, strain_score, computed_at
  into r
  from submission_results
  where submission_id = p_submission_id;
  if not found then
    return null;
  end if;
  return json_build_object(
    'phase', r.phase,
    'experienceState', r.experience_state,
    'phaseScoreBreakdown', r.phase_score_breakdown,
    'strainScore', (r.strain_score)::float,
    'computed_at', r.computed_at
  );
end;
$$;

grant execute on function public.save_submission_result to anon, authenticated;
grant execute on function public.get_submission_result to anon, authenticated;
