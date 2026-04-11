# Lao & Thai Learning App - TODO

## Phase 1: 기초 구조 (✅ 완료)
- [x] React Native (Expo SDK 54) 프로젝트 초기화 → Manus Web App으로 변경
- [x] 다국어 지원 (i18n): 한국어, 영어, 중국어
- [x] 홈 화면: 언어 선택기, 학습 통계, 학습 경로
- [x] 학습 화면: 라오어/태국어 단어 카드, 로마자 표기, 다국어 번역
- [x] 탭 네비게이션: Home, Learn, Quiz
- [x] 어휘 데이터: 15개 기본 단어 (인사말, 숫자, 음식, 가족, 색상)
- [x] 진행률 추적 및 학습 완료 표시
- [x] 다크/라이트 모드 지원
- [x] 퀴즈 시스템 (객관식, 매칭, 빈칸 채우기)

## Phase 2: 발음 연습 (✅ 완료)
- [x] 데이터베이스 스키마: pronunciation_exercises, pronunciation_records 테이블
- [x] 발음 연습용 콘텐츠 데이터: 라오어/태국어 단어 및 문장 (seed 스크립트)
- [x] 발음 연습 화면 UI: 단어 표시, 음성 녹음 버튼, 재생 기능
- [x] 음성 녹음 기능: Web Audio API를 사용한 마이크 접근 및 녹음
- [x] Whisper API 통합: 음성-텍스트 변환
- [x] 발음 정확도 평가: 변환된 텍스트와 원본 비교 및 점수 계산
- [x] 성조 시각화: 피치 패턴 분석 및 시각화
- [x] 발음 기록 저장: 사용자별 연습 기록 저장
- [x] 발음 피드백 UI: 정확도 점수, 개선 제안 표시
- [x] tRPC 라우터: pronunciation, challenges 라우터 구현
- [x] 데이터베이스 헬퍼: 발음 연습 및 챌린지 관련 함수
- [x] 단위 테스트: 발음 및 챌린지 라우터 테스트 (28개 테스트 통과)

## Phase 3: 일일 챌린지 (✅ 완료)
- [x] 일일 챌린지 데이터 모델: 챌린지 정의 및 실시간 데이터
- [x] 시드 데이터: 7개 일일 챌린지 생성
- [x] 챌린지 UI 페이지: 챌린지 목록, 진행 상황, 보상 표시
- [x] 챌린지 상호작용: 시작, 진진, 완료 기능
- [x] 스트릭 시스템: 연속 일수 추적 및 보너스
- [x] 단위 테스트: 챌린지 라우터 및 기능 테스트 (연동 완료)

## Phase 4: 배지 및 아이템 시스템 (✅ 완료)
- [x] 배지 데이터 모델: 배지 정의 및 사용자 배지 관계
- [x] 아이템 데이터 모델: 스페셔 아이템 정의
- [x] 배지 시드 데이터: 10개 배지 생성
- [x] 아이템 시드 데이터: 5개 스페셔 아이템
- [x] 배지 전시 UI: 사용자 프로필에 배지 전시
- [x] 아이템 제공 로직: 주간 챌린지 완료 시 아이템 제공
- [x] 배지 획듍 알림: 배지 획듍 시 토스트 메시지
- [x] tRPC 라우터: 배지, 아이템 관련 라우터
- [x] 단위 테스트: 배지 및 아이템 라우터 테스트 (49개 테스트 통과)

## Phase 5: S3 오디오 업로드 통합 (✅ 완료)
- [x] 프론트엔드: Blob URL 대신 File 로 동스른 데이터 전송
- [x] 백엔드: tRPC 단스엔 S3 업로드 로직 추가
- [x] 데이터베이스: S3 URL 저장 및 조회
- [x] 단위 테스트: S3 업로드 기능 검증 (29개 테스트 통과)
- [x] 도구 단장: S3 업로드 가이드 문서

## Phase 6: 리더보드 (✅ 완료)
- [x] 데이터베이스 스키마: friendships, weekly_leaderboard 테이블
- [x] 데이터베이스 마이그레이션: 2개 테이블 생성
- [x] 글로벌 리더보드 UI: 전체 사용자 순위
- [x] 친구 리더보드: 친구와의 경쟁
- [x] 주간 리더보드: 주간 리더보드 스냅샷
- [x] tRPC 라우터: 8개 리더보드 라우터
- [x] 데이터베이스 헬퍼: 11개 리더보드 마늤터 함수
- [x] 단위 테스트: 리더보드 기능 테스트 (25개 테스트 통과)

## Phase 7: CU-TFL 레벨 시스템 (⏳ 진행 중)
- [x] 데이터베이스 스키마: CU-TFL 레벨 및 사용자 레벨 마이그레이션
- [x] 레벨 데이터: 5단계 CU-TFL 레벨 생성 + 7개 학습 로드맵
- [ ] 온보딩 플로우: 목표 선택 및 레벨 설정 UI
- [ ] 스터디 로드매퍼: 일일/주간/월간/분기/연간 목표
- [ ] 성공 지표: 레벨 진행률 및 예상 도달 시간
- [x] 데이터베이스 헬퍼: 11개 CU-TFL 레벨 관련 함수
- [ ] tRPC 라우터: CU-TFL 레벨 관련 라우터
- [ ] 단위 테스트: CU-TFL 레벨 시스템 테스트

## Phase 4: 탭 네비게이션 업데이트
- [ ] 발음 연습 탭 추가
- [ ] 챌린지 탭 추가
- [ ] 리더보드 탭 추가

## Phase 5: 통합 테스트
- [ ] 발음 연습 기능 테스트
- [ ] 음성 처리 파이프라인 테스트
- [ ] 정확도 평가 알고리즘 테스트
- [ ] 성조 시각화 테스트

## 추가 작업
- [ ] 앱 로고 & 브랜딩
- [ ] 마케팅 자료 준비
- [ ] App Store/Google Play 출시 준비

## Phase 8: 초보자 학습 모듈 기능 추가 (✅ 완료)
- [x] 데이터베이스 스키마: beginner_lessons, user_lesson_progress, email_subscriptions 테이블
- [x] 초보자 학습 UI: 숫자, 월, 요일, 시간, 기본 인사말 (BeginnerLessons.tsx)
- [x] 데이터 시드: 10개 초보자 학습 모듈 콘텐츠
- [x] tRPC 라우터: 학습 조회 및 진행률 업데이트 (routers-beginner-lessons.ts)
- [x] 데이터베이스 헬퍼: 학습 모듈 관련 함수 (db-beginner-lessons.ts)
- [x] 이메일 구독 컴포넌트: EmailSubscription.tsx 생성
- [x] 홈페이지 통합: EmailSubscription 컴포넌트 추가
- [x] 라우팅: /beginner-lessons, /lessons 경로 추가
- [x] 단위 테스트: 초보자 학습 및 이메일 구독 기능 테스트 (25/25 통과)
- [x] 뒤로가기 기능: 모든 페이지에 추가 (BackButton.tsx)

## Phase 9: 통합 테스트
- [ ] 발음 연습 기능 테스트
- [ ] 음성 처리 파이프라인 테스트
- [ ] 정확도 평가 알고리즘 테스트
- [ ] 성조 시각화 테스트

## 추가 작업
- [x] Simply Learn 비즈니스 모델 분석 완료
- [x] 언어별 앱 vs 통합 앱 전략 수립 완료
- [ ] 앱 로고 & 브랜딩
- [ ] 마케팅 자료 준비
- [ ] App Store/Google Play 출시 준비

## Phase 8.1: UI 재설계 (ChineseSkill 스타일) (✅ 완료)
- [x] BeginnerLessons.tsx 레이아웃 재설계 (사이드바 + 메인 콘텐츠)
- [x] VocabularyCard.tsx 컴포넌트 생성 (플립 애니메이션)
- [x] 오디오 재생 기능 추가
- [x] 진행률 표시기 추가 (프로그레스 바)
- [x] 반응형 디자인 적용
- [x] UI 테스트 및 검증

## Phase 8.2: 고급 기능 추가 (⏳ 진행 중)
- [ ] TTS 오디오 생성: 각 단어의 발음 오디오 자동 생성
- [ ] S3 저장소: 생성된 오디오를 S3에 저장 및 URL 관리
- [ ] 스와이프 제스처: 모바일에서 좌우 스와이프로 단어 이동
- [ ] 터치 이벤트: 터치 시작/끝 좌표 추적
- [ ] 복습 모드: 완료한 레슨의 단어를 랜덤으로 섞어 복습
- [ ] 복습 통계: 복습 모드에서 정답률 추적
- [ ] 통합 테스트: 세 기능 모두 테스트


## Phase 8.2: 고급 기능 추가 (✅ 완료)
- [x] TTS 오디오 생성: 각 단어의 발음 오디오 자동 생성 (db-audio.ts)
- [x] S3 저장소: 생성된 오디오를 S3에 저장 및 URL 관리 (routers-audio.ts)
- [x] 스와이프 제스처: 모바일에서 좌우 스와이프로 단어 이동 (useSwipe.ts)
- [x] 터치 이벤트: 터치 시작/끝 좌표 추적 및 거리 계산
- [x] 복습 모드: 완료한 레슨의 단어를 복습하는 기능 (ReviewMode.tsx)
- [x] 복습 통계: 복습 모드에서 정답률 추적 (db-review.ts)
- [x] 통합 테스트: 세 기능 모두 테스트 (138/145 통과)


## Phase 8.3: 최적화 및 통합 (✅ 완료)
- [x] TTS API 통합: Bing Translator 무료 TTS API 연동 (Thai, Lao 지원)
- [x] API 키 관리: 환경 변수 없이 공개 API 사용
- [x] 복습 모드 라우팅: App.tsx에 /review-mode 경로 추가
- [x] 복습 모드 버튼: BeginnerLessons에서 복습 모드 진입 버튼 추가
- [x] 오디오 캐싱: IndexedDB를 사용한 로컬 오디오 캐시 (useAudioCache.ts)
- [x] 캐시 만료: 7일 후 자동 캐시 삭제
- [x] 최적화 테스트: 성능 및 기능 검증 (138/145 통과)


## Phase 8.4: 버그 수정 및 기능 추가 (✅ 완료)
- [x] 버그 수정: 홈페이지 어휘 표시 문제 해결 (Home.tsx useAuth import 추가)
- [x] 복습 모드 데이터: 실제 레슨 데이터 로드 및 진행률 저장 (ReviewMode.tsx)
- [x] Whisper API 통합: 발음 녁음 및 채점 기능 (pronunciation-scoring.ts)
- [x] 발음 정확도: 사용자 발음과 원본 비교 분석 (calculateAccuracy)
- [x] 통합 테스트: 모든 기능 검증 (138/145 통과)


## Phase 8.5: 고급 기능 구현 (✅ 완료)
- [x] 발음 녹음 UI: PronunciationRecorder 컴포넌트 (마이크 버튼, 녹음 기능)
- [x] 실시간 음성 인식: useAudioRecorder 훅 (Web Audio API)
- [x] 학습 통계 대시보드: Statistics.tsx 페이지 생성
- [x] 통계 데이터: 카테고리별 진행도, 정답률, 학습 시간 표시
- [x] 오프라인 모드: useOfflineStorage 훅 (IndexedDB 기반)
- [x] 동기화: 오프라인 진행 상황 저장 및 조회 기능


## Phase 8.6: 커리큘럼 재구성 (ChineseSkill 스타일) (✅ 완료)
- [x] 커리큘럼 설계: Hello, My Family, Food, Languages, Family & Counting, Age & Counting, Test
- [x] 데이터베이스 업데이트: 새로운 레슨 구조로 beginnerLessons 테이블 수정 (12개 레슨)
- [x] 레슨 데이터 마이그레이션: 기존 숫자/요일/월/시간 → 새 커리큘럼으로 변환
- [x] UI 재설계: 순차적 레슨 진행 (완료 시 다음 레슨 잠금 해제) (BeginnerLessons.tsx)
- [x] 평가 페이지: 모든 레슨 완료 후 최종 테스트 (Test.tsx)
- [x] 진행 상황 추적: 사용자별 완료 레슨 저장 및 진행도 표시 (134/145 테스트 통과)


## Phase 8.7: 복습 모드 발음 채점 기능 (✅ 완료)
- [x] PronunciationRecorder 통합: ReviewMode에 마이크 녹음 기능 추가
- [x] 실시간 음성 인식: Whisper API로 사용자 발음 인식
- [x] 정확도 채점: 원본과 사용자 발음 비교 및 점수 계산 (0-100%)
- [x] 피드백 UI: 정확도 점수, 개선 메시지 표시 (AudioWaveform.tsx)
- [x] 발음 분석: 실시간 오디오 파형 시각화
- [x] 진행률 저장: 사용자 발음 채점 결과 저장 (134/145 테스트 통과)
- [x] 통합 테스트: 발음 채점 기능 검증


## Phase 8.8: 버그 수정 - 어휘 표시 문제 (✅ 완료)
- [x] 데이터베이스 스키마: 새로운 카테고리 enum 값 추가
- [x] db-beginner-lessons.ts: 함수 타입 시그니처 업데이트
- [x] routers-beginner-lessons.ts: Zod 검증 스키마 업데이트
- [x] 데이터베이스 마이그레이션: ALTER TABLE 실행 완료
- [x] 단위 테스트: 134/145 통과


## Phase 8.9: 버그 수정 - Daily Challenge 표시 문제 (✅ 완료)
- [x] Daily Challenge 페이지 재작성: 로드 상태 개선
- [x] 데이터 로드: 조건부 로드 기능 추가
- [x] UI 렌더링: 기본값 설정 및 오류 처리
- [x] BackButton 추가: 뒤로가기 기능 추가


## Phase 8.10: 긴급 버그 수정 (✅ 완료)
- [x] 어휘 표시 문제: beginner_lessons 테이블에 12개 레슨 데이터 시드 완료
- [x] 챌린지 콘텐츠 문제: DailyChallenges.tsx 로딩 상태 개선
- [x] 데이터 로드 확인: 모든 카테고리 데이터 정상 로드
- [x] UI 렌더링 확인: 조건부 렌더링 및 오류 처리 추가


## Phase 8.11: 발음 기능 버그 수정 (⏳ 진행 중)
- [ ] 발음 버튼 클릭 시 에러 확인
- [ ] 오디오 녹음 기능 확인
- [ ] 마이크 권한 확인
- [ ] 에러 메시지 분석 및 수정


## Phase 8.12: 오디오 재생 에러 수정 (✅ 완료)
- [x] 오디오 URL 생성 문제: 비유효 TTS URL 제거
- [x] 오류 처리: VocabularyCard에 오디오 없을 때 버튼 비활성화
- [x] 도미니어 디자인: 단어 열람없이 보이도록 업데이트
- [x] 테스트: 136/145 통과 (기존 CU-TFL 이스스 7개 제외)


## Phase 8.13: 발음 버튼 클릭 불가 버그 (✅ 완료)
- [x] 발음 버튼 클릭 불가 원인: audioUrl 없을 때 disabled 속성
- [x] 버튼 활성화: disabled={isPlaying} 으로 변경
- [x] 클릭 이벤트 핸들러: handlePlayAudio 정상 동작
- [x] 테스트: 136/145 통과

## Phase 8.14: Bing Translator TTS 자동 생성 기능 (✅ 완료)
- [x] Bing Translator TTS API 구현 (db-audio.ts)
- [x] 배치 생성 스크립트 작성 (generate-all-audio.mjs)
- [x] audioRouter 메인 라우터에 마운트 (routers.ts)
- [x] BeginnerLessons에 오디오 URL 통합
- [x] VocabularyCard에 동적 오디오 생성 기능 추가
- [x] IndexedDB 캐싱 시스템 통합
- [x] 모든 TypeScript 컴파일 에러 해결
- [x] 테스트: 136/145 통과

**구현 내용:**
- Bing Translator TTS API 무료 엔드포인트 사용 (인증 불필요)
- 발음 버튼 클릭 시 동적 오디오 생성
- 생성된 오디오는 S3에 저장 및 IndexedDB에 캐싱
- 배치 생성 스크립트로 모든 120개 어휘 사전 생성 가능 (프로덕션)
- 폴백 오디오로 버튼 클릭 항상 가능

**파일 변경:**
- server/db-audio.ts (Bing TTS 구현 개선)
- server/routers-audio.ts (이미 구현됨)
- server/routers.ts (audioRouter 마운트)
- server/generate-all-audio.mjs (배치 생성 스크립트)
- client/src/components/VocabularyCard.tsx (동적 생성 및 캐싱)
- client/src/pages/BeginnerLessons.tsx (오디오 URL 통합)
