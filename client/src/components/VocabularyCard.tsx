"use client";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, RotateCcw } from "lucide-react";
import { useSwipe } from "@/hooks/useSwipe";
import { useAudioCache } from "@/hooks/useAudioCache";
import { trpc } from "@/lib/trpc";

interface VocabularyItem {
  thai?: string;
  lao?: string;
  romanization?: string;
  number?: number;
  day?: string;
  month?: string;
  time?: string;
  phrase?: string;
  pronunciation?: string;
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
  const [cachedAudioUrl, setCachedAudioUrl] = useState<string | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(audioUrl || null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { getAudio, cacheAudio, isReady: cacheReady } = useAudioCache();
  const generateAudioMutation = trpc.audio.generateAudio.useMutation();
  const swipeRef = useSwipe(
    {
      onSwipeLeft: () => onSwipeLeft?.(),
      onSwipeRight: () => onSwipeRight?.(),
    },
    { threshold: 50, timeout: 500 }
  );

  // Load cached audio on mount and when audioUrl changes
  useEffect(() => {
    if (!cacheReady) return;
    
    const urlToCache = currentAudioUrl || audioUrl;
    if (!urlToCache) return;

    const loadCachedAudio = async () => {
      const cacheKey = `audio-${urlToCache.substring(urlToCache.lastIndexOf('/') + 1)}`;
      const cached = await getAudio(cacheKey);
      if (cached) {
        setCachedAudioUrl(cached);
      } else if (urlToCache) {
        // Cache the audio for future use
        try {
          const response = await fetch(urlToCache);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          await cacheAudio(cacheKey, urlToCache, blob);
          setCachedAudioUrl(url);
        } catch (error) {
          console.error("Failed to cache audio:", error);
        }
      }
    };

    loadCachedAudio();
  }, [cacheReady, currentAudioUrl, audioUrl, getAudio, cacheAudio]);

  const handlePlayAudio = async () => {
    if (!audioRef.current) return;

    setIsPlaying(true);
    try {
      let audioToPlay = cachedAudioUrl || currentAudioUrl;
      
      // If no audio URL, try to generate it dynamically
      if (!audioToPlay && lessonId !== undefined && itemIndex !== undefined) {
        const mainWord = language === "thai" ? item.thai : item.lao;
        if (mainWord) {
          try {
            // Generate audio on demand
            const result = await generateAudioMutation.mutateAsync({
              text: mainWord,
              language,
              lessonId,
              itemIndex,
            });
            if (result.audioUrl) {
              audioToPlay = result.audioUrl;
              setCurrentAudioUrl(result.audioUrl);
            }
          } catch (error) {
            console.error("Failed to generate audio:", error);
          }
        }
      }
      
      if (audioToPlay) {
        audioRef.current.src = audioToPlay;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Failed to play audio:", error);
    } finally {
      setIsPlaying(false);
    }
  };

  // Get the main word to display
  const mainWord = language === "thai" ? item.thai : item.lao;
  const secondaryWord = language === "thai" ? item.lao : item.thai;

  // Get additional info
  const additionalInfo = item.romanization || item.pronunciation || "";

  // Get metadata
  const metadata = item.number !== undefined ? `숫자: ${item.number}` : 
                   item.day ? item.day :
                   item.month ? item.month :
                   item.time ? item.time :
                   item.phrase ? item.phrase : "";

  return (
    <div className="w-full" ref={swipeRef}>
      {/* Flip Card */}
      <div
        className="h-80 cursor-pointer perspective"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className="relative w-full h-full transition-transform duration-500 transform-gpu"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front Side */}
          <div
            className="absolute w-full h-full bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center text-white"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-center">
              <p className="text-sm font-medium opacity-75 mb-4 uppercase tracking-widest">
                {language === "thai" ? "태국어" : "라오어"}
              </p>
              <h2 className="text-6xl font-bold mb-4 break-words">{mainWord}</h2>
              {additionalInfo && (
                <p className="text-lg opacity-90 italic">{additionalInfo}</p>
              )}
              {metadata && (
                <p className="text-sm opacity-75 mt-4">{metadata}</p>
              )}
            </div>
            <p className="absolute bottom-4 text-xs opacity-50">클릭하여 뒤집기</p>
          </div>

          {/* Back Side */}
          <div
            className="absolute w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center text-white"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="text-center">
              <p className="text-sm font-medium opacity-75 mb-4 uppercase tracking-widest">
                {language === "thai" ? "라오어" : "태국어"}
              </p>
              <h2 className="text-5xl font-bold mb-6 break-words">{secondaryWord}</h2>
              {additionalInfo && (
                <p className="text-lg opacity-90 italic mb-4">{additionalInfo}</p>
              )}
              {metadata && (
                <p className="text-sm opacity-75">{metadata}</p>
              )}
            </div>
            <p className="absolute bottom-4 text-xs opacity-50">클릭하여 뒤집기</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-3 justify-center">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsFlipped(!isFlipped)}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          뒤집기
        </Button>

        <Button
          size="lg"
          onClick={handlePlayAudio}
          disabled={isPlaying}
          className="gap-2"
        >
          <Volume2 className="w-4 h-4" />
          {isPlaying ? "재생 중..." : "발음 듣기"}
        </Button>

      <audio
        ref={audioRef}
        src={cachedAudioUrl || currentAudioUrl || audioUrl}
        onEnded={() => setIsPlaying(false)}
      />
      </div>

      {/* Card Info */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-slate-600 text-xs font-medium mb-1">앞면</p>
          <p className="font-semibold text-slate-900">{mainWord}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-slate-600 text-xs font-medium mb-1">뒷면</p>
          <p className="font-semibold text-slate-900">{secondaryWord}</p>
        </div>
      </div>
    </div>
  );
}
