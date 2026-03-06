import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import StepProgress from "@/components/questionnaire/StepProgress";
import QuestionDisplay from "@/components/questionnaire/QuestionDisplay";
import type { Question } from "@/types/questionnaire";

describe("Questionnaire UI Components", () => {
  describe("StepProgress", () => {
    it("renders current step and total steps", () => {
      render(
        <StepProgress
          currentStep={3}
          totalSteps={8}
          stepLabels={["Step 1", "Step 2", "Step 3"]}
        />
      );
      expect(screen.getByText("ステップ 3 of 8")).toBeInTheDocument();
    });

    it("shows progress bar width based on current step", () => {
      const { container } = render(
        <StepProgress currentStep={4} totalSteps={8} />
      );
      const progressDiv = container.querySelector("[style*='width']");
      expect(progressDiv).toBeInTheDocument();
    });

    it("displays step labels when provided", () => {
      render(
        <StepProgress
          currentStep={2}
          totalSteps={3}
          stepLabels={["車の有無", "運転頻度", "走行距離"]}
        />
      );
      expect(screen.getByText("車の有無")).toBeInTheDocument();
      expect(screen.getByText("運転頻度")).toBeInTheDocument();
    });
  });

  describe("QuestionDisplay", () => {
    const mockQuestion: Question = {
      id: "vehicle_ownership",
      insuranceType: "auto",
      step: 1,
      type: "single_choice",
      title: "お車をお持ちですか？",
      description: "現在、自動車を所有・使用していますか？",
      options: [
        {
          value: "yes",
          label: "はい、持っています",
          description: "現在使用している自動車がある",
        },
        {
          value: "no",
          label: "いいえ、持っていません",
          description: "現在自動車を所有していない",
        },
      ],
      required: true,
    };

    const mockMultipleQuestion: Question = {
      id: "past_accidents",
      insuranceType: "auto",
      step: 5,
      type: "multiple_choice",
      title: "過去の事故歴を教えてください",
      options: [
        {
          value: "minor",
          label: "軽い事故",
        },
        {
          value: "major",
          label: "重大な事故",
        },
      ],
      required: true,
    };

    it("renders question title and description", () => {
      const mockOnAnswer = vi.fn();
      render(
        <QuestionDisplay
          question={mockQuestion}
          onAnswer={mockOnAnswer}
        />
      );
      expect(screen.getByText("お車をお持ちですか？")).toBeInTheDocument();
      expect(
        screen.getByText("現在、自動車を所有・使用していますか？")
      ).toBeInTheDocument();
    });

    it("renders single choice options", () => {
      const mockOnAnswer = vi.fn();
      render(
        <QuestionDisplay
          question={mockQuestion}
          onAnswer={mockOnAnswer}
        />
      );
      expect(screen.getByLabelText(/はい、持っています/)).toBeInTheDocument();
      expect(screen.getByLabelText(/いいえ、持っていません/)).toBeInTheDocument();
    });

    it("calls onAnswer when single choice is selected", () => {
      const mockOnAnswer = vi.fn();
      render(
        <QuestionDisplay
          question={mockQuestion}
          onAnswer={mockOnAnswer}
        />
      );
      const yesRadio = screen.getByLabelText(/はい、持っています/) as HTMLInputElement;
      fireEvent.click(yesRadio);
      expect(mockOnAnswer).toHaveBeenCalledWith("vehicle_ownership", "yes");
    });

    it("renders multiple choice options", () => {
      const mockOnAnswer = vi.fn();
      render(
        <QuestionDisplay
          question={mockMultipleQuestion}
          onAnswer={mockOnAnswer}
        />
      );
      expect(screen.getByLabelText("軽い事故")).toBeInTheDocument();
      expect(screen.getByLabelText("重大な事故")).toBeInTheDocument();
    });

    it("calls onAnswer with array for multiple choices", () => {
      const mockOnAnswer = vi.fn();
      const { rerender } = render(
        <QuestionDisplay
          question={mockMultipleQuestion}
          onAnswer={mockOnAnswer}
        />
      );
      const minorCheckbox = screen.getByLabelText("軽い事故") as HTMLInputElement;
      fireEvent.click(minorCheckbox);
      expect(mockOnAnswer).toHaveBeenCalledWith("past_accidents", ["minor"]);

      // Check second option
      mockOnAnswer.mockClear();
      rerender(
        <QuestionDisplay
          question={mockMultipleQuestion}
          onAnswer={mockOnAnswer}
          currentAnswer={["minor"]}
        />
      );
      const majorCheckbox = screen.getByLabelText("重大な事故") as HTMLInputElement;
      fireEvent.click(majorCheckbox);
      expect(mockOnAnswer).toHaveBeenCalledWith("past_accidents", [
        "minor",
        "major",
      ]);
    });

    it("highlights selected option", () => {
      const mockOnAnswer = vi.fn();
      render(
        <QuestionDisplay
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          currentAnswer="yes"
        />
      );
      const yesRadio = screen.getByLabelText(/はい、持っています/) as HTMLInputElement;
      expect(yesRadio.checked).toBe(true);
    });
  });
});
