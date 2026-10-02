-- 오늘의 문제를 추천한 이유 (예: "아직 약한 BFS를 연습할 차례예요")
-- 실력이 바뀌면 다시 계산한 이유가 달라질 수 있어, 추천한 시점의 이유를 저장한다.
alter table public.daily_problems add column reason text;

-- daily_problems의 select/insert/update 권한은 테이블 단위로 부여되어 있어 새 컬럼에도 적용된다. (20261001130000_rls_policies.sql)
