import { create } from "zustand";

interface FilterStore {
  startTime: string;
  endTime: string;
  keyword: string;
  isClearing: boolean;
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
  setKeyword: (keyword: string) => void;
  beginClear: () => void;
  clearFilter: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  startTime: "",
  endTime: "",
  keyword: "",
  isClearing: false,
  setStartTime: (time) => set({ startTime: time }),
  setEndTime: (time) => set({ endTime: time }),
  setKeyword: (keyword) => set({ keyword }),
  beginClear: () => set({ isClearing: true }),
  clearFilter: () => set({ startTime: "", endTime: "", isClearing: false }),
}));
