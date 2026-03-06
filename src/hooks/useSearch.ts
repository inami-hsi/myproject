import { create } from "zustand";
import type {
  SearchFilters,
  CompanyResult,
  FilterChip,
  CountResponse,
  SearchResponse,
} from "@/types/search";
import { DEFAULT_FILTERS } from "@/types/search";

// ============================================================
// Store interface
// ============================================================

interface SearchState {
  filters: SearchFilters;
  results: CompanyResult[];
  totalCount: number | null;
  isLoadingCount: boolean;
  isLoadingResults: boolean;
  isLoadingMore: boolean;
  nextCursor: string | null;
  hasMore: boolean;
  error: string | null;
}

interface SearchActions {
  setIndustries: (codes: string[]) => void;
  toggleIndustry: (code: string) => void;
  setPrefectures: (codes: string[]) => void;
  togglePrefecture: (code: string) => void;
  setKeyword: (keyword: string) => void;
  removeFilter: (chip: FilterChip) => void;
  clearAllFilters: () => void;
  fetchCount: () => Promise<void>;
  fetchResults: () => Promise<void>;
  loadMore: () => Promise<void>;
}

// ============================================================
// Helpers
// ============================================================

function buildQueryParams(
  filters: SearchFilters,
  cursor?: string | null,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.industries.length > 0) {
    params.set("industries", filters.industries.join(","));
  }
  if (filters.prefectures.length > 0) {
    params.set("prefectures", filters.prefectures.join(","));
  }
  if (filters.cities.length > 0) {
    params.set("cities", filters.cities.join(","));
  }
  if (filters.keyword) {
    params.set("keyword", filters.keyword);
  }
  if (filters.capital_min !== undefined) {
    params.set("capital_min", String(filters.capital_min));
  }
  if (filters.capital_max !== undefined) {
    params.set("capital_max", String(filters.capital_max));
  }
  if (filters.employee_min !== undefined) {
    params.set("employee_min", String(filters.employee_min));
  }
  if (filters.employee_max !== undefined) {
    params.set("employee_max", String(filters.employee_max));
  }
  if (filters.sort_by) {
    params.set("sort_by", filters.sort_by);
  }
  if (filters.sort_order) {
    params.set("sort_order", filters.sort_order);
  }
  if (cursor) {
    params.set("cursor", cursor);
  }

  return params;
}

function toggle(arr: string[], value: string): string[] {
  return arr.includes(value)
    ? arr.filter((v) => v !== value)
    : [...arr, value];
}

// ============================================================
// Debounce timer — module scope
// ============================================================

let countTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFetchCount() {
  if (countTimer) clearTimeout(countTimer);
  countTimer = setTimeout(() => {
    useSearchStore.getState().fetchCount();
  }, 300);
}

// ============================================================
// Zustand store
// ============================================================

export const useSearchStore = create<SearchState & SearchActions>(
  (set, get) => ({
    // --- state ---
    filters: { ...DEFAULT_FILTERS },
    results: [],
    totalCount: null,
    isLoadingCount: false,
    isLoadingResults: false,
    isLoadingMore: false,
    nextCursor: null,
    hasMore: false,
    error: null,

    // --- filter mutations ---

    setIndustries: (codes) => {
      set((s) => ({ filters: { ...s.filters, industries: codes } }));
      scheduleFetchCount();
    },

    toggleIndustry: (code) => {
      set((s) => ({
        filters: {
          ...s.filters,
          industries: toggle(s.filters.industries, code),
        },
      }));
      scheduleFetchCount();
    },

    setPrefectures: (codes) => {
      set((s) => ({ filters: { ...s.filters, prefectures: codes } }));
      scheduleFetchCount();
    },

    togglePrefecture: (code) => {
      set((s) => ({
        filters: {
          ...s.filters,
          prefectures: toggle(s.filters.prefectures, code),
        },
      }));
      scheduleFetchCount();
    },

    setKeyword: (keyword) => {
      set((s) => ({ filters: { ...s.filters, keyword } }));
      scheduleFetchCount();
    },

    removeFilter: (chip) => {
      const { filters } = get();
      if (chip.category === "industry") {
        set({
          filters: {
            ...filters,
            industries: filters.industries.filter((c) => c !== chip.id),
          },
        });
      } else if (chip.category === "region") {
        set({
          filters: {
            ...filters,
            prefectures: filters.prefectures.filter((c) => c !== chip.id),
          },
        });
      }
      scheduleFetchCount();
    },

    clearAllFilters: () => {
      set({
        filters: { ...DEFAULT_FILTERS },
        results: [],
        totalCount: null,
        nextCursor: null,
        hasMore: false,
      });
    },

    // --- data fetching ---

    fetchCount: async () => {
      const { filters } = get();
      set({ isLoadingCount: true, error: null });

      try {
        const params = buildQueryParams(filters);
        const res = await fetch(`/api/search/count?${params.toString()}`);
        if (!res.ok) throw new Error("Count fetch failed");
        const data: CountResponse = await res.json();
        set({ totalCount: data.total_count_approx, isLoadingCount: false });
      } catch (err) {
        set({
          isLoadingCount: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    },

    fetchResults: async () => {
      const { filters } = get();
      set({
        isLoadingResults: true,
        error: null,
        nextCursor: null,
        results: [],
      });

      try {
        const params = buildQueryParams(filters);
        const res = await fetch(`/api/search?${params.toString()}`);
        if (!res.ok) throw new Error("Search failed");
        const data: SearchResponse = await res.json();
        set({
          results: data.companies,
          totalCount: data.total_count_approx,
          nextCursor: data.next_cursor,
          hasMore: data.has_more,
          isLoadingResults: false,
        });
      } catch (err) {
        set({
          isLoadingResults: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    },

    loadMore: async () => {
      const { filters, nextCursor, isLoadingMore } = get();
      if (isLoadingMore || !nextCursor) return;

      set({ isLoadingMore: true, error: null });

      try {
        const params = buildQueryParams(filters, nextCursor);
        const res = await fetch(`/api/search?${params.toString()}`);
        if (!res.ok) throw new Error("Load more failed");
        const data: SearchResponse = await res.json();
        set((s) => ({
          results: [...s.results, ...data.companies],
          nextCursor: data.next_cursor,
          hasMore: data.has_more,
          isLoadingMore: false,
        }));
      } catch (err) {
        set({
          isLoadingMore: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    },
  }),
);

// ============================================================
// Convenience selectors
// ============================================================

export function useFilterChips(): FilterChip[] {
  const filters = useSearchStore((s) => s.filters);
  const chips: FilterChip[] = [];

  for (const code of filters.industries) {
    chips.push({ id: code, label: code, category: "industry" });
  }
  for (const code of filters.prefectures) {
    chips.push({ id: code, label: code, category: "region" });
  }

  return chips;
}
