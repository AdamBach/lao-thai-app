import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Mic, BookOpen, Trophy, Flame } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import EmailSubscription from "@/components/EmailSubscription";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">라오어 & 태국어 학습</h1>
            <p className="text-gray-600">차별화된 발음 연습으로 완벽하게 마스터하세요</p>
          </div>
          {isAuthenticated && (
            <div className="text-right">
              <p className="text-gray-700 font-semibold">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {!isAuthenticated ? (
          // Not Logged In
          <div className="text-center py-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              라오어와 태국어를 배우세요
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              AI 기반 발음 분석, 성조 시각화, 게임화된 학습으로 언어 습득을 가속화합니다.
              Ling보다 41% 저렴하고 더 깊이 있는 학습 경험을 제공합니다.
            </p>
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              size="lg"
              className="gap-2 text-lg px-8 py-6"
            >
              시작하기
            </Button>
          </div>
        ) : (
          // Logged In
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-indigo-600">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                환영합니다, {user?.name}!
              </h2>
              <p className="text-gray-600 mb-4">
                오늘은 발음 연습으로 언어 능력을 향상시켜보세요.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pronunciation Practice */}
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white"
                onClick={() => navigate("/pronunciation")}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                  <Mic className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">발음 연습</h3>
                <p className="text-gray-600 mb-4">
                  AI 성조 분석으로 정확한 발음을 배우세요. 실시간 피치 시각화로 진전을 확인하세요.
                </p>
                <div className="text-sm font-semibold text-red-600">차별화된 핵심 기능 →</div>
              </Card>

              {/* Daily Challenges */}
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white"
                onClick={() => navigate("/challenges")}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                  <Flame className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">일일 챌린지</h3>
                <p className="text-gray-600 mb-4">
                  매일 새로운 챌린지를 완료하고 XP를 획득하세요. 연속 학습으로 보너스를 받으세요.
                </p>
                <div className="text-sm font-semibold text-purple-600">게임화 강화 →</div>
              </Card>

              {/* Leaderboard */}
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white"
                onClick={() => navigate("/leaderboard")}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">리더보드</h3>
                <p className="text-gray-600 mb-4">
                  친구들과 경쟁하며 글로벌 랭킹에 올라가세요. 매일 새로운 챌린지를 완료하세요.
                </p>
                <div className="text-sm font-semibold text-yellow-600">경쟁 시작 →</div>
              </Card>

              {/* Beginner Lessons */}
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white"
                onClick={() => navigate("/beginner-lessons")}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">초보자 학습</h3>
                <p className="text-gray-600 mb-4">
                  숫자, 요일, 월, 시간, 기본 인사말을 배우세요. 3D 플립 카드로 재미있게 학습하세요.
                </p>
                <div className="text-sm font-semibold text-green-600">어휘 배우기 →</div>
              </Card>
            </div>

            {/* Key Features Section */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">주요 기능</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">AI 성조 분석</h4>
                    <p className="text-gray-600">
                      Whisper API로 음성을 텍스트로 변환하고 정확도를 평가합니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">성조 시각화</h4>
                    <p className="text-gray-600">
                      피치 패턴을 실시간으로 시각화하여 발음 개선을 도와줍니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">다국어 지원</h4>
                    <p className="text-gray-600">
                      한국어, 영어, 중국어로 학습 인터페이스를 제공합니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">게임화 시스템</h4>
                    <p className="text-gray-600">
                      XP, 배지, 챌린지로 학습 동기를 높입니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Subscription Section */}
            <div className="mt-12">
              <EmailSubscription />
            </div>

            {/* Pricing Section */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">가격 비교</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">무료</h4>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li>✓ 일일 3개 단어</li>
                    <li>✓ 기본 발음 연습</li>
                    <li>✗ 성조 분석</li>
                  </ul>
                  <Button variant="outline" className="w-full">
                    현재 사용 중
                  </Button>
                </div>

                <div className="border-2 border-indigo-600 rounded-lg p-6 bg-indigo-50 relative">
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">
                    추천
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">프리미엄</h4>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-indigo-600">$9.99</span>
                    <span className="text-gray-600">/월</span>
                  </div>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li>✓ 무제한 발음 연습</li>
                    <li>✓ AI 성조 분석</li>
                    <li>✓ 성조 시각화</li>
                    <li>✓ 모든 게임 모드</li>
                  </ul>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    업그레이드
                  </Button>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">VIP</h4>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">$19.99</span>
                    <span className="text-gray-600">/월</span>
                  </div>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li>✓ 프리미엄 모든 기능</li>
                    <li>✓ 라이브 튜터링</li>
                    <li>✓ 우선 지원</li>
                    <li>✓ 맞춤형 학습 경로</li>
                  </ul>
                  <Button variant="outline" className="w-full">
                    업그레이드
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-center text-gray-400">
            © 2026 라오어 & 태국어 학습 앱. 모든 권리 보유.
          </p>
        </div>
      </footer>
    </div>
  );
}
