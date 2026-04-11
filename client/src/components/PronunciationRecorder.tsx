import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, RotateCcw, Volume2, Loader2 } from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface PronunciationRecorderProps {
  expectedText: string;
  language: "thai" | "lao";
  onScored?: (result: {
    accuracy: number;
    transcribed: string;
    feedback: string;
    isCorrect: boolean;
  }) => void;
}

export default function PronunciationRecorder({
  expectedText,
  language,
  onScored,
}: PronunciationRecorderProps) {
  const {
    isRecording,
    isProcessing,
    audioBlob,
    recordingTime,
    startRecording,
    stopRecording,
    resetRecording,
    error,
  } = useAudioRecorder();

  const [isScoring, setIsScoring] = useState(false);
  const [scoringResult, setScoringResult] = useState<{
    accuracy: number;
    transcribed: string;
    feedback: string;
    isCorrect: boolean;
  } | null>(null);

  const scoreMutation = trpc.pronunciationScoring.scorePronunciation.useMutation();

  const handleStartRecording = async () => {
    setScoringResult(null);
    await startRecording();
  };

  const handleStopRecording = async () => {
    const blob = await stopRecording();
    if (blob) {
      await scoreRecording(blob);
    }
  };

  const scoreRecording = async (blob: Blob) => {
    try {
      setIsScoring(true);

      // Upload blob to S3 first
      const formData = new FormData();
      formData.append("file", blob);

      // For now, we'll create a data URL to pass to the scoring function
      const reader = new FileReader();
      reader.onload = async () => {
        const audioUrl = reader.result as string;

        scoreMutation.mutate(
          {
            audioUrl,
            expectedText,
            language,
          },
          {
            onSuccess: (result) => {
              setScoringResult(result);
              if (onScored) {
                onScored(result);
              }

              if (result.isCorrect) {
                toast.success("완벽합니다! 발음이 정확합니다.");
              } else if (result.accuracy >= 70) {
                toast.success("좋습니다! 거의 맞았습니다.");
              } else {
                toast.error("다시 시도해보세요.");
              }
            },
            onError: (error) => {
              toast.error("발음 채점 중 오류가 발생했습니다.");
              console.error("Scoring error:", error);
            },
          }
        );
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      toast.error("발음 채점 중 오류가 발생했습니다.");
      console.error("Error scoring recording:", err);
    } finally {
      setIsScoring(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const accuracyColor = scoringResult
    ? scoringResult.accuracy >= 90
      ? "text-green-600"
      : scoringResult.accuracy >= 70
        ? "text-blue-600"
        : "text-orange-600"
    : "text-slate-600";

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">발음 녹음</h3>
            <p className="text-sm text-slate-600">마이크 버튼을 눌러 발음을 녹음하세요</p>
          </div>
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-red-600">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center mb-4">
          {!isRecording && !audioBlob ? (
            <Button
              size="lg"
              className="gap-2 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleStartRecording}
              disabled={isProcessing || isScoring}
            >
              <Mic className="w-5 h-5" />
              녹음 시작
            </Button>
          ) : isRecording ? (
            <Button
              size="lg"
              variant="destructive"
              className="gap-2"
              onClick={handleStopRecording}
              disabled={isProcessing || isScoring}
            >
              <Square className="w-5 h-5" />
              녹음 중지
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={resetRecording}
                disabled={isScoring}
              >
                <RotateCcw className="w-5 h-5" />
                다시 녹음
              </Button>
              {audioBlob && (
                <Button
                  size="lg"
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => scoreRecording(audioBlob)}
                  disabled={isScoring}
                >
                  {isScoring ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      채점 중...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5" />
                      채점하기
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>

        {error && <div className="text-sm text-red-600 text-center">{error}</div>}
      </Card>

      {/* Scoring Result */}
      {scoringResult && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">정확도</p>
              <p className={`text-4xl font-bold ${accuracyColor}`}>
                {scoringResult.accuracy.toFixed(1)}%
              </p>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-600 mb-1">인식된 텍스트</p>
                <p className="text-sm font-medium text-slate-900 bg-white p-2 rounded">
                  {scoringResult.transcribed || "(인식 실패)"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-600 mb-1">예상 텍스트</p>
                <p className="text-sm font-medium text-slate-900 bg-white p-2 rounded">
                  {expectedText}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-600 mb-1">피드백</p>
                <p className="text-sm text-slate-700 bg-white p-2 rounded">
                  {scoringResult.feedback}
                </p>
              </div>
            </div>

            {scoringResult.isCorrect && (
              <div className="text-center p-3 bg-green-100 rounded-lg">
                <p className="text-sm font-semibold text-green-700">✓ 정답입니다!</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
