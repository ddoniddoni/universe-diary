# Universe Diary

하루의 기록을 별로 남기고, 한 달의 기록을 은하수로 완성하는 감성 다이어리 웹 애플리케이션입니다.

> 기록은 사라지지 않고, 나만의 우주를 만듭니다.

## 핵심 경험

1. 회원가입 또는 로그인 후 나의 우주에 들어갑니다.
2. 하루에 한 번, 제목·내용·감정을 담아 일기를 작성합니다.
3. 기록과 연결된 별이 우주에 생성됩니다.
4. 별을 선택해 해당 날짜의 일기를 다시 읽거나 수정합니다.
5. 한 달의 모든 날짜를 기록하면 그 달의 별들이 은하수로 연결됩니다.

## 현재 구현된 기능

- 회원가입, 로그인, 로그아웃 및 HTTP-only 세션 쿠키 인증
- 로그인 전용 페이지 및 소유자 기준 데이터 접근 제어
- `Asia/Seoul` 기준 하루 한 개 일기 작성 제한
- 제목·내용·감정 입력 검증 및 일기 수정
- 감정별 별빛 색상과 일기 수정 시 색상 동기화
- 작성일별 별 생성 및 별 선택 후 일기 상세 이동
- 월간 기록 완성 시 은하수 생성
- 연도별 우주 아카이브와 월별 은하수 이동
- 연·월별 기록 목록
- Three.js 기반의 탐색 가능한 우주 화면

## 화면 구성

| 경로 | 설명 |
| --- | --- |
| `/` | 서비스 소개 및 로그인 상태에 따른 빠른 이동 |
| `/login` | 로그인 |
| `/signup` | 회원가입 |
| `/universe` | 연도별 우주 아카이브 |
| `/universe/[year]` | 별과 은하수를 탐색하는 해당 연도의 우주 |
| `/diaries` | 연도·월별 기록 목록 |
| `/diary/new` | 오늘의 별(일기) 작성 |
| `/diary/[id]` | 일기 상세 |
| `/diary/[id]/edit` | 일기 수정 |

## 기술 스택

- Next.js 16 App Router / React 19 / TypeScript
- Tailwind CSS 4
- Prisma 7 + PostgreSQL
- `jose` 기반 HTTP-only 세션 인증
- Three.js 기반 우주 시각화
- React Hook Form + Zod 입력 검증

## 시작하기

### 1. 설치

```bash
npm install
Copy-Item .env.example .env
```

macOS 또는 Linux에서는 다음 명령을 사용합니다.

```bash
cp .env.example .env
```

### 2. 환경 변수 설정

`.env`에 PostgreSQL 연결 정보와 충분히 긴 세션 비밀값을 입력합니다.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/universe_diary?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/universe_diary?schema=public"
SESSION_SECRET="충분히-길고-예측하기-어려운-문자열"
```

### 3. 데이터베이스 적용 및 실행

```bash
npx prisma migrate deploy
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## 개발용 스크립트

```bash
# 정적 검사
npm run lint

# 프로덕션 빌드 검사
npm run build

# Prisma 스키마 검사
npx prisma validate
```

### 2026년 5월 은하수 테스트 데이터

특정 사용자에게 2026년 5월 기록을 채워 은하수 완성 경험을 확인할 수 있습니다.

```powershell
$env:MAY_GALAXY_USER_ID="사용자 ID"
npm run seed:may-galaxy
```

기존 별을 월별 성단 영역으로 다시 배치하려면 다음 명령을 사용합니다.

```powershell
$env:STAR_ARRANGE_USER_ID="사용자 ID"
npm run arrange:monthly-stars
```

## 데이터 및 보안 원칙

- 모든 일기, 별, 은하수 조회는 현재 로그인한 사용자로 제한합니다.
- 서버에서 사용자 권한을 확인하며, 클라이언트의 `userId`는 신뢰하지 않습니다.
- 비밀번호는 `bcryptjs` 해시로만 저장합니다.
- `userId + diaryDate` 데이터베이스 unique 제약으로 하루 한 개 작성 규칙을 보장합니다.
- 날짜는 `Asia/Seoul` 기준으로 정규화합니다.

## 프로젝트 문서

- [PRD.md](./PRD.md): 제품 요구사항
- [AGENTS.md](./AGENTS.md): 개발 원칙 및 Git 작업 규칙
- [DEVELOPMENT_STANDARDS.md](./DEVELOPMENT_STANDARDS.md): 완료 기준과 품질 기준
