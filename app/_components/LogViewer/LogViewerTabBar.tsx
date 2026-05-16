"use client";

import { useCallback, useMemo, useRef } from "react";
import styles from "./LogViewerTabBar.module.css";
import type { SearchTab, ActiveTabId } from "@/app/lib/searchTypes";

interface LogViewerTabBarProps {
  searchTabs: SearchTab[];
  activeTabId: ActiveTabId;
  onTabChange: (id: ActiveTabId) => void;
  onCloseTab: (id: string) => void;
  /** Ref to the Log tab button — used by LogViewer to move focus after close. */
  logTabRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function LogViewerTabBar({
  searchTabs,
  activeTabId,
  onTabChange,
  onCloseTab,
  logTabRef,
}: LogViewerTabBarProps) {
  /**
   * Map from tab id → its label button DOM element.
   * Used for Left/Right arrow key focus management across tab label buttons.
   */
  const tabButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  /** Ordered list of all focusable tab ids: "log" first, then each search tab. */
  const tabIds = useMemo(() => ["log", ...searchTabs.map((t) => t.id)], [searchTabs]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, currentId: string) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();

      const idx = tabIds.indexOf(currentId);
      const nextIdx =
        e.key === "ArrowRight"
          ? (idx + 1) % tabIds.length
          : (idx - 1 + tabIds.length) % tabIds.length;
      const nextId = tabIds[nextIdx];

      if (nextId === "log") {
        logTabRef?.current?.focus();
      } else {
        tabButtonRefs.current.get(nextId)?.focus();
      }
    },
    [tabIds, logTabRef],
  );

  return (
    <div
      className={styles.tabBar}
      role="tablist"
      aria-label="Log view tabs"
    >
      <div className={styles.tabList}>
        {/* Log tab — always present, no close button, sticky left */}
        <button
          ref={logTabRef}
          type="button"
          role="tab"
          aria-selected={activeTabId === "log"}
          aria-controls="panel-log"
          className={`${styles.tab} ${styles.logTab}${activeTabId === "log" ? ` ${styles.tabActive}` : ""}`}
          onClick={() => onTabChange("log")}
          onKeyDown={(e) => handleKeyDown(e, "log")}
        >
          Log
        </button>

        {/* One tab per search run */}
        {searchTabs.map((tab) => (
          <div key={tab.id} className={styles.searchTabWrapper}>
            <button
              ref={(el) => {
                if (el) tabButtonRefs.current.set(tab.id, el);
                else tabButtonRefs.current.delete(tab.id);
              }}
              type="button"
              role="tab"
              aria-selected={activeTabId === tab.id}
              aria-controls={`panel-${tab.id}`}
              title={tab.label}
              className={`${styles.tab}${activeTabId === tab.id ? ` ${styles.tabActive}` : ""}`}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
            >
              <span className={styles.tabLabel}>{tab.label}</span>
              <span className={styles.tabCount}>{tab.lines.length.toLocaleString()}</span>
            </button>
            <button
              type="button"
              className={styles.closeTab}
              onClick={() => onCloseTab(tab.id)}
              aria-label={`Close ${tab.label} search tab`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
