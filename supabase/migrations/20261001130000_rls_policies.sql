-- CodeMate 접근 권한 (ADR-002)
--
-- Supabase의 데이터 보호는 두 겹이다.
--   1) GRANT: 역할(anon = 비로그인, authenticated = 로그인)이 테이블/컬럼에 접근할 수 있는가
--   2) RLS 정책: 접근할 수 있다면 어떤 행(row)까지 허용하는가
--
-- 프로젝트 설정(새 테이블 자동 노출 여부)과 관계없이 같은 결과가 나오도록,
-- 기본 권한을 모두 회수한 뒤 필요한 것만 명시적으로 허용한다.
-- service_role(서버 전용 키)은 RLS를 우회하므로 여기서 다루지 않는다.

-- ---------------------------------------------------------------------------
-- 1. 기본 권한 회수
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- 앞으로 migration으로 만드는 테이블도 자동으로 노출되지 않게 한다.
-- (새 테이블은 이 파일처럼 grant를 직접 적어야 API에서 보인다)
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. 문제은행: 공개된 문제는 누구나(Demo 포함) 읽을 수 있다
-- ---------------------------------------------------------------------------
grant select on public.problems to anon, authenticated;
grant select on public.problem_tags to anon, authenticated;

create policy "공개된 문제는 누구나 조회"
  on public.problems for select
  to anon, authenticated
  using (is_published);

create policy "공개된 문제의 태그는 누구나 조회"
  on public.problem_tags for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.problems p
      where p.id = problem_id and p.is_published
    )
  );

-- problem_hints, problem_solutions: grant도 정책도 없다.
-- 서버가 service_role로만 읽고, 읽을 때 learning_history에 기록한다.

-- ---------------------------------------------------------------------------
-- 3. 사용자 데이터: 로그인한 사용자는 자기 행만 다룬다
-- ---------------------------------------------------------------------------
-- auth.uid()를 (select ...)로 감싸면 행마다가 아니라 쿼리당 한 번만 계산된다. (Supabase 권장)

-- profiles: 행은 가입 트리거가 만든다. 수정은 학습 상태 컬럼만 허용한다.
grant select on public.profiles to authenticated;
grant update (current_difficulty, streak, longest_streak, last_study_date)
  on public.profiles to authenticated;

create policy "본인 프로필 조회"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "본인 프로필 수정"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- user_preferences: 행은 가입 트리거가 만든다. 설정 값만 수정할 수 있다.
grant select on public.user_preferences to authenticated;
grant update (java_ratio, preferred_difficulty, timezone)
  on public.user_preferences to authenticated;

create policy "본인 설정 조회"
  on public.user_preferences for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "본인 설정 수정"
  on public.user_preferences for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- submissions: 제출 기록은 추가만 한다. (수정·삭제 불가 → 기록이 바뀌지 않음)
grant select, insert on public.submissions to authenticated;

create policy "본인 제출 조회"
  on public.submissions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "본인 제출 추가"
  on public.submissions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- user_problem_progress, daily_problems, user_skills: 조회·추가·수정
grant select, insert, update on public.user_problem_progress to authenticated;
grant select, insert, update on public.daily_problems to authenticated;
grant select, insert, update on public.user_skills to authenticated;

create policy "본인 진도 조회" on public.user_problem_progress for select
  to authenticated using ((select auth.uid()) = user_id);
create policy "본인 진도 추가" on public.user_problem_progress for insert
  to authenticated with check ((select auth.uid()) = user_id);
create policy "본인 진도 수정" on public.user_problem_progress for update
  to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "본인 오늘의 문제 조회" on public.daily_problems for select
  to authenticated using ((select auth.uid()) = user_id);
create policy "본인 오늘의 문제 추가" on public.daily_problems for insert
  to authenticated with check ((select auth.uid()) = user_id);
create policy "본인 오늘의 문제 수정" on public.daily_problems for update
  to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "본인 Skill 조회" on public.user_skills for select
  to authenticated using ((select auth.uid()) = user_id);
create policy "본인 Skill 추가" on public.user_skills for insert
  to authenticated with check ((select auth.uid()) = user_id);
create policy "본인 Skill 수정" on public.user_skills for update
  to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- learning_history: 추가와 조회만
grant select, insert on public.learning_history to authenticated;

create policy "본인 학습 이력 조회" on public.learning_history for select
  to authenticated using ((select auth.uid()) = user_id);
create policy "본인 학습 이력 추가" on public.learning_history for insert
  to authenticated with check ((select auth.uid()) = user_id);

-- ai_interactions: 기록은 서버(service_role)만 쓴다. 사용자는 자기 기록 조회만 가능하다.
grant select on public.ai_interactions to authenticated;

create policy "본인 AI 사용 기록 조회" on public.ai_interactions for select
  to authenticated using ((select auth.uid()) = user_id);
