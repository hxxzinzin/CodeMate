-- service_role(서버 전용 secret key)에 테이블 권한을 명시적으로 부여한다.
--
-- 배경: 클라우드 프로젝트를 "새 테이블 자동 노출" 옵션을 끈 상태로 만들면,
-- migration으로 만든 테이블에 anon/authenticated뿐 아니라 service_role 권한도 자동으로 붙지 않는다.
-- 로컬 Supabase는 기본 권한이 자동으로 붙어서 이 차이가 로컬 테스트에서는 드러나지 않았다.
--
-- service_role은 RLS를 우회하지만, 테이블 GRANT가 없으면 "permission denied"가 난다. (RLS와 GRANT는 별개)
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- 앞으로 만드는 테이블도 service_role은 자동으로 접근할 수 있게 한다. (anon/authenticated는 여전히 명시적 grant 필요)
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
