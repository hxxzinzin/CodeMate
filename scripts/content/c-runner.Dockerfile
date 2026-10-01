# 문제 정답 코드(C) 검증용 컴파일 환경. scripts/content/verify.ts가 자동으로 빌드한다.
FROM alpine:3.20
RUN apk add --no-cache build-base
WORKDIR /work
