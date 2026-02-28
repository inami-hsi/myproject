"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export default function StepProgress({
  currentStep,
  totalSteps,
  stepLabels,
}: StepProgressProps) {
  const progress = useMemo(() => {
    return ((currentStep - 1) / (totalSteps - 1)) * 100;
  }, [currentStep, totalSteps]);

  return (
    <div className="w-full space-y-3">
      {/* ラベル行 */}
      {stepLabels && stepLabels.length > 0 && (
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          {stepLabels.map((label, idx) => (
            <span
              key={idx}
              className={cn(
                "flex-1 text-center",
                idx + 1 === currentStep && "text-primary font-semibold"
              )}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* プログレスバー */}
      <div className="relative w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ステップカウンター */}
      <div className="text-center text-sm text-muted-foreground">
        ステップ {currentStep} of {totalSteps}
      </div>
    </div>
  );
}
