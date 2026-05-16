import { create } from "zustand";

interface FilterStore {
  startTime: string;
  endTime: string;
  keyword: string;
  /** The keyword that was explicitly submitted (Enter or Search button). Filtering reads this. */
  submittedKeyword: string;
  isClearing: boolean;
  /** When true, the keyword is interpreted as a regular expression. */
  isRegexMode: boolean;
  /**
   * When true, matching is case-sensitive.
   * Default is false (case-insensitive) to preserve existing behaviour.
   */
  isCaseSensitive: boolean;
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
  setKeyword: (keyword: string) => void;
  setSubmittedKeyword: (v: string) => void;
  beginClear: () => void;
  clearFilter: () => void;
  setIsRegexMode: (value: boolean) => void;
  setIsCaseSensitive: (value: boolean) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  startTime: "",
  endTime: "",
  keyword: "",
  submittedKeyword: "",
  isClearing: false,
  isRegexMode: false,
  isCaseSensitive: false,
  setStartTime: (time) => set({ startTime: time }),
  setEndTime: (time) => set({ endTime: time }),
  setKeyword: (keyword) => set({ keyword }),
  setSubmittedKeyword: (v) => set({ submittedKeyword: v }),
  beginClear: () => set({ isClearing: true }),
  clearFilter: () => set({ startTime: "", endTime: "", isClearing: false }),
  setIsRegexMode: (value) => set({ isRegexMode: value }),
  setIsCaseSensitive: (value) => set({ isCaseSensitive: value }),
}));
