"use client";

import { useMemo } from "react";
import styles from "./LogViewer.module.css";
import { useFileStore } from "@/app/stores/fileStore";
import { useFilterStore } from "@/app/stores/filterStore";
import { parseLineTimestamp } from "@/app/lib/timestampParser";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LogViewer() {
  const { loadedFile, closeFile } = useFileStore();
  const { startTime, endTime } = useFilterStore();

  const lines = useMemo(() => {
    if (!loadedFile?.content) return [];
    const raw = loadedFile.content.split("\n");
    return raw[raw.length - 1] === "" ? raw.slice(0, -1) : raw;
  }, [loadedFile]);

  const isFilterActive = startTime !== "" || endTime !== "";

  const displayLines = useMemo(() => {
    if (!isFilterActive) {
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
  }, [lines, isFilterActive, startTime, endTime]);

  if (!loadedFile) return null;

  const lineNumWidth = `${String(lines.length).length}ch`;

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
      <div className={styles.content}>
        {loadedFile.content !== null ? (
          <>
            {displayLines.length === 0 && isFilterActive ? (
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
