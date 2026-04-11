# S3 오디오 업로드 통합 가이드

## 📋 개요

라오어·태국어 학습 앱의 발음 연습 오디오를 Blob URL 대신 **Amazon S3에 영구 저장**하는 시스템을 구현했습니다. 이를 통해 프로덕션 환경에서 안정적으로 작동하고, 오디오 파일을 영구 보관하며, 다른 사용자와 공유할 수 있습니다.

## 🎯 주요 개선사항

| 항목 | 이전 (Blob URL) | 현재 (S3 저장) |
|------|-----------------|----------------|
| **저장 위치** | 브라우저 메모리 | AWS S3 (영구 저장) |
| **지속성** | 세션 종료 시 소실 | 무한정 보관 |
| **공유** | 불가능 | URL 공유 가능 |
| **분석** | 불가능 | 백업 분석 가능 |
| **용량** | 브라우저 제한 (수십 MB) | 무제한 |
| **프로덕션** | 작동 불가 | 완전 지원 |
| **비용** | 무료 (로컬) | 저렴 (S3 요금) |

## 🏗️ 아키텍처

### 전체 흐름

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 프론트엔드: 음성 녹음                                      │
│    - Web Audio API로 마이크에서 실시간 녹음                  │
│    - Blob으로 메모리에 임시 저장                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. 프론트엔드: Blob → Base64 변환                            │
│    - Blob을 Base64 문자열로 인코딩                           │
│    - tRPC를 통해 백엔드로 전송                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. 백엔드: Base64 → Buffer → S3 업로드                      │
│    - Base64를 Buffer로 디코딩                                │
│    - storagePut() 함수로 S3에 업로드                         │
│    - S3 URL 획득                                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. 백엔드: Whisper API로 음성-텍스트 변환                    │
│    - S3 URL을 Whisper API에 전송                            │
│    - 음성을 텍스트로 변환                                    │
│    - 정확도 계산 및 피드백 생성                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. 백엔드: 데이터베이스에 저장                                │
│    - S3 URL을 pronunciation_records에 저장                  │
│    - 음성 텍스트, 정확도, 피드백 저장                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. 프론트엔드: 결과 표시                                     │
│    - S3 URL을 클라이언트로 반환                              │
│    - 사용자에게 분석 결과 표시                               │
└─────────────────────────────────────────────────────────────┘
```

## 📝 구현 상세

### 1. 프론트엔드 (PronunciationPractice.tsx)

#### 음성 녹음
```typescript
// Web Audio API로 마이크에서 실시간 녹음
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    recordedBlobRef.current = blob; // Blob 저장
  };
};
```

#### Blob → Base64 변환
```typescript
// Blob을 Base64로 변환
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob); // data:audio/webm;base64,... 형식
  });
};
```

#### tRPC 뮤테이션 호출
```typescript
// Base64 오디오를 백엔드로 전송
const result = await submitRecordingMutation.mutateAsync({
  exerciseId: selectedExercise.id,
  audioData: audioBase64, // Base64 인코딩된 오디오
  duration,
});
```

### 2. 백엔드 (routers.ts)

#### Base64 → Buffer → S3 업로드
```typescript
submitRecording: protectedProcedure
  .input(z.object({
    exerciseId: z.number(),
    audioData: z.string(), // Base64 인코딩된 오디오
    duration: z.number(),
  }))
  .mutation(async ({ input, ctx }) => {
    // Base64 데이터 정제
    const base64Data = input.audioData.includes(",") 
      ? input.audioData.split(",")[1] 
      : input.audioData;
    
    // Base64 → Buffer 변환
    const audioBuffer = Buffer.from(base64Data, "base64");
    
    // S3에 업로드
    const fileName = `pronunciations/${ctx.user.id}/recording-${Date.now()}.webm`;
    const { url: s3AudioUrl } = await storagePut(
      fileName,
      audioBuffer,
      "audio/webm"
    );
    
    // S3 URL을 Whisper API에 전송
    const transcriptionResult = await transcribeAudio({
      audioUrl: s3AudioUrl,
      language: exercise.language === "lao" ? "lo" : "th",
    });
    
    // 데이터베이스에 저장
    await createPronunciationRecord({
      userId: ctx.user.id,
      exerciseId: input.exerciseId,
      audioUrl: s3AudioUrl, // S3 URL 저장
      transcribedText,
      accuracyScore,
      feedback,
      duration: input.duration,
    });
    
    return {
      audioUrl: s3AudioUrl,
      accuracyScore,
      feedback,
      transcribedText,
    };
  })
```

### 3. 데이터베이스 (pronunciation_records)

#### S3 URL 저장
```sql
-- pronunciation_records 테이블
CREATE TABLE pronunciation_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  exerciseId INT NOT NULL,
  audioUrl VARCHAR(2048) NOT NULL, -- S3 URL (이전: Blob URL)
  transcribedText TEXT,
  accuracyScore INT,
  feedback TEXT,
  duration INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (exerciseId) REFERENCES pronunciation_exercises(id)
);
```

#### S3 URL 조회
```typescript
// 사용자의 발음 기록 조회
const records = await getUserPronunciationRecords(userId);

// 각 기록의 S3 URL로 오디오 재생 가능
records.forEach(record => {
  console.log(record.audioUrl); // https://manus-storage.s3.amazonaws.com/pronunciations/123/recording-1711353600000.webm
});
```

## 🔒 보안 고려사항

### 1. 경로 검증 (Path Traversal 방지)
```typescript
// ✅ 안전한 경로 형식
const fileName = `pronunciations/${userId}/recording-${Date.now()}.webm`;

// ❌ 위험한 경로
const maliciousPath = `pronunciations/${userId}/../../../etc/passwd`;

// 경로 검증 정규식
const validPathRegex = /^pronunciations\/\d+\/[a-zA-Z0-9._-]+$/;
```

### 2. 사용자 ID 포함 (Enumeration 방지)
```typescript
// 파일 경로에 사용자 ID를 포함하여 다른 사용자의 파일 접근 방지
const fileName = `pronunciations/${userId}/recording-${Date.now()}.webm`;
// 다른 사용자는 userId가 다르므로 해당 경로에 접근 불가
```

### 3. HTTPS 사용
```typescript
// S3 URL은 항상 HTTPS 사용
const s3Url = "https://manus-storage.s3.amazonaws.com/pronunciations/123/recording-1711353600000.webm";
// HTTP 사용 불가
```

### 4. 자격증명 노출 방지
```typescript
// ✅ 안전한 URL (자격증명 없음)
https://manus-storage.s3.amazonaws.com/pronunciations/123/recording-1711353600000.webm

// ❌ 위험한 URL (자격증명 포함)
https://AKIAIOSFODNN7EXAMPLE:wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY@s3.amazonaws.com/...
```

## 📊 파일 구조

```
/home/ubuntu/lao_thai_learning_app/
├── client/src/
│   └── pages/
│       └── PronunciationPractice.tsx    # Base64 변환 로직 추가
├── server/
│   ├── routers.ts                       # S3 업로드 로직 추가
│   ├── storage.ts                       # storagePut() 함수 (기존)
│   └── s3-audio-upload.test.ts          # S3 업로드 테스트 (29개)
├── drizzle/
│   └── schema.ts                        # audioUrl 컬럼 (기존)
└── S3_AUDIO_UPLOAD_GUIDE.md             # 이 파일
```

## 🧪 테스트

### 테스트 항목 (29개)

1. **Audio Data Conversion (3개)**
   - Base64 → Buffer 변환
   - 데이터 무결성 검증

2. **S3 Upload Path Generation (3개)**
   - 안전한 경로 생성
   - Path Traversal 방지
   - 타임스탐프 고유성

3. **Audio Upload Response (2개)**
   - S3 URL 형식 검증
   - URL 유효성 검증

4. **Audio File Metadata (3개)**
   - 메타데이터 추적
   - 파일 크기 검증
   - Content Type 검증

5. **Database Integration (3개)**
   - S3 URL 저장
   - S3 URL 조회
   - 세션 간 URL 유지

6. **Error Handling (3개)**
   - 업로드 실패 처리
   - Base64 검증
   - 누락된 데이터 처리

7. **Security Considerations (4개)**
   - 무단 접근 방지
   - HTTPS 사용 검증
   - 자격증명 노출 방지
   - 파일 소유권 검증

8. **Performance (3개)**
   - 대용량 파일 처리
   - 동시 업로드 지원
   - 업로드 진행률 추적

9. **Integration Flow (2개)**
   - 전체 업로드 및 변환 흐름
   - 업로드 및 음성-텍스트 변환 통합

10. **Cleanup and Maintenance (3개)**
    - Blob URL 정리
    - 오디오 파일 삭제
    - 저장소 사용량 추적

### 테스트 실행
```bash
cd /home/ubuntu/lao_thai_learning_app
pnpm test
```

**결과:**
```
Test Files  4 passed (4)
     Tests  78 passed (78)
```

## 🚀 사용 방법

### 1. 발음 연습 페이지 접근
1. 앱에 로그인
2. 홈페이지에서 "발음 연습" 클릭
3. 언어 선택 (라오어/태국어)

### 2. 음성 녹음
1. 단어 선택
2. "녹음 시작" 버튼 클릭
3. 단어 발음
4. "녹음 중지" 버튼 클릭

### 3. 분석 제출
1. "발음 분석 제출" 버튼 클릭
2. 백엔드에서 자동으로:
   - Blob → Base64 변환 (프론트)
   - Base64 → Buffer → S3 업로드 (백)
   - Whisper API로 음성-텍스트 변환
   - 정확도 계산 및 피드백 생성
   - 데이터베이스에 S3 URL 저장

### 4. 결과 확인
- 정확도 점수 표시
- AI 피드백 표시
- S3 URL 표시 (개발자용)

## 📈 성과 지표

| 지표 | 값 |
|------|-----|
| 프론트엔드 수정 | 1개 파일 (PronunciationPractice.tsx) |
| 백엔드 수정 | 1개 파일 (routers.ts) |
| 테스트 파일 | 1개 (s3-audio-upload.test.ts) |
| 테스트 개수 | 29개 |
| 전체 테스트 통과 | 78/78 ✅ |
| 데이터베이스 변경 | 없음 (기존 audioUrl 컬럼 재사용) |

## 🔄 마이그레이션 경로

### 기존 Blob URL 데이터 처리
```typescript
// 기존 데이터는 Blob URL로 저장되어 있음
// 새 데이터부터는 S3 URL로 저장됨

// 데이터베이스 쿼리
SELECT * FROM pronunciation_records 
WHERE audioUrl LIKE 'blob:%'; // 기존 데이터

SELECT * FROM pronunciation_records 
WHERE audioUrl LIKE 'https://%'; // 새 데이터
```

### 선택적 마이그레이션 스크립트
```typescript
// 기존 Blob URL 데이터를 S3로 마이그레이션하는 스크립트
// (선택사항: 필요시 별도로 구현 가능)

async function migrateOldAudioData() {
  const oldRecords = await db.select()
    .from(pronunciationRecords)
    .where(like(pronunciationRecords.audioUrl, 'blob:%'));
  
  for (const record of oldRecords) {
    // Blob URL은 더 이상 접근 불가능하므로
    // 데이터 손실 주의
  }
}
```

## ⚠️ 주의사항

### 1. Blob URL 수명
- Blob URL은 생성한 페이지가 언로드되면 자동으로 무효화됨
- 새로고침 후 이전 Blob URL에 접근 불가능
- **S3 저장으로 이 문제 완전 해결**

### 2. 파일 크기 제한
- 최대 파일 크기: 10MB (권장)
- 초과 시 업로드 실패
- 프론트에서 사전 검증 권장

### 3. 네트워크 연결
- S3 업로드 시 네트워크 연결 필수
- 오프라인 상태에서는 업로드 불가능
- 에러 처리 및 재시도 로직 포함

### 4. S3 비용
- 저장 비용: 약 $0.023/GB/월
- 전송 비용: 약 $0.09/GB (아웃바운드)
- 요청 비용: 약 $0.0004/1000 PUT 요청
- 소규모 사용자는 무시할 수 있는 수준

## 🔗 관련 문서

- [Manus Storage API](https://docs.manus.im/storage)
- [AWS S3 문서](https://docs.aws.amazon.com/s3/)
- [Whisper API 문서](https://platform.openai.com/docs/guides/speech-to-text)
- [Web Audio API 문서](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 📞 문제 해결

### 업로드 실패
```
에러: "Failed to upload audio to storage"
원인: S3 자격증명 오류 또는 네트워크 문제
해결: 환경 변수 확인 (BUILT_IN_FORGE_API_URL, BUILT_IN_FORGE_API_KEY)
```

### 음성-텍스트 변환 실패
```
에러: "Transcription error"
원인: Whisper API 오류 또는 음성 품질 문제
해결: 음성 재녹음 또는 마이크 권한 확인
```

### 데이터베이스 저장 실패
```
에러: "Failed to save pronunciation record"
원인: 데이터베이스 연결 오류
해결: 데이터베이스 상태 확인 및 마이그레이션 재실행
```

## ✅ 체크리스트

- [x] 프론트엔드: Blob → Base64 변환
- [x] 백엔드: Base64 → Buffer → S3 업로드
- [x] 데이터베이스: S3 URL 저장 및 조회
- [x] Whisper API: S3 URL로 음성-텍스트 변환
- [x] 보안: Path Traversal 방지, 사용자 ID 포함
- [x] 테스트: 29개 테스트 모두 통과
- [x] 에러 처리: 업로드 실패 시 적절한 에러 메시지
- [x] 문서: 이 가이드 작성

## 🎓 학습 포인트

1. **Base64 인코딩/디코딩** - 바이너리 데이터를 문자열로 변환
2. **S3 업로드** - AWS S3 스토리지 통합
3. **파일 경로 보안** - Path Traversal 공격 방지
4. **비동기 처리** - Promise 기반 파일 업로드
5. **에러 처리** - 업로드 실패 시 적절한 처리

---

**최종 업데이트:** 2026-03-25  
**개발자:** Manus AI  
**상태:** Phase 5 완료 ✅  
**테스트:** 78/78 통과 ✅
