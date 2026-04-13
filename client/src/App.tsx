import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import PronunciationPractice from "./pages/PronunciationPractice";
import DailyChallenges from "./pages/DailyChallenges";
import UserProfile from "./pages/UserProfile";
import Leaderboard from "./pages/Leaderboard";
import Onboarding from "./pages/Onboarding";
import ProfileDashboard from "./pages/ProfileDashboard";
import BeginnerLessons from "./pages/BeginnerLessons";
import LessonDetail from "./pages/LessonDetail";
import ReviewMode from "./pages/ReviewMode";
import Test from "./pages/Test";
import Statistics from "./pages/Statistics";
import Login from "./pages/Login";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard" component={ProfileDashboard} />
      <Route path="/profile-dashboard" component={ProfileDashboard} />
      <Route path="/pronunciation" component={PronunciationPractice} />
      <Route path="/practice" component={PronunciationPractice} />
      <Route path="/challenges" component={DailyChallenges} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/beginner-lessons" component={BeginnerLessons} />
      <Route path="/lessons" component={BeginnerLessons} />
      <Route path="/lesson/:id" component={LessonDetail} />
      <Route path="/review-mode" component={ReviewMode} />
      <Route path="/review" component={ReviewMode} />
      <Route path="/test" component={Test} />
      <Route path="/statistics" component={Statistics} />
      <Route path="/login" component={Login} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
