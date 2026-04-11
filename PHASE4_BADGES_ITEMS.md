# 라오어·태국어 학습 앱 - Phase 4 배지 및 아이템 시스템 구현 문서

## 📋 개요

Phase 4에서는 **배지 시스템과 특별 학습 아이템 제공 기능**을 완전히 구현했습니다. 사용자가 획득한 배지를 프로필에서 전시하고, 주간 챌린지 완료 시 특별 아이템을 제공하는 게임화 강화 시스템을 제공합니다.

## 🎯 구현된 기능

### 1. 배지 데이터 모델 (✅ 완료)

**badges 테이블** - 배지 정의
```sql
- id: 고유 ID
- name: 배지 이름
- description: 배지 설명
- icon: 배지 아이콘 (이모지 또는 URL)
- rarity: 희귀도 (common/uncommon/rare/epic/legendary)
- unlockedCondition: 해제 조건 (e.g., "7_day_streak")
- xpReward: XP 보상
- createdAt: 생성 시간
```

**user_badges 테이블** - 사용자 배지 관계
```sql
- id: 고유 ID
- userId: 사용자 ID
- badgeId: 배지 ID
- unlockedAt: 해제 시간
- createdAt: 생성 시간
```

### 2. 아이템 데이터 모델 (✅ 완료)

**special_items 테이블** - 스페셜 아이템 정의
```sql
- id: 고유 ID
- name: 아이템 이름
- description: 아이템 설명
- icon: 아이템 아이콘 (이모지 또는 URL)
- itemType: 아이템 타입 (bonus_xp/hint/skip/power_up/cosmetic)
- value: 아이템 값 (e.g., XP 수량)
- rarity: 희귀도 (common/uncommon/rare/epic/legendary)
- unlockedCondition: 해제 조건 (e.g., "weekly_challenge_complete")
- createdAt: 생성 시간
```

**user_inventory 테이블** - 사용자 인벤토리
```sql
- id: 고유 ID
- userId: 사용자 ID
- itemId: 아이템 ID
- quantity: 보유 수량
- usedCount: 사용 횟수
- acquiredAt: 획득 시간
- createdAt: 생성 시간
- updatedAt: 업데이트 시간
```

### 3. 배지 시드 데이터 (✅ 완료)

**경로:** `/server/seed-badges-items.mjs`

10개의 배지를 생성합니다:

| 배지명 | 설명 | 아이콘 | 희귀도 | 해제 조건 | XP |
|--------|------|--------|--------|---------|-----|
| 첫 발걸음 | 첫 번째 발음 연습 완료 | 🌱 | common | first_pronunciation | 10 |
| 연속 학습자 | 7일 연속 챌린지 완료 | 🔥 | uncommon | 7_day_streak | 50 |
| 전문가 | 14일 연속 챌린지 완료 | ⭐ | rare | 14_day_streak | 100 |
| 마스터 | 30일 연속 챌린지 완료 | 👑 | epic | 30_day_streak | 200 |
| 정확도 달인 | 100개 단어 90% 이상 정확도 | 🎯 | uncommon | high_accuracy_100 | 75 |
| 라오어 전문가 | 라오어 50개 단어 완벽 발음 | 🇱🇦 | rare | lao_50_words | 100 |
| 태국어 전문가 | 태국어 50개 단어 완벽 발음 | 🇹🇭 | rare | thai_50_words | 100 |
| 주간 챔피언 | 한 주 모든 챌린지 완료 | 🏆 | epic | weekly_challenge_complete | 150 |
| 언어 마스터 | 라오어·태국어 모두 100개 단어 | 🌍 | legendary | bilingual_master | 500 |
| 커뮤니티 스타 | 친구 추가 | ⭐✨ | uncommon | add_friend | 25 |

### 4. 아이템 시드 데이터 (✅ 완료)

5개의 스페셜 아이템을 생성합니다:

| 아이템명 | 설명 | 아이콘 | 타입 | 값 | 희귀도 | 해제 조건 |
|---------|------|--------|------|-----|--------|---------|
| 보너스 XP 50 | 다음 챌린지에서 50 XP 추가 | ⚡ | bonus_xp | 50 | common | weekly_challenge_complete |
| 보너스 XP 100 | 다음 챌린지에서 100 XP 추가 | ⚡⚡ | bonus_xp | 100 | uncommon | weekly_challenge_complete_2 |
| 힌트 사용권 | 발음 연습에서 한 번 힌트 사용 | 💡 | hint | 1 | common | weekly_challenge_complete |
| 스킵 권리 | 어려운 단어를 한 번 건너뛰기 | ⏭️ | skip | 1 | uncommon | weekly_challenge_complete_2 |
| 파워업 - 더블 XP | 다음 챌린지에서 모든 XP 2배 | 🚀 | power_up | 2 | rare | weekly_challenge_complete_3 |

### 5. 배지 전시 UI (✅ 완료)

**경로:** `/client/src/pages/UserProfile.tsx`

#### 주요 기능

**1. 사용자 프로필 페이지**
- 사용자 정보 표시 (이름, 이메일, 로그인 방법)
- 학습 통계 표시 (레벨, 총 XP, 연속 일수, 평균 정확도)
- 배지 탭: 획득한 배지 전시
- 인벤토리 탭: 보유 아이템 표시

**2. 배지 전시**
- 배지 이름, 설명, 아이콘 표시
- 희귀도별 색상 구분 (legendary/epic/rare/uncommon/common)
- XP 보상 표시
- 그리드 레이아웃 (반응형)

**3. 인벤토리 표시**
- 아이템 이름, 설명, 아이콘 표시
- 아이템 타입 표시 (보너스 XP, 힌트, 스킵, 파워업, 코스메틱)
- 보유 수량 및 사용 횟수 표시
- 희귀도별 색상 구분

**4. 설정 섹션**
- 계정 정보 표시
- 학습 통계 요약
- 로그아웃 버튼

#### UI 특징
- 탭 기반 네비게이션 (배지/인벤토리)
- 희귀도별 색상 코딩
- 반응형 디자인 (모바일, 태블릿, 데스크톱)
- 빈 상태 메시지 (배지/아이템 없을 때)
- 로딩 상태 표시

### 6. 아이템 제공 로직 (✅ 완료)

**경로:** `/server/routers-badges-items.ts`

#### 주요 기능

**배지 획득**
```typescript
// 조건에 따라 배지 자동 획득
- 첫 발음 연습 완료 시 "첫 발걸음" 배지
- 7일 연속 학습 시 "연속 학습자" 배지
- 14일 연속 학습 시 "전문가" 배지
- 30일 연속 학습 시 "마스터" 배지
- 90% 이상 정확도 100개 단어 시 "정확도 달인" 배지
- 주간 챌린지 완료 시 "주간 챔피언" 배지
```

**아이템 제공**
```typescript
// 주간 챌린지 완료 시 아이템 제공
- 1주차: 보너스 XP 50
- 2주차: 보너스 XP 100 + 힌트 사용권
- 3주차: 스킵 권리 + 파워업 - 더블 XP
```

**중복 방지**
- 이미 획득한 배지는 중복 획득 불가
- 아이템은 수량으로 관리 (중복 획득 시 수량 증가)

### 7. 배지 획득 알림 (✅ 완료)

**알림 시스템**
```typescript
// 배지 획득 시
{
  type: "badge_acquired",
  title: "배지 획득: 연속 학습자",
  message: "축하합니다! '연속 학습자' 배지를 획득했습니다!",
  icon: "🔥",
  rarity: "uncommon"
}

// 아이템 획득 시
{
  type: "item_acquired",
  title: "아이템 획득: 보너스 XP 50",
  message: "축하합니다! '보너스 XP 50'을(를) 획득했습니다!",
  icon: "⚡"
}

// 마일스톤 달성 시
{
  type: "milestone",
  title: "7일 연속 학습!",
  message: "축하합니다! 7일 연속으로 학습했습니다. 2배 XP 보너스를 받으세요!"
}
```

### 8. tRPC 라우터 (✅ 완료)

**경로:** `/server/routers-badges-items.ts`

```typescript
badgesItemsRouter: router({
  // 모든 배지 조회
  getAllBadges: protectedProcedure.query(),

  // 사용자 배지 조회
  getUserBadges: protectedProcedure.query(),

  // 배지 수여
  awardBadge: protectedProcedure.mutation(),

  // 조건에 따라 배지 확인 및 수여
  checkAndAwardBadge: protectedProcedure.mutation(),

  // 모든 아이템 조회
  getAllSpecialItems: protectedProcedure.query(),

  // 사용자 인벤토리 조회
  getUserInventory: protectedProcedure.query(),

  // 인벤토리에 아이템 추가
  addItemToInventory: protectedProcedure.mutation(),

  // 아이템 사용
  useItem: protectedProcedure.mutation(),

  // 조건에 따라 아이템 확인 및 제공
  checkAndAwardItem: protectedProcedure.mutation(),

  // 모든 성취 확인 및 보상 제공
  checkAchievements: protectedProcedure.mutation(),
})
```

### 9. 데이터베이스 헬퍼 함수 (✅ 완료)

**경로:** `/server/db-badges-items.ts`

```typescript
// 배지 관련
- getAllBadges()
- getBadgeById(badgeId)
- getUserBadges(userId)
- awardBadgeToUser(userId, badgeId)
- getBadgeByUnlockCondition(condition)

// 아이템 관련
- getAllSpecialItems()
- getSpecialItemById(itemId)
- getUserInventory(userId)
- addItemToInventory(userId, itemId, quantity)
- useItemFromInventory(userId, itemId)
- getSpecialItemByUnlockCondition(condition)
```

### 10. 라우팅 및 네비게이션 (✅ 완료)

**경로 추가**
- `/profile` - 사용자 프로필 페이지

**App.tsx 업데이트**
```typescript
<Route path="/profile" component={UserProfile} />
```

### 11. 단위 테스트 (✅ 완료)

**경로:** `/server/badges-items.test.ts`

**테스트 항목:**
- 배지 수여 (21개 테스트)
- 아이템 인벤토리 (중복 방지, 수량 관리)
- 주간 챌린지 보상 (배지 + 아이템)
- 성취 확인 (연속, 정확도, 언어 전문성)
- 알림 시스템 (배지/아이템/마일스톤)
- 보상 조건 정의
- 사용자 프로필 표시

**테스트 결과:** 49개 테스트 모두 통과 ✅

## 🎨 UI/UX 디자인

### 색상 팔레트 (희귀도별)
- **Legendary:** 황금색 (bg-yellow-100, border-yellow-300)
- **Epic:** 보라색 (bg-purple-100, border-purple-300)
- **Rare:** 파란색 (bg-blue-100, border-blue-300)
- **Uncommon:** 녹색 (bg-green-100, border-green-300)
- **Common:** 회색 (bg-gray-100, border-gray-300)

### 레이아웃
- **데스크톱:** 3열 그리드 (배지/아이템)
- **태블릿:** 2열 그리드
- **모바일:** 1열 그리드

### 인터랙션
- 탭 클릭으로 배지/인벤토리 전환
- 배지/아이템 카드 호버 시 그림자 확대
- 빈 상태 메시지로 사용자 가이드

## 📊 파일 구조

```
/home/ubuntu/lao_thai_learning_app/
├── drizzle/
│   └── schema.ts                    # 배지/아이템 테이블 추가
├── server/
│   ├── seed-badges-items.mjs        # 배지/아이템 시드 데이터
│   ├── db-badges-items.ts           # 배지/아이템 헬퍼 함수
│   ├── routers-badges-items.ts      # 배지/아이템 tRPC 라우터
│   └── badges-items.test.ts         # 배지/아이템 단위 테스트
├── client/src/
│   ├── pages/
│   │   └── UserProfile.tsx          # 사용자 프로필 페이지
│   └── App.tsx                      # 라우팅 (/profile 경로 추가)
├── todo.md                          # 진행 상황 (Phase 4 완료)
└── PHASE4_BADGES_ITEMS.md           # 이 파일
```

## 🚀 사용 방법

### 1. 배지/아이템 데이터 시드 (선택사항)

```bash
cd /home/ubuntu/lao_thai_learning_app
node server/seed-badges-items.mjs
```

### 2. 사용자 프로필 페이지 접근

1. 로그인 후 홈페이지에서 프로필 버튼 클릭
2. 또는 직접 `/profile` URL 접근

### 3. 배지 획득 흐름

1. 사용자가 챌린지 완료 또는 조건 달성
2. 시스템이 자동으로 배지 확인 및 수여
3. 토스트 메시지로 배지 획득 알림
4. 프로필 페이지에서 배지 확인

### 4. 아이템 획득 흐름

1. 주간 챌린지 완료
2. 시스템이 자동으로 아이템 제공
3. 토스트 메시지로 아이템 획득 알림
4. 프로필 페이지의 인벤토리에서 아이템 확인

### 5. API 호출 예시

```typescript
// 모든 배지 조회
const badges = await trpc.badgesItems.getAllBadges.useQuery();

// 사용자 배지 조회
const userBadges = await trpc.badgesItems.getUserBadges.useQuery();

// 배지 수여
await trpc.badgesItems.awardBadge.useMutation({
  badgeId: 1,
});

// 사용자 인벤토리 조회
const inventory = await trpc.badgesItems.getUserInventory.useQuery();

// 인벤토리에 아이템 추가
await trpc.badgesItems.addItemToInventory.useMutation({
  itemId: 1,
  quantity: 1,
});

// 아이템 사용
await trpc.badgesItems.useItem.useMutation({
  itemId: 1,
});

// 모든 성취 확인 및 보상 제공
await trpc.badgesItems.checkAchievements.useMutation();
```

## 🎮 게임화 요소

### 배지 시스템
- 10개의 배지로 다양한 성취 표현
- 희귀도 시스템 (common ~ legendary)
- XP 보상 (10 ~ 500 XP)
- 배지별 고유한 아이콘

### 아이템 시스템
- 5개의 스페셜 아이템
- 아이템 타입별 기능 (XP, 힌트, 스킵, 파워업)
- 희귀도별 가치 차등
- 인벤토리 관리

### 보상 체계
- **연속 학습:** 배지 + XP 보상
- **정확도 달성:** 배지 + XP 보상
- **주간 챌린지:** 배지 + 스페셜 아이템
- **언어 마스터:** 최고 희귀도 배지 (legendary)

## 📈 성과 지표

| 지표 | 값 |
|------|-----|
| 배지 개수 | 10개 |
| 스페셜 아이템 | 5개 |
| UI 컴포넌트 | 1개 (UserProfile.tsx) |
| tRPC 라우터 | 9개 |
| 데이터베이스 헬퍼 | 11개 |
| 단위 테스트 | 21개 (badges-items.test.ts) |
| 전체 테스트 통과 | 49/49 ✅ |
| 데이터베이스 테이블 | 4개 (badges, user_badges, special_items, user_inventory) |

## ✅ 체크리스트

- [x] 배지 데이터 모델 설계
- [x] 아이템 데이터 모델 설계
- [x] 시드 데이터 생성 (10개 배지 + 5개 아이템)
- [x] 배지 전시 UI 페이지 구현
- [x] 인벤토리 UI 구현
- [x] 배지 수여 로직
- [x] 아이템 제공 로직
- [x] 중복 방지 로직
- [x] 알림 시스템
- [x] tRPC 라우터 통합
- [x] 데이터베이스 헬퍼 함수
- [x] 라우팅 추가 (/profile)
- [x] 단위 테스트 (49개 통과)
- [x] 반응형 디자인
- [x] 희귀도별 색상 코딩

## 🔐 보안 고려사항

- 모든 배지/아이템은 사용자별로 저장됨
- protectedProcedure 사용으로 인증된 사용자만 접근 가능
- 배지 수여는 서버에서 검증
- 중복 배지 획득 방지
- 아이템 사용 시 수량 확인

## 📝 주의사항

1. **배지 중복:** 이미 획득한 배지는 중복 획득 불가
2. **아이템 수량:** 아이템은 수량으로 관리되어 중복 획득 시 수량 증가
3. **조건 확인:** 배지 해제 조건은 정확히 정의되어야 함
4. **타임스탐프:** 모든 배지/아이템 획득 시간 기록

## 🚀 다음 단계 (Phase 5)

1. **리더보드 페이지** - 글로벌 순위 표시, 친구 순위
2. **배지 수집 챌린지** - 특정 배지 조합 수집 시 보상
3. **시즌 시스템** - 월별 배지 및 아이템 변경
4. **배지 공유** - SNS 공유 기능
5. **배지 업그레이드** - 배지 레벨 시스템

## 🎓 학습 포인트

- React hooks (useState, useEffect)
- tRPC 클라이언트 쿼리 및 뮤테이션
- 탭 기반 UI 구현 (Radix UI Tabs)
- 희귀도별 색상 코딩
- 반응형 그리드 레이아웃
- 데이터베이스 관계 설계
- 중복 방지 로직
- 단위 테스트 작성

---

**최종 업데이트:** 2026-03-25  
**개발자:** Manus AI  
**상태:** Phase 4 완료 ✅  
**테스트:** 49/49 통과 ✅
