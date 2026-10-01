-- 접근 권한(GRANT + RLS) 검증: npx supabase test db
--
-- 실제 API 요청과 같은 조건을 만들기 위해 역할(role)과 JWT claim을 바꿔 가며 쿼리한다.
--   anon          : 로그인하지 않은 사용자 (Demo)
--   authenticated : 로그인한 사용자. auth.uid()는 JWT의 sub 값
--   service_role  : 서버 전용 키
begin;
select plan(17);

-- ---------------------------------------------------------------------------
-- 준비 (postgres 권한으로 데이터 생성)
-- seed 문제도 함께 있으므로, 문제 관련 검증은 아래에서 만든 테스트용 id로 범위를 좁힌다.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000000', 'a@example.com'),
  ('bbbbbbbb-0000-0000-0000-000000000000', 'b@example.com');

insert into public.problems (id, slug, title, description, input, output, constraints, difficulty, estimated_minutes, languages, is_published) values
  ('10000000-0000-0000-0000-000000000001', 'published', '공개 문제', 'd', 'i', 'o', 'c', 2, 20, array['java'], true),
  ('10000000-0000-0000-0000-000000000002', 'draft', '비공개 문제', 'd', 'i', 'o', 'c', 2, 20, array['java'], false);

insert into public.problem_tags (problem_id, tag_type, tag) values
  ('10000000-0000-0000-0000-000000000001', 'algorithm', 'sorting'),
  ('10000000-0000-0000-0000-000000000002', 'algorithm', 'dp');

insert into public.problem_hints (problem_id, level, content) values
  ('10000000-0000-0000-0000-000000000001', 1, '정렬을 떠올려 보세요');
insert into public.problem_solutions (problem_id, explanation) values
  ('10000000-0000-0000-0000-000000000001', '정답 해설');

insert into public.submissions (user_id, problem_id, language, code) values
  ('aaaaaaaa-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'java', 'class A {}'),
  ('bbbbbbbb-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'java', 'class B {}');

-- ---------------------------------------------------------------------------
-- 비로그인 사용자 (anon)
-- ---------------------------------------------------------------------------
set local role anon;

select results_eq(
  $$ select slug from public.problems where id in ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002') $$,
  $$ values ('published') $$,
  'anon: 공개된 문제만 보인다'
);

select results_eq(
  $$ select tag from public.problem_tags where problem_id in ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002') $$,
  $$ values ('sorting') $$,
  'anon: 공개된 문제의 태그만 보인다'
);

select throws_ok('select * from public.problem_hints', '42501', null, 'anon: 힌트 테이블에 접근할 수 없다');
select throws_ok('select * from public.profiles', '42501', null, 'anon: 사용자 프로필에 접근할 수 없다');

reset role;

-- ---------------------------------------------------------------------------
-- 로그인 사용자 A
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims = '{"sub": "aaaaaaaa-0000-0000-0000-000000000000", "role": "authenticated"}';

select throws_ok('select * from public.problem_solutions', '42501', null, 'A: 정답 해설 테이블에 접근할 수 없다');

select results_eq(
  'select code from public.submissions',
  $$ values ('class A {}') $$,
  'A: 본인 제출 기록만 보인다'
);

select results_eq(
  'select id from public.profiles',
  $$ values ('aaaaaaaa-0000-0000-0000-000000000000'::uuid) $$,
  'A: 본인 프로필만 보인다'
);

select throws_ok(
  $$ insert into public.submissions (user_id, problem_id, language, code)
     values ('bbbbbbbb-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'java', 'x') $$,
  '42501', null,
  'A: 다른 사용자 이름으로 제출을 추가할 수 없다'
);

select lives_ok(
  $$ insert into public.submissions (user_id, problem_id, language, code)
     values ('aaaaaaaa-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'c', 'int main(void){}') $$,
  'A: 본인 제출은 추가할 수 있다'
);

select throws_ok(
  $$ update public.submissions set result = 'ac' $$,
  '42501', null,
  'A: 제출 기록은 수정할 수 없다'
);

select throws_ok(
  $$ delete from public.submissions $$,
  '42501', null,
  'A: 제출 기록은 삭제할 수 없다'
);

-- 다른 사용자의 행은 RLS에 걸러져 "0행 수정"으로 끝난다. (오류 없이 무시됨)
update public.user_preferences set java_ratio = 10
  where user_id = 'bbbbbbbb-0000-0000-0000-000000000000';
update public.user_preferences set java_ratio = 50
  where user_id = 'aaaaaaaa-0000-0000-0000-000000000000';

select results_eq(
  'select java_ratio::int from public.user_preferences',
  $$ values (50) $$,
  'A: 본인 설정은 수정할 수 있다'
);

select throws_ok(
  $$ update public.profiles set created_at = now() $$,
  '42501', null,
  'A: 프로필의 허용되지 않은 컬럼(created_at)은 수정할 수 없다'
);

select lives_ok(
  $$ insert into public.learning_history (user_id, problem_id, event_type)
     values ('aaaaaaaa-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'problem_view') $$,
  'A: 본인 학습 이력은 추가할 수 있다'
);

select throws_ok(
  $$ insert into public.ai_interactions (user_id, type, request_hash)
     values ('aaaaaaaa-0000-0000-0000-000000000000', 'hint', 'h') $$,
  '42501', null,
  'A: AI 사용 기록은 직접 추가할 수 없다 (서버 전용)'
);

reset role;

-- B의 설정이 A의 수정 시도에 영향을 받지 않았는지 확인
select results_eq(
  $$ select java_ratio::int from public.user_preferences
     where user_id = 'bbbbbbbb-0000-0000-0000-000000000000' $$,
  $$ values (70) $$,
  'B: A가 수정을 시도해도 B의 설정은 그대로다'
);

-- ---------------------------------------------------------------------------
-- 서버 (service_role)
-- ---------------------------------------------------------------------------
set local role service_role;

select results_eq(
  $$ select content from public.problem_hints where problem_id in ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002') $$,
  $$ values ('정렬을 떠올려 보세요') $$,
  'service_role: 서버는 힌트를 읽을 수 있다'
);

reset role;

select * from finish();
rollback;
