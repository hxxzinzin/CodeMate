-- 채점 테스트케이스: 사용자는 볼 수 없고 서버만 읽는다
begin;
select plan(5);

insert into auth.users (id, email) values ('aaaaaaaa-0000-0000-0000-000000000000', 'a@example.com');

insert into public.problems (id, slug, title, description, input, output, constraints, difficulty, estimated_minutes, languages, is_published) values
  ('30000000-0000-0000-0000-000000000001', 'tc-p1', 'p1', 'd', 'i', 'o', 'c', 1, 10, array['java', 'c'], true);

insert into public.problem_test_cases (problem_id, ord, input, expected_output, is_sample) values
  ('30000000-0000-0000-0000-000000000001', 0, '1 2', '3', true),
  ('30000000-0000-0000-0000-000000000001', 1, '100 200', '300', false);

set local role anon;
select throws_ok('select * from public.problem_test_cases', '42501', null, 'anon: 테스트케이스에 접근할 수 없다');
reset role;

set local role authenticated;
set local request.jwt.claims = '{"sub": "aaaaaaaa-0000-0000-0000-000000000000", "role": "authenticated"}';
select throws_ok('select * from public.problem_test_cases', '42501', null, '로그인 사용자: 숨김 테스트를 읽을 수 없다');
select throws_ok(
  $$ insert into public.problem_test_cases (problem_id, ord, input, expected_output) values ('30000000-0000-0000-0000-000000000001', 2, 'x', 'y') $$,
  '42501', null, '로그인 사용자: 테스트케이스를 추가할 수 없다'
);
reset role;

set local role service_role;
select results_eq(
  $$ select expected_output from public.problem_test_cases where problem_id = '30000000-0000-0000-0000-000000000001' order by ord $$,
  $$ values ('3'), ('300') $$,
  'service_role: 서버는 순서대로 읽을 수 있다'
);
reset role;

select throws_ok(
  $$ insert into public.problem_test_cases (problem_id, ord, input, expected_output) values ('30000000-0000-0000-0000-000000000001', 0, 'x', 'y') $$,
  '23505', null, '같은 문제에 같은 순서 번호는 둘일 수 없다'
);

select * from finish();
rollback;
