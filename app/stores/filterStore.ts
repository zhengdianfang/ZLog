import { create } from "zustand";

interface FilterStore {
  startTime: string;
  endTime: string;
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
  clearFilter: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  startTime: "",
  endTime: "",
  setStartTime: (time) => set({ startTime: time }),
  setEndTime: (time) => set({ endTime: time }),
  clearFilter: () => set({ startTime: "", endTime: "" }),
}));
