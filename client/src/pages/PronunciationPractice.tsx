"use client";
import { useState, useRef } from "react";
import { Loader2, Mic, Square, Play, Volume2, ChevronLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";
import BottomNav from "@/components/BottomNav";

interface PitchPoint {
  time: number;
  frequency: number;
}

export default function PronunciationPractice() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [language, setLanguage] = useState<"lao" | "thai">("thai");
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

  const exercisesQuery = trpc.pronunciation.getExercises.useQuery({ language });
  const submitRecordingMutation = trpc.pronunciation.submitRecording.useMutation();

  const initializeAudioContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

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
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        recordedBlobRef.current = blob;
        setRecordedAudioUrl(URL.createObjectURL(blob));
      };
      mediaRecorder.start();
      setIsRecording(true);
      analyzePitch();
    } catch (error) {
      toast.error("Cannot access microphone. Please check permissions.");
    }
  };

  const analyzePitch = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    let maxValue = 0, maxIndex = 0;
    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > maxValue) { maxValue = dataArray[i]; maxIndex = i; }
    }
    const nyquist = (audioContextRef.current?.sampleRate || 44100) / 2;
    const frequency = (maxIndex * nyquist) / analyserRef.current.frequencyBinCount;
    setPitchVisualization(prev => [
      ...prev.slice(-99),
      { time: Date.now() - recordingStartTimeRef.current, frequency: Math.max(0, frequency) },
    ]);
    requestAnimationFrame(analyzePitch);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      streamRef.current?.getTracks().forEach(t => t.stop());
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const submitRecording = async () => {
    if (!recordedBlobRef.current || !selectedExercise || !user) {
      toast.error("No recording or exercise selected.");
      return;
    }
    setIsSubmitting(true);
    try {
      const audioBase64 = await blobToBase64(recordedBlobRef.current);
      const duration = Date.now() - recordingStartTimeRef.current;
      const result = await submitRecordingMutation.mutateAsync({
        exerciseId: selectedExercise.id,
        audioData: audioBase64,
        duration,
      });
      setFeedbackResult(result);
      toast.success("Analysis complete!");
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl("");
      recordedBlobRef.current = null;
    } catch (error) {
      toast.error("Error analyzing pronunciation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pronunciation</h1>
          <p className="text-white/40 text-sm mt-0.5">AI tone analysis & feedback</p>
        </div>
        <div className="flex bg-card border border-white/8 rounded-xl overflow-hidden">
          <button
            onClick={() => { setLanguage("thai"); setSelectedExercise(null); setFeedbackResult(null); }}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${language === "thai" ? "bg-blue-500 text-white" : "text-white/40 hover:text-white/70"}`}
          >
            ไทย Thai
          </button>
          <button
            onClick={() => { setLanguage("lao"); setSelectedExercise(null); setFeedbackResult(null); }}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${language === "lao" ? "bg-blue-500 text-white" : "text-white/40 hover:text-white/70"}`}
          >
            ລາວ Lao
          </button>
        </div>
      </div>

      <div className="px-5">
        {/* Exercise Selection */}
        {!selectedExercise && !feedbackResult && (
          <>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3 font-medium">Choose a word to practice</p>
            {exercisesQuery.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {exercisesQuery.data?.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => { setSelectedExercise(exercise); setPitchVisualization([]); }}
                    className="bg-card border border-white/8 rounded-2xl p-4 text-left hover:border-blue-500/40 hover:bg-blue-500/5 transition-all"
                  >
                    <div className="text-2xl font-bold text-blue-400 mb-1">{exercise.word}</div>
                    <div className="text-white/50 text-xs mb-1">{exercise.romanization}</div>
                    <div className="text-white/70 text-sm font-medium">{exercise.englishTranslation}</div>
                    <div className="mt-2 inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 rounded-lg px-2 py-0.5">
                      <span className="text-blue-400 text-xs font-semibold">{exercise.difficulty}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Recording Interface */}
        {selectedExercise && !feedbackResult && (
          <div className="space-y-4">
            {/* Back */}
            <button
              onClick={() => { setSelectedExercise(null); setPitchVisualization([]); setRecordedAudioUrl(""); recordedBlobRef.current = null; }}
              className="flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to exercises
            </button>

            {/* Word display */}
            <div className="bg-card border border-white/8 rounded-2xl p-6 text-center">
              <div className="text-5xl font-bold text-blue-400 mb-2">{selectedExercise.word}</div>
              <div className="text-white/50 text-lg mb-1">{selectedExercise.romanization}</div>
              <div className="text-white font-semibold">{selectedExercise.englishTranslation}</div>
              {selectedExercise.tonePattern && (
                <div className="mt-3 inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-1.5">
                  <span className="text-white/40 text-xs">Tone pattern:</span>
                  <span className="text-blue-400 text-sm font-semibold">{selectedExercise.tonePattern}</span>
                </div>
              )}
              {selectedExercise.audioUrl && (
                <button
                  onClick={() => new Audio(selectedExercise.audioUrl).play()}
                  className="mt-4 flex items-center gap-2 mx-auto bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
                >
                  <Volume2 className="w-4 h-4" /> Listen to native audio
                </button>
              )}
            </div>

            {/* Pitch visualization */}
            {pitchVisualization.length > 0 && (
              <div className="bg-card border border-white/8 rounded-2xl p-4">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-3 font-medium">Tone visualization</p>
                <div className="h-20 flex items-end gap-0.5 bg-blue-500/5 rounded-xl p-2">
                  {pitchVisualization.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-blue-500 rounded-t opacity-70"
                      style={{ height: `${Math.min(100, (point.frequency / 800) * 100)}%`, minHeight: 2 }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recording controls */}
            <div className="bg-card border border-white/8 rounded-2xl p-5 space-y-3">
              {!isRecording && !recordedAudioUrl && (
                <button
                  onClick={startRecording}
                  className="w-full py-4 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-400 transition-all blue-glow"
                >
                  <Mic className="w-5 h-5" /> Start Recording
                </button>
              )}
              {isRecording && (
                <>
                  <div className="flex items-center justify-center gap-2 text-red-400 font-semibold">
                    <div className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse" />
                    Recording...
                  </div>
                  <button
                    onClick={stopRecording}
                    className="w-full py-4 rounded-xl bg-white/10 border border-white/10 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/15 transition-all"
                  >
                    <Square className="w-5 h-5" /> Stop Recording
                  </button>
                </>
              )}
              {recordedAudioUrl && (
                <>
                  <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
                    <span className="text-blue-400 font-semibold text-sm">✓ Recording ready</span>
                  </div>
                  <button
                    onClick={() => new Audio(recordedAudioUrl).play()}
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                  >
                    <Play className="w-4 h-4" /> Play my recording
                  </button>
                  <button
                    onClick={submitRecording}
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-400 transition-all blue-glow disabled:opacity-50"
                  >
                    {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : "Analyze Pronunciation"}
                  </button>
                  <button
                    onClick={() => { if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl); setRecordedAudioUrl(""); recordedBlobRef.current = null; setPitchVisualization([]); }}
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 font-medium hover:bg-white/10 transition-all"
                  >
                    Record again
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Feedback Results */}
        {feedbackResult && (
          <div className="space-y-4">
            <div className="bg-card border border-white/8 rounded-2xl p-6">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-4 font-medium">Analysis Result</p>
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">Accuracy</span>
                  <span className="text-2xl font-bold text-blue-400">{feedbackResult.accuracy}%</span>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${feedbackResult.accuracy}%` }} />
                </div>
              </div>
              <div>
                <p className="text-white/40 text-sm mb-1">Feedback</p>
                <p className="text-white">{feedbackResult.feedback}</p>
              </div>
            </div>
            <button
              onClick={() => { setSelectedExercise(null); setFeedbackResult(null); setPitchVisualization([]); }}
              className="w-full py-4 rounded-2xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-400 transition-all blue-glow"
            >
              Practice another word
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
