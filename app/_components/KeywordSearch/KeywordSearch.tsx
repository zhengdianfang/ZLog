"use client";

import { useCallback, useState } from "react";
import styles from "./KeywordSearch.module.css";
import { useFilterStore } from "@/app/stores/filterStore";
import { useFileStore } from "@/app/stores/fileStore";

interface KeywordSearchProps {
  onSearch?: (keyword: string) => void;
}

/**
 * Validate a regex pattern and return an error message, or null when valid.
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

export default function KeywordSearch({ onSearch }: KeywordSearchProps) {
  const { keyword, setKeyword, isRegexMode, setIsRegexMode, isCaseSensitive, setIsCaseSensitive } =
    useFilterStore();
  const { loadedFile } = useFileStore();
  const [inputValue, setInputValue] = useState(keyword);
  // Regex error is only shown after a submit attempt, not on every keystroke.
  const [regexError, setRegexError] = useState<string | null>(null);

  const isRegexInvalid = regexError !== null;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Clear any prior submit-time error when the user edits the input.
    setRegexError(null);
  }, []);

  const handleSubmit = useCallback(() => {
    const error = getRegexError(inputValue, isRegexMode);
    if (error !== null) {
      setRegexError(error);
      return;
    }
    setRegexError(null);
    setKeyword(inputValue);
    onSearch?.(inputValue);
  }, [inputValue, isRegexMode, setKeyword, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    setKeyword("");
    setRegexError(null);
    // Toggle states (isRegexMode, isCaseSensitive) are intentionally preserved on clear.
  }, [setKeyword]);

  const handleToggleCase = useCallback(() => {
    setIsCaseSensitive(!isCaseSensitive);
  }, [isCaseSensitive, setIsCaseSensitive]);

  const handleToggleRegex = useCallback(() => {
    // Clear any regex error when toggling mode — in non-regex mode the error is meaningless.
    setRegexError(null);
    setIsRegexMode(!isRegexMode);
  }, [isRegexMode, setIsRegexMode]);

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
          onKeyDown={handleKeyDown}
          aria-label="Search logs by keyword"
          aria-invalid={isRegexInvalid}
          spellCheck={false}
          disabled={isDisabled}
        />
        {/* Tab order: Aa → .* → Search → ✕ (left-to-right visual order) */}
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
          <button
            type="button"
            className={styles.searchBtn}
            onClick={handleSubmit}
            aria-label="Search"
            disabled={isDisabled}
          >
            Search
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
    </div>
  );
}
