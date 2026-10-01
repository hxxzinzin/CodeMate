@AGENTS.md

# CodeMate 개발 원칙

## 서비스 철학
- AI는 정답을 대신 주는 도구가 아니라 사용자가 스스로 풀도록 돕는 코치다.
- 사용자가 명시적으로 요청하지 않으면 완성된 정답 코드를 먼저 제공하지 않는다.

## 개발 방식
- Phase 단위로 작게 구현한다: 구현 → 실행 → 오류 확인 → 수정 → `npm run build` → 다음 단계.
- 작동하지 않는 기능을 완성된 것처럼 표시하지 않는다.
- 불필요한 dependency, 사용하지 않는 코드, 과도한 abstraction을 만들지 않는다.
- UI와 비즈니스 로직을 분리한다. DB 접근(`lib/db`)과 AI 호출(`lib/ai`)을 컴포넌트에 직접 작성하지 않는다.
- TypeScript strict, `any` 남용 금지, 재사용 타입은 `types/`에 둔다.

## 보안
- Gemini API 키와 Supabase service role 키는 서버 전용이다. `NEXT_PUBLIC_` 접두사를 붙이지 않는다.
- 사용자 코드를 서버에서 실행하지 않는다. (eval, shell 실행 금지 — 채점은 외부 Judge로)
- `.env*` 파일은 커밋하지 않는다. (`.env.local.example` 제외)

## Git / 문서 규칙
- 작업 흐름: Issue → `feat/<이슈번호>-<설명>` 브랜치 → PR(`Closes #N`) → merge.
- 커밋은 Conventional Commits 형식으로 실제 변경 내용과 목적을 적는다. (예: `feat: implement daily problem recommendation`)
- 커밋에 `Co-authored-by` AI 표기를 자동으로 추가하지 않는다. (사용자가 명시적으로 요청한 경우만)
- AI 활용 사실은 README의 AI-assisted development 섹션, `docs/ai-development-log.md`, `docs/decisions.md`(ADR)로 공개한다.
- 주요 기능을 마치면 `docs/ai-development-log.md`에 요청 / AI 제안 / 수정·거부 / 최종 결정 / 검증을 기록한다.
- 중요한 기술적 결정은 `docs/decisions.md`에 ADR로 추가한다.
- 문서와 커밋에는 실제로 수행한 작업만 기록한다.
