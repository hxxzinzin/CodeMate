-- 대시보드 통계 함수: 본인 기록만 집계하는지, 계산이 맞는지
begin;
select plan(7);

insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000000', 'a@example.com'),
  ('bbbbbbbb-0000-0000-0000-000000000000', 'b@example.com');

insert into public.problems (id, slug, title, description, input, output, constraints, difficulty, estimated_minutes, languages, is_published) values
  ('20000000-0000-0000-0000-000000000001', 'stats-p1', 'p1', 'd', 'i', 'o', 'c', 1, 10, array['java', 'c'], true),
  ('20000000-0000-0000-0000-000000000002', 'stats-p2', 'p2', 'd', 'i', 'o', 'c', 2, 20, array['java', 'c'], true);

-- A: p1 Java 오답 → p1 Java 정답(600초) → p1 C 정답(900초) → p2 Java 정답(측정값 없음) / pending 1건
insert into public.submissions (user_id, problem_id, language, code, result, solving_time_sec) values
  ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', 'java', 'x', 'self_wrong', 300),
  ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', 'java', 'x', 'self_correct', 600),
  ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', 'c', 'x', 'self_correct', 900),
  ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'java', 'x', 'ac', null),
  ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'java', 'x', 'pending', null),
  -- B의 기록 (A의 통계에 섞이면 안 됨)
  ('bbbbbbbb-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'c', 'x', 'self_correct', 60);

insert into public.user_problem_progress (user_id, problem_id, status, attempts) values
  ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', 'solved', 3),
  ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'solved', 2),
  ('bbbbbbbb-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'solved', 1);

set local role authenticated;
set local request.jwt.claims = '{"sub": "aaaaaaaa-0000-0000-0000-000000000000", "role": "authenticated"}';

select is((public.dashboard_stats() ->> 'total_submissions')::int, 4, '제출 수: pending은 세지 않는다');
select is((public.dashboard_stats() ->> 'correct_submissions')::int, 3, '정답 제출 수 (자기 보고 + 채점 정답)');
select is((public.dashboard_stats() ->> 'avg_correct_time_sec')::int, 750, '정답 평균 시간: 측정값이 있는 것만 (600, 900)');
select is((public.dashboard_stats() ->> 'java_solved')::int, 2, 'Java로 맞힌 서로 다른 문제 수');
select is((public.dashboard_stats() ->> 'c_solved')::int, 1, 'C로 맞힌 서로 다른 문제 수');
select is((public.dashboard_stats() ->> 'solved_count')::int, 2, '해결한 문제 수 (본인 진도만, B 제외)');

reset role;
set local role anon;
select throws_ok('select public.dashboard_stats()', '42501', null, '비로그인은 통계 함수를 실행할 수 없다');
reset role;

select * from finish();
rollback;
