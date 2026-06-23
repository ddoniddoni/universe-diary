# universe-diary

하루의 기록이 별이 되고, 한 달의 기록이 은하수가 되는 감성 다이어리 웹 애플리케이션입니다.

> 기록으로 만들어지는 나만의 우주

## 핵심 경험

1. 회원가입하고 로그인합니다.
2. 하루에 한 번 오늘의 다이어리를 작성합니다.
3. 감정 색을 가진 나만의 별이 우주에 생성됩니다.
4. 한 달의 모든 기록을 채우면 별들이 모여 은하수가 됩니다.
5. 연도별 우주와 월별 은하수를 탐험하거나, 목록으로 기록을 다시 읽습니다.

## 주요 기능

- 세션 기반 회원가입, 로그인, 로그아웃 및 보호 라우팅
- 하루 한 개 다이어리 작성 제한 (`Asia/Seoul` 기준)
- 감정별 별 색상과 다이어리 수정 시 별 색상 동기화
- 별 hover 시 작성 날짜·제목 표시, 클릭 시 상세 기록 이동
- 월별 성단 영역 배치 및 완성 월의 은하수 표현
- 연도별 우주 아카이브: `/universe/2026`, `/universe/2027` …
- 우주 화면의 1–12월 항법 및 완성 은하수로의 카메라 이동
- 연도·월·날짜별 다이어리 목록 보기
- Three.js 기반 심우주 장면, 절차적 별·성계·운석 배경

## 화면 구성

| 경로 | 설명 |
| --- | --- |
| `/` | 랜딩 페이지 |
| `/login`, `/signup` | 인증 |
| `/universe` | 연도별 우주 목록 |
| `/universe/[year]` | 특정 연도의 별·은하수 우주 |
| `/diaries` | 연도·월별 기록 목록 |
| `/diary/new` | 오늘의 다이어리 작성 |
| `/diary/[id]` | 다이어리 상세 |
| `/diary/[id]/edit` | 다이어리 수정 |

## 기술 스택

- Next.js 16 App Router / React 19 / TypeScript
- Tailwind CSS
- Prisma 7 + PostgreSQL (Supabase 호환)
- `jose` 기반 HTTP-only 세션 쿠키 인증
- Three.js 기반 우주 시각화
- React Hook Form + Zod 입력 검증

## 시작하기

### 1. 설치

```bash
npm install
Copy-Item .env.example .env
```

macOS/Linux에서는 두 번째 명령 대신 아래를 사용합니다.

```bash
cp .env.example .env
```

### 2. 환경 변수 설정

`.env`에 아래 값을 설정합니다.

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
SESSION_SECRET="충분히-긴-랜덤-문자열"
```

### 3. 데이터베이스 준비 및 실행

```bash
npx prisma migrate deploy
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## 테스트용 2026년 5월 은하수

5월 1일부터 31일까지의 테스트 기록·별·완성 은하수를 준비하는 스크립트가 있습니다. 대상 사용자 ID를 지정해야 하며, 같은 명령을 다시 실행해도 중복 다이어리는 만들지 않습니다.

```powershell
$env:MAY_GALAXY_USER_ID="사용자-ID"
npm run seed:may-galaxy
```

기존 별을 작성 월별 성단 영역으로 재배치하려면 아래를 실행합니다.

```powershell
$env:STAR_ARRANGE_USER_ID="사용자-ID"
npm run arrange:monthly-stars
```

## 검증

```bash
npm run lint
npm run build
npx prisma validate
```

## 개발 원칙

- 모든 Diary, Star, Galaxy 조회는 현재 로그인한 사용자 기준으로 제한합니다.
- 다이어리 날짜는 `Asia/Seoul` 기준으로 정규화합니다.
- `userId + diaryDate`의 DB unique 제약으로 하루 한 개 작성 규칙을 보장합니다.
- `develop`을 통합 브랜치로 사용하며, 기능 작업은 전용 브랜치에서 진행합니다.

기능 요구사항과 작업 규칙은 [PRD.md](./PRD.md), [AGENTS.md](./AGENTS.md)를 참고하세요.
