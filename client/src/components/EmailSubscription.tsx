import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function EmailSubscription() {
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState<"thai" | "lao">("thai");
  const [subscriptionType, setSubscriptionType] = useState<"weekly_phrases" | "daily_tips" | "all">(
    "weekly_phrases"
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const subscribe = trpc.beginnerLessons.subscribeToEmail.useMutation();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("이메일을 입력해주세요");
      return;
    }

    try {
      await subscribe.mutateAsync({
        email,
        language,
        subscriptionType,
      });

      setIsSubmitted(true);
      setEmail("");
      toast.success("구독이 완료되었습니다!");

      // Reset success state after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      toast.error("구독 중 오류가 발생했습니다");
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-900 mb-2">구독 완료!</h3>
        <p className="text-green-700">주간 이메일을 받을 준비가 되었습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-8">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-6 h-6 text-blue-600" />
        <h3 className="text-2xl font-bold text-blue-900">주간 이메일 구독</h3>
      </div>

      <p className="text-blue-700 mb-6">
        매주 새로운 태국어/라오어 표현과 학습 팁을 이메일로 받아보세요!
      </p>

      <form onSubmit={handleSubscribe} className="space-y-4">
        {/* Email Input */}
        <div>
          <Input
            type="email"
            placeholder="이메일 주소를 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white border-blue-200"
            disabled={subscribe.isPending}
          />
        </div>

        {/* Language Select */}
        <div>
          <Select value={language} onValueChange={(v) => setLanguage(v as "thai" | "lao")}>
            <SelectTrigger className="bg-white border-blue-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thai">태국어</SelectItem>
              <SelectItem value="lao">라오어</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subscription Type Select */}
        <div>
          <Select
            value={subscriptionType}
            onValueChange={(v) => setSubscriptionType(v as "weekly_phrases" | "daily_tips" | "all")}
          >
            <SelectTrigger className="bg-white border-blue-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly_phrases">주간 표현</SelectItem>
              <SelectItem value="daily_tips">일일 팁</SelectItem>
              <SelectItem value="all">모두 받기</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
          disabled={subscribe.isPending}
        >
          {subscribe.isPending ? "구독 중..." : "지금 구독하기"}
        </Button>
      </form>

      <p className="text-xs text-blue-600 mt-4 text-center">
        언제든지 구독을 취소할 수 있습니다.
      </p>
    </div>
  );
}
