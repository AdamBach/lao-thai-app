import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Mic, Square, Play, Volume2 } from "lucide-react";
import BackButton from "@/components/BackButton";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

interface PitchPoint {
  time: number;
  frequency: number;
}

export default function PronunciationPractice() {
  const { user } = useAuth();
  const [language, setLanguage] = useState<"lao" | "thai">("lao");
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<any>(null);
  const [pitchVisualization, setPitchVisualization] = useState<PitchPoint[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const recordedBlobRef = useRef<Blob | null>(null);

  // Fetch exercises
  const exercisesQuery = trpc.pronunciation.getExercises.useQuery({
    language,
  });

  const submitRecordingMutation = trpc.pronunciation.submitRecording.useMutation();

  // Initialize audio context for pitch analysis
  const initializeAudioContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = await initializeAudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      source.connect(analyser);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        recordedBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Analyze pitch in real-time
      analyzePitch();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("마이크에 접근할 수 없습니다. 권한을 확인해주세요.");
    }
  };

  // Analyze pitch from audio stream
  const analyzePitch = () => {
    if (!analyserRef.current || !isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Find peak frequency (simplified pitch detection)
    let maxValue = 0;
    let maxIndex = 0;
    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }

    const nyquist = (audioContextRef.current?.sampleRate || 44100) / 2;
    const frequency = (maxIndex * nyquist) / analyserRef.current.frequencyBinCount;

    setPitchVisualization((prev) => [
      ...prev.slice(-99), // Keep last 100 points
      {
        time: Date.now() - recordingStartTimeRef.current,
        frequency: Math.max(0, frequency),
      },
    ]);

    requestAnimationFrame(analyzePitch);
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Submit recording for analysis
  const submitRecording = async () => {
    if (!recordedBlobRef.current || !selectedExercise || !user) {
      toast.error("녹음 파일 또는 연습 항목이 없습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert blob to base64 for transmission
      const audioBase64 = await blobToBase64(recordedBlobRef.current);

      const duration = Date.now() - recordingStartTimeRef.current;

      // Submit to backend for S3 upload and analysis
      const result = await submitRecordingMutation.mutateAsync({
        exerciseId: selectedExercise.id,
        audioData: audioBase64, // Send base64 encoded audio
        duration,
      });

      setFeedbackResult(result);
      toast.success("발음 분석이 완료되었습니다!");

      // Clean up blob URL
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      setRecordedAudioUrl("");
      recordedBlobRef.current = null;
    } catch (error) {
      console.error("Error submitting recording:", error);
      toast.error("발음 분석 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Play reference audio
  const playReferenceAudio = () => {
    if (selectedExercise?.audioUrl) {
      const audio = new Audio(selectedExercise.audioUrl);
      audio.play();
    }
  };

  // Play recorded audio
  const playRecordedAudio = () => {
    if (recordedAudioUrl) {
      const audio = new Audio(recordedAudioUrl);
      audio.play();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">발음 연습</h1>
            <p className="text-lg text-gray-600">라오어와 태국어 발음을 완벽하게 마스터하세요</p>
          </div>
        </div>

        {/* Language Selection */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={language === "lao" ? "default" : "outline"}
            onClick={() => {
              setLanguage("lao");
              setSelectedExercise(null);
              setFeedbackResult(null);
            }}
            className="flex-1"
          >
            라오어
          </Button>
          <Button
            variant={language === "thai" ? "default" : "outline"}
            onClick={() => {
              setLanguage("thai");
              setSelectedExercise(null);
              setFeedbackResult(null);
            }}
            className="flex-1"
          >
            태국어
          </Button>
        </div>

        {/* Exercise Selection */}
        {!selectedExercise && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {exercisesQuery.data?.map((exercise) => (
              <Card
                key={exercise.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedExercise(exercise)}
              >
                <div className="text-3xl font-bold text-indigo-600 mb-2">{exercise.word}</div>
                <div className="text-gray-600 mb-2">{exercise.romanization}</div>
                <div className="text-sm text-gray-500 mb-3">{exercise.englishTranslation}</div>
                <div className="flex items-center gap-2 text-xs bg-indigo-50 px-3 py-1 rounded-full w-fit">
                  <span className="font-semibold">{exercise.category}</span>
                  <span className="text-indigo-600">•</span>
                  <span>{exercise.difficulty}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Recording Interface */}
        {selectedExercise && (
          <div className="space-y-6">
            {/* Exercise Display */}
            <Card className="p-8 bg-white shadow-lg">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-indigo-600 mb-3">{selectedExercise.word}</div>
                <div className="text-2xl text-gray-600 mb-4">{selectedExercise.romanization}</div>
                <div className="text-lg text-gray-700 mb-6">{selectedExercise.englishTranslation}</div>

                {/* Reference Audio Button */}
                {selectedExercise.audioUrl && (
                  <Button
                    onClick={playReferenceAudio}
                    variant="outline"
                    className="gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    표준 발음 듣기
                  </Button>
                )}
              </div>

              {/* Tone Pattern Display */}
              {selectedExercise.tonePattern && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-600 mb-2">성조 패턴:</p>
                  <p className="text-lg font-semibold text-indigo-600">{selectedExercise.tonePattern}</p>
                </div>
              )}
            </Card>

            {/* Recording Controls */}
            <Card className="p-8 bg-white shadow-lg">
              <div className="text-center space-y-4">
                {!isRecording && !recordedAudioUrl && (
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="w-full gap-2 bg-red-500 hover:bg-red-600"
                  >
                    <Mic className="w-5 h-5" />
                    녹음 시작
                  </Button>
                )}

                {isRecording && (
                  <>
                    <div className="flex items-center justify-center gap-2 text-red-500 text-lg font-semibold">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      녹음 중...
                    </div>
                    <Button
                      onClick={stopRecording}
                      size="lg"
                      className="w-full gap-2 bg-gray-500 hover:bg-gray-600"
                    >
                      <Square className="w-5 h-5" />
                      녹음 중지
                    </Button>
                  </>
                )}

                {recordedAudioUrl && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-green-700 font-semibold mb-2">✓ 녹음 완료</p>
                      <Button
                        onClick={playRecordedAudio}
                        variant="outline"
                        className="w-full gap-2 mb-2"
                      >
                        <Play className="w-4 h-4" />
                        내 녹음 재생
                      </Button>
                    </div>
                    <Button
                      onClick={submitRecording}
                      disabled={isSubmitting}
                      size="lg"
                      className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          분석 중...
                        </>
                      ) : (
                        "발음 분석 제출"
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        if (recordedAudioUrl) {
                          URL.revokeObjectURL(recordedAudioUrl);
                        }
                        setRecordedAudioUrl("");
                        recordedBlobRef.current = null;
                        setPitchVisualization([]);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      다시 녹음
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {/* Pitch Visualization */}
            {pitchVisualization.length > 0 && (
              <Card className="p-6 bg-white shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">성조 시각화</h3>
                <div className="h-48 bg-gradient-to-b from-blue-50 to-indigo-50 rounded-lg p-4 flex items-end gap-1">
                  {pitchVisualization.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-indigo-600 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                      style={{
                        height: `${Math.min(100, (point.frequency / 1000) * 100)}%`,
                      }}
                      title={`${point.frequency.toFixed(0)} Hz`}
                    />
                  ))}
                </div>
              </Card>
            )}

            {/* Feedback Results */}
            {feedbackResult && (
              <Card className="p-6 bg-white shadow-lg border-2 border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">분석 결과</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">정확도 점수</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${feedbackResult.accuracy}%` }}
                        />
                      </div>
                      <span className="text-2xl font-bold text-green-600">{feedbackResult.accuracy}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">피드백</p>
                    <p className="text-gray-900">{feedbackResult.feedback}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">녹음 URL</p>
                    <p className="text-xs text-indigo-600 break-all font-mono bg-indigo-50 p-2 rounded">
                      {feedbackResult.audioUrl}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setSelectedExercise(null);
                    setFeedbackResult(null);
                    setPitchVisualization([]);
                  }}
                  className="w-full mt-4"
                >
                  다른 단어 연습
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
