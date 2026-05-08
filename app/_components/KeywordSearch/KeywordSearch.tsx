"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./KeywordSearch.module.css";
import { useFilterStore } from "@/app/stores/filterStore";
import { useFileStore } from "@/app/stores/fileStore";

interface KeywordSearchProps {
  matchCount?: number;
  totalFiltered?: number;
}

export default function KeywordSearch({ matchCount, totalFiltered }: KeywordSearchProps) {
  const { keyword, setKeyword } = useFilterStore();
  const { loadedFile } = useFileStore();
  const [inputValue, setInputValue] = useState(keyword);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setKeyword(value), 150);
  }, [setKeyword]);

  const handleClear = useCallback(() => {
    setInputValue("");
    setKeyword("");
  }, [setKeyword]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const showCount = keyword.trim() !== "" && loadedFile !== null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputRow}>
        <svg className={styles.searchIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="6.5" cy="6.5" r="4.5" />
          <line x1="10.5" y1="10.5" x2="14" y2="14" />
        </svg>
        <input
          className={styles.input}
          type="text"
          placeholder="Search logs…"
          value={inputValue}
          onChange={handleChange}
          aria-label="Search logs by keyword"
          spellCheck={false}
        />
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
      {showCount && (
        <span className={`${styles.resultCount} ${(matchCount ?? 0) > 0 ? styles.hasResults : ""}`}>
          {matchCount === 0
            ? "No matches found"
            : `${matchCount?.toLocaleString()} of ${totalFiltered?.toLocaleString()} lines match`}
        </span>
      )}
    </div>
  );
}
