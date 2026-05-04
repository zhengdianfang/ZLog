"use client";

import { useRef, useCallback } from "react";
import styles from "./WelcomePanel.module.css";
import { useFileStore } from "@/app/stores/fileStore";
import { SUPPORTED_EXTENSIONS } from "@/app/lib/fileUtils";

const ACCEPT = SUPPORTED_EXTENSIONS.map((ext) => `.${ext}`).join(",");

const DOC_LINKS = [
  { label: "Getting Started Guide", href: "#" },
  { label: "Log Format Reference", href: "#" },
  { label: "Scenario Analysis Overview", href: "#" },
];

const PLUGIN_LINKS = [
  { label: "Android Studio Plugin", href: "#" },
  { label: "Xcode Plugin", href: "#" },
];

export default function WelcomePanel() {
  const { openFile, validationError, isLoading, clearError } = useFileStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenClick = useCallback(() => {
    clearError();
    inputRef.current?.click();
  }, [clearError]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await openFile(file);
      e.target.value = "";
    },
    [openFile]
  );

  return (
    <div className={styles.panel}>
      <div className={styles.tabBar} role="tablist">
        <button
          role="tab"
          aria-selected="true"
          className={`${styles.tab} ${styles.tabActive}`}
          type="button"
        >
          Get Started
        </button>
      </div>

      <div className={styles.scrollArea}>
        <div className={styles.inner}>
          <section className={styles.hero}>
            <h2 className={styles.heading}>Welcome to ZLog</h2>
            <p className={styles.description}>
              A scenario-based log content analysis tool. View log information
              as a key timeline to quickly locate issues on mobile clients.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className={styles.fileInput}
              onChange={handleFileChange}
              aria-hidden="true"
              tabIndex={-1}
            />
            <button
              className={styles.openButton}
              type="button"
              onClick={handleOpenClick}
              disabled={isLoading}
            >
              {isLoading ? "Loading…" : "Open Log File"}
            </button>
            {validationError && (
              <p role="alert" className={styles.validationError}>
                {validationError}
              </p>
            )}
          </section>

          <div className={styles.divider} />

          <section className={styles.section} aria-labelledby="formats-title">
            <h3 className={styles.sectionTitle} id="formats-title">
              Supported Formats
            </h3>
            <ul
              className={styles.formatList}
              aria-label="Supported file formats"
            >
              {SUPPORTED_EXTENSIONS.map((ext) => (
                <li key={ext} className={styles.formatChip}>
                  .{ext}
                </li>
              ))}
            </ul>
          </section>

          <div className={styles.divider} />

          <section className={styles.section} aria-labelledby="docs-title">
            <h3 className={styles.sectionTitle} id="docs-title">
              Documentation
            </h3>
            <ul className={styles.linkList}>
              {DOC_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className={styles.link}>
                    {label}
                    <span className={styles.linkArrow} aria-hidden="true">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <div className={styles.divider} />

          <section className={styles.section} aria-labelledby="plugins-title">
            <h3 className={styles.sectionTitle} id="plugins-title">
              Plugins
            </h3>
            <ul className={styles.linkList}>
              {PLUGIN_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className={styles.link}>
                    {label}
                    <span className={styles.linkArrow} aria-hidden="true">
                      ↓
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
