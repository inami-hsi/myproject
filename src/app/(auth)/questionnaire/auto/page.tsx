"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getQuestionByStep, getNextStep } from "@/lib/questionnaire/engine-client";
import StepProgress from "@/components/questionnaire/StepProgress";
import QuestionDisplay from "@/components/questionnaire/QuestionDisplay";
import QuestionnaireNavigation from "@/components/questionnaire/QuestionnaireNavigation";
import type { Question } from "@/types/questionnaire";

const INSURANCE_TYPE = "auto";
const TOTAL_STEPS = 8;
const STEP_LABELS = [
  "車の有無",
  "運転頻度",
  "走行距離",
  "車種",
  "事故歴",
  "運転者",
  "補償",
  "予算",
];

export default function AutoInsuranceQuestionnaire() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [question, setQuestion] = useState<Question | null>(null);
  const [responses, setResponses] = useState<Record<string, string | string[]>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ページ初期化：ユーザー認証とステップ1の質問を読み込み
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const user = await (await fetch("/api/user/profile"))
          .json()
          .catch(() => null);
        if (!user || user.error) {
          router.push("/login");
          return;
        }

        // ステップ1の質問を取得
        const q = getQuestionByStep(INSURANCE_TYPE, 1);
        if (q) {
          setQuestion(q);
        }

        // 既存の回答があれば読み込む
        const res = await fetch(
          `/api/questionnaire?type=${INSURANCE_TYPE}&step=1`
        );
        const data = await res.json();
        if (data.responses) {
          setResponses(data.responses);
        }
      } catch (e) {
        setError("データ読み込みに失敗しました");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [router]);

  // ステップ変更時に質問を更新
  useEffect(() => {
    const q = getQuestionByStep(INSURANCE_TYPE, currentStep);
    if (q) {
      setQuestion(q);
    }
  }, [currentStep]);

  // 回答を記録
  const handleAnswer = useCallback(
    async (questionId: string, value: string | string[]) => {
      const updatedResponses = {
        ...responses,
        [questionId]: value,
      };
      setResponses(updatedResponses);

      // DB に保存
      try {
        await fetch("/api/questionnaire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            insuranceType: INSURANCE_TYPE,
            responses: updatedResponses,
          }),
        });
      } catch (e) {
        console.error("Failed to save response:", e);
      }
    },
    [responses]
  );

  // 次へボタンの有効化判定
  const currentQuestion = getQuestionByStep(INSURANCE_TYPE, currentStep);
  const hasCurrentAnswer = !!(
    currentQuestion && responses[currentQuestion.id] !== undefined
  );
  const canGoNext = hasCurrentAnswer && currentStep < TOTAL_STEPS;
  const canGoPrevious = currentStep > 1;

  // 次へ
  const handleNext = () => {
    if (!question) return;

    const nextStep = getNextStep(
      INSURANCE_TYPE,
      question.id,
      responses[question.id]
    );

    if (nextStep.action === "skip") {
      // スキップ（診断完了へ）
      handleComplete();
    } else if (nextStep.action === "complete") {
      // ステップ8が終了した
      handleComplete();
    } else {
      // 次のステップへ
      setCurrentStep(currentStep + 1);
    }
  };

  // 前へ
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 診断完了
  const handleComplete = () => {
    // 結果ページへ遷移
    router.push(`/questionnaire/results?type=${INSURANCE_TYPE}`);
  };

  if (error) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">{error}</h1>
          <button
            onClick={() => window.location.reload()}
            className="text-primary underline"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* ページタイトル */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-heading">自動車保険診断</h1>
          <p className="text-muted-foreground">
            あなたに合った保険を見つけましょう
          </p>
        </div>

        {/* プログレスバー */}
        <StepProgress
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          stepLabels={STEP_LABELS}
        />

        {/* 質問表示 */}
        <div className="bg-card border rounded-lg p-6 md:p-8 shadow-sm">
          {question && (
            <QuestionDisplay
              question={question}
              onAnswer={handleAnswer}
              currentAnswer={responses[question.id]}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* ナビゲーション */}
        <div className="bg-card border rounded-lg p-6 md:p-8 shadow-sm">
          <QuestionnaireNavigation
            onPrevious={handlePrevious}
            onNext={handleNext}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            isLoading={isLoading}
            isLastStep={currentStep === TOTAL_STEPS}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </div>
  );
}
