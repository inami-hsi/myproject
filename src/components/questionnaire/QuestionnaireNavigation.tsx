"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface QuestionnaireNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLoading?: boolean;
  isLastStep?: boolean;
  onComplete?: () => void;
}

export default function QuestionnaireNavigation({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  isLoading = false,
  isLastStep = false,
  onComplete,
}: QuestionnaireNavigationProps) {
  return (
    <div className="flex gap-3 justify-between">
      <Button
        onClick={onPrevious}
        disabled={!canGoPrevious || isLoading}
        variant="outline"
        className="gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        戻る
      </Button>

      {isLastStep && onComplete ? (
        <Button
          onClick={onComplete}
          disabled={!canGoNext || isLoading}
          className="gap-2 bg-success hover:bg-success/90"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "診断を完了"
          )}
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "次へ"
          )}
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
