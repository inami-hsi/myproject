'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InsuranceCategory, Recommendation } from '@/types';

interface InsuranceStore {
  // Current insurance type and flow state
  currentCategory: InsuranceCategory | null;
  currentStep: number;
  
  // User answers grouped by category
  answers: Record<InsuranceCategory, Record<number, string | string[]>>;
  
  // Results for current category
  recommendations: Recommendation[];
  showResults: boolean;
  
  // Actions
  setCategory: (category: InsuranceCategory) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  setAnswer: (step: number, answer: string | string[]) => void;
  setRecommendations: (recommendations: Recommendation[]) => void;
  showResultsPage: (show: boolean) => void;
  
  // Reset entire flow
  reset: () => void;
}

export const useInsuranceStore = create<InsuranceStore>()(
  persist(
    (set, get) => ({
      currentCategory: null,
      currentStep: 1,
      answers: {
        auto: {},
        fire: {},
        liability: {},
        injury: {},
        term: {},
        whole: {},
        medical: {},
        cancer: {},
        annuity: {},
        variable: {},
        endowment: {},
        education: {},
        income: {},
        nursing: {},
        disability: {},
      },
      recommendations: [],
      showResults: false,

      setCategory: (category) =>
        set((state) => {
          // Keep recommendations if switching to same category
          if (state.currentCategory === category) {
            return { currentCategory: category };
          }
          return {
            currentCategory: category,
            currentStep: 1,
            recommendations: [],
            showResults: false,
          };
        }),

      setStep: (step) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 8),
        })),

      previousStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      setAnswer: (step, answer) =>
        set((state) => {
          const cat = state.currentCategory as InsuranceCategory;
          return {
            answers: {
              ...state.answers,
              [cat]: {
                ...state.answers[cat],
                [step]: answer,
              },
            },
          };
        }),

      setRecommendations: (recommendations) =>
        set({ recommendations }),

      showResultsPage: (show) => set({ showResults: show }),

      reset: () =>
        set({
          currentCategory: null,
          currentStep: 1,
          answers: {
            auto: {},
            fire: {},
            liability: {},
            injury: {},
            term: {},
            whole: {},
            medical: {},
            cancer: {},
            annuity: {},
            variable: {},
            endowment: {},
            education: {},
            income: {},
            nursing: {},
            disability: {},
          },
          recommendations: [],
          showResults: false,
        }),
    }),
    {
      name: 'insurance-storage',
      skipHydration: true,
    }
  )
);
