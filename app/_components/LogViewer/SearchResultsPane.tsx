"use client";

import styles from "./SearchResultsPane.module.css";
import { buildSearchRegex, highlightKeyword } from "@/app/lib/searchUtils";
import logViewerStyles from "./LogViewer.module.css";
import type { SearchTab } from "@/app/lib/searchTypes";

interface SearchResultsPaneProps {
  tab: SearchTab;
  lineNumWidth: string;
}

export default function SearchResultsPane({ tab, lineNumWidth }: SearchResultsPaneProps) {
  const searchRegex = buildSearchRegex(tab.label, tab.isRegexMode, tab.isCaseSensitive);

  const resultsHeader = (
    <div className={styles.resultsHeader} aria-live="polite">
      Results for: <span className={styles.resultsQuery}>&ldquo;{tab.label}&rdquo;</span>
      &nbsp;&middot;&nbsp;
      <span className={styles.resultsCount}>{tab.lines.length.toLocaleString()}</span> lines matched
    </div>
  );

  if (tab.lines.length === 0) {
    return (
      <div className={styles.pane}>
        {resultsHeader}
        <div className={styles.emptyState} role="status">
          <p>No matches for &ldquo;{tab.label}&rdquo;</p>
          <p className={styles.emptyHint}>Try a different keyword or search mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pane} role="tabpanel" id={`panel-${tab.id}`} tabIndex={0}>
      {resultsHeader}
      <div className={styles.resultsBody}>
        {tab.lines.map(({ line, originalIndex }) => (
          <div key={originalIndex} className={logViewerStyles.logLine}>
            <span
              className={logViewerStyles.lineNumber}
              style={{ minWidth: lineNumWidth }}
            >
              {originalIndex + 1}
            </span>
            <span className={logViewerStyles.lineContent}>
              {searchRegex !== null
                ? highlightKeyword(line, searchRegex, logViewerStyles.highlight)
                : line}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
