-- AI 사용 기록 보관 기간 (기획서 50: 불필요한 데이터는 장기간 저장하지 않는다)
--
-- ai_interactions는 응답 캐시와 하루 사용량 계산에만 쓰인다.
-- 캐시는 7일, 사용량은 당일만 필요하므로 90일이 지난 기록은 매일 지운다.

create extension if not exists pg_cron;

-- 같은 이름의 작업이 이미 있으면 다시 만들지 않는다. (migration을 여러 번 적용해도 안전)
select cron.unschedule(jobid) from cron.job where jobname = 'purge-old-ai-interactions';

select cron.schedule(
  'purge-old-ai-interactions',
  '30 18 * * *', -- 매일 18:30 UTC = 한국 시간 새벽 3:30
  $$delete from public.ai_interactions where created_at < now() - interval '90 days'$$
);

-- 캐시 조회(request_hash + 최근 7일)와 사용량 계산(오늘 이후)을 빠르게 하는 인덱스
create index if not exists ai_interactions_hash_created_idx
  on public.ai_interactions (request_hash, created_at desc);
