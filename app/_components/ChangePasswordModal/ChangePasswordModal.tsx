"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ChangePasswordModal.module.css";

interface ChangePasswordFormProps {
  onClose: () => void;
}

// Extracted form so it remounts each time the modal opens,
// which naturally resets all controlled state without effects.
function ChangePasswordForm({ onClose }: ChangePasswordFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button on mount (i.e., when modal opens)
  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  return (
    <>
      <div className={styles.body}>
        <div className={styles.fieldGroup}>
          <label htmlFor="change-password-current" className={styles.label}>
            Current Password
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="change-password-current"
              type={showCurrentPassword ? "text" : "password"}
              className={styles.input}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.revealButton}
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
            >
              {showCurrentPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="change-password-new" className={styles.label}>
            New Password
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="change-password-new"
              type={showNewPassword ? "text" : "password"}
              className={styles.input}
              placeholder="Enter new password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.revealButton}
              onClick={() => setShowNewPassword((prev) => !prev)}
              aria-label={showNewPassword ? "Hide new password" : "Show new password"}
            >
              {showNewPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.buttonCancel}
          onClick={onClose}
          ref={cancelButtonRef}
        >
          Cancel
        </button>
        <button type="button" className={styles.buttonSave} onClick={onClose}>
          Save
        </button>
      </div>
    </>
  );
}

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
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
      aria-labelledby="change-password-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 id="change-password-modal-title" className={styles.title}>
            Change Password
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close change password"
          >
            ×
          </button>
        </div>

        {/* Key forces remount on each open, resetting all form state cleanly */}
        <ChangePasswordForm key={String(open)} onClose={onClose} />
      </div>
    </div>
  );
}
