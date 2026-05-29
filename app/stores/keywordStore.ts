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
  loadRulesFromDb: () => Promise<void>;
  focusedLine: FocusedLine | null;
  setFocusedLine: (line: FocusedLine | null) => void;
}

export const useKeywordStore = create<KeywordStore>((set) => ({
  rules: [],
  addRule: (rule) => {
    set((state) => ({ rules: [...state.rules, rule] }));
    import("@/app/actions/keywordRules").then(({ saveKeywordRule }) => saveKeywordRule(rule));
  },
  updateRule: (rule) => {
    set((state) => ({ rules: state.rules.map((r) => (r.id === rule.id ? rule : r)) }));
    import("@/app/actions/keywordRules").then(({ saveKeywordRule }) => saveKeywordRule(rule));
  },
  removeRule: (id) => {
    set((state) => ({ rules: state.rules.filter((r) => r.id !== id) }));
    import("@/app/actions/keywordRules").then(({ deleteKeywordRule }) => deleteKeywordRule(id));
  },
  loadRulesFromDb: async () => {
    const { fetchKeywordRules } = await import("@/app/actions/keywordRules");
    const rules = await fetchKeywordRules();
    set({ rules });
  },
  focusedLine: null,
  setFocusedLine: (line) => set({ focusedLine: line }),
}));
