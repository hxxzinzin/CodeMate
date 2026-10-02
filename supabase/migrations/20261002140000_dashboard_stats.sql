-- 대시보드 통계 집계 함수.
-- 제출 기록을 모두 화면으로 가져와 계산하면 기록이 쌓일수록 느려지므로 DB에서 집계한다.
--
-- security invoker: 호출한 사용자의 권한으로 실행되어 RLS가 그대로 적용된다.
-- auth.uid()로 본인 행만 집계하고, 다른 사용자의 통계는 볼 수 없다.

create function public.dashboard_stats()
returns json
language sql
stable
security invoker
set search_path = ''
as $$
  with mine as (
    select result, language, problem_id, solving_time_sec,
           result in ('self_correct', 'ac') as correct
    from public.submissions
    where user_id = (select auth.uid()) and result <> 'pending'
  )
  select json_build_object(
    'total_submissions', (select count(*) from mine),
    'correct_submissions', (select count(*) from mine where correct),
    -- 정답 제출의 평균 풀이 시간 (측정값이 있는 것만)
    'avg_correct_time_sec', (select round(avg(solving_time_sec)) from mine where correct and solving_time_sec is not null),
    -- 언어별로 맞힌 서로 다른 문제 수
    'java_solved', (select count(distinct problem_id) from mine where correct and language = 'java'),
    'c_solved', (select count(distinct problem_id) from mine where correct and language = 'c'),
    'solved_count', (
      select count(*) from public.user_problem_progress
      where user_id = (select auth.uid()) and status = 'solved'
    )
  );
$$;

-- 함수는 기본적으로 모든 역할(PUBLIC)이 실행할 수 있으므로, 로그인 사용자만 남긴다.
revoke execute on function public.dashboard_stats() from public, anon;
grant execute on function public.dashboard_stats() to authenticated;
