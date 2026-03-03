'use client';

import React, { useState } from 'react';
import { Question, QuestionOption } from '@/types';
import { Card, ProgressBar, Badge } from './Card';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface QuestionFormProps {
  question: Question;
  selectedAnswer?: string | string[];
  onAnswer: (answer: string | string[]) => void;
  onNext: () => void;
  onPrevious?: () => void;
  currentStep: number;
  totalSteps: number;
  showPrevious?: boolean;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  selectedAnswer,
  onAnswer,
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  showPrevious = true,
}) => {
  const [showTip, setShowTip] = useState(false);
  const [localAnswer, setLocalAnswer] = useState<string | string[]>(selectedAnswer || '');

  const isSingleSelect = question.type === 'single-select';
  const isMultiSelect = question.type === 'multi-select';

  const handleOptionChange = (optionId: string) => {
    if (isSingleSelect) {
      setLocalAnswer(optionId);
    } else if (isMultiSelect) {
      const current = Array.isArray(localAnswer) ? localAnswer : [];
      if (current.includes(optionId)) {
        setLocalAnswer(current.filter((id) => id !== optionId));
      } else {
        setLocalAnswer([...current, optionId]);
      }
    }
  };

  const handleSubmit = () => {
    if (localAnswer) {
      onAnswer(localAnswer);
      onNext();
    }
  };

  const isAnswered = isSingleSelect ? !!localAnswer : (Array.isArray(localAnswer) ? localAnswer.length > 0 : false);

  return (
    <div className="space-y-6">
      {/* プログレスバー */}
      <ProgressBar current={currentStep} total={totalSteps} />

      {/* メイン質問カード */}
      <Card variant="elevated" className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-900 mb-4 sm:mb-6">{question.question}</h2>

        {/* TIP表示 */}
        {question.tip && (
          <div className="mb-6 p-4 bg-accent-50 rounded-md border border-accent-200">
            <button
              onClick={() => setShowTip(!showTip)}
              className="text-accent-700 text-sm font-semibold flex items-center gap-2 hover:text-accent-800 transition-colors"
            >
              <span className="text-lg">💡</span>
              ヒント
              <span className="text-xs ml-auto">{showTip ? '▲' : '▼'}</span>
            </button>
            {showTip && <p className="text-accent-700 text-sm mt-3 leading-relaxed">{question.tip}</p>}
          </div>
        )}

        {/* オプション */}
        <div className={cn(
          'grid gap-3',
          question.options.length <= 3 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
        )}>
          {question.options.map((option) => {
            const isSelected =
              isSingleSelect
                ? localAnswer === option.id
                : Array.isArray(localAnswer)
                  ? localAnswer.includes(option.id)
                  : false;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleOptionChange(option.id)}
                className={cn(
                  'relative flex items-center justify-center p-4 sm:p-5 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center min-h-[60px]',
                  isSelected
                    ? 'border-accent-500 bg-accent-500 text-white shadow-md scale-[1.02]'
                    : 'border-neutral-200 bg-white hover:border-accent-300 hover:bg-accent-50 text-neutral-900'
                )}
              >
                <span className={cn(
                  'font-semibold text-sm sm:text-base',
                  isSelected && 'text-white'
                )}>
                  {option.label}
                </span>
                {isSelected && (
                  <span className="absolute top-2 right-2 text-white text-lg">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* マルチセレクトの場合、選択数を表示 */}
        {isMultiSelect && Array.isArray(localAnswer) && (
          <p className="text-xs text-neutral-600 mt-5 font-medium">
            {localAnswer.length}個選択中 {localAnswer.length >= 3 ? '(最大3選択推奨)' : ''}
          </p>
        )}
      </Card>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        {showPrevious && (
          <Button variant="outline" size="md" onClick={onPrevious} className="w-full sm:w-auto order-2 sm:order-1">
            ← 戻る
          </Button>
        )}
        <div className="hidden sm:flex flex-1" />
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={!isAnswered}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {currentStep === totalSteps ? '結果を見る' : '次へ'} →
        </Button>
      </div>
    </div>
  );
};

QuestionForm.displayName = 'QuestionForm';
