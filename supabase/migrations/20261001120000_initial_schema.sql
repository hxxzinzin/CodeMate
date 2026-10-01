-- CodeMate 초기 스키마
-- 설계 근거: docs/decisions.md (ADR-002 ~ ADR-005)
--
-- 원칙
-- - 값의 범위는 enum 대신 text + check 제약으로 제한한다. (값 추가·변경이 migration 한 줄로 끝남)
-- - 모든 테이블은 생성 즉시 RLS를 켠다. 정책이 없으면 anon/authenticated 접근은 전부 거부된다.
--   실제 접근 정책은 다음 migration(RLS)에서 추가한다.

-- ---------------------------------------------------------------------------
-- 공통: updated_at 자동 갱신
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 사용자
-- ---------------------------------------------------------------------------

-- auth.users와 1:1. 이메일 등 개인정보는 auth.users에만 두고 복제하지 않는다.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- 한 번의 조정 폭이 0.01 단위까지 작을 수 있어 소수 둘째 자리까지 저장한다.
  current_difficulty numeric(4, 2) not null default 1.5
    check (current_difficulty between 1 and 10),
  streak integer not null default 0 check (streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_study_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- C 비율은 저장하지 않고 100 - java_ratio로 계산한다.
create table public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  java_ratio smallint not null default 70 check (java_ratio between 0 and 100),
  preferred_difficulty smallint check (preferred_difficulty between 1 and 10),
  timezone text not null default 'Asia/Seoul',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 문제은행
-- ---------------------------------------------------------------------------
create table public.problems (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 100),
  description text not null,
  input text not null,
  output text not null,
  constraints text not null,
  -- [{ "input": "...", "output": "...", "explanation": "..." }]
  examples jsonb not null default '[]' check (jsonb_typeof(examples) = 'array'),
  -- 지금은 1~5만 사용, 1~10까지 확장 가능
  difficulty smallint not null check (difficulty between 1 and 10),
  estimated_minutes smallint not null check (estimated_minutes > 0),
  languages text[] not null
    check (cardinality(languages) > 0 and languages <@ array['java', 'c']),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index problems_published_difficulty_idx
  on public.problems (difficulty)
  where is_published;

-- tag_type은 Skill 카테고리와 1:1로 대응한다. 지원 언어는 problems.languages에 둔다.
create table public.problem_tags (
  problem_id uuid not null references public.problems (id) on delete cascade,
  tag_type text not null check (tag_type in ('algorithm', 'data_structure', 'java', 'c')),
  tag text not null check (tag ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  primary key (problem_id, tag_type, tag)
);

create index problem_tags_tag_idx on public.problem_tags (tag_type, tag);

-- 힌트와 해설은 클라이언트에서 조회할 수 없다. 서버에서만 읽는다. (ADR-002)
create table public.problem_hints (
  problem_id uuid not null references public.problems (id) on delete cascade,
  level smallint not null check (level between 1 and 4),
  content text not null,
  primary key (problem_id, level)
);

create table public.problem_solutions (
  problem_id uuid primary key references public.problems (id) on delete cascade,
  explanation text not null,
  -- { "java": "...", "c": "..." }
  reference_code jsonb not null default '{}' check (jsonb_typeof(reference_code) = 'object'),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 학습 기록
-- ---------------------------------------------------------------------------

-- 문제는 삭제하지 않고 is_published = false로 내린다. 풀이 기록을 지키기 위해 restrict.
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  problem_id uuid not null references public.problems (id) on delete restrict,
  language text not null check (language in ('java', 'c')),
  code text not null check (char_length(code) between 1 and 20000),
  -- self_*: Judge 도입 전 자기 보고 결과 (ADR-003)
  result text not null default 'pending'
    check (result in ('pending', 'self_correct', 'self_wrong', 'ac', 'wa', 'tle', 're', 'ce')),
  solving_time_sec integer check (solving_time_sec >= 0),
  hint_count smallint not null default 0 check (hint_count >= 0),
  max_hint_level smallint not null default 0 check (max_hint_level between 0 and 4),
  attempt_count smallint not null default 1 check (attempt_count >= 1),
  solution_revealed boolean not null default false,
  ai_review_used boolean not null default false,
  -- Judge 도입 후 실행 시간, 메모리, 테스트케이스 결과 등
  judge_detail jsonb,
  created_at timestamptz not null default now()
);

create index submissions_user_created_idx on public.submissions (user_id, created_at desc);
create index submissions_user_problem_idx on public.submissions (user_id, problem_id);
create index submissions_problem_idx on public.submissions (problem_id);

-- 이미 푼 문제인지, 복습할 때가 됐는지를 submissions 전체를 훑지 않고 조회하기 위한 요약 테이블
create table public.user_problem_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  problem_id uuid not null references public.problems (id) on delete restrict,
  status text not null check (status in ('attempted', 'solved')),
  attempts integer not null default 0 check (attempts >= 0),
  first_solved_at timestamptz,
  last_attempt_at timestamptz,
  next_review_at timestamptz,
  primary key (user_id, problem_id)
);

create index user_problem_progress_review_idx
  on public.user_problem_progress (user_id, next_review_at)
  where next_review_at is not null;
create index user_problem_progress_problem_idx on public.user_problem_progress (problem_id);

-- 사용자당 하루 1행. "새로 뽑기"는 행을 추가하지 않고 교체하며 하루 2회까지 허용한다.
create table public.daily_problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  problem_id uuid not null references public.problems (id) on delete restrict,
  date date not null,
  language text not null check (language in ('java', 'c')),
  mode text not null default 'recommended' check (mode in ('recommended', 'random')),
  reroll_count smallint not null default 0 check (reroll_count between 0 and 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create index daily_problems_problem_idx on public.daily_problems (problem_id);

create table public.user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null check (category in ('algorithm', 'data_structure', 'java', 'c')),
  skill text not null,
  score numeric(5, 2) not null default 0 check (score between 0 and 100),
  -- attempts = 0이면 측정 전 (0점과 구분)
  attempts integer not null default 0 check (attempts >= 0),
  correct integer not null default 0 check (correct between 0 and attempts),
  last_practiced_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, category, skill)
);

-- AI 사용량 추적과 응답 캐시. user_id가 null이면 Demo 사용자.
-- request/response 원문은 일정 기간 후 정리한다. (Phase 6)
create table public.ai_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  problem_id uuid references public.problems (id) on delete set null,
  type text not null check (type in ('hint', 'review', 'explain', 'solution')),
  request_hash text not null,
  request jsonb,
  response text,
  model text,
  tokens_in integer check (tokens_in >= 0),
  tokens_out integer check (tokens_out >= 0),
  created_at timestamptz not null default now()
);

create index ai_interactions_hash_idx on public.ai_interactions (request_hash);
create index ai_interactions_user_created_idx on public.ai_interactions (user_id, created_at desc);
create index ai_interactions_created_idx on public.ai_interactions (created_at);
create index ai_interactions_problem_idx on public.ai_interactions (problem_id);

create table public.learning_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  problem_id uuid references public.problems (id) on delete set null,
  event_type text not null check (event_type in (
    'problem_view', 'hint_request', 'submission', 'solve', 'review_request', 'solution_reveal'
  )),
  metadata jsonb not null default '{}' check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index learning_history_user_created_idx on public.learning_history (user_id, created_at desc);
create index learning_history_problem_idx on public.learning_history (problem_id);

-- ---------------------------------------------------------------------------
-- updated_at 트리거
-- ---------------------------------------------------------------------------
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.user_preferences
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.problems
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.problem_solutions
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.daily_problems
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.user_skills
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 가입 시 profiles, user_preferences 자동 생성
-- ---------------------------------------------------------------------------
-- auth.users에 대한 트리거라 security definer로 실행한다.
-- search_path를 비워 두고 모든 객체를 스키마까지 명시한다. (Supabase 권장 사항)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.user_preferences (user_id) values (new.id);
  return new;
end;
$$;

-- returns trigger 함수는 PostgREST rpc로 노출되지 않는다.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS: 전부 켜고 정책은 다음 migration에서 추가한다. (기본 거부)
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.problems enable row level security;
alter table public.problem_tags enable row level security;
alter table public.problem_hints enable row level security;
alter table public.problem_solutions enable row level security;
alter table public.submissions enable row level security;
alter table public.user_problem_progress enable row level security;
alter table public.daily_problems enable row level security;
alter table public.user_skills enable row level security;
alter table public.ai_interactions enable row level security;
alter table public.learning_history enable row level security;
