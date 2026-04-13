import { useLocation } from "wouter";
import { BookOpen, Mic, Flame, Trophy, User } from "lucide-react";

const tabs = [
  { label: "Lessons",   icon: BookOpen, path: "/lessons" },
  { label: "Practice",  icon: Mic,      path: "/practice" },
  { label: "Challenge", icon: Flame,    path: "/challenges" },
  { label: "Ranks",     icon: Trophy,   path: "/leaderboard" },
  { label: "Profile",   icon: User,     path: "/profile" },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/8"
      style={{ background: "oklch(0.12 0.025 265)" }}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ label, icon: Icon, path }) => {
          const active = location === path || (path === "/lessons" && location === "/beginner-lessons");
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 flex-1 py-2 transition-all duration-200"
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                active
                  ? "bg-blue-500/20 blue-glow"
                  : "hover:bg-white/5"
              }`}>
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active ? "text-blue-400" : "text-white/40"
                  }`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${
                active ? "text-blue-400" : "text-white/35"
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
