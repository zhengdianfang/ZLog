"use client";

import { useEffect, useState } from "react";
import { useFilterStore } from "@/app/stores/filterStore";
import { useFileStore } from "@/app/stores/fileStore";
import styles from "./TimeRangeFilter.module.css";

export default function TimeRangeFilter() {
  const { startTime, endTime, setStartTime, setEndTime, beginClear, clearFilter } =
    useFilterStore();
  const { loadedFile } = useFileStore();

  const [localStart, setLocalStart] = useState(startTime);
  const [localEnd, setLocalEnd] = useState(endTime);
  const [error, setError] = useState<string | null>(null);
  const [pendingClear, setPendingClear] = useState(false);

  useEffect(() => {
    if (!pendingClear) return;
    const id = setTimeout(() => {
      clearFilter();
      setPendingClear(false);
    }, 0);
    return () => clearTimeout(id);
  }, [pendingClear, clearFilter]);

  const isFilterActive = startTime !== "" || endTime !== "";
  const disabled = !loadedFile?.content;

  function handleApply() {
    if (localStart && localEnd && localStart > localEnd) {
      setError("Start time must be before end time");
      return;
    }
    setError(null);
    setStartTime(localStart);
    setEndTime(localEnd);
  }

  function handleClear() {
    setLocalStart("");
    setLocalEnd("");
    setError(null);
    beginClear();
    setPendingClear(true);
  }

  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="time-range-start">
          Start
        </label>
        <input
          id="time-range-start"
          type="time"
          step="1"
          className={styles.input}
          value={localStart}
          onChange={(e) => setLocalStart(e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="time-range-end">
          End
        </label>
        <input
          id="time-range-end"
          type="time"
          step="1"
          className={styles.input}
          value={localEnd}
          onChange={(e) => setLocalEnd(e.target.value)}
          disabled={disabled}
        />
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.applyButton}
          onClick={handleApply}
          disabled={disabled || (!localStart && !localEnd)}
        >
          Apply
        </button>
        {isFilterActive && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            disabled={pendingClear}
          >
            {pendingClear ? (
              <span className={styles.clearSpinner} aria-label="Clearing…" />
            ) : (
              "Clear"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
