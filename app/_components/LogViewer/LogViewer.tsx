"use client";

import { useMemo } from "react";
import styles from "./LogViewer.module.css";
import { useFileStore } from "@/app/stores/fileStore";
import { useFilterStore } from "@/app/stores/filterStore";
import { parseLineTimestamp } from "@/app/lib/timestampParser";
import KeywordSearch from "@/app/_components/KeywordSearch/KeywordSearch";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Build a search RegExp from the current filter state.
 *
 * Behaviour:
 *   - Returns null when keyword is empty (no filtering).
 *   - isRegexMode=true: treats keyword as a raw regex pattern.
 *     Returns null (fail-open) when the pattern is syntactically invalid.
 *   - isRegexMode=false: the "|" character splits the keyword into OR terms.
 *     Each term is escaped so it is treated as a plain literal string.
 *     Example: "crash|ANR|OOM" → /crash|ANR|OOM/i
 *   - isCaseSensitive controls presence of the "i" flag.
 *
 * The returned regex does NOT carry the "g" flag so it is safe to call
 * `.test()` repeatedly without `lastIndex` state mutations.
 */
function buildSearchRegex(
  keyword: string,
  isRegexMode: boolean,
  isCaseSensitive: boolean,
): RegExp | null {
  if (keyword.trim() === "") return null;
  const flags = isCaseSensitive ? "" : "i";
  if (isRegexMode) {
    try {
      return new RegExp(keyword, flags);
    } catch {
      // Invalid regex — fail-open: show all lines rather than crashing.
      return null;
    }
  }
  // Non-regex mode: split on "|" into independent OR terms, escape each one.
  const terms = keyword
    .split("|")
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (terms.length === 0) return null;
  return new RegExp(terms.join("|"), flags);
}

/**
 * Highlight all matches of `searchRegex` in `text`.
 * Uses the global variant of the regex (matchAll) to avoid lastIndex bugs.
 */
function highlightKeyword(text: string, searchRegex: RegExp): React.ReactNode {
  // Build a global copy for matchAll; the caller's regex has no "g" flag.
  const globalRegex = new RegExp(searchRegex.source, searchRegex.flags + "g");
  const matches = [...text.matchAll(globalRegex)];
  if (matches.length === 0) return text;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  for (const match of matches) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (start > cursor) nodes.push(text.slice(cursor, start));
    nodes.push(
      <mark key={start} className={styles.highlight}>
        {match[0]}
      </mark>,
    );
    cursor = end;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export default function LogViewer() {
  const { loadedFile, closeFile } = useFileStore();
  const { startTime, endTime, keyword, isRegexMode, isCaseSensitive } = useFilterStore();

  const lines = useMemo(() => {
    if (!loadedFile?.content) return [];
    const raw = loadedFile.content.split("\n");
    return raw[raw.length - 1] === "" ? raw.slice(0, -1) : raw;
  }, [loadedFile]);

  const isTimeFilterActive = startTime !== "" || endTime !== "";
  const isKeywordActive = keyword.trim() !== "";

  // Build the search regex once; reuse for both filtering and highlighting.
  const searchRegex = useMemo(
    () => buildSearchRegex(keyword, isRegexMode, isCaseSensitive),
    [keyword, isRegexMode, isCaseSensitive],
  );

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

  const displayLines = useMemo(() => {
    // When no keyword is active, or no valid regex was built (e.g. invalid pattern
    // in regex mode), show all time-filtered lines — fail-open behaviour.
    if (!isKeywordActive || searchRegex === null) return timeFilteredLines;
    return timeFilteredLines.filter(({ line }) => searchRegex.test(line));
  }, [timeFilteredLines, isKeywordActive, searchRegex]);

  if (!loadedFile) return null;

  const isFilterActive = isTimeFilterActive || isKeywordActive;
  const lineNumWidth = `${String(lines.length).length}ch`;

  const emptyDueToKeyword = isKeywordActive && displayLines.length === 0;
  const emptyDueToTime = !isKeywordActive && isTimeFilterActive && timeFilteredLines.length === 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.fileInfo}>
          <span className={styles.fileName}>{loadedFile.name}</span>
          <span className={styles.fileMeta}>
            {formatFileSize(loadedFile.size)} · .{loadedFile.extension}
            {lines.length > 0 && ` · ${lines.length.toLocaleString()} lines`}
            {isFilterActive &&
              ` · ${displayLines.length.toLocaleString()} matched`}
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
        <KeywordSearch
          matchCount={isKeywordActive ? displayLines.length : undefined}
          totalFiltered={isKeywordActive ? timeFilteredLines.length : undefined}
        />
      </div>
      <div className={styles.content}>
        {loadedFile.content !== null ? (
          <>
            {emptyDueToKeyword ? (
              <div className={styles.emptyFilter}>
                <p>No log entries match &ldquo;{keyword}&rdquo;.</p>
                <p className={styles.emptyFilterHint}>
                  Try a different keyword or clear the search.
                </p>
              </div>
            ) : emptyDueToTime ? (
              <div className={styles.emptyFilter}>
                <p>No log entries match the selected time range.</p>
                <p className={styles.emptyFilterHint}>
                  Try adjusting or clearing the filter.
                </p>
              </div>
            ) : (
              <div className={styles.logBody}>
                {displayLines.map(({ line, originalIndex }) => (
                  <div key={originalIndex} className={styles.logLine}>
                    <span
                      className={styles.lineNumber}
                      style={{ minWidth: lineNumWidth }}
                    >
                      {originalIndex + 1}
                    </span>
                    <span className={styles.lineContent}>
                      {isKeywordActive && searchRegex !== null
                        ? highlightKeyword(line, searchRegex)
                        : line}
                    </span>
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
