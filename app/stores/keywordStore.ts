import { create } from "zustand";
import type { KeywordRule } from "@/app/types/keyword";

interface FocusedLine {
  index: number;
  bg: string;
}

interface KeywordStore {
  rules: KeywordRule[];
  addRule: (rule: KeywordRule) => void;
  updateRule: (rule: KeywordRule) => void;
  removeRule: (id: string) => void;
  focusedLine: FocusedLine | null;
  setFocusedLine: (line: FocusedLine | null) => void;
}

export const useKeywordStore = create<KeywordStore>((set) => ({
  rules: [],
  addRule: (rule) => set((state) => ({ rules: [...state.rules, rule] })),
  updateRule: (rule) =>
    set((state) => ({ rules: state.rules.map((r) => (r.id === rule.id ? rule : r)) })),
  removeRule: (id) => set((state) => ({ rules: state.rules.filter((r) => r.id !== id) })),
  focusedLine: null,
  setFocusedLine: (line) => set({ focusedLine: line }),
}));
