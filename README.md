# CodeMate

> 스스로 생각하는 힘을 기르는 개인 맞춤형 코딩테스트 학습 플랫폼

CodeMate는 사용자의 풀이 기록(정답률, 풀이 시간, 힌트 사용량, 알고리즘·자료구조별 실력)을 분석해
매일 지금 풀기 가장 적절한 Java/C 코딩테스트 문제를 추천하는 서비스입니다.

AI는 정답을 대신 알려주지 않습니다. 개념 → 사고 방향 → 접근 방법 → 의사코드 순서로 단계적인 힌트를 주는 **코치** 역할을 합니다.

> 🚧 현재 개발 중입니다. 진행 상황은 [Milestones](https://github.com/hxxzinzin/CodeMate/milestones)에서 확인할 수 있습니다.

## 주요 기능 (MVP 목표)

- 오늘의 문제: 약점·복습 시기·난이도를 고려한 규칙 기반 추천
- Adaptive Difficulty: 풀이 결과에 따라 추천 난이도 조정
- Skill System: 알고리즘 / 자료구조 / Java / C 분야별 점수
- Monaco Editor 기반 Java/C 코드 작성 (자동 저장)
- Gemini 기반 단계별 힌트와 코드 리뷰
- 학습 대시보드

## 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend / API | Next.js (App Router), React, TypeScript (strict) |
| Styling | Tailwind CSS |
| Database / Auth | Supabase (PostgreSQL, RLS, Google OAuth) |
| AI | Google Gemini API (서버 전용) |
| Deploy | Vercel |

모든 인프라는 무료 플랜 기준으로 설계했습니다. 이유는 [ADR-001](docs/decisions.md#adr-001-무료-플랜-기반-인프라)을 참고하세요.

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local   # 값 입력
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

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
npx supabase db push --include-seed   # 클라우드에 seed 적용
```

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
   | `GEMINI_MODEL` | 예: `gemini-3.8-flash` | 서버 전용 |

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
| Supabase Free | 활성 프로젝트 2개, DB 용량 제한. 일정 기간 활동이 없으면 프로젝트가 일시정지됨 (대시보드에서 Restore) | https://supabase.com/pricing |
| Gemini API Free tier | 모델별 분당·일일 요청 한도. 무료 등급 데이터는 서비스 개선에 사용될 수 있음 | https://ai.google.dev/gemini-api/docs/rate-limits |

> Gemini API 연동 방법은 Phase 6에서 추가합니다.

## 문서

- [docs/decisions.md](docs/decisions.md): 기술적 의사결정 기록 (ADR)
- [docs/ai-development-log.md](docs/ai-development-log.md): AI 활용 개발 로그

## AI-assisted development

이 프로젝트는 AI 코딩 도구(Claude Code)를 활용해 개발하고 있습니다.

- **직접 수행하는 일:** 요구사항 정의, 아키텍처와 기술적 의사결정, 코드 검토, 테스트, 디버깅
- **AI를 활용하는 일:** 설계안과 대안 제시, 코드 초안 작성, 리뷰 보조
- AI가 생성한 코드는 그대로 사용하지 않고 검토·실행·수정을 거쳐 반영합니다.
- 커밋마다 AI를 공동 저자로 표기하는 대신, 기능별로 무엇을 요청하고 AI가 무엇을 제안했으며 어떤 부분을 수정·거부했는지를 [AI 개발 로그](docs/ai-development-log.md)에 기록합니다.
- 주요 설계 결정과 그 이유는 [ADR](docs/decisions.md)에 남깁니다.
