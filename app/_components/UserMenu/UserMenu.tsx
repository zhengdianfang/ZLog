"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/app/actions/auth";
import { useAuthStore } from "@/app/stores/authStore";
import type { AuthUser } from "@/app/stores/authStore";
import { getInitials } from "@/app/lib/userUtils";
import styles from "./UserMenu.module.css";

interface UserMenuProps {
  user: AuthUser;
}
export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { isLoggingOut, setIsLoggingOut, clearUser, openUserInfoModal, openChangePasswordModal } =
    useAuthStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  async function handleLogout() {
    setIsLoggingOut(true);
    setOpen(false);
    const result = await logoutUser();
    if (result.success) {
      clearUser();
      router.push("/");
    } else {
      setIsLoggingOut(false);
    }
  }

  function handleUserInfoClick() {
    setOpen(false);
    openUserInfoModal();
  }

  function handleChangePasswordClick() {
    setOpen(false);
    openChangePasswordModal();
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.avatarButton}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt={getInitials(user)} className={styles.avatarImage} />
        ) : (
          getInitials(user)
        )}
      </button>

      {open && (
        <div className={styles.dropdown} role="menu" aria-label="Account menu">
          <ul className={styles.menuList}>
            <li role="none">
              <button
                type="button"
                className={`${styles.menuItem} ${styles.menuItemCaption}`}
                role="menuitem"
                onClick={handleUserInfoClick}
              >
                {user.displayName ?? user.email}
              </button>
            </li>
            <li role="none" className={styles.menuDivider} />
            <li role="none">
              <button
                type="button"
                className={styles.menuItem}
                role="menuitem"
                onClick={handleChangePasswordClick}
              >
                Update Password
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                role="menuitem"
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-disabled={isLoggingOut}
              >
                {isLoggingOut && <span className={styles.spinner} aria-hidden="true" />}
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
