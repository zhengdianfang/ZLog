import { create } from "zustand";
import type { KeywordRule } from "@/app/types/keyword";

interface KeywordStore {
  rules: KeywordRule[];
  addRule: (rule: KeywordRule) => void;
  removeRule: (id: string) => void;
}

export const useKeywordStore = create<KeywordStore>((set) => ({
  rules: [],
  addRule: (rule) => set((state) => ({ rules: [...state.rules, rule] })),
  removeRule: (id) => set((state) => ({ rules: state.rules.filter((r) => r.id !== id) })),
}));
