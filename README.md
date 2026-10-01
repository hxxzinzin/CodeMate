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

> Supabase 설정, Gemini API 설정, Vercel 배포, 무료 플랜 주의사항, Database Migration 문서는 해당 Phase를 진행하면서 추가합니다.

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
