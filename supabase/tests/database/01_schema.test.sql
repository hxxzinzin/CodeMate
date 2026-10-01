-- 초기 스키마 검증: npx supabase test db
begin;
select plan(18);

-- 모든 public 테이블에 RLS가 켜져 있어야 한다. (정책이 없으면 기본 거부)
select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity),
  0,
  'public 스키마의 모든 테이블에 RLS가 켜져 있다'
);

select has_table('public', t, format('%s 테이블이 존재한다', t))
from unnest(array[
  'profiles', 'user_preferences', 'problems', 'problem_tags', 'problem_hints',
  'problem_solutions', 'submissions', 'user_problem_progress', 'daily_problems',
  'user_skills', 'ai_interactions', 'learning_history'
]) as t;

-- 가입 트리거: auth.users에 행이 생기면 profiles, user_preferences가 기본값으로 생성된다.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-000000000001', 'test@example.com');

select results_eq(
  $$ select current_difficulty, streak from public.profiles
     where id = '00000000-0000-0000-0000-000000000001' $$,
  $$ values (1.50::numeric(4, 2), 0) $$,
  '가입 시 profiles가 기본값으로 생성된다'
);

select results_eq(
  $$ select java_ratio::int, timezone from public.user_preferences
     where user_id = '00000000-0000-0000-0000-000000000001' $$,
  $$ values (70, 'Asia/Seoul') $$,
  '가입 시 user_preferences가 기본값(Java 70%)으로 생성된다'
);

-- 제약 조건
select throws_ok(
  $$ update public.user_preferences set java_ratio = 120
     where user_id = '00000000-0000-0000-0000-000000000001' $$,
  '23514',
  null,
  'java_ratio는 0~100 범위를 벗어날 수 없다'
);

insert into public.problems (id, slug, title, description, input, output, constraints, difficulty, estimated_minutes, languages)
values ('10000000-0000-0000-0000-000000000001', 'sample', '샘플', 'd', 'i', 'o', 'c', 2, 20, array['java']);

insert into public.daily_problems (user_id, problem_id, date, language)
values ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2026-10-01', 'java');

select throws_ok(
  $$ insert into public.daily_problems (user_id, problem_id, date, language)
     values ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2026-10-01', 'c') $$,
  '23505',
  null,
  '같은 사용자는 같은 날짜에 오늘의 문제를 하나만 가진다'
);

select throws_ok(
  $$ insert into public.problems (slug, title, description, input, output, constraints, difficulty, estimated_minutes, languages)
     values ('python-only', 'x', 'd', 'i', 'o', 'c', 1, 10, array['python']) $$,
  '23514',
  null,
  '지원하지 않는 언어는 문제 언어로 등록할 수 없다'
);

select * from finish();
rollback;
