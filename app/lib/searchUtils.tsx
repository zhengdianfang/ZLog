import React from "react";

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
export function buildSearchRegex(
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
 * The `highlightClassName` is applied to each `<mark>` element.
 */
export function highlightKeyword(
  text: string,
  searchRegex: RegExp,
  highlightClassName: string,
): React.ReactNode {
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
      <mark key={start} className={highlightClassName}>
        {match[0]}
      </mark>,
    );
    cursor = end;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}
