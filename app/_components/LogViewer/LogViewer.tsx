"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import styles from "./LogViewer.module.css";
import { useFileStore } from "@/app/stores/fileStore";
import { useFilterStore } from "@/app/stores/filterStore";
import { parseLineTimestamp } from "@/app/lib/timestampParser";
import { buildSearchRegex } from "@/app/lib/searchUtils";
import KeywordSearch from "@/app/_components/KeywordSearch/KeywordSearch";
import LogViewerTabBar from "@/app/_components/LogViewer/LogViewerTabBar";
import SearchResultsPane from "@/app/_components/LogViewer/SearchResultsPane";
import type { SearchTab, ActiveTabId } from "@/app/lib/searchTypes";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LogViewer() {
  const { loadedFile, closeFile } = useFileStore();
  const { startTime, endTime, isRegexMode, isCaseSensitive, setSubmittedKeyword } =
    useFilterStore();

  const [searchTabs, setSearchTabs] = useState<SearchTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<ActiveTabId>("log");

  /** Ref to the Log tab button — focus is moved here after a search tab is closed. */
  const logTabRef = useRef<HTMLButtonElement | null>(null);

  const lines = useMemo(() => {
    if (!loadedFile?.content) return [];
    const raw = loadedFile.content.split("\n");
    return raw[raw.length - 1] === "" ? raw.slice(0, -1) : raw;
  }, [loadedFile]);

  const isTimeFilterActive = startTime !== "" || endTime !== "";

  const timeFilteredLines = useMemo(() => {
    if (!isTimeFilterActive) {
      return lines.map((line, index) => ({ line, originalIndex: index }));
    }
    const toSeconds = (t: string) => {
      const [h, m, s = "0"] = t.split(":");
      return Number(h) * 3600 + Number(m) * 60 + parseFloat(s);
    };
    const start = startTime ? toSeconds(startTime) : null;
    const end = endTime ? toSeconds(endTime) : null;
    return lines
      .map((line, index) => ({ line, originalIndex: index }))
      .filter(({ line }) => {
        const ts = parseLineTimestamp(line);
        if (!ts) return false;
        const sec = ts.getHours() * 3600 + ts.getMinutes() * 60 + ts.getSeconds();
        if (start !== null && sec < start) return false;
        if (end !== null && sec > end) return false;
        return true;
      });
  }, [lines, isTimeFilterActive, startTime, endTime]);

  const handleSearch = useCallback(
    (keyword: string) => {
      // Keep the store's submittedKeyword in sync for any store-reading components.
      setSubmittedKeyword(keyword);

      // Snapshot mode flags at search time so each tab is self-contained.
      const snapshotRegexMode = isRegexMode;
      const snapshotCaseSensitive = isCaseSensitive;

      const regex = buildSearchRegex(keyword, snapshotRegexMode, snapshotCaseSensitive);
      const matchedLines =
        regex !== null
          ? timeFilteredLines.filter(({ line }) => regex.test(line))
          : timeFilteredLines;

      const newTab: SearchTab = {
        id: crypto.randomUUID(),
        label: keyword,
        lines: matchedLines,
        isRegexMode: snapshotRegexMode,
        isCaseSensitive: snapshotCaseSensitive,
      };

      setSearchTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    },
    [setSubmittedKeyword, isRegexMode, isCaseSensitive, timeFilteredLines],
  );

  const handleCloseTab = useCallback(
    (id: string) => {
      setSearchTabs((prev) => {
        const idx = prev.findIndex((t) => t.id === id);
        const next = prev.filter((t) => t.id !== id);

        // Focus management: if the closed tab was active, move to nearest-left sibling
        // or fall back to the Log tab.
        setActiveTabId((current) => {
          if (current !== id) return current;
          if (idx > 0) return next[idx - 1].id;
          return "log";
        });

        return next;
      });

      // Move DOM focus to the Log tab button when the closed tab was the active one.
      // We defer slightly so state has settled before the element is queried.
      requestAnimationFrame(() => {
        if (activeTabId === id) {
          logTabRef.current?.focus();
        }
      });
    },
    [activeTabId],
  );

  if (!loadedFile) return null;

  const lineNumWidth = `${String(lines.length).length}ch`;
  const emptyDueToTime = isTimeFilterActive && timeFilteredLines.length === 0;

  // Find the currently active search tab (null when log tab is active).
  const activeSearchTab = searchTabs.find((t) => t.id === activeTabId) ?? null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.fileInfo}>
          <span className={styles.fileName}>{loadedFile.name}</span>
          <span className={styles.fileMeta}>
            {formatFileSize(loadedFile.size)} · .{loadedFile.extension}
            {lines.length > 0 && ` · ${lines.length.toLocaleString()} lines`}
            {isTimeFilterActive &&
              ` · ${timeFilteredLines.length.toLocaleString()} matched`}
          </span>
        </div>
        <button
          className={styles.closeButton}
          onClick={closeFile}
          type="button"
          aria-label="Close file"
        >
          ✕
        </button>
      </header>
      <div className={styles.searchBar}>
        <KeywordSearch onSearch={handleSearch} />
      </div>
      <LogViewerTabBar
        searchTabs={searchTabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        onCloseTab={handleCloseTab}
        logTabRef={logTabRef}
      />
      <div
        className={styles.content}
        role="tabpanel"
        id="panel-log"
        tabIndex={activeTabId === "log" ? 0 : -1}
        aria-hidden={activeTabId !== "log"}
      >
        {activeSearchTab !== null ? (
          <SearchResultsPane tab={activeSearchTab} lineNumWidth={lineNumWidth} />
        ) : loadedFile.content !== null ? (
          <>
            {emptyDueToTime ? (
              <div className={styles.emptyFilter}>
                <p>No log entries match the selected time range.</p>
                <p className={styles.emptyFilterHint}>
                  Try adjusting or clearing the filter.
                </p>
              </div>
            ) : (
              <div className={styles.logBody}>
                {timeFilteredLines.map(({ line, originalIndex }) => (
                  <div key={originalIndex} className={styles.logLine}>
                    <span
                      className={styles.lineNumber}
                      style={{ minWidth: lineNumWidth }}
                    >
                      {originalIndex + 1}
                    </span>
                    <span className={styles.lineContent}>{line}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={styles.binaryMessage}>
            <p>Binary file loaded — ready for analysis.</p>
            <p className={styles.binaryHint}>
              ZLog will parse <strong>.{loadedFile.extension}</strong> format
              automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
