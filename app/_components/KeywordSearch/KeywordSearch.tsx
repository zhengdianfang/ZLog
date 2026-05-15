"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./KeywordSearch.module.css";
import { useFilterStore } from "@/app/stores/filterStore";
import { useFileStore } from "@/app/stores/fileStore";

interface KeywordSearchProps {
  matchCount?: number;
  totalFiltered?: number;
}

/**
 * Compute a regex error message for the current input value when regex mode is
 * active, or null when the pattern is valid (or mode is inactive).
 */
function getRegexError(value: string, isRegexMode: boolean): string | null {
  if (!isRegexMode || value === "") return null;
  try {
    new RegExp(value);
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : "Invalid regular expression";
  }
}

export default function KeywordSearch({ matchCount, totalFiltered }: KeywordSearchProps) {
  const { keyword, setKeyword, isRegexMode, setIsRegexMode, isCaseSensitive, setIsCaseSensitive } =
    useFilterStore();
  const { loadedFile } = useFileStore();
  const [inputValue, setInputValue] = useState(keyword);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Regex error is derived locally — no need to persist it in the store.
  const regexError = getRegexError(inputValue, isRegexMode);
  const isRegexInvalid = regexError !== null;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setKeyword(value), 150);
    },
    [setKeyword],
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    setKeyword("");
    // Toggle states (isRegexMode, isCaseSensitive) are intentionally preserved on clear.
  }, [setKeyword]);

  const handleToggleCase = useCallback(() => {
    setIsCaseSensitive(!isCaseSensitive);
  }, [isCaseSensitive, setIsCaseSensitive]);

  const handleToggleRegex = useCallback(() => {
    setIsRegexMode(!isRegexMode);
  }, [isRegexMode, setIsRegexMode]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const showCount = keyword.trim() !== "" && loadedFile !== null;
  const isDisabled = loadedFile === null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputRow}>
        <svg
          className={styles.searchIcon}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="6.5" cy="6.5" r="4.5" />
          <line x1="10.5" y1="10.5" x2="14" y2="14" />
        </svg>
        <input
          className={`${styles.input}${isRegexInvalid ? ` ${styles.inputError}` : ""}`}
          type="text"
          placeholder="Search logs…"
          value={inputValue}
          onChange={handleChange}
          aria-label="Search logs by keyword"
          aria-invalid={isRegexInvalid}
          spellCheck={false}
          disabled={isDisabled}
        />
        {/* Tab order: Aa → .* → ✕ (left-to-right visual order, natural DOM order) */}
        <div className={styles.toggleGroup}>
          <button
            type="button"
            className={`${styles.toggleBtn}${isCaseSensitive ? ` ${styles.toggleBtnActive}` : ""}`}
            onClick={handleToggleCase}
            aria-label="Toggle case sensitivity"
            aria-pressed={isCaseSensitive}
            disabled={isDisabled}
          >
            Aa
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn}${isRegexMode ? ` ${styles.toggleBtnActive}` : ""}`}
            onClick={handleToggleRegex}
            aria-label="Toggle regex mode"
            aria-pressed={isRegexMode}
            disabled={isDisabled}
          >
            .*
          </button>
        </div>
        {inputValue && (
          <button
            className={styles.clearBtn}
            onClick={handleClear}
            type="button"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      {/* Regex error row — announced immediately by screen readers via role="alert" */}
      {isRegexInvalid && (
        <p className={styles.regexError} role="alert" aria-live="assertive">
          ⚠ Invalid regex: {regexError}
        </p>
      )}
      {showCount && (
        <span
          className={`${styles.resultCount} ${(matchCount ?? 0) > 0 ? styles.hasResults : ""}`}
        >
          {matchCount === 0
            ? "No matches found"
            : `${matchCount?.toLocaleString()} of ${totalFiltered?.toLocaleString()} lines match`}
        </span>
      )}
    </div>
  );
}
