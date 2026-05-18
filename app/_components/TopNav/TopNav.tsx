"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useAuthStore } from "@/app/stores/authStore";
import { UserMenu } from "@/app/_components/UserMenu/UserMenu";
import { UserInfoModal } from "@/app/_components/UserInfoModal/UserInfoModal";
import { ChangePasswordModal } from "@/app/_components/ChangePasswordModal/ChangePasswordModal";
import styles from "./TopNav.module.css";

// Returns true only after the first client-side render, preventing hydration mismatch
// when Zustand's persist middleware rehydrates localStorage on the client.
function useIsClient(): boolean {
  return useSyncExternalStore(
    (callback) => {
      // No external subscription needed — we just need the client snapshot.
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => true,   // client snapshot: we are on the client
    () => false,  // server snapshot: not hydrated yet
  );
}

export default function TopNav() {
  const isClient = useIsClient();

  const user = useAuthStore((s) => s.user);
  const userInfoModalOpen = useAuthStore((s) => s.userInfoModalOpen);
  const changePasswordModalOpen = useAuthStore((s) => s.changePasswordModalOpen);
  const closeUserInfoModal = useAuthStore((s) => s.closeUserInfoModal);
  const closeChangePasswordModal = useAuthStore((s) => s.closeChangePasswordModal);

  return (
    <>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              ZLog
            </Link>
          </div>
          <nav className={styles.links}>
            <Link href="/" className={styles.link}>
              Dashboard
            </Link>
            <Link href="/analyze" className={styles.link}>
              Analyze
            </Link>
            <Link href="/history" className={styles.link}>
              History
            </Link>
          </nav>
          <div className={styles.actions}>
            {isClient && (
              user ? (
                <UserMenu user={user} />
              ) : (
                <Link href="/login" className={styles.loginLink}>
                  Sign In
                </Link>
              )
            )}
          </div>
        </div>
      </header>

      {isClient && user && (
        <>
          <UserInfoModal
            open={userInfoModalOpen}
            onClose={closeUserInfoModal}
            user={user}
          />
          <ChangePasswordModal
            open={changePasswordModalOpen}
            onClose={closeChangePasswordModal}
          />
        </>
      )}
    </>
  );
}
