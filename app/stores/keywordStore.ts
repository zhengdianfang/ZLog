import { create } from "zustand";
import type { KeywordRule } from "@/app/types/keyword";
import { saveKeywordRule, fetchKeywordRules } from "@/app/actions/keywordRules";

interface FocusedLine {
  index: number;
  bg: string;
}

interface KeywordStore {
  savedRules: KeywordRule[];
  rules: KeywordRule[];
  addRule: (rule: KeywordRule) => void;
  updateRule: (rule: KeywordRule) => void;
  removeRule: (id: string) => void;
  setActiveRuleIds: (ids: string[]) => void;
  loadRulesFromDb: () => Promise<void>;
  focusedLine: FocusedLine | null;
  setFocusedLine: (line: FocusedLine | null) => void;
}

export const useKeywordStore = create<KeywordStore>((set) => ({
  savedRules: [],
  rules: [],
  addRule: (rule) => {
    set((state) => ({
      savedRules: [...state.savedRules, rule],
      rules: [...state.rules, rule],
    }));
    saveKeywordRule(rule);
  },
  updateRule: (rule) => {
    set((state) => ({
      savedRules: state.savedRules.map((r) => (r.id === rule.id ? rule : r)),
      rules: state.rules.map((r) => (r.id === rule.id ? rule : r)),
    }));
    saveKeywordRule(rule);
  },
  removeRule: (id) => {
    set((state) => ({
      savedRules: state.savedRules.filter((r) => r.id !== id),
      rules: state.rules.filter((r) => r.id !== id),
    }));
  },
  setActiveRuleIds: (ids) => {
    set((state) => ({ rules: state.savedRules.filter((r) => ids.includes(r.id)) }));
  },
  loadRulesFromDb: async () => {
    const loaded = await fetchKeywordRules();
    set({ savedRules: loaded, rules: loaded });
  },
  focusedLine: null,
  setFocusedLine: (line) => set({ focusedLine: line }),
}));
