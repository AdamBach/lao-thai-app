"use client";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Volume2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";

type Language = "thai" | "lao";

interface VocabItem {
  id: number;
  thai?: string;
  lao?: string;
  english?: string;
  romanization?: string;
  tonePattern?: string;
}

export default function PronunciationPractice() {
  const [language, setLanguage] = useState<Language>("thai");
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [learning, setLearning] = useState<Set<number>>(new Set());
  const [sessionDone, setSessionDone] = useState(false);

  // Pull all lessons for this language
  const { data: lessonsData, isLoading } = trpc.beginnerLessons.getLessons.useQuery({ language });

  // Flatten all vocabulary from all lessons into one deck
  const deck = useMemo<VocabItem[]>(() => {
    if (!lessonsData) return [];
    const items: VocabItem[] = [];
    lessonsData.forEach(lesson => {
      try {
        const content = JSON.parse(lesson.content as string);
        content.forEach((item: any, idx: number) => {
          items.push({ id: items.length, ...item });
        });
      } catch {}
    });
    return items;
  }, [lessonsData]);

  const card = deck[currentIndex];
  const word = language === "thai" ? card?.thai : card?.lao;
  const progress = deck.length > 0 ? ((currentIndex) / deck.length) * 100 : 0;

  const handleKnow = () => {
    setKnown(prev => new Set(prev).add(currentIndex));
    advance();
  };

  const handleLearning = () => {
    setLearning(prev => new Set(prev).add(currentIndex));
    advance();
  };

  const advance = () => {
    setFlipped(false);
    if (currentIndex >= deck.length - 1) {
      setSessionDone(true);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setLearning(new Set());
    setSessionDone(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white/40">Loading vocabulary...</div>
      </div>
    );
  }

  // Session complete screen
  if (sessionDone || (deck.length > 0 && currentIndex >= deck.length)) {
    const knownCount = known.size;
    const learningCount = learning.size;
    const pct = deck.length > 0 ? Math.round((knownCount / deck.length) * 100) : 0;
    return (
      <div className="min-h-screen bg-background pb-24 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center mb-6 blue-glow">
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Session Complete!</h1>
          <p className="text-white/40 mb-8">You reviewed all {deck.length} cards</p>

          <div className="w-full max-w-xs bg-card border border-white/8 rounded-2xl p-5 grid grid-cols-2 gap-4 text-center mb-6">
            <div>
              <div className="text-3xl font-bold text-green-400">{knownCount}</div>
              <div className="text-white/40 text-xs mt-0.5">I know it ✓</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400">{learningCount}</div>
              <div className="text-white/40 text-xs mt-0.5">Still learning</div>
            </div>
          </div>

          {/* Accuracy bar */}
          <div className="w-full max-w-xs mb-8">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white/40 text-xs">Recall rate</span>
              <span className="text-blue-400 font-bold text-sm">{pct}%</span>
            </div>
            <div className="h-2 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <button
            onClick={restart}
            className="w-full max-w-xs py-4 rounded-2xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-400 transition-all blue-glow"
          >
            <RotateCcw className="w-4 h-4" /> Practice Again
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Practice</h1>
          <p className="text-white/40 text-sm mt-0.5">Tap card to reveal meaning</p>
        </div>
        <div className="flex bg-card border border-white/8 rounded-xl overflow-hidden">
          <button
            onClick={() => { setLanguage("thai"); setCurrentIndex(0); setFlipped(false); setKnown(new Set()); setLearning(new Set()); setSessionDone(false); }}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${language === "thai" ? "bg-blue-500 text-white" : "text-white/40 hover:text-white/70"}`}
          >
            ไทย
          </button>
          <button
            onClick={() => { setLanguage("lao"); setCurrentIndex(0); setFlipped(false); setKnown(new Set()); setLearning(new Set()); setSessionDone(false); }}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${language === "lao" ? "bg-blue-500 text-white" : "text-white/40 hover:text-white/70"}`}
          >
            ລາວ
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/40 text-sm">{currentIndex + 1} / {deck.length}</span>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-green-400 font-semibold">✓ {known.size}</span>
            <span className="text-orange-400 font-semibold">↻ {learning.size}</span>
          </div>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 px-5 flex flex-col">
        {deck.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-white/40 text-lg">No vocabulary found</p>
              <p className="text-white/25 text-sm mt-1">Try switching language</p>
            </div>
          </div>
        ) : (
          <>
            {/* Flip card */}
            <div
              onClick={() => setFlipped(f => !f)}
              className="cursor-pointer flex-1 min-h-[320px] relative"
              style={{ perspective: "1000px" }}
            >
              <div
                className="w-full h-full transition-transform duration-500 relative"
                style={{
                  transformStyle: "preserve-3d",
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  minHeight: 320,
                }}
              >
                {/* Front — native word */}
                <div
                  className="absolute inset-0 bg-card border border-white/8 rounded-3xl flex flex-col items-center justify-center p-8 text-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <p className="text-white/25 text-xs uppercase tracking-widest mb-6 font-medium">
                    {language === "thai" ? "Thai" : "Lao"}
                  </p>
                  <div className="text-6xl font-bold text-white mb-4 leading-tight">
                    {word || "—"}
                  </div>
                  {card?.romanization && (
                    <div className="text-blue-400/70 text-xl">{card.romanization}</div>
                  )}
                  <div className="mt-8 flex items-center gap-2 text-white/20 text-sm">
                    <span>Tap to reveal meaning</span>
                  </div>
                </div>

                {/* Back — English */}
                <div
                  className="absolute inset-0 bg-blue-500/10 border border-blue-500/30 rounded-3xl flex flex-col items-center justify-center p-8 text-center"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <p className="text-blue-400/60 text-xs uppercase tracking-widest mb-4 font-medium">English</p>
                  <div className="text-4xl font-bold text-white mb-4">
                    {card?.english || "—"}
                  </div>
                  <div className="text-blue-400 text-2xl mb-2">{word}</div>
                  {card?.romanization && (
                    <div className="text-white/40 text-sm">{card.romanization}</div>
                  )}
                  {card?.tonePattern && (
                    <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2">
                      <span className="text-white/30 text-xs">Tone: </span>
                      <span className="text-blue-400 text-sm font-semibold">{card.tonePattern}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex gap-3 pb-2">
              {!flipped ? (
                <button
                  onClick={() => setFlipped(true)}
                  className="flex-1 py-4 rounded-2xl bg-blue-500 text-white font-bold text-lg hover:bg-blue-400 transition-all blue-glow"
                >
                  Show Answer
                </button>
              ) : (
                <>
                  <button
                    onClick={handleLearning}
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-orange-400/30 text-orange-400 font-bold flex items-center justify-center gap-2 hover:bg-orange-400/10 transition-all active:scale-95"
                  >
                    <XCircle className="w-5 h-5" /> Still learning
                  </button>
                  <button
                    onClick={handleKnow}
                    className="flex-1 py-4 rounded-2xl bg-green-400/15 border border-green-400/30 text-green-400 font-bold flex items-center justify-center gap-2 hover:bg-green-400/20 transition-all active:scale-95"
                  >
                    <CheckCircle className="w-5 h-5" /> I know it!
                  </button>
                </>
              )}
            </div>

            {/* Skip navigation */}
            <div className="flex items-center justify-between mt-2 pb-2">
              <button
                onClick={() => { setCurrentIndex(i => Math.max(0, i - 1)); setFlipped(false); }}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 text-white/25 hover:text-white/50 disabled:opacity-20 transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => { setFlipped(false); advance(); }}
                className="flex items-center gap-1 text-white/25 hover:text-white/50 transition-colors text-sm"
              >
                Skip <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
