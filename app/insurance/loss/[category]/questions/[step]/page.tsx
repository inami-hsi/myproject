'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useInsuranceStore } from '@/stores/insuranceStore';
import { questionsByCategory } from '@/data/questions';
import { calculateRecommendations } from '@/lib/scoring';
import { QuestionForm } from '@/components/QuestionForm';
import { RecommendationResult } from '@/components/RecommendationResult';
import { InsuranceCategory } from '@/types';

export default function InsuranceQuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const categoryParam = params.category as string;
  const step = parseInt(params.step as string, 10) || 1;

  const category = (['auto', 'fire', 'liability', 'injury'] as InsuranceCategory[]).includes(
    categoryParam as InsuranceCategory
  )
    ? (categoryParam as InsuranceCategory)
    : 'auto';

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

  // initialize store and category
  useEffect(() => {
    const init = async () => {
      await useInsuranceStore.persist.rehydrate();
      const state = useInsuranceStore.getState();
      // Only call setCategory if category differs (and not already on results)
      if (state.currentCategory !== category && !state.showResults) {
        setCategory(category);
      }
      setIsInitialized(true);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // synchronize step from URL
  useEffect(() => {
    if (step !== currentStep && step >= 1 && step <= questionsByCategory[category].length + 1) {
      setStep(step);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, category]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-neutral-50">
        <div className="animate-pulse">
          <p className="text-neutral-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const questionList = questionsByCategory[category];

  const handleAnswer = (answer: string | string[]) => {
    setAnswer(currentStep, answer);
  };

  const goNext = () => {
    if (currentStep < questionList.length) {
      nextStep();
      router.push(`/insurance/loss/${category}/questions/${currentStep + 1}`);
    } else {
      // calculate recommendations
      const recs = calculateRecommendations(category, answers[category]);
      setRecommendations(recs);
      showResultsPage(true);
      router.push(`/insurance/loss/${category}/questions/${currentStep + 1}`);
    }
  };

  const goPrev = () => {
    if (currentStep > 1) {
      previousStep();
      router.push(`/insurance/loss/${category}/questions/${currentStep - 1}`);
    }
  };

  const restart = () => {
    reset();
    router.push(`/insurance/loss`);
  };

  if (currentStep === questionList.length + 1 || showResults) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 py-6 sm:py-12 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">
          <RecommendationResult
            category={category}
            recommendations={recommendations}
            onReset={restart}
          />
        </div>
      </main>
    );
  }

  const currentQuestion = questionList[currentStep - 1];

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 py-6 sm:py-12 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        <QuestionForm
          question={currentQuestion}
          selectedAnswer={answers[category][currentStep] || ''}
          onAnswer={handleAnswer}
          onNext={goNext}
          onPrevious={goPrev}
          currentStep={currentStep}
          totalSteps={questionList.length}
          showPrevious={currentStep > 1}
        />
      </div>
    </main>
  );
}
