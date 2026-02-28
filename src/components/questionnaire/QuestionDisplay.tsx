"use client";

import type { Question } from "@/types/questionnaire";

interface QuestionDisplayProps {
  question: Question;
  onAnswer: (questionId: string, value: string | string[]) => void;
  currentAnswer?: string | string[];
  isLoading?: boolean;
}

export default function QuestionDisplay({
  question,
  onAnswer,
  currentAnswer = question.type === "multiple_choice" ? [] : "",
  isLoading = false,
}: QuestionDisplayProps) {

  const handleSingleChoice = (value: string) => {
    onAnswer(question.id, value);
  };

  const handleMultipleChoice = (value: string) => {
    const current = Array.isArray(currentAnswer)
      ? currentAnswer
      : [currentAnswer].filter(Boolean);
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onAnswer(question.id, updated);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* 質問テキスト */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold font-heading text-foreground">
          {question.title}
        </h2>
        {question.description && (
          <p className="text-sm text-muted-foreground">{question.description}</p>
        )}
      </div>

      {/* 選択肢 */}
      <fieldset className="space-y-3">
        {question.type === "single_choice" && (
          <div className="space-y-2">
            {question.options.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-3 p-4 rounded-lg border-2 border-input bg-background cursor-pointer transition-all hover:border-primary hover:bg-secondary"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={currentAnswer === option.value}
                  onChange={() => handleSingleChoice(option.value)}
                  disabled={isLoading}
                  className="w-5 h-5 cursor-pointer accent-primary"
                />
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}

        {question.type === "multiple_choice" && (
          <div className="space-y-2">
            {question.options.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-3 p-4 rounded-lg border-2 border-input bg-background cursor-pointer transition-all hover:border-primary hover:bg-secondary"
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={
                    Array.isArray(currentAnswer)
                      ? currentAnswer.includes(option.value)
                      : false
                  }
                  onChange={() => handleMultipleChoice(option.value)}
                  disabled={isLoading}
                  className="w-5 h-5 cursor-pointer accent-primary"
                />
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </fieldset>
    </div>
  );
}
