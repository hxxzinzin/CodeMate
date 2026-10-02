# CodeMate

> 스스로 생각하는 힘을 기르는 개인 맞춤형 코딩테스트 학습 플랫폼

CodeMate는 사용자의 풀이 기록(정답률, 풀이 시간, 힌트 사용량, 알고리즘·자료구조별 실력)을 분석해
매일 지금 풀기 가장 적절한 Java/C 코딩테스트 문제를 추천하는 서비스입니다.

AI는 정답을 대신 알려주지 않습니다. 개념 → 사고 방향 → 접근 방법 → 의사코드 순서로 단계적인 힌트를 주는 **코치** 역할을 합니다.

**🌐 서비스 주소: https://code-mate-gold.vercel.app** (문제 목록은 로그인 없이 체험 가능, Google 로그인)

## 현재 상태

계획한 기능(Phase 1~10)을 모두 구현해 배포했고, 실제로 사용하며 개선하고 있습니다. 모든 인프라는 **결제 정보 없이 무료 플랜**으로 운영합니다. ([ADR-001](docs/decisions.md#adr-001-무료-플랜-기반-인프라))

| 항목 | 현재 |
|---|---|
| 문제 | 31개 (Java·C, 난이도 1~5, 예제 + 숨김 테스트 267개) |
| 테스트 | 단위 테스트 229개 (Vitest), DB 테스트 47개 (pgTAP) |
| 설계 결정 기록 | ADR 15개 ([docs/decisions.md](docs/decisions.md)) |
| 진행 기록 | 이슈 → 브랜치 → PR → merge ([Milestones](https://github.com/hxxzinzin/CodeMate/milestones)) |

## 주요 기능

**학습 흐름**
- **오늘의 문제:** 약점·최근 오답·복습 시기·난이도·언어 비율로 하루 한 문제를 추천하고, 추천 이유를 보여줍니다. 하루 2번까지 새로 뽑을 수 있습니다.
- **적응형 난이도:** 풀이 결과(정답, 시간, 힌트, 시도 횟수)에 따라 추천 난이도를 소수 단위로 조정합니다. 정답률 약 70%인 "약간 어려운" 구간을 유지합니다.
- **분야별 실력 점수:** 알고리즘 / 자료구조 / Java / C 분야별 점수와 강점·취약점·복습 추천
- **복습과 다시 풀기:** 푼 문제는 7일 → 14일 간격으로 복습, 정답을 보고 넘어간 문제는 3일 뒤 "다시 풀기"로 다시 나옵니다.

**문제 풀이**
- **코드 에디터:** Monaco 기반 Java/C 에디터, 자동 저장, 화면을 보는 동안만 재는 풀이 시간
- **자동 채점:** 외부 sandbox에서 예제 + 숨김 테스트로 채점 (정답 / 오답 / 시간 초과 / 실행 에러 / 컴파일 에러). 사용자 코드는 우리 서버에서 실행하지 않습니다.
- **단계별 힌트와 AI 코치:** 검증된 힌트 4단계 → Gemini가 내 코드에 맞춘 힌트·코드 리뷰·질문 답변. 정답 코드는 사용자가 확인한 뒤에만 보여주고, 하루 사용 한도가 있습니다.

**기록과 콘텐츠**
- **대시보드·학습 현황:** 연속 학습일, 정답률, 평균 풀이 시간, 추천 난이도 변화 그래프, 최근 30일 분야별 성장
- **문제 늘리기:** AI가 초안을 만들면 세 가지 풀이(Java, C, 완전 탐색)를 sandbox에서 실행해 모두 같은 답일 때만 통과하고, 사람이 승인해야 공개됩니다. ([ADR-015](docs/decisions.md#adr-015-ai-문제-초안은-sandbox-교차-검증과-사람-승인을-거쳐-공개한다))

## 어떻게 동작하나요

```
브라우저 (Next.js 화면, Monaco 에디터)
   │
   ▼
Vercel ─ Next.js 서버 (API Route → 서비스 계층 → DB 접근 계층)
   │            │                     │                    │
   │            ▼                     ▼                    ▼
   │     Supabase (PostgreSQL,   Gemini API           OnlineCompiler.io
   │     Google 로그인, RLS)     (힌트·리뷰, 서버만)   (채점 sandbox, 서버만)
   │
   └─ 매일 03:00 Cron → /api/health (DB 일시정지 방지)
```

- **보안:** 다른 사용자의 데이터는 DB의 RLS(행 단위 보안)로 막고, pgTAP 테스트로 확인합니다. AI·채점·DB 관리자 키는 서버에서만 씁니다.
- **추천·점수·난이도 계산**은 DB와 화면에서 분리한 순수 함수(`lib/recommendation`, `lib/skills`, `lib/learning`)라 단위 테스트로 동작을 증명합니다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 화면 / API | Next.js 16 (App Router), React 19, TypeScript (strict) |
| 스타일 | Tailwind CSS v4, shadcn/ui |
| DB / 로그인 | Supabase (PostgreSQL, RLS, Google OAuth) |
| AI | Google Gemini API (서버 전용) |
| 채점 | OnlineCompiler.io (외부 sandbox) |
| 에디터 | Monaco Editor |
| 테스트 | Vitest, pgTAP |
| 배포 | Vercel (Cron 포함) |

## 폴더 구조

```
app/            화면(page)과 API(app/api)
components/     화면 컴포넌트 (editor, dashboard, progress, ui ...)
lib/            서버·공용 로직
  recommendation/  오늘의 문제 추천, 적응형 난이도
  skills/          분야별 실력 점수
  learning/        수행 점수, 연속 학습일, 진도·복습
  judge/           채점 (실행 서비스 연결, 판정)
  ai/              Gemini 호출, 프롬프트, 사용 한도
  db/              DB 접근 (Supabase)
content/        문제 원본 (problem.ts + 정답 코드)
scripts/        문제 검증·생성·배포 스크립트
supabase/       migration, seed, DB 테스트
docs/           설계 결정(ADR), AI 개발 로그
```

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local   # 값 입력
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

```bash
npm test           # 단위 테스트 (Vitest)
npm run lint
npm run build
```

> 배포 사이트는 Vercel·Supabase 클라우드에서 돌아가므로, 개발하지 않을 때는 로컬 서버와 Docker를 꺼도 됩니다.

## 환경변수

`.env.local.example`을 참고하세요. Gemini API 키와 Supabase service role 키는 서버에서만 사용하며 클라이언트에 노출하지 않습니다.

## Database (Supabase)

스키마는 `supabase/migrations/`의 SQL 파일로 버전 관리합니다.

### 로컬 DB에서 개발·검증

[Docker Desktop](https://www.docker.com/products/docker-desktop/)을 실행한 상태에서:

```bash
npm run db:start   # 로컬 Supabase 실행 + migration 적용 (첫 실행 시 이미지 다운로드)
npm run db:test    # pgTAP 테스트 (supabase/tests/database)
npm run db:lint    # 스키마 lint
npm run db:reset   # DB를 비우고 migration부터 다시 적용
npm run db:stop
```

로컬 Studio는 http://127.0.0.1:54323 에서 열립니다.

### 클라우드에 migration 적용

```bash
npx supabase login                      # 최초 1회 (브라우저 인증)
npx supabase link --project-ref <ref>   # 최초 1회
npx supabase db push --dry-run          # 적용될 migration 미리보기
npx supabase db push
```

> Windows PowerShell에서 `npx`가 실행 정책 때문에 막히면 `npx.cmd`로 실행하세요.

## 문제 콘텐츠

문제는 `content/problems/<slug>/`에 폴더 단위로 관리합니다.

```
content/problems/valid-brackets/
├── problem.ts   # 설명, 예제, 힌트 4단계, 해설, 태그, 숨김 테스트 (content/types.ts 타입)
├── Main.java    # Java 정답 코드
└── main.c       # C 정답 코드
```

```bash
npm run content:verify        # 형식 검사 + 정답 코드를 예제·숨김 테스트로 실행 (Java: 로컬 JDK, C: Docker)
npm run content:seed          # supabase/seed.sql 생성 (직접 수정하지 않음)
npm run db:reset              # 로컬 DB에 migration + seed 적용
npm run content:sync          # 클라우드에 반영할 내용 미리보기 (변경 없음)
npm run content:sync -- --yes # 클라우드에 문제·태그·힌트·해설·테스트케이스 반영
```

> `npx supabase db push --include-seed`는 이미 적용한 seed가 바뀌어도 다시 실행하지 않습니다(해시만 갱신). 문제를 추가·수정한 뒤에는 `content:sync`를 사용하세요.

### AI로 문제 늘리기 ([ADR-015](docs/decisions.md#adr-015-ai-문제-초안은-sandbox-교차-검증과-사람-승인을-거쳐-공개한다))

```bash
npm run content:generate -- --tag bfs --difficulty 3   # 초안 생성 + sandbox 교차 검증 (GEMINI_API_KEY, ONLINECOMPILER_API_KEY 필요)
# content/drafts/<slug>/preview.md 를 읽고 검토 (Git에 올라가지 않는 폴더)
npm run content:approve -- <slug>                      # 승인: 정식 문제로 이동 + 검증 + seed
```

- AI는 테스트 **입력**만 씁니다. 기대 출력은 Java·C·완전 탐색 풀이를 sandbox에서 실행해 **세 풀이가 모두 같은 답**일 때 그 값을 씁니다.
- AI가 만든 코드는 로컬에서 실행하지 않습니다. 사람이 승인한 뒤에만 기존 검증을 한 번 더 돌립니다.

- 태그는 `content/tags.ts`에 등록된 것만 쓸 수 있습니다. (화면 표시 이름도 이 파일을 사용)
- 문제 id는 slug에서 결정적으로 만들어지므로 seed를 여러 번 적용해도 중복되지 않습니다.
- 정답 검증 스크립트는 저장소의 정답 코드만 실행합니다. 사용자 코드는 실행하지 않습니다.

## 로그인 (Google OAuth) 설정

1. **Google Cloud Console** → API 및 서비스
   - OAuth 동의 화면: 외부(External), 앱 이름 `CodeMate`, 범위는 `email`, `profile`, `openid`
   - 사용자 인증 정보 → OAuth 클라이언트 ID 만들기 → 웹 애플리케이션
     - 승인된 JavaScript 원본: `http://localhost:3000`, 배포 주소
     - 승인된 리디렉션 URI: `https://<project-ref>.supabase.co/auth/v1/callback`
       (Google은 Supabase로 돌려보내므로, Vercel에 배포해도 이 값은 바뀌지 않습니다)
2. **Supabase Dashboard** → Authentication → Sign In / Providers → Google 활성화, Client ID와 Client Secret 입력
3. **Supabase Dashboard** → Authentication → URL Configuration
   - Site URL: 배포 주소 (예: `https://code-mate-gold.vercel.app`)
   - Redirect URLs: `http://localhost:3000/**`, `https://<배포 주소>/**`, Preview용 `https://code-mate-*.vercel.app/**`

로그인 흐름: `/login` → Google → Supabase → `/auth/callback`(code를 세션 쿠키로 교환) → 원래 가려던 페이지.
로그인이 필요한 페이지(`/dashboard`, `/progress`, `/settings`)는 `proxy.ts`가 `/login`으로 보내고, `/problems`는 Demo Mode로 공개합니다.

## 배포 (Vercel)

1. Vercel에 GitHub 계정으로 로그인 → **Add New → Project** → 저장소 Import
2. Framework Preset은 Next.js로 자동 인식됩니다. Build 설정은 기본값(`npm run build`)을 사용합니다.
3. **Environment Variables** (Production, Preview 체크)

   | 이름 | 값 | 노출 |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` | 브라우저 |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Publishable key | 브라우저 |
   | `SUPABASE_SECRET_KEY` | Supabase Secret key | 서버 전용 |
   | `GEMINI_API_KEY` | Google AI Studio API key | 서버 전용 |
   | `GEMINI_MODEL` | `gemini-3.5-flash-lite` (비우면 기본값) | 서버 전용 |
   | `GEMINI_FALLBACK_MODEL` | `gemini-3.1-flash-lite` (비우면 기본값) | 서버 전용 |
   | `ONLINECOMPILER_API_KEY` | OnlineCompiler.io API key (비우면 자기 보고 채점) | 서버 전용 |

4. Deploy 후 Supabase **URL Configuration**에 배포 주소를 추가합니다. (위 로그인 설정 3번)
5. 확인
   - `https://<배포 주소>/api/health` → `{"ok":true}` 이면 DB 연결 정상
   - `/login`에서 Google 로그인 → `/dashboard` 이동

`main`에 merge하면 Production, PR과 다른 브랜치는 Preview로 자동 배포됩니다.
Preview도 같은 Supabase 프로젝트(운영 DB)를 사용합니다.

## 무료 플랜 사용 시 주의사항

이 프로젝트는 결제 정보 없이 무료 플랜만 사용합니다. 한도와 정책은 바뀔 수 있으니 공식 문서에서 최신 기준을 확인하세요.

| 서비스 | 주의할 점 | 공식 문서 |
|---|---|---|
| Vercel Hobby | 개인·비상업용. 함수 실행 시간, 빌드 횟수 제한 | https://vercel.com/docs/plans/hobby |
| Supabase Free | 활성 프로젝트 2개, DB 용량 제한. 7일 동안 활동이 없으면 프로젝트가 일시정지됨 (대시보드에서 Restore) → `vercel.json`의 Cron이 매일 03:00(KST) `/api/health`로 DB를 조회해 막음 | https://supabase.com/pricing |
| OnlineCompiler.io Free | 월 100만 회, 입력 100KB, 실행 30초 ([ADR-014](docs/decisions.md#adr-014-자동-채점은-onlinecompilerio로-하고-한계는-숨기지-않고-표시한다)) | https://onlinecompiler.io/pricing |
| Gemini API Free tier | 모델별 분당·일일 요청 한도. 무료 등급 데이터는 서비스 개선에 사용될 수 있음 | https://ai.google.dev/gemini-api/docs/rate-limits |

## AI 코치 (Gemini)

1. [Google AI Studio](https://aistudio.google.com/apikey)에서 API 키를 발급받아 `GEMINI_API_KEY`에 넣습니다. (서버 전용, `NEXT_PUBLIC_` 금지)
2. `npm run ai:smoke`로 연결을 확인합니다. 짧은 힌트를 한 번 요청하고, 응답 모델·시간·토큰 수를 출력합니다. (키는 출력하지 않음)

- 호출은 서버(`lib/ai/gemini.ts`)에서만 합니다. 기본 모델이 한도 초과·과부하면 예비 모델로 한 번 더 시도합니다.
- 모델 선택 근거와 비교 결과는 [ADR-010](docs/decisions.md#adr-010-gemini-모델-선택과-예비-모델)에 있습니다.

## 자동 채점 (OnlineCompiler.io)

1. [OnlineCompiler.io](https://onlinecompiler.io)에서 무료 API 키를 발급받아 `ONLINECOMPILER_API_KEY`에 넣습니다. (서버 전용, 카드 등록 없음, 콜백 URL·IP 제한은 비워 둠)
2. `npm run judge:smoke`로 실제 응답 형태와 채점 결과를 확인합니다. (키는 출력하지 않음)

- 테스트케이스는 `problem_test_cases`에 있고 서버만 읽습니다. 숨김 테스트의 입력은 결과에 보여주지 않습니다.
- 서비스 한계(입력 100KB, Java 에러 메시지 없음 등)와 대응은 [ADR-014](docs/decisions.md#adr-014-자동-채점은-onlinecompilerio로-하고-한계는-숨기지-않고-표시한다)에 있습니다.

## 문서

- [docs/decisions.md](docs/decisions.md): 기술적 의사결정 기록 (ADR)
- [docs/ai-development-log.md](docs/ai-development-log.md): AI 활용 개발 로그

## AI-assisted development

이 프로젝트는 AI 코딩 도구(Claude Code)를 활용해 개발했습니다. 실제로 누가 무엇을 했는지 그대로 적습니다.

- **직접 한 일**
  - 서비스 기획과 요구사항 정의 (학습 철학: AI는 정답이 아닌 코치), 기능 우선순위와 진행 결정
  - 외부 서비스 설정: Supabase·Google OAuth·Vercel·Gemini·OnlineCompiler.io 계정과 키 발급, 환경변수 설정
  - 배포 환경 실사용 QA: 운영 서비스를 학습자로서 직접 사용하며 사용성 문제와 학습 흐름의 빈틈을 찾아, 개선 요구사항으로 정의하고 반영 여부를 결정
  - AI가 만든 문제 초안 검토·승인 (예: 첫 문제의 난이도를 2 → 3으로 수정)
- **AI가 한 일**
  - 설계안·대안 제시, 코드 작성, 테스트 작성과 실행, 로컬·브라우저 검증, 문서 초안
- 커밋마다 AI를 공동 저자로 표기하는 대신, 기능별로 무엇을 요청하고 AI가 무엇을 제안했으며 어떤 부분을 수정·거부했는지를 [AI 개발 로그](docs/ai-development-log.md)에 기록합니다.
- 주요 설계 결정과 그 이유는 [ADR](docs/decisions.md)에 남깁니다.
- 검증하지 못한 항목은 PR과 개발 로그에 "확인하지 못한 것"으로 따로 적습니다.
