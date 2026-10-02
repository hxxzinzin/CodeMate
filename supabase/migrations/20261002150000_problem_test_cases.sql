-- 채점용 테스트케이스 (예제 + 숨김 테스트).
--
-- 숨김 테스트의 입력과 기대 출력이 사용자에게 보이면, 그 값만 출력하는 코드로 채점을 통과할 수 있다.
-- 그래서 힌트·해설(ADR-002)과 같이 사용자 역할(anon/authenticated)에는 권한을 주지 않고,
-- 서버가 secret key(service_role)로만 읽는다.

create table public.problem_test_cases (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems (id) on delete cascade,
  ord smallint not null check (ord >= 0),
  input text not null,
  expected_output text not null,
  -- 화면에 보이는 예제인지. 예제는 틀렸을 때 입력과 기대 출력을 보여줘도 된다.
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  unique (problem_id, ord)
);

alter table public.problem_test_cases enable row level security;

-- 사용자 역할에는 어떤 권한도 주지 않는다. (정책도 만들지 않음 → RLS가 켜져 있어 모든 행 거부)
revoke all on public.problem_test_cases from anon, authenticated;
-- ADR-009: service_role 권한도 기본값에 기대지 않고 명시한다.
grant all on public.problem_test_cases to service_role;
