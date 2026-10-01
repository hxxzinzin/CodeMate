# Architecture Decision Records

CodeMate의 중요한 기술적 의사결정과 그 이유를 기록합니다.
결정이 바뀌면 기존 항목을 지우지 않고, 상태를 `Superseded by ADR-XXX`로 바꾼 뒤 새 항목을 추가합니다.

| ADR | 제목 | 상태 |
|---|---|---|
| [001](#adr-001-무료-플랜-기반-인프라) | 무료 플랜 기반 인프라 | Accepted |
| [002](#adr-002-힌트해설-테이블-분리와-rls) | 힌트·해설 테이블 분리와 RLS | Accepted |
| [003](#adr-003-mvp는-자기-보고-채점--judgeprovider-추상화) | MVP는 자기 보고 채점 + JudgeProvider 추상화 | Accepted |
| [004](#adr-004-규칙-기반-추천난이도skill-모듈) | 규칙 기반 추천·난이도·Skill 모듈 | Accepted |
| [005](#adr-005-작성-중인-코드는-localstorage에-저장) | 작성 중인 코드는 localStorage에 저장 | Accepted |
| [006](#adr-006-프로젝트별-저장소와-api-키-분리) | 프로젝트별 저장소와 API 키 분리 | Accepted |
| [007](#adr-007-ai-활용-사실의-공개-방식) | AI 활용 사실의 공개 방식 | Accepted |
| [008](#adr-008-로컬-supabase와-pgtap으로-db-변경-검증) | 로컬 Supabase와 pgTAP으로 DB 변경 검증 | Accepted |
| [009](#adr-009-모든-역할의-테이블-권한을-migration에-명시) | 모든 역할의 테이블 권한을 migration에 명시 | Accepted |
| [010](#adr-010-gemini-모델-선택과-예비-모델) | Gemini 모델 선택과 예비 모델 | Accepted |

## 템플릿

```markdown
## ADR-XXX: 제목

- 날짜: YYYY-MM-DD
- 상태: Proposed | Accepted | Superseded by ADR-XXX

### 배경
### 결정
### 이유
### 대안
### 결과 / 트레이드오프
```

---

## ADR-001: 무료 플랜 기반 인프라

- 날짜: 2026-10-01
- 상태: Accepted

### 배경
개인 학습용 서비스로 장기간 운영해야 하므로, 운영 비용이 0원에 가까워야 한다.

### 결정
Vercel(Hobby) + Supabase(Free) + Gemini API(Free tier) + GitHub를 사용한다. AWS와 결제 정보가 필요한 서비스는 사용하지 않는다.

### 이유
- Next.js는 Vercel에 별도 설정 없이 배포된다.
- Supabase 하나로 Auth(Google OAuth), PostgreSQL, RLS를 모두 해결할 수 있다.

### 대안
- AWS EC2/RDS: 비용이 들고 운영 부담이 크다.

### 결과 / 트레이드오프
- 무료 한도 안에서 동작하도록 설계해야 한다. (AI 호출 캐시와 한도, DB 쓰기 최소화)
- Supabase 무료 프로젝트는 일정 기간 비활성 상태면 일시정지된다.
- 무료 플랜 조건은 바뀔 수 있으므로 README에 공식 문서 링크를 남긴다.

## ADR-002: 힌트·해설 테이블 분리와 RLS

- 날짜: 2026-10-01
- 상태: Accepted

### 배경
문제 해설과 힌트가 `problems` 테이블에 있으면 클라이언트가 anon key로 한 번에 조회할 수 있다. 그러면 힌트 사용 기록과 난이도 조정이 의미를 잃는다.

### 결정
- `problem_hints`, `problem_solutions` 테이블을 따로 두고, RLS 정책을 하나도 두지 않아 모든 클라이언트 접근을 막는다.
- 서버(service role, `server-only` 모듈)에서만 조회하고, 조회할 때 `learning_history`에 기록한다.
- 그 밖의 사용자 데이터 테이블은 `user_id = auth.uid()` 정책으로 본인 데이터만 접근할 수 있게 한다.

### 대안
- 컬럼 단위 권한(column privileges): 관리하기 복잡하고 실수하기 쉽다.

### 결과 / 트레이드오프
- service role 키가 서버에 존재하게 된다. 사용 범위를 `lib/supabase/admin.ts` 한 곳으로 제한한다.

## ADR-003: MVP는 자기 보고 채점 + JudgeProvider 추상화

- 날짜: 2026-10-01
- 상태: Accepted

### 배경
사용자 코드를 서버에서 직접 실행하는 것은 보안상 허용할 수 없다. 외부 sandbox 서비스는 무료 정책이 자주 바뀐다. "AI가 정답이라고 판단한 것"은 실제 채점이 아니다.

### 결정
- MVP에서는 사용자가 예제로 직접 확인한 뒤 결과를 선택한다(`self_correct` / `self_wrong`).
- AI 리뷰는 의견으로만 보여주고 채점 결과를 결정하지 않는다.
- `JudgeProvider` 인터페이스만 먼저 정의해 두고, 이후 Judge0, Piston 등으로 구현체를 추가한다.

### 결과 / 트레이드오프
- 데이터의 신뢰도가 사용자의 정직성에 달려 있다.
- 결과 값을 `self_*`와 `ac`/`wa` 등으로 구분해 두어, 나중에 Judge 결과와 가중치를 다르게 줄 수 있게 한다.

## ADR-004: 규칙 기반 추천·난이도·Skill 모듈

- 날짜: 2026-10-01
- 상태: Accepted

### 배경
초기에는 ML 모델을 학습시킬 데이터가 없다.

### 결정
- 오늘의 문제: 약점, 최근 오답, 복습 시기, 새 개념 등에 가중치를 준 점수로 후보를 평가하고, 상위 5개 중 점수 비례 확률로 고른다.
- 난이도: 정답 여부, 풀이 시간, 힌트, 시도 횟수로 수행 점수 p를 계산하고 이를 바탕으로 소수 단위 난이도 D를 조정한다.
- Skill: 문제 난이도를 반영한 목표 점수를 향해 지수이동평균으로 갱신한다.
- 세 로직 모두 DB와 UI에 의존하지 않는 순수 함수 모듈(`lib/recommendation`, `lib/skills`)로 만들고 단위 테스트한다.

### 결과 / 트레이드오프
- 가중치를 직관적으로 정했기 때문에, 실제 사용 데이터를 보며 조정해야 한다.
- 모듈이 분리되어 있어 나중에 ML 방식으로 교체할 수 있다.

## ADR-005: 작성 중인 코드는 localStorage에 저장

- 날짜: 2026-10-01
- 상태: Accepted

### 결정
작성 중인 코드는 문제별·언어별 키로 localStorage에 자동 저장한다. DB에는 제출할 때만 저장한다.

### 이유
키를 입력할 때마다 DB에 쓰면 Supabase 무료 한도를 불필요하게 소모한다.

### 결과 / 트레이드오프
다른 기기와는 작성 중인 코드가 동기화되지 않는다.

## ADR-006: 프로젝트별 저장소와 API 키 분리

- 날짜: 2026-10-01
- 상태: Accepted

### 결정
- CodeMate와 DataMate는 별도 GitHub 저장소로 관리하고, Vercel 프로젝트도 각각 둔다.
- Gemini API 키는 프로젝트별로 따로 발급한다.

### 이유
- 포트폴리오에서 프로젝트별 이력이 명확히 구분된다.
- 배포, 환경변수, AI 사용량을 독립적으로 관리할 수 있다.

### 결과 / 트레이드오프
- Supabase 무료 플랜의 활성 프로젝트 2개를 두 서비스가 모두 사용하므로, 개발/스테이징용 프로젝트를 추가할 여유가 없다.

## ADR-007: AI 활용 사실의 공개 방식

- 날짜: 2026-10-01
- 상태: Accepted

### 배경
이 프로젝트는 AI 코딩 도구를 활용해 개발하며, 이 사실을 숨기지 않고 공개한다.

### 결정
- 커밋 메시지는 Conventional Commits 형식으로 실제 변경 내용과 목적을 적는다.
- 커밋마다 AI를 `Co-authored-by`로 자동 표기하지 않는다.
- AI 활용 사실은 README의 AI-assisted development 섹션, [ai-development-log.md](./ai-development-log.md), 이 ADR 문서로 공개한다.
- AI가 생성한 코드는 검토·테스트·수정을 거쳐 반영한다.
- 문서에는 실제로 수행한 작업만 기록한다.

### 이유
커밋 단위의 기계적인 표기보다, 요구사항 정의, 설계 결정, 검토 과정을 문서로 남기는 편이 개발 과정을 더 정확하게 보여준다.

## ADR-008: 로컬 Supabase와 pgTAP으로 DB 변경 검증

- 날짜: 2026-10-01
- 상태: Accepted

### 배경
Supabase 무료 플랜은 활성 프로젝트가 2개뿐이고 CodeMate와 DataMate가 하나씩 사용한다(ADR-006). 클라우드에 테스트용 프로젝트를 따로 둘 수 없다.

### 결정
- DB 변경은 먼저 Docker 기반 로컬 Supabase(`npm run db:start`)에 적용해 검증한 뒤 클라우드에 반영한다.
- 스키마 제약, 트리거, RLS는 pgTAP 테스트(`supabase/tests/database`, `npm run db:test`)로 검증한다.

### 대안
- 클라우드 DB에 바로 적용: 설치가 필요 없지만, 실수하면 운영 DB를 직접 고쳐야 한다.

### 결과 / 트레이드오프
- 로컬 개발에 Docker Desktop이 필요하고, 실행 중 메모리를 2~4GB 사용한다.
- 쓰지 않는 서비스(Storage, Realtime, Edge Functions 등)는 제외하고 실행한다.
- RLS 같은 보안 규칙을 테스트 코드로 남겨, 이후 변경에서도 같은 검증을 반복할 수 있다.

## ADR-009: 모든 역할의 테이블 권한을 migration에 명시

- 날짜: 2026-10-02
- 상태: Accepted

### 배경
클라우드 프로젝트를 "새 테이블 자동 노출" 옵션을 끈 상태로 만들었다. 이 경우 migration으로 만든 테이블에 service_role 권한도 자동으로 붙지 않는다.
로컬 Supabase는 기본 권한이 자동으로 붙기 때문에 로컬 테스트는 통과했지만, 클라우드에서 secret key로 조회하면 `permission denied`가 났다. 첫 실제 로그인 후 가입 트리거 결과를 확인하다가 발견했다.

### 결정
- anon, authenticated, service_role 모두 테이블 권한을 migration에 명시한다. (`20261002090000_service_role_grants.sql`)
- service_role은 앞으로 만드는 테이블에도 자동으로 접근하도록 default privileges를 설정한다. anon과 authenticated는 계속 테이블마다 직접 grant한다.

### 결과 / 트레이드오프
- 로컬과 클라우드의 기본 권한 설정이 달라도 같은 결과가 나온다.
- 로컬 테스트만으로는 이런 환경 차이를 잡을 수 없다. migration을 클라우드에 적용한 뒤에는 공개 키와 secret key로 접근 결과를 한 번씩 확인한다.

## ADR-010: Gemini 모델 선택과 예비 모델

- 날짜: 2026-10-02
- 상태: Accepted

### 배경
무료 등급 API 키로 쓸 수 있는 텍스트 모델 후보 4개를 실제 힌트 요청과 같은 형태로 비교했다. (같은 프롬프트, 출력 상한 300토큰)

| 모델 | 결과 | 시간 | 비고 |
|---|---|---|---|
| gemini-3.8-flash | 503 (5회 중 4회) | - | 최신 모델, 무료 등급에서 "high demand"로 불안정 |
| gemini-3.5-flash | 200 | 2.3초 | 기본 설정에서 생각(thinking) 토큰이 284~454개 사용되어 출력 상한에 걸려 답변이 잘림 |
| gemini-3.5-flash-lite | 200 | 1.5초 | 생각 없이 바로 답변, 질문형 힌트 품질 양호 |
| gemini-3.1-flash-lite | 200 | 1.9초 | 생각 없이 바로 답변, 품질 양호 |

### 결정
- 기본 모델 `gemini-3.5-flash-lite`, 예비 모델 `gemini-3.1-flash-lite`. 둘 다 환경변수(`GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL`)로 바꿀 수 있다.
- 기본 모델이 429(한도 초과)·5xx(과부하)·시간 초과면 예비 모델로 한 번 더 시도한다. 모델마다 무료 한도가 따로라 사용 가능량도 늘어난다.
- 생각 기능은 `thinkingLevel: "minimal"`로 끈다.
  - `thinkingBudget: 0`은 gemini-3.5-flash-lite가 400으로 거부했다. 세 모델 모두 받는 설정을 쓴다.
- SDK 대신 REST(fetch)로 호출한다. 요청이 generateContent 하나뿐이고, 재시도·시간 제한을 직접 제어하기 위해서다.
- `-latest` 별칭과 `-preview` 모델은 쓰지 않는다. 예고 없이 동작이 바뀔 수 있다.

### 결과 / 트레이드오프
- 응답이 빠르고 무료 한도 안에서 안정적이다. 대신 깊은 추론이 필요한 리뷰 품질은 Flash보다 낮을 수 있다. 필요하면 용도별로 모델을 나눈다.
- 무료 등급 모델 목록과 한도는 자주 바뀌므로 `npm run ai:smoke`로 주기적으로 확인한다.
- 실제 응답에서 AI가 작은 사실 오류를 내는 경우를 확인했다. AI 리뷰를 채점 결과로 쓰지 않는 원칙(ADR-003)을 유지한다.
