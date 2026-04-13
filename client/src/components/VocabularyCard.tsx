"use client";
import { useState, useRef, useEffect } from "react";
import { Volume2, RotateCcw } from "lucide-react";
import { useSwipe } from "@/hooks/useSwipe";
import { useAudioCache } from "@/hooks/useAudioCache";
import { trpc } from "@/lib/trpc";

interface VocabularyItem {
  thai?: string;
  lao?: string;
  english?: string;
  romanization?: string;
  pronunciation?: string;
  number?: number;
  day?: string;
  month?: string;
  time?: string;
  phrase?: string;
  tonePattern?: string;
}

interface VocabularyCardProps {
  item: VocabularyItem;
  language: "thai" | "lao";
  audioUrl?: string;
  lessonId?: number;
  itemIndex?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export default function VocabularyCard({
  item,
  language,
  audioUrl,
  lessonId,
  itemIndex,
  onSwipeLeft,
  onSwipeRight,
}: VocabularyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(audioUrl || null);
  const [cachedAudioUrl, setCachedAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { getAudio, cacheAudio, isReady: cacheReady } = useAudioCache();
  const generateAudioMutation = trpc.audio.generateAudio.useMutation();

  const swipeRef = useSwipe(
    { onSwipeLeft: () => onSwipeLeft?.(), onSwipeRight: () => onSwipeRight?.() },
    { threshold: 50, timeout: 500 }
  );

  useEffect(() => {
    if (!cacheReady) return;
    const urlToCache = currentAudioUrl || audioUrl;
    if (!urlToCache) return;
    const loadCachedAudio = async () => {
      const cacheKey = `audio-${urlToCache.substring(urlToCache.lastIndexOf('/') + 1)}`;
      const cached = await getAudio(cacheKey);
      if (cached) {
        setCachedAudioUrl(cached);
      } else {
        try {
          const response = await fetch(urlToCache);
          const blob = await response.blob();
          await cacheAudio(cacheKey, urlToCache, blob);
          setCachedAudioUrl(URL.createObjectURL(blob));
        } catch {}
      }
    };
    loadCachedAudio();
  }, [cacheReady, currentAudioUrl, audioUrl, getAudio, cacheAudio]);

  const handlePlayAudio = async () => {
    if (!audioRef.current) return;
    setIsPlaying(true);
    try {
      let audioToPlay = cachedAudioUrl || currentAudioUrl;
      if (!audioToPlay && lessonId !== undefined && itemIndex !== undefined) {
        const mainWord = language === "thai" ? item.thai : item.lao;
        if (mainWord) {
          try {
            const result = await generateAudioMutation.mutateAsync({ text: mainWord, language, lessonId, itemIndex });
            if (result.audioUrl) { audioToPlay = result.audioUrl; setCurrentAudioUrl(result.audioUrl); }
          } catch {}
        }
      }
      if (audioToPlay) {
        audioRef.current.src = audioToPlay;
        await audioRef.current.play();
      }
    } catch {}
    finally { setIsPlaying(false); }
  };

  const mainWord = language === "thai" ? (item.thai || item.lao) : (item.lao || item.thai);
  const additionalInfo = item.romanization || item.pronunciation || "";
  const metadata = item.number !== undefined ? `Number: ${item.number}`
    : item.day ? item.day
    : item.month ? item.month
    : item.time ? item.time
    : item.phrase ? item.phrase : "";

  return (
    <div className="w-full" ref={swipeRef}>
      {/* Flip card */}
      <div
        className="h-64 cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setIsFlipped(f => !f)}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-blue-400/60 text-xs uppercase tracking-widest mb-3 font-medium">
              {language === "thai" ? "Thai" : "Lao"}
            </p>
            <h2 className="text-5xl font-bold text-white mb-3 break-words leading-tight">{mainWord}</h2>
            {additionalInfo && <p className="text-blue-400 text-lg">{additionalInfo}</p>}
            {metadata && <p className="text-white/30 text-sm mt-2">{metadata}</p>}
            <p className="absolute bottom-3 text-white/20 text-xs">Tap to flip</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-card border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-white/30 text-xs uppercase tracking-widest mb-3 font-medium">English</p>
            <h2 className="text-4xl font-bold text-white mb-3">{item.english || "—"}</h2>
            <p className="text-blue-400 text-xl mb-1">{mainWord}</p>
            {additionalInfo && <p className="text-white/40 text-sm">{additionalInfo}</p>}
            {item.tonePattern && (
              <div className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-1">
                <span className="text-white/30 text-xs">Tone: </span>
                <span className="text-blue-400 text-sm font-semibold">{item.tonePattern}</span>
              </div>
            )}
            <p className="absolute bottom-3 text-white/20 text-xs">Tap to flip</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex gap-3 justify-center">
        <button
          onClick={() => setIsFlipped(f => !f)}
          className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <RotateCcw className="w-4 h-4" /> Flip
        </button>
        <button
          onClick={handlePlayAudio}
          disabled={isPlaying}
          className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2.5 text-blue-400 hover:bg-blue-500/20 transition-all text-sm disabled:opacity-50"
        >
          <Volume2 className="w-4 h-4" />
          {isPlaying ? "Playing..." : "Listen"}
        </button>
      </div>

      <audio ref={audioRef} src={cachedAudioUrl || currentAudioUrl || audioUrl || ""} onEnded={() => setIsPlaying(false)} />
    </div>
  );
}
