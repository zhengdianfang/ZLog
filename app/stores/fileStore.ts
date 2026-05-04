import { create } from "zustand";
import { getFileExtension, validateFile } from "@/app/lib/fileUtils";

const BINARY_EXTENSIONS = new Set(["zip", "gz", "qlog"]);

export interface LoadedFile {
  name: string;
  size: number;
  extension: string;
  content: string | null;
}

interface FileStore {
  loadedFile: LoadedFile | null;
  validationError: string | null;
  isLoading: boolean;
  openFile: (file: File) => Promise<void>;
  closeFile: () => void;
  clearError: () => void;
}

export const useFileStore = create<FileStore>((set) => ({
  loadedFile: null,
  validationError: null,
  isLoading: false,

  openFile: async (file: File) => {
    const result = validateFile(file);
    if (!result.valid) {
      set({ validationError: result.error });
      return;
    }
    set({ isLoading: true, validationError: null });
    const ext = getFileExtension(file.name);
    const content = BINARY_EXTENSIONS.has(ext) ? null : await file.text();
    set({
      loadedFile: { name: file.name, size: file.size, extension: ext, content },
      isLoading: false,
    });
  },

  closeFile: () => set({ loadedFile: null, validationError: null }),
  clearError: () => set({ validationError: null }),
}));
