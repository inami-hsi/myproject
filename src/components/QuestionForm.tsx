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
      <Card variant="elevated">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">{question.question}</h2>

        {/* TIP表示 */}
        {question.tip && (
          <div className="mb-6 p-3 bg-warning-50 rounded-lg border border-warning-200">
            <button
              onClick={() => setShowTip(!showTip)}
              className="text-warning-700 text-sm font-medium flex items-center gap-2 hover:text-warning-800"
            >
              <span className="text-base">💡</span>
              ヒント
              <span className="text-xs">{showTip ? '▲' : '▼'}</span>
            </button>
            {showTip && <p className="text-warning-700 text-sm mt-2">{question.tip}</p>}
          </div>
        )}

        {/* オプション */}
        <div className={cn('space-y-3', isMultiSelect && 'space-y-3')}>
          {question.options.map((option) => {
            const isSelected =
              isSingleSelect
                ? localAnswer === option.id
                : Array.isArray(localAnswer)
                  ? localAnswer.includes(option.id)
                  : false;

            return (
              <label
                key={option.id}
                className={cn(
                  'flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all',
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 bg-white hover:border-primary-300'
                )}
              >
                <input
                  type={isSingleSelect ? 'radio' : 'checkbox'}
                  name={`option-${question.step}`}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => handleOptionChange(option.id)}
                  className="mt-1 mr-4 w-5 h-5 cursor-pointer"
                />
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900">{option.label}</p>
                </div>
                {isSelected && <Badge variant="success">選択中</Badge>}
              </label>
            );
          })}
        </div>

        {/* マルチセレクトの場合、選択数を表示 */}
        {isMultiSelect && Array.isArray(localAnswer) && (
          <p className="text-sm text-neutral-600 mt-4">
            {localAnswer.length}個選択中 {localAnswer.length >= 3 ? '(最大3選択推奨)' : ''}
          </p>
        )}
      </Card>

      {/* アクションボタン */}
      <div className="flex gap-3 justify-between">
        {showPrevious && (
          <Button variant="outline" size="md" onClick={onPrevious}>
            ← 戻る
          </Button>
        )}
        <div className="flex-1" />
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={!isAnswered}
        >
          {currentStep === totalSteps ? '結果を見る' : '次へ'} →
        </Button>
      </div>
    </div>
  );
};

QuestionForm.displayName = 'QuestionForm';
