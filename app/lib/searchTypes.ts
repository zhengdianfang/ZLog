/**
 * Represents a single search run that opens its own results tab.
 * Each call to handleSearch creates a new SearchTab; re-running the same
 * keyword intentionally opens a second tab (no deduplication).
 */
export interface SearchTab {
  /** Unique identifier generated via crypto.randomUUID(). */
  id: string;
  /** The keyword string exactly as submitted by the user. */
  label: string;
  /** Log lines that matched at search time, with their original 0-based indices. */
  lines: { line: string; originalIndex: number }[];
  /** Snapshot of isRegexMode at the moment the search was triggered. */
  isRegexMode: boolean;
  /** Snapshot of isCaseSensitive at the moment the search was triggered. */
  isCaseSensitive: boolean;
}

/**
 * The active tab can be the main log view ("log") or any search tab by its id.
 */
export type ActiveTabId = "log" | string;
