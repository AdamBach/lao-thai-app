import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, BookOpen, Trophy, Flame, Zap, Star, Globe } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
          <div className="text-5xl mb-4">🇱🇦🇹🇭</div>
          <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
            Learn Lao & Thai
          </h1>
          <p className="text-white/50 text-lg mb-2 max-w-sm">
            AI-powered pronunciation, tone analysis & gamified lessons
          </p>
          <p className="text-blue-400 text-sm mb-10 font-medium">
            For English & Chinese speakers
          </p>

          <Button
            onClick={() => window.location.href = getLoginUrl()}
            size="lg"
            className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-10 py-6 text-lg rounded-2xl blue-glow transition-all"
          >
            Get Started Free
          </Button>
          <p className="text-white/30 text-xs mt-4">No credit card required</p>
        </div>

        {/* Feature highlights */}
        <div className="px-6 pb-12 grid grid-cols-2 gap-3 max-w-sm mx-auto w-full">
          {[
            { icon: "🎯", label: "AI Tone Analysis" },
            { icon: "🎮", label: "Gamified XP System" },
            { icon: "📊", label: "Pitch Visualization" },
            { icon: "🏆", label: "Global Leaderboard" },
          ].map(({ icon, label }) => (
            <div key={label} className="bg-card border border-white/8 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <span className="text-white/70 text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="px-6 pb-16 max-w-sm mx-auto w-full">
          <div className="flex items-center justify-center gap-2 text-white/30 text-sm">
            <span>🇬🇧 English</span>
            <span>·</span>
            <span>🇨🇳 中文</span>
            <span>·</span>
            <span>more coming</span>
          </div>
        </div>
      </div>
    );
  }

  // Logged in view
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <p className="text-white/40 text-sm mb-1">Welcome back,</p>
        <h1 className="text-2xl font-bold text-white">{user?.name || user?.email}</h1>
      </div>

      {/* Stats strip */}
      <div className="px-5 mb-6">
        <div className="bg-card border border-white/8 rounded-2xl p-4 grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-blue-400 font-bold text-lg">0</div>
            <div className="text-white/40 text-xs">Day Streak 🔥</div>
          </div>
          <div className="text-center border-x border-white/8">
            <div className="text-blue-400 font-bold text-lg">0</div>
            <div className="text-white/40 text-xs">Total XP ⚡</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold text-lg">0%</div>
            <div className="text-white/40 text-xs">Accuracy 🎯</div>
          </div>
        </div>
      </div>

      {/* Main nav cards */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => navigate("/lessons")}
          className="bg-card border border-white/8 rounded-2xl p-5 text-left hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group"
        >
          <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-500/25 transition-colors">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-white font-semibold text-sm">Lessons</div>
          <div className="text-white/40 text-xs mt-0.5">Start learning</div>
        </button>

        <button
          onClick={() => navigate("/practice")}
          className="bg-card border border-white/8 rounded-2xl p-5 text-left hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group"
        >
          <div className="w-10 h-10 bg-purple-500/15 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-500/25 transition-colors">
            <Mic className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-white font-semibold text-sm">Pronunciation</div>
          <div className="text-white/40 text-xs mt-0.5">AI tone practice</div>
        </button>

        <button
          onClick={() => navigate("/challenges")}
          className="bg-card border border-white/8 rounded-2xl p-5 text-left hover:border-orange-500/40 hover:bg-orange-500/5 transition-all group"
        >
          <div className="w-10 h-10 bg-orange-500/15 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-500/25 transition-colors">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-white font-semibold text-sm">Daily Challenge</div>
          <div className="text-white/40 text-xs mt-0.5">Earn XP today</div>
        </button>

        <button
          onClick={() => navigate("/leaderboard")}
          className="bg-card border border-white/8 rounded-2xl p-5 text-left hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-all group"
        >
          <div className="w-10 h-10 bg-yellow-500/15 rounded-xl flex items-center justify-center mb-3 group-hover:bg-yellow-500/25 transition-colors">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-white font-semibold text-sm">Leaderboard</div>
          <div className="text-white/40 text-xs mt-0.5">Compete globally</div>
        </button>
      </div>

      {/* Key features */}
      <div className="px-5 mb-6">
        <h2 className="text-white font-bold mb-3 text-sm uppercase tracking-wider text-white/40">Why LaoThai App</h2>
        <div className="space-y-2">
          {[
            { icon: <Zap className="w-4 h-4 text-blue-400" />, title: "AI Tone Analysis", desc: "Whisper API scores your pronunciation accuracy" },
            { icon: <Star className="w-4 h-4 text-yellow-400" />, title: "XP & Badges", desc: "Earn rewards and level up as you learn" },
            { icon: <Globe className="w-4 h-4 text-green-400" />, title: "English & Chinese UI", desc: "Interface available in EN / 中文" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-card border border-white/8 rounded-xl p-4 flex items-center gap-4">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
              <div>
                <div className="text-white font-medium text-sm">{title}</div>
                <div className="text-white/40 text-xs">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade banner */}
      <div className="px-5 mb-6">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-white font-bold mb-1">Go Premium</div>
            <div className="text-white/50 text-xs">Unlock all lessons + AI features</div>
          </div>
          <div className="text-right">
            <div className="text-blue-400 font-bold">$9.99</div>
            <div className="text-white/30 text-xs">/month</div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
