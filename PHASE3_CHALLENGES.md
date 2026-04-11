# 라오어·태국어 학습 앱 - Phase 3 일일 챌린지 구현 문서

## 📋 개요

Phase 3에서는 **게임화 시스템을 강화하는 일일 챌린지 기능**을 완전히 구현했습니다. 사용자들이 매일 새로운 챌린지를 완료하고 XP를 획득하며, 연속 학습으로 보너스를 받을 수 있는 시스템을 제공합니다.

## 🎯 구현된 기능

### 1. 일일 챌린지 데이터 모델 (✅ 완료)

**daily_challenges 테이블** - 챌린지 정의
```sql
- id: 고유 ID
- date: 날짜 (YYYY-MM-DD, unique)
- title: 챌린지 제목
- description: 상세 설명
- language: 언어 (lao/thai)
- targetCount: 목표 항목 수
- xpReward: XP 보상
- createdAt: 생성 시간
```

**challenge_progress 테이블** - 사용자 진행 상황
```sql
- id: 고유 ID
- userId: 사용자 ID
- challengeId: 챌린지 ID
- completed: 완료한 항목 수
- isCompleted: 완료 여부 (0/1)
- xpEarned: 획득한 XP
- createdAt: 생성 시간
- updatedAt: 업데이트 시간
```

### 2. 시드 데이터 (✅ 완료)

**경로:** `/server/seed-challenges.mjs`

7개의 일일 챌린지를 생성합니다:

| 날짜 | 제목 | 언어 | 목표 | XP |
|------|------|------|------|-----|
| 오늘 | 라오어 인사말 마스터 | 라오어 | 5개 | 100 |
| +1일 | 태국어 숫자 배우기 | 태국어 | 10개 | 150 |
| +2일 | 라오어 음식 어휘 | 라오어 | 8개 | 120 |
| +3일 | 태국어 인사말 완벽하게 | 태국어 | 5개 | 200 |
| +4일 | 라오어 종합 연습 | 라오어 | 10개 | 250 |
| +5일 | 태국어 종합 연습 | 태국어 | 10개 | 250 |
| +6일 | 주간 챌린지 완료! | 라오어 | 1개 | 500 |

### 3. 챌린지 UI 페이지 (✅ 완료)

**경로:** `/client/src/pages/DailyChallenges.tsx`

#### 주요 섹션

**1. 사용자 통계 바**
- 레벨 (Trophy 아이콘)
- 총 XP (Zap 아이콘)
- 연속 일수 (Flame 아이콘)
- 평균 정확도 (CheckCircle 아이콘)

**2. 챌린지 목록**
- 카드 기반 UI로 각 챌린지 표시
- 챌린지 제목, 설명, 언어, XP 보상 표시
- 진행률 바 (0-100%)
- 완료 상태 표시 (완료/진행 중)
- 클릭하면 상세 패널에서 선택됨

**3. 챌린지 상세 패널 (Sticky)**
- 선택된 챌린지의 상세 정보
- 진행 상황 표시
- "챌린지 시작" 버튼 (발음 연습으로 이동)
- "완료 표시" 버튼 (진행 상황 업데이트)
- 연속 일수 보너스 정보

**4. 주간 보상 섹션**
- 연속 학습 보너스: 최대 +100% XP
- 주간 챌린지: +500 XP
- 정확도 보너스: 최대 +50 XP

**5. 팁 섹션**
- 매일 같은 시간에 완료하기
- 높은 정확도로 보너스 받기
- 주간 챌린지 완료로 배지 획득
- 친구와 경쟁하기

#### UI 특징
- 반응형 디자인 (모바일, 태블릿, 데스크톱)
- 그라데이션 배경 (보라색 → 인디고)
- 카드 기반 레이아웃
- 실시간 진행 상황 업데이트
- 로딩 상태 표시

### 4. 챌린지 상호작용 기능 (✅ 완료)

**챌린지 시작**
```typescript
handleStartChallenge(challenge)
- 발음 연습 페이지로 이동
- 토스트 메시지로 확인
```

**챌린지 진행 상황 업데이트**
```typescript
handleCompleteChallenge(challenge)
- tRPC mutation으로 완료 표시
- 사용자 통계 새로고침
- 성공 토스트 메시지 표시
```

**챌린지 선택**
```typescript
setSelectedChallenge(challenge)
- 우측 패널에서 상세 정보 표시
- 선택된 챌린지 강조 표시 (ring-2)
```

### 5. 스트릭 시스템 (✅ 완료)

**연속 일수 추적**
- 사용자 통계에서 `streak` 필드로 추적
- 매일 챌린지 완료 시 +1
- 하루 놓치면 리셋

**보너스 시스템**
- 7일 연속: 모든 XP 2배
- 14일 연속: 특별 배지 획득
- 30일 연속: VIP 멤버십 1개월 무료

**시각적 표시**
- Flame 아이콘으로 연속 일수 표시
- 빨간색 배경으로 강조
- 보너스 정보 표시

### 6. tRPC 라우터 통합 (✅ 완료)

**challenges 라우터** - `/server/routers.ts`

```typescript
challenges: router({
  // 오늘의 챌린지 조회
  getTodayChallenge: publicProcedure
    .query(async () => {
      return await getTodayChallenge();
    }),

  // 사용자 챌린지 진행 상황 조회
  getUserProgress: protectedProcedure
    .input(z.object({ challengeId: z.number() }))
    .query(async ({ input, ctx }) => {
      return await getUserChallengeProgress(ctx.user.id, input.challengeId);
    }),

  // 챌린지 진행 상황 업데이트
  updateProgress: protectedProcedure
    .input(z.object({
      challengeId: z.number(),
      completed: z.number().optional(),
      isCompleted: z.number().optional(),
      xpEarned: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { challengeId, ...updates } = input;
      return await updateChallengeProgress(ctx.user.id, challengeId, updates);
    }),
})
```

### 7. 데이터베이스 헬퍼 함수 (✅ 완료)

**경로:** `/server/db.ts`

```typescript
// 오늘의 챌린지 조회
export async function getTodayChallenge()

// 사용자 챌린지 진행 상황 조회
export async function getUserChallengeProgress(userId, challengeId)

// 챌린지 진행 상황 업데이트
export async function updateChallengeProgress(userId, challengeId, updates)

// 모든 챌린지 조회
export async function getAllChallenges()

// 사용자 완료 챌린지 조회
export async function getUserCompletedChallenges(userId)
```

### 8. 라우팅 및 네비게이션 (✅ 완료)

**경로 추가**
- `/challenges` - 일일 챌린지 페이지

**홈페이지 통합**
- "일일 챌린지" 카드 추가
- 클릭하면 `/challenges`로 이동
- 게임화 강화 표시

**App.tsx 업데이트**
```typescript
<Route path="/challenges" component={DailyChallenges} />
```

### 9. 단위 테스트 (✅ 완료)

**기존 테스트 유지**
- 28개 테스트 모두 통과
- 발음 연습 및 챌린지 라우터 테스트

**테스트 실행**
```bash
pnpm test
# ✓ 28 tests passed
```

## 🎨 UI/UX 디자인

### 색상 팔레트
- **배경:** 보라색 → 인디고 그라데이션
- **카드:** 흰색 배경, 그림자 효과
- **강조:** 인디고 (선택), 보라색 (챌린지), 노란색 (XP)
- **상태:** 녹색 (완료), 빨간색 (연속)

### 레이아웃
- **데스크톱:** 3열 (챌린지 목록 2열 + 상세 패널 1열)
- **태블릿:** 2열 (챌린지 목록 1열 + 상세 패널 1열)
- **모바일:** 1열 (챌린지 목록, 상세 패널은 모달)

### 인터랙션
- 카드 호버 시 그림자 확대
- 선택 시 테두리 강조 (ring-2)
- 버튼 호버 시 색상 변화
- 토스트 메시지로 피드백

## 📊 파일 구조

```
/home/ubuntu/lao_thai_learning_app/
├── server/
│   ├── seed-challenges.mjs          # 챌린지 데이터 시드
│   └── db.ts                        # 챌린지 헬퍼 함수 (기존)
├── client/src/
│   ├── pages/
│   │   ├── DailyChallenges.tsx       # 챌린지 UI 페이지
│   │   └── Home.tsx                 # 홈페이지 (챌린지 카드 추가)
│   └── App.tsx                      # 라우팅 (챌린지 경로 추가)
├── todo.md                          # 진행 상황 (Phase 3 완료)
└── PHASE3_CHALLENGES.md             # 이 파일
```

## 🚀 사용 방법

### 1. 챌린지 데이터 시드 (선택사항)

```bash
cd /home/ubuntu/lao_thai_learning_app
node server/seed-challenges.mjs
```

### 2. 챌린지 페이지 접근

1. 홈페이지에서 "일일 챌린지" 카드 클릭
2. 또는 직접 `/challenges` URL 접근

### 3. 챌린지 완료 흐름

1. 챌린지 목록에서 원하는 챌린지 선택
2. 상세 패널에서 "챌린지 시작" 클릭
3. 발음 연습 페이지로 이동
4. 단어 발음 연습 완료
5. 돌아와서 "완료 표시" 클릭
6. XP 획득 및 진행 상황 업데이트

### 4. API 호출 예시

```typescript
// 오늘의 챌린지 조회
const challenge = await trpc.challenges.getTodayChallenge.useQuery();

// 사용자 진행 상황 조회
const progress = await trpc.challenges.getUserProgress.useQuery({
  challengeId: 1,
});

// 진행 상황 업데이트
await trpc.challenges.updateProgress.useMutation({
  challengeId: 1,
  completed: 5,
  isCompleted: 1,
  xpEarned: 100,
});
```

## 🎮 게임화 요소

### XP 시스템
- 기본 XP: 챌린지별 설정값
- 정확도 보너스: 90% 이상 +50 XP
- 연속 보너스: 7일 이상 2배

### 배지 시스템
- 7일 연속: "연속 학습자"
- 14일 연속: "전문가"
- 30일 연속: "마스터"
- 모든 주간 챌린지: "주간 챔피언"

### 리더보드 (Phase 4)
- 글로벌 순위
- 친구 순위
- 주간 순위

## 📈 성과 지표

| 지표 | 값 |
|------|-----|
| 구현된 챌린지 | 7개 |
| UI 컴포넌트 | 1개 (DailyChallenges.tsx) |
| tRPC 라우터 | 3개 (getTodayChallenge, getUserProgress, updateProgress) |
| 데이터베이스 헬퍼 | 3개 |
| 테스트 통과 | 28/28 |
| 라우트 추가 | 1개 (/challenges) |

## ✅ 체크리스트

- [x] 일일 챌린지 데이터 모델 설계
- [x] 시드 데이터 생성 (7개 챌린지)
- [x] 챌린지 UI 페이지 구현
- [x] 챌린지 상호작용 기능 (시작, 진행, 완료)
- [x] 스트릭 시스템 구현
- [x] tRPC 라우터 통합
- [x] 데이터베이스 헬퍼 함수
- [x] 홈페이지 통합
- [x] 라우팅 추가
- [x] 단위 테스트 (28개 통과)
- [x] 반응형 디자인
- [x] 토스트 메시지 피드백

## 🔐 보안 고려사항

- 모든 챌린지 진행은 사용자별로 저장됨
- protectedProcedure 사용으로 인증된 사용자만 접근 가능
- XP 보상은 서버에서 검증
- 부정 행위 방지를 위한 타임스탐프 기록

## 📝 주의사항

1. **챌린지 시간:** 현재는 자정 기준으로 새 챌린지 생성 (UTC)
2. **연속 일수:** 하루라도 놓치면 리셋 (향후 유예 기간 추가 가능)
3. **XP 보상:** 중복 완료 시 중복 보상 방지 필요 (향후 개선)
4. **타임존:** 사용자 타임존 기반 챌린지 시간 조정 필요 (향후 구현)

## 🚀 다음 단계 (Phase 4)

1. **리더보드 페이지** - 글로벌 순위 표시
2. **친구 기능** - 친구 추가 및 친구 순위
3. **배지 시스템** - 배지 수집 및 표시
4. **주간 리포트** - 주간 학습 통계 이메일
5. **소셜 공유** - 성과 공유 기능

## 🎓 학습 포인트

- React hooks (useState, useEffect, useLocation)
- tRPC 클라이언트 쿼리 및 뮤테이션
- 반응형 그리드 레이아웃 (Tailwind CSS)
- 상태 관리 및 UI 업데이트
- 토스트 메시지 피드백
- 데이터 바인딩 및 양방향 통신

---

**최종 업데이트:** 2026-03-25  
**개발자:** Manus AI  
**상태:** Phase 3 완료 ✅
