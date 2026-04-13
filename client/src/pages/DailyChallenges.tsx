"use client";
import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, XCircle, Zap, Flame, RotateCcw, Trophy } from "lucide-react";
import BottomNav from "@/components/BottomNav";

type Language = "thai" | "lao";
type QuizMode = "word-to-meaning" | "meaning-to-word";

interface VocabItem {
  id: number;
  thai?: string;
  lao?: string;
  english?: string;
  romanization?: string;
}

interface Question {
  item: VocabItem;
  options: string[];   // 4 English options (word→meaning) OR 4 native options (meaning→word)
  correct: string;
  mode: QuizMode;
}

const QUIZ_LENGTH = 10;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestions(deck: VocabItem[], mode: QuizMode, count: number): Question[] {
  if (deck.length < 4) return [];
  const shuffled = shuffle(deck).slice(0, count);
  return shuffled.map(item => {
    const wrong = shuffle(deck.filter(d => d.id !== item.id)).slice(0, 3);
    if (mode === "word-to-meaning") {
      const correct = item.english || "";
      const options = shuffle([correct, ...wrong.map(w => w.english || "")]);
      return { item, options, correct, mode };
    } else {
      const word = (item as any)["thai"] || (item as any)["lao"] || "";
      const correct = word;
      const options = shuffle([correct, ...wrong.map(w => (w as any)["thai"] || (w as any)["lao"] || "")]);
      return { item, options, correct, mode };
    }
  });
}

export default function DailyChallenges() {
  const [language, setLanguage] = useState<Language>("thai");
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [quizMode, setQuizMode] = useState<QuizMode>("word-to-meaning");

  const { data: lessonsData, isLoading } = trpc.beginnerLessons.getLessons.useQuery({ language });

  const deck = useMemo<VocabItem[]>(() => {
    if (!lessonsData) return [];
    const items: VocabItem[] = [];
    lessonsData.forEach(lesson => {
      try {
        const content = JSON.parse(lesson.content as string);
        content.forEach((item: any) => {
          if (item.english && (item.thai || item.lao)) {
            items.push({ id: items.length, ...item });
          }
        });
      } catch {}
    });
    return items;
  }, [lessonsData]);

  const startQuiz = () => {
    const qs = buildQuestions(deck, quizMode, QUIZ_LENGTH);
    setQuestions(qs);
    setCurrentQ(0);
    setSelected(null);
    setXp(0);
    setStreak(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setDone(false);
    setQuizStarted(true);
  };

  const handleAnswer = (option: string) => {
    if (selected !== null) return;
    setSelected(option);

    const isCorrect = option === questions[currentQ]?.correct;
    if (isCorrect) {
      setXp(x => x + 10);
      setCorrectCount(c => c + 1);
      setCurrentStreak(s => {
        const ns = s + 1;
        setBestStreak(b => Math.max(b, ns));
        return ns;
      });
      setStreak(s => s + 1);
    } else {
      setCurrentStreak(0);
    }

    setTimeout(() => {
      setSelected(null);
      if (currentQ >= questions.length - 1) {
        setDone(true);
      } else {
        setCurrentQ(q => q + 1);
      }
    }, 900);
  };

  const q = questions[currentQ];
  const nativeWord = language === "thai" ? q?.item?.thai : q?.item?.lao;
  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white/40">Loading challenges...</div>
      </div>
    );
  }

  // Done screen
  if (done && quizStarted) {
    return (
      <div className="min-h-screen bg-background pb-24 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-yellow-400/15 border-2 border-yellow-400/30 flex items-center justify-center mb-6">
            <Trophy className="w-12 h-12 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Challenge Complete!</h1>
          <p className="text-white/40 mb-8">{accuracy >= 80 ? "Outstanding work! 🔥" : accuracy >= 60 ? "Good effort! Keep going!" : "Keep practicing, you'll improve!"}</p>

          <div className="w-full max-w-xs bg-card border border-white/8 rounded-2xl p-5 grid grid-cols-3 gap-3 text-center mb-4">
            <div>
              <div className="text-2xl font-bold text-yellow-400">+{xp}</div>
              <div className="text-white/40 text-xs mt-0.5">XP earned ⚡</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{accuracy}%</div>
              <div className="text-white/40 text-xs mt-0.5">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">{bestStreak}</div>
              <div className="text-white/40 text-xs mt-0.5">Best streak 🔥</div>
            </div>
          </div>

          {/* Accuracy bar */}
          <div className="w-full max-w-xs mb-6">
            <div className="h-2 bg-white/8 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${accuracy >= 80 ? "bg-green-400" : accuracy >= 60 ? "bg-blue-500" : "bg-orange-400"}`}
                style={{ width: `${accuracy}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-white/30 text-xs">{correctCount}/{questions.length} correct</span>
              <span className="text-white/30 text-xs">{accuracy >= 80 ? "Excellent!" : accuracy >= 60 ? "Good" : "Keep going"}</span>
            </div>
          </div>

          <button
            onClick={() => { setQuizStarted(false); setDone(false); }}
            className="w-full max-w-xs py-4 rounded-2xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-400 transition-all blue-glow"
          >
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Quiz screen
  if (quizStarted && q) {
    const isCorrect = selected === q.correct;
    return (
      <div className="min-h-screen bg-background pb-24 flex flex-col">
        {/* Top bar */}
        <div className="px-5 pt-12 pb-3 flex items-center justify-between">
          <button onClick={() => setQuizStarted(false)} className="text-white/40 hover:text-white/70 text-sm transition-colors">✕ Quit</button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-orange-400 font-bold text-sm">
              <Flame className="w-4 h-4" /> {streak}
            </div>
            <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-sm">
              <Zap className="w-4 h-4" /> {xp} XP
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="px-5 mb-6">
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                i < currentQ ? "bg-blue-500" : i === currentQ ? "bg-blue-400" : "bg-white/10"
              }`} />
            ))}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-white/30 text-xs">{currentQ + 1} / {questions.length}</span>
            <span className="text-white/30 text-xs">{correctCount} correct</span>
          </div>
        </div>

        {/* Question */}
        <div className="px-5 flex-1 flex flex-col">
          <div className="bg-card border border-white/8 rounded-3xl p-8 text-center mb-6">
            {q.mode === "word-to-meaning" ? (
              <>
                <p className="text-white/30 text-sm mb-4">What does this mean?</p>
                <div className="text-6xl font-bold text-white mb-3">{nativeWord}</div>
                {q.item.romanization && (
                  <div className="text-blue-400/70 text-lg">{q.item.romanization}</div>
                )}
              </>
            ) : (
              <>
                <p className="text-white/30 text-sm mb-4">Which {language === "thai" ? "Thai" : "Lao"} word means this?</p>
                <div className="text-4xl font-bold text-white">{q.item.english}</div>
              </>
            )}
          </div>

          {/* Answer options */}
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, i) => {
              const isSelected = selected === opt;
              const isRight = opt === q.correct;
              let style = "bg-card border-white/10 text-white hover:border-blue-500/40 hover:bg-blue-500/5";
              if (selected !== null) {
                if (isRight) style = "bg-green-400/15 border-green-400/40 text-green-300";
                else if (isSelected && !isRight) style = "bg-red-400/15 border-red-400/40 text-red-300";
                else style = "bg-card border-white/5 text-white/30";
              }
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  disabled={selected !== null}
                  className={`border rounded-2xl p-4 text-center font-semibold transition-all active:scale-95 disabled:cursor-default ${style}`}
                >
                  <span className="text-sm leading-snug break-words">{opt || "—"}</span>
                  {selected !== null && isRight && (
                    <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto mt-1" />
                  )}
                  {selected !== null && isSelected && !isRight && (
                    <XCircle className="w-4 h-4 text-red-400 mx-auto mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Streak bonus notice */}
          {streak > 0 && streak % 3 === 0 && selected !== null && isCorrect && (
            <div className="mt-4 bg-orange-400/10 border border-orange-400/20 rounded-xl px-4 py-2.5 flex items-center gap-2 justify-center">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-semibold text-sm">{streak} streak! Bonus XP! 🔥</span>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    );
  }

  // Start screen
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Daily Challenge</h1>
          <p className="text-white/40 text-sm mt-0.5">Test your knowledge • Earn XP</p>
        </div>
        <div className="flex bg-card border border-white/8 rounded-xl overflow-hidden">
          <button
            onClick={() => setLanguage("thai")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${language === "thai" ? "bg-blue-500 text-white" : "text-white/40 hover:text-white/70"}`}
          >
            ไทย
          </button>
          <button
            onClick={() => setLanguage("lao")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${language === "lao" ? "bg-blue-500 text-white" : "text-white/40 hover:text-white/70"}`}
          >
            ລາວ
          </button>
        </div>
      </div>

      {/* Quiz type selector */}
      <div className="px-5 mb-5">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-3 font-medium">Quiz Mode</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setQuizMode("word-to-meaning")}
            className={`rounded-2xl p-4 text-left border transition-all ${quizMode === "word-to-meaning" ? "bg-blue-500/10 border-blue-500/40" : "bg-card border-white/8 hover:border-white/20"}`}
          >
            <div className="text-2xl mb-2">{language === "thai" ? "ไทย" : "ລາວ"} → 🇬🇧</div>
            <div className={`font-semibold text-sm ${quizMode === "word-to-meaning" ? "text-blue-400" : "text-white"}`}>Word → Meaning</div>
            <div className="text-white/30 text-xs mt-0.5">See native word, pick English</div>
          </button>
          <button
            onClick={() => setQuizMode("meaning-to-word")}
            className={`rounded-2xl p-4 text-left border transition-all ${quizMode === "meaning-to-word" ? "bg-blue-500/10 border-blue-500/40" : "bg-card border-white/8 hover:border-white/20"}`}
          >
            <div className="text-2xl mb-2">🇬🇧 → {language === "thai" ? "ไทย" : "ລາວ"}</div>
            <div className={`font-semibold text-sm ${quizMode === "meaning-to-word" ? "text-blue-400" : "text-white"}`}>Meaning → Word</div>
            <div className="text-white/30 text-xs mt-0.5">See English, pick native script</div>
          </button>
        </div>
      </div>

      {/* Stats preview */}
      <div className="px-5 mb-5">
        <div className="bg-card border border-white/8 rounded-2xl p-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-white font-bold text-lg">{QUIZ_LENGTH}</div>
            <div className="text-white/40 text-xs">Questions</div>
          </div>
          <div className="border-x border-white/8">
            <div className="text-yellow-400 font-bold text-lg">+100</div>
            <div className="text-white/40 text-xs">Max XP ⚡</div>
          </div>
          <div>
            <div className="text-white font-bold text-lg">{deck.length}</div>
            <div className="text-white/40 text-xs">Vocab pool</div>
          </div>
        </div>
      </div>

      {/* Start button */}
      <div className="px-5">
        <button
          onClick={startQuiz}
          disabled={deck.length < 4}
          className="w-full py-5 rounded-2xl bg-blue-500 text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-blue-400 transition-all blue-glow disabled:opacity-30 disabled:cursor-not-allowed active:scale-98"
        >
          <Flame className="w-6 h-6" /> Start Challenge
        </button>
        {deck.length < 4 && (
          <p className="text-white/30 text-xs text-center mt-2">Not enough vocabulary loaded. Please check back soon.</p>
        )}
      </div>

      {/* Tips */}
      <div className="px-5 mt-5">
        <div className="space-y-2">
          {[
            { icon: "🔥", text: "Build streaks for bonus XP — answer 3+ in a row!" },
            { icon: "⚡", text: "Each correct answer earns 10 XP" },
            { icon: "📈", text: "Complete daily to climb the leaderboard" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-3 bg-card border border-white/8 rounded-xl px-4 py-3">
              <span className="text-base">{icon}</span>
              <span className="text-white/40 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
