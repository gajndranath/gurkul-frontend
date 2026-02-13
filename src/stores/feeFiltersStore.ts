// frontend/src/features/admin/fees/stores/feeFiltersStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FeeFiltersState {
  month: number;
  year: number;
  actions: {
    setMonth: (month: number) => void;
    setYear: (year: number) => void;
    reset: () => void;
  };
}

const CURRENT_MONTH = new Date().getMonth();
const CURRENT_YEAR = new Date().getFullYear();

export const useFeeFiltersStore = create<FeeFiltersState>()(
  persist(
    (set) => ({
      month: CURRENT_MONTH,
      year: CURRENT_YEAR,
      actions: {
        setMonth: (month) => set({ month }),
        setYear: (year) => set({ year }),
        reset: () => set({ month: CURRENT_MONTH, year: CURRENT_YEAR }),
      },
    }),
    {
      name: "fee-filters",
      partialize: (state) => ({ month: state.month, year: state.year }),
    },
  ),
);

// Selector hooks for performance
export const useMonth = () => useFeeFiltersStore((state) => state.month);
export const useYear = () => useFeeFiltersStore((state) => state.year);
export const useFeeFiltersActions = () =>
  useFeeFiltersStore((state) => state.actions);
