# universe-diary ✦

하루의 기록이 별이 되고, 한 달의 기록이 은하수가 되는 감성 다이어리 웹 애플리케이션입니다.

> 기록으로 만드는 나만의 우주

## 핵심 경험

- 하루에 하나의 다이어리를 쓰면 감정에 맞는 별이 생성됩니다.
- 내 우주에서 별을 눌러 그날의 기록을 다시 읽을 수 있습니다.
- 한 달의 모든 날을 채우면 별들이 연결되어 은하수가 됩니다.

## 기술 스택

- Next.js App Router · TypeScript · Tailwind CSS
- Prisma · PostgreSQL
- 세션 기반 인증 (구현 예정)

## 시작하기

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다. 데이터베이스 연결 전 `.env`의 `DATABASE_URL`과 `SESSION_SECRET`을 설정하세요.

## 품질 검사

```bash
npm run lint
npm run build
npx prisma validate
```

## 브랜치 정책

`develop`을 통합 브랜치로 사용합니다. 각 기능 또는 Phase 작업은 `develop`에서 전용 브랜치를 분기해 진행하며, `master`는 사용하지 않습니다.

자세한 기능 범위와 구현 규칙은 [PRD.md](./PRD.md), [AGENTS.md](./AGENTS.md)를 참고하세요.
