"use client";

import { useEffect, useRef } from "react";
import type { AuthUser } from "@/app/stores/authStore";
import styles from "./UserInfoModal.module.css";

interface UserInfoModalProps {
  open: boolean;
  onClose: () => void;
  user: AuthUser;
}

export function UserInfoModal({ open, onClose, user }: UserInfoModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the close button when modal opens
  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-info-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 id="user-info-modal-title" className={styles.title}>
            User Info
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close user info"
            ref={closeButtonRef}
          >
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.fieldGroup}>
            <label htmlFor="user-info-email" className={styles.label}>
              Email
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden="true">
                🔒
              </span>
              <input
                id="user-info-email"
                type="email"
                className={styles.input}
                value={user.email}
                readOnly
                aria-readonly="true"
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="user-info-display-name" className={styles.label}>
              Display Name
            </label>
            <div className={`${styles.inputWrapper} ${styles.editable}`}>
              <input
                id="user-info-display-name"
                type="text"
                className={styles.input}
                defaultValue={user.displayName ?? ""}
                placeholder="Enter display name"
              />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.buttonClose} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
