import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

interface AuthStore {
  user: AuthUser | null;
  isLoggingOut: boolean;
  userInfoModalOpen: boolean;
  changePasswordModalOpen: boolean;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  setIsLoggingOut: (value: boolean) => void;
  openUserInfoModal: () => void;
  closeUserInfoModal: () => void;
  openChangePasswordModal: () => void;
  closeChangePasswordModal: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoggingOut: false,
      userInfoModalOpen: false,
      changePasswordModalOpen: false,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setIsLoggingOut: (value) => set({ isLoggingOut: value }),
      openUserInfoModal: () => set({ userInfoModalOpen: true }),
      closeUserInfoModal: () => set({ userInfoModalOpen: false }),
      openChangePasswordModal: () => set({ changePasswordModalOpen: true }),
      closeChangePasswordModal: () => set({ changePasswordModalOpen: false }),
    }),
    {
      name: "zlog-auth",
      // Persist only the user field; transient UI state is not persisted
      partialize: (state) => ({ user: state.user }),
    }
  )
);
