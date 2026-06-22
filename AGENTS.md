universe# AGENTS.md

# universe-diary 개발 에이전트 작업 지침

이 문서는 CODEX 또는 AI 개발 에이전트가 `universe-diary` 프로젝트를 구현할 때 따라야 하는 작업 지침이다.

목표는 PRD에 정의된 MVP를 안정적으로 구현하는 것이다.

---

## 1. 프로젝트 기본 원칙

`universe-diary`는 감성 다이어리 웹 애플리케이션이다.

핵심 경험은 다음과 같다.

> 사용자가 하루에 하나의 다이어리를 작성하면, 나의 우주에 별 하나가 생성된다.
> 한 달을 모두 채우면 그 달의 별들이 은하수가 된다.

개발 시 모든 결정은 이 핵심 경험을 기준으로 판단한다.

---

## 2. 최우선 목표

MVP에서 가장 중요한 것은 화려한 기능이 아니라, 아래 흐름이 안정적으로 작동하는 것이다.

1. 사용자가 회원가입한다.
2. 사용자가 로그인한다.
3. 로그인 후 나의 우주에 입장한다.
4. 오늘의 다이어리를 작성한다.
5. 다이어리 작성 후 별이 생성된다.
6. 나의 우주에서 별을 확인한다.
7. 별을 클릭하면 다이어리를 확인한다.
8. 한 달을 모두 작성하면 은하수가 생성된다.

이 흐름이 깨지면 안 된다.

---

## 3. 기본 권장 기술 스택

프로젝트에 이미 기술 스택이 정해져 있다면 기존 설정을 따른다.

기술 스택이 아직 없다면 다음 구성을 기본으로 사용한다.

- Framework: Next.js App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Database ORM: Prisma
- Database: PostgreSQL
- Auth: 세션 기반 인증 또는 NextAuth/Auth.js
- Package Manager: 프로젝트에 존재하는 설정을 따른다.
- UI: 직접 구현 또는 shadcn/ui 사용 가능

단, 라이브러리는 필요할 때만 추가한다. MVP 구현에 불필요한 라이브러리를 과하게 설치하지 않는다.

---

## 4. 개발 원칙

## 4.1 단순하게 구현한다

처음부터 복잡한 3D 우주, 고급 애니메이션, 소셜 기능을 만들지 않는다.

MVP에서는 다음에 집중한다.

- 인증
- 다이어리 작성
- 하루 하나 제한
- 별 생성
- 나의 우주 시각화
- 은하수 생성 조건

## 4.2 작동하는 기능을 우선한다

디자인이 중요하지만, 기능이 먼저 안정적으로 작동해야 한다.

우선순위는 다음과 같다.

1. 데이터 구조
2. 인증
3. 다이어리 작성
4. 별 생성
5. 나의 우주 페이지
6. 디자인 고도화
7. 애니메이션

## 4.3 사용자 데이터 보호

사용자는 자신의 데이터만 볼 수 있어야 한다.

다음 데이터는 반드시 사용자 기준으로 필터링한다.

- Diary
- Star
- Galaxy

다른 사용자의 데이터에 접근할 수 있는 API 또는 페이지가 생기면 안 된다.

## 4.4 날짜 기준

하루 하나 작성 제한은 날짜 기준이 중요하다.

기본 날짜 기준은 `Asia/Seoul`이다.

주의할 점:

- 서버에서 오늘 날짜를 계산할 때 시간대 문제를 고려한다.
- `userId + diaryDate`는 unique 제약으로 막는다.
- 프론트엔드에서 막더라도 백엔드와 DB에서 반드시 다시 검증한다.

---

## 5. 추천 폴더 구조

프로젝트 구조가 이미 존재한다면 기존 구조를 따른다.

새로 구성해야 한다면 다음 구조를 권장한다.

```txt
/
├─ app/
│  ├─ page.tsx
│  ├─ login/
│  │  └─ page.tsx
│  ├─ signup/
│  │  └─ page.tsx
│  ├─ universe/
│  │  └─ page.tsx
│  ├─ diary/
│  │  ├─ new/
│  │  │  └─ page.tsx
│  │  └─ [id]/
│  │     ├─ page.tsx
│  │     └─ edit/
│  │        └─ page.tsx
│  └─ api/
│     ├─ auth/
│     ├─ diaries/
│     └─ universe/
├─ components/
│  ├─ auth/
│  ├─ diary/
│  ├─ universe/
│  └─ ui/
├─ lib/
│  ├─ auth.ts
│  ├─ db.ts
│  ├─ date.ts
│  ├─ star.ts
│  └─ galaxy.ts
├─ prisma/
│  └─ schema.prisma
├─ public/
├─ styles/
├─ PRD.md
└─ AGENTS.md
```

---

## 6. 데이터베이스 모델 지침

Prisma를 사용하는 경우 다음 모델을 기준으로 구현한다.

필요에 따라 필드명은 프로젝트 컨벤션에 맞게 조정할 수 있다.

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  nickname     String
  diaries      Diary[]
  stars        Star[]
  galaxies     Galaxy[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Diary {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  content   String
  emotion   Emotion
  diaryDate DateTime
  star      Star?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, diaryDate])
  @@index([userId])
}

model Star {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  diaryId   String   @unique
  diary     Diary    @relation(fields: [diaryId], references: [id], onDelete: Cascade)
  x         Float
  y         Float
  color     String
  emotion   Emotion
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

model Galaxy {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  year        Int
  month       Int
  isCompleted Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, year, month])
  @@index([userId])
}

enum Emotion {
  HAPPY
  CALM
  SAD
  ANGRY
  EXCITED
  TIRED
}
```

주의:

- `passwordHash`에는 해시된 비밀번호만 저장한다.
- `diaryDate`는 하루 단위 비교가 가능하도록 정규화해서 저장한다.
- 같은 사용자의 같은 날짜 다이어리는 절대 중복 생성되면 안 된다.

---

## 7. 인증 구현 지침

## 7.1 필수 기능

- 회원가입
- 로그인
- 로그아웃
- 인증 상태 유지
- 보호된 페이지 접근 제어

## 7.2 접근 제어 규칙

로그인하지 않은 사용자는 다음 페이지에 접근할 수 없다.

- `/universe`
- `/diary/new`
- `/diary/[id]`
- `/diary/[id]/edit`

로그인하지 않은 사용자가 접근하면 `/login`으로 이동시킨다.

로그인한 사용자가 `/login` 또는 `/signup`에 접근하면 `/universe`로 이동시킨다.

## 7.3 보안 규칙

- 비밀번호는 절대 평문 저장하지 않는다.
- 서버에서 사용자 권한을 반드시 확인한다.
- 클라이언트에서 전달받은 `userId`를 그대로 신뢰하지 않는다.
- 현재 로그인된 사용자 정보를 기준으로 데이터 생성, 조회, 수정한다.

---

## 8. 다이어리 구현 지침

## 8.1 작성 규칙

사용자는 하루에 하나의 다이어리만 작성할 수 있다.

다이어리 작성 시 서버는 다음을 수행해야 한다.

1. 로그인 여부 확인
2. 오늘 날짜 계산
3. 해당 사용자의 오늘 다이어리 존재 여부 확인
4. 이미 존재하면 생성 거부
5. 존재하지 않으면 다이어리 생성
6. 다이어리에 연결된 별 생성
7. 해당 월 은하수 완성 여부 검사
8. 결과 반환

## 8.2 입력값 검증

다음 입력값을 검증한다.

- 제목은 비어 있으면 안 된다.
- 제목은 너무 길면 안 된다.
- 내용은 비어 있으면 안 된다.
- 감정 상태는 허용된 값 중 하나여야 한다.

권장 제한:

- 제목: 1자 이상 50자 이하
- 내용: 1자 이상 5000자 이하

## 8.3 수정 규칙

사용자는 자신의 다이어리만 수정할 수 있다.

수정 가능한 값:

- 제목
- 내용
- 감정 상태

수정 불가능한 값:

- 작성 날짜
- 작성자
- 다이어리 ID

감정 상태가 변경되면 연결된 별의 색상도 함께 업데이트한다.

---

## 9. 별 구현 지침

별은 다이어리 작성 후 자동 생성된다.

## 9.1 별 생성 로직

별 생성 시 다음 값을 저장한다.

- `userId`
- `diaryId`
- `x`
- `y`
- `emotion`
- `color`

## 9.2 감정별 색상

다음 매핑을 기본으로 사용한다.

```ts
const EMOTION_STAR_COLORS = {
  HAPPY: "#FFD166",
  CALM: "#7BDFF2",
  SAD: "#B8A1FF",
  ANGRY: "#FF6B6B",
  EXCITED: "#FFAFCC",
  TIRED: "#D9D9D9",
} as const;
```

## 9.3 별 위치 생성

MVP에서는 랜덤 좌표를 사용한다.

권장 범위:

- x: -3000 ~ 3000
- y: -3000 ~ 3000

기존 별과 너무 가까운 위치는 피하는 것이 좋다.

간단한 구현에서는 다음 방식으로 처리한다.

1. 랜덤 좌표를 생성한다.
2. 기존 별들과의 거리를 확인한다.
3. 너무 가까우면 다시 생성한다.
4. 최대 시도 횟수를 넘으면 마지막 좌표를 사용한다.

---

## 10. 은하수 구현 지침

은하수는 한 달을 모두 작성했을 때 생성된다.

## 10.1 생성 조건

다이어리 작성 완료 후 항상 해당 월의 완성 여부를 확인한다.

검사 로직:

1. 오늘 날짜의 연도와 월을 구한다.
2. 해당 월의 전체 날짜 수를 계산한다.
3. 해당 사용자가 해당 월에 작성한 다이어리 수를 계산한다.
4. 작성한 다이어리 수가 전체 날짜 수와 같으면 은하수를 생성한다.
5. 이미 생성된 은하수가 있으면 중복 생성하지 않는다.

## 10.2 윤년 처리

2월 날짜 수는 연도에 따라 달라질 수 있다.

반드시 해당 연도와 월을 기준으로 전체 날짜 수를 계산한다.

## 10.3 표시 방식

MVP에서는 은하수를 다음 방식으로 표현한다.

- 같은 월에 작성된 별들을 선으로 연결한다.
- 선은 부드러운 빛 느낌으로 표현한다.
- 은하수 이름을 표시한다.
- 예: `2026년 6월의 은하수`

---

## 11. 나의 우주 UI 구현 지침

`/universe` 페이지는 이 프로젝트에서 가장 중요한 화면이다.

단순한 리스트처럼 보이면 안 된다. 사용자가 로그인했을 때 자신의 우주에 들어온 느낌을 받아야 한다.

## 11.1 필수 UI

- 전체 화면에 가까운 어두운 우주 배경
- 별들이 좌표 기반으로 배치된 화면
- 오늘의 작성 상태 카드
- 오늘의 별 만들기 버튼
- 별 hover 효과
- 별 클릭 기능
- 은하수 표시
- 빈 우주 상태 메시지

## 11.2 빈 우주 상태

아직 별이 없을 때도 화면은 아름다워야 한다.

문구 예시:

> 아직 당신의 우주에는 별이 없어요.
> 오늘의 첫 번째 별을 만들어보세요.

## 11.3 오늘 작성 전 상태

문구 예시:

> 오늘의 별이 아직 떠오르지 않았어요.

버튼:

> 오늘의 별 만들기

## 11.4 오늘 작성 완료 상태

문구 예시:

> 오늘의 별이 이미 당신의 우주에 떠올랐어요.

버튼:

> 오늘의 다이어리 보기

---

## 12. 스타일링 지침

## 12.1 디자인 톤

전체 디자인은 감성적이고 몽환적인 우주 느낌이어야 한다.

키워드:

- 조용함
- 반짝임
- 깊은 밤
- 별빛
- 나만의 공간
- 은하수
- 몰입감

## 12.2 색상

권장 색상:

- 배경: `#050510`
- 진한 남색: `#0B1026`
- 진한 보라: `#1A103D`
- 텍스트 기본: `#FFFFFF`
- 텍스트 보조: `#B8B8C8`
- 별빛 노랑: `#FFD166`
- 은하수 보라: `#B8A1FF`
- 포인트 블루: `#7BDFF2`

## 12.3 UI 스타일

- 모서리는 부드럽게 처리한다.
- 버튼은 은은하게 빛나는 느낌을 준다.
- 카드 배경은 완전한 검정보다는 반투명한 어두운 색을 사용한다.
- hover 효과는 과하지 않게 부드럽게 처리한다.
- 애니메이션은 느리고 자연스럽게 사용한다.

---

## 13. API 구현 지침

API는 반드시 현재 로그인된 사용자 기준으로 동작해야 한다.

## 13.1 `/api/diaries`

### POST

다이어리를 생성한다.

서버 처리 순서:

1. 인증 확인
2. 입력값 검증
3. 오늘 날짜 계산
4. 오늘 작성된 다이어리 존재 여부 확인
5. 다이어리 생성
6. 별 생성
7. 은하수 생성 조건 검사
8. 응답 반환

## 13.2 `/api/diaries/today`

### GET

현재 로그인한 사용자의 오늘 다이어리 작성 여부를 반환한다.

## 13.3 `/api/diaries/:id`

### GET

다이어리 상세 정보를 반환한다.

규칙:

- 본인 다이어리만 조회 가능

### PATCH

다이어리를 수정한다.

규칙:

- 본인 다이어리만 수정 가능
- 감정 변경 시 별 색상도 함께 수정

## 13.4 `/api/universe`

### GET

현재 로그인한 사용자의 우주 데이터를 반환한다.

응답 데이터:

- 사용자 정보
- 별 목록
- 은하수 목록
- 오늘 다이어리 작성 여부
- 오늘 다이어리 ID

---

## 14. 작업 순서

개발 에이전트는 다음 순서로 작업하는 것을 권장한다.

## Step 1. 프로젝트 구조 확인

- 사용 중인 프레임워크 확인
- 패키지 매니저 확인
- 기존 폴더 구조 확인
- 환경 변수 구조 확인

## Step 2. 데이터 모델 구현

- User
- Diary
- Star
- Galaxy
- Emotion enum
- unique 제약 추가

## Step 3. 인증 구현

- 회원가입
- 로그인
- 로그아웃
- 인증 상태 유지
- 보호 라우팅

## Step 4. 다이어리 기능 구현

- 작성 페이지
- 작성 API
- 하루 하나 제한
- 상세 페이지
- 수정 페이지

## Step 5. 별 기능 구현

- 다이어리 작성 후 별 생성
- 감정별 색상 적용
- 좌표 생성
- 우주 화면에 별 표시
- 별 클릭 시 상세 이동

## Step 6. 은하수 기능 구현

- 월 완성 검사
- 은하수 데이터 생성
- 우주 화면에 은하수 표시

## Step 7. UI 고도화

- 메인 페이지 디자인
- 나의 우주 디자인
- 별 hover 효과
- 반짝임 애니메이션
- 빈 상태 UI
- 반응형 처리

---

## 15. 테스트 체크리스트

구현 후 다음 항목을 반드시 확인한다.

## 인증

- 회원가입이 정상 작동한다.
- 중복 이메일 회원가입이 막힌다.
- 로그인 성공 시 `/universe`로 이동한다.
- 로그인 실패 시 에러 메시지가 표시된다.
- 로그아웃이 정상 작동한다.
- 비로그인 상태에서 `/universe` 접근 시 `/login`으로 이동한다.

## 다이어리

- 오늘 다이어리를 작성할 수 있다.
- 제목이 비어 있으면 작성할 수 없다.
- 내용이 비어 있으면 작성할 수 없다.
- 하루에 두 개 이상 작성할 수 없다.
- 작성 후 별이 생성된다.
- 작성한 다이어리를 상세 페이지에서 볼 수 있다.
- 다이어리를 수정할 수 있다.
- 감정을 수정하면 별 색상도 변경된다.

## 우주

- 로그인 후 나의 우주가 표시된다.
- 작성된 별들이 표시된다.
- 별을 클릭하면 해당 다이어리로 이동한다.
- 별 색상이 감정에 따라 다르게 보인다.
- 오늘 작성 상태가 올바르게 표시된다.
- 별이 없을 때 빈 상태 UI가 표시된다.

## 은하수

- 한 달을 모두 작성하면 은하수가 생성된다.
- 같은 월 은하수가 중복 생성되지 않는다.
- 28일, 29일, 30일, 31일 월 계산이 올바르게 작동한다.

---

## 16. 금지사항

다음 작업은 MVP 단계에서 하지 않는다.

- 3D 우주 구현
- 친구 기능 구현
- 공개 다이어리 구현
- 댓글 기능 구현
- 좋아요 기능 구현
- 팔로우 기능 구현
- 결제 기능 구현
- 아이템 상점 구현
- AI 감정 분석 구현
- 모바일 앱 전용 기능 구현
- 과도한 애니메이션 구현
- 복잡한 상태관리 라이브러리 도입

MVP에 필요하지 않은 기능을 임의로 추가하지 않는다.

---

## 17. 코드 스타일

- TypeScript를 사용하는 경우 `any` 사용을 최소화한다.
- 함수명과 변수명은 의미 있게 작성한다.
- UI 텍스트는 기본적으로 한국어를 사용한다.
- 공통 로직은 `lib` 폴더로 분리한다.
- 감정 색상 매핑, 날짜 계산, 별 좌표 생성은 별도 유틸 함수로 분리한다.
- 서버 로직과 클라이언트 UI 로직을 명확히 분리한다.
- 인증과 권한 검사는 서버에서 반드시 수행한다.

---

## 18. 구현 완료 기준

작업이 완료되었다면 다음 조건을 만족해야 한다.

1. 앱이 정상적으로 실행된다.
2. 회원가입, 로그인, 로그아웃이 가능하다.
3. 로그인한 사용자는 `/universe`에 접근할 수 있다.
4. 비로그인 사용자는 보호 페이지에 접근할 수 없다.
5. 다이어리를 작성할 수 있다.
6. 하루 하나 작성 제한이 적용된다.
7. 다이어리 작성 후 별이 생성된다.
8. 우주 화면에서 별이 보인다.
9. 별 클릭 시 다이어리 상세로 이동한다.
10. 다이어리 수정이 가능하다.
11. 감정별 별 색상이 적용된다.
12. 한 달 완성 시 은하수가 생성된다.
13. 다른 사용자의 데이터에 접근할 수 없다.
14. 기본 디자인이 우주 다이어리 컨셉을 충분히 전달한다.

---

## 19. 개발 에이전트에게 주는 최종 지침

기능을 만들 때마다 PRD의 핵심 컨셉을 잊지 않는다.

이 프로젝트의 핵심은 “일기 작성” 자체가 아니라, “기록이 나의 우주를 만든다”는 경험이다.

따라서 단순한 CRUD 앱처럼 보이지 않게 주의한다.

특히 `/universe` 페이지는 반드시 감성적으로 구현한다.

MVP에서는 완벽한 우주가 아니라도 괜찮다.
하지만 사용자가 로그인했을 때 다음 느낌은 반드시 들어야 한다.

> 여기가 내 기록으로 만들어진 나만의 우주구나.

## 20. Git workflow

Use `develop` as the main working and integration branch for this project.
Do not use `master` for project work.

Do not work directly on `develop` for Phase work unless explicitly requested.

Each Phase must use a dedicated branch before implementation starts.
Small non-Phase tasks may also use a focused branch.

Branch naming examples:

- `phase/02-supabase-setup`
- `phase/03-auth`
- `phase/04-rbac`
- `phase/06-ticket-list`
- `phase/06-ticket-filters`

If a Phase becomes too large, split it into smaller focused branches.

For each Phase or focused task:

1. Start from the latest `develop`.
2. Create a dedicated branch.
3. Implement only the scope of that Phase or task.
4. Run verification before committing when possible:
   - `npm.cmd run lint`
   - `npm.cmd run build`
5. Keep one commit per Phase or focused task whenever possible.
6. Push the task branch to the remote repository.
7. Merge the task branch into `develop`.
8. Push `develop`.
9. Leave the working tree clean before starting the next Phase.

Before starting a new Phase:

```bash
git status --short
git checkout develop
git pull origin develop
```

Never force push, hard reset, or delete branches unless explicitly requested.

## Commit message rules

Commit messages must follow this format:

```txt
<type>(<scope>): <title>

<body>
```

The body should explain why the change was made and include important
implementation details.

Allowed commit types:

- `feat`: Add a new feature
- `fix`: Fix a bug
- `docs`: Documentation-only changes
- `style`: Formatting or style-only changes with no code behavior change
- `refactor`: Code refactoring without a feature or bug fix
- `test`: Add or update tests
- `chore`: Build, package manager, tooling, or maintenance changes

Example:

```txt
feat(auth): 로그인 페이지 구현

Supabase signInWithPassword를 연결하고
폼 검증과 에러 상태를 추가했다.
```
