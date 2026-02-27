'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useInsuranceStore } from '@/stores/insuranceStore';
import { autoInsuranceQuestions } from '@/data/questions';
import { calculateAutoRecommendations } from '@/lib/scoring';
import { QuestionForm } from '@/components/QuestionForm';
import { RecommendationResult } from '@/components/RecommendationResult';

export default function AutoInsuranceQuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const step = parseInt(params.step as string, 10) || 1;

  const {
    currentCategory,
    currentStep,
    answers,
    showResults,
    recommendations,
    setCategory,
    setStep,
    nextStep,
    previousStep,
    setAnswer,
    setRecommendations,
    showResultsPage,
    reset,
  } = useInsuranceStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // 初期化
  useEffect(() => {
    useInsuranceStore.persist.rehydrate();
    if (currentCategory !== 'auto') {
      setCategory('auto');
    }
    setIsInitialized(true);
  }, []);

  // ステップ同期
  useEffect(() => {
    if (step !== currentStep && step >= 1 && step <= autoInsuranceQuestions.length) {
      setStep(step);
    }
  }, [step]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-neutral-50">
        <div className="animate-pulse">
          <p className="text-neutral-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 最後のステップで結果を表示
  if (currentStep === autoInsuranceQuestions.length + 1 || showResults) {
    // スコアリングを実行
    const finalRecommendations = calculateAutoRecommendations(answers);
    if (recommendations.length === 0) {
      setRecommendations(finalRecommendations);
    }

    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/insurance/loss" className="text-primary-500 hover:text-primary-600 mb-8 inline-block">
            ← 保険種目に戻る
          </Link>

          <RecommendationResult
            recommendations={finalRecommendations}
            insuranceType="auto"
            onReset={() => {
              reset();
              router.push('/insurance/loss');
            }}
          />
        </div>
      </main>
    );
  }

  const currentQuestion = autoInsuranceQuestions[currentStep - 1];
  const selectedAnswer = answers[currentQuestion.step];

  const handleNext = () => {
    const newStep = currentStep + 1;
    router.push(`/insurance/loss/auto/questions/${newStep}`);
    if (newStep > autoInsuranceQuestions.length) {
      showResultsPage(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      router.push(`/insurance/loss/auto/questions/${newStep}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/insurance/loss" className="text-primary-500 hover:text-primary-600 mb-8 inline-block">
          ← 保険種目に戻る
        </Link>

        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          損害保険・自動車保険
        </h1>
        <p className="text-neutral-600 mb-8">
          あなたにぴったりの保険をご提案します
        </p>

        <QuestionForm
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onAnswer={(answer) => setAnswer(currentQuestion.step, answer)}
          onNext={handleNext}
          onPrevious={handlePrevious}
          currentStep={currentStep}
          totalSteps={autoInsuranceQuestions.length}
          showPrevious={currentStep > 1}
        />
      </div>
    </main>
  );
}
