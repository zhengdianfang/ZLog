"use client";

import { useMemo } from "react";
import styles from "./LogViewer.module.css";
import { useFileStore } from "@/app/stores/fileStore";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LogViewer() {
  const { loadedFile, closeFile } = useFileStore();

  const lines = useMemo(() => {
    if (!loadedFile?.content) return [];
    const raw = loadedFile.content.split("\n");
    return raw[raw.length - 1] === "" ? raw.slice(0, -1) : raw;
  }, [loadedFile]);

  if (!loadedFile) return null;

  const lineNumWidth = `${String(lines.length).length}ch`;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.fileInfo}>
          <span className={styles.fileName}>{loadedFile.name}</span>
          <span className={styles.fileMeta}>
            {formatFileSize(loadedFile.size)} · .{loadedFile.extension}
            {lines.length > 0 &&
              ` · ${lines.length.toLocaleString()} lines`}
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
          <div className={styles.logBody}>
            {lines.map((line, index) => (
              <div key={index} className={styles.logLine}>
                <span
                  className={styles.lineNumber}
                  style={{ minWidth: lineNumWidth }}
                >
                  {index + 1}
                </span>
                <span className={styles.lineContent}>{line}</span>
              </div>
            ))}
          </div>
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
