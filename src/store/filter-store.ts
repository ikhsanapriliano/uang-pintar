import { create } from "zustand";

export type TFilterState = {
  active: string[];
  increment: (item: string) => void;
  decrement: (item: string) => void;
  reset: () => void;
};

export const useFilter = create<TFilterState>((set) => ({
  active: [],
  increment: (item: string) =>
    set((state) => ({ active: [...state.active, item] })),
  decrement: (item: string) =>
    set((state) => ({ active: [...state.active.filter((i) => i != item)] })),
  reset: () => set({ active: [] }),
}));
