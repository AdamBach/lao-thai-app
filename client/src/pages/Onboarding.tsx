import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, ArrowRight, BookOpen, Target } from "lucide-react";

type GoalType = "general" | "test";
type LevelCode = "novice" | "intermediate" | "advanced" | "superior" | "distinguished";

const LEVEL_DESCRIPTIONS: Record<LevelCode, { name: string; description: string }> = {
  novice: {
    name: "Novice (초급)",
    description: "기본 인사와 간단한 문장 이해",
  },
  intermediate: {
    name: "Intermediate (중급)",
    description: "일상 대화 가능, 기본 문법 이해",
  },
  advanced: {
    name: "Advanced (고급)",
    description: "복잡한 주제 대화, 문화 이해",
  },
  superior: {
    name: "Superior (상급)",
    description: "전문적 대화, 미묘한 표현 이해",
  },
  distinguished: {
    name: "Distinguished (최상급)",
    description: "원어민 수준의 유창성",
  },
};

export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [goalType, setGoalType] = useState<GoalType>("general");
  const [currentLevel, setCurrentLevel] = useState<LevelCode>("novice");
  const [targetLevel, setTargetLevel] = useState<LevelCode>("intermediate");
  const [isLoading, setIsLoading] = useState(false);

  const initializeLevelMutation = trpc.cuTfl.initializeUserLevel.useMutation();

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Validate that target level is higher than current level
      const levels: LevelCode[] = ["novice", "intermediate", "advanced", "superior", "distinguished"];
      const currentIndex = levels.indexOf(currentLevel);
      const targetIndex = levels.indexOf(targetLevel);

      if (targetIndex <= currentIndex) {
        toast.error("목표 레벨은 현재 레벨보다 높아야 합니다.");
        return;
      }

      setStep(3);
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await initializeLevelMutation.mutateAsync({
        currentLevelCode: currentLevel,
        targetLevelCode: targetLevel,
        goalType,
      });

      toast.success("학습 경로가 설정되었습니다!");
      navigate("/profile");
    } catch (error) {
      toast.error("오류가 발생했습니다. 다시 시도해주세요.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 mx-1 rounded-full transition-colors ${
                s <= step ? "bg-indigo-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Goal Selection */}
        {step === 1 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                학습 목표 선택
              </CardTitle>
              <CardDescription>
                당신의 학습 목표를 선택해주세요. 이에 따라 맞춤형 학습 경로가 제시됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={goalType} onValueChange={(value) => setGoalType(value as GoalType)}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setGoalType("general")}>
                  <RadioGroupItem value="general" id="general" />
                  <Label htmlFor="general" className="flex-1 cursor-pointer">
                    <div className="font-semibold">일반 학습</div>
                    <div className="text-sm text-gray-600">
                      자신의 속도로 라오어/태국어를 배우고 싶습니다.
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setGoalType("test")}>
                  <RadioGroupItem value="test" id="test" />
                  <Label htmlFor="test" className="flex-1 cursor-pointer">
                    <div className="font-semibold">시험 준비</div>
                    <div className="text-sm text-gray-600">
                      CU-TFL 시험에 합격하기 위해 집중 학습하고 싶습니다.
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Level Selection */}
        {step === 2 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                현재 레벨과 목표 레벨 선택
              </CardTitle>
              <CardDescription>
                당신의 현재 언어 수준과 목표 수준을 선택해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Current Level */}
              <div>
                <h3 className="font-semibold mb-3">현재 레벨</h3>
                <RadioGroup value={currentLevel} onValueChange={(value) => setCurrentLevel(value as LevelCode)}>
                  <div className="space-y-2">
                    {(["novice", "intermediate", "advanced", "superior", "distinguished"] as LevelCode[]).map((level) => (
                      <div
                        key={level}
                        className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setCurrentLevel(level)}
                      >
                        <RadioGroupItem value={level} id={`current-${level}`} />
                        <Label htmlFor={`current-${level}`} className="flex-1 cursor-pointer">
                          <div className="font-medium">{LEVEL_DESCRIPTIONS[level].name}</div>
                          <div className="text-sm text-gray-600">{LEVEL_DESCRIPTIONS[level].description}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Target Level */}
              <div>
                <h3 className="font-semibold mb-3">목표 레벨</h3>
                <RadioGroup value={targetLevel} onValueChange={(value) => setTargetLevel(value as LevelCode)}>
                  <div className="space-y-2">
                    {(["novice", "intermediate", "advanced", "superior", "distinguished"] as LevelCode[]).map((level) => (
                      <div
                        key={level}
                        className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setTargetLevel(level)}
                      >
                        <RadioGroupItem value={level} id={`target-${level}`} />
                        <Label htmlFor={`target-${level}`} className="flex-1 cursor-pointer">
                          <div className="font-medium">{LEVEL_DESCRIPTIONS[level].name}</div>
                          <div className="text-sm text-gray-600">{LEVEL_DESCRIPTIONS[level].description}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>학습 경로 확인</CardTitle>
              <CardDescription>
                아래 내용이 맞는지 확인하고 학습을 시작하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">학습 목표:</span>
                  <span className="font-semibold">
                    {goalType === "general" ? "일반 학습" : "시험 준비"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">현재 레벨:</span>
                  <span className="font-semibold">
                    {LEVEL_DESCRIPTIONS[currentLevel].name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">목표 레벨:</span>
                  <span className="font-semibold">
                    {LEVEL_DESCRIPTIONS[targetLevel].name}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <p className="text-sm text-amber-800">
                  💡 <strong>팁:</strong> 매일 5개의 발음 연습을 완료하면 약 {Math.ceil(
                    (["novice", "intermediate", "advanced", "superior", "distinguished"].indexOf(targetLevel) -
                      ["novice", "intermediate", "advanced", "superior", "distinguished"].indexOf(currentLevel)) * 30
                  )}일 안에 목표 레벨에 도달할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep((step - 1) as 1 | 2 | 3)}
              className="flex-1"
            >
              이전
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={handleContinue}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              다음 <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  설정 중...
                </>
              ) : (
                <>
                  학습 시작 <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
