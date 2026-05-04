"use client";

import styles from "./LogViewer.module.css";
import { useFileStore } from "@/app/stores/fileStore";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LogViewer() {
  const { loadedFile, closeFile } = useFileStore();

  if (!loadedFile) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.fileInfo}>
          <span className={styles.fileName}>{loadedFile.name}</span>
          <span className={styles.fileMeta}>
            {formatFileSize(loadedFile.size)} · .{loadedFile.extension}
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
          <pre className={styles.logContent}>{loadedFile.content}</pre>
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
