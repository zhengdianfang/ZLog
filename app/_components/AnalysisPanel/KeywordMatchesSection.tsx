"use client";

import { useMemo } from "react";
import { useKeywordStore } from "@/app/stores/keywordStore";
import { useFileStore } from "@/app/stores/fileStore";
import { KEYWORD_TYPE_COLORS } from "@/app/constants/keywordColors";
import { resolveDescription } from "@/app/lib/searchUtils";
import styles from "./KeywordMatchesSection.module.css";

const MAX_MATCHES_PER_RULE = 200;
const FOCUS_BG = "rgba(250, 200, 0, 0.28)";

function parsePatternBody(pattern: string): string {
  const trimmed = pattern.trim();
  if (trimmed.startsWith("/") && trimmed.lastIndexOf("/") > 0) {
    return trimmed.slice(1, trimmed.lastIndexOf("/"));
  }
  return trimmed;
}

export function KeywordMatchesSection() {
  const rules = useKeywordStore((state) => state.rules);
  const focusedLine = useKeywordStore((state) => state.focusedLine);
  const setFocusedLine = useKeywordStore((state) => state.setFocusedLine);
  const loadedFile = useFileStore((state) => state.loadedFile);

  const lines = useMemo(() => {
    if (!loadedFile?.content) return [];
    const raw = loadedFile.content.split("\n");
    return raw[raw.length - 1] === "" ? raw.slice(0, -1) : raw;
  }, [loadedFile]);

  const matchesByRule = useMemo(() => {
    if (!lines.length || !rules.length) return [];
    return rules.map((rule) => {
      let regex: RegExp | null = null;
      try {
        regex = new RegExp(parsePatternBody(rule.pattern));
      } catch {
        return { rule, matches: [] as Array<{ lineIndex: number; text: string; groups: Record<string, string> }>, truncated: false };
      }
      const matches: Array<{ lineIndex: number; text: string; groups: Record<string, string> }> = [];
      let truncated = false;
      for (let i = 0; i < lines.length; i++) {
        const execResult = regex.exec(lines[i]);
        if (execResult) {
          if (matches.length >= MAX_MATCHES_PER_RULE) {
            truncated = true;
            break;
          }
          const groups: Record<string, string> = {};
          if (execResult.groups) {
            for (const [key, val] of Object.entries(execResult.groups)) {
              groups[key] = val ?? "";
            }
          }
          matches.push({ lineIndex: i, text: lines[i], groups });
        }
      }
      return { rule, matches, truncated };
    });
  }, [lines, rules]);

  if (!rules.length || !loadedFile?.content) return null;

  return (
    <>
      <h3 className={styles.sectionTitle}>Keyword Matches</h3>
      {matchesByRule.map(({ rule, matches, truncated }) => {
        const colors = KEYWORD_TYPE_COLORS[rule.type];
        return (
          <div key={rule.id} className={styles.ruleGroup}>
            <div className={styles.ruleHeader}>
              <span className={styles.ruleName} title={rule.description}>
                {rule.description}
              </span>
              <span
                className={styles.typeBadge}
                style={{ background: FOCUS_BG, color: colors.badgeText }}
              >
                {rule.type}
              </span>
              <span className={styles.matchCount}>{matches.length}{truncated ? "+" : ""}</span>
            </div>
            {matches.length === 0 ? (
              <p className={styles.noMatches}>No matches</p>
            ) : (
              <ul className={styles.matchList} aria-label={`Matches for ${rule.description}`}>
                {matches.map(({ lineIndex, text, groups }) => {
                  const isActive = focusedLine?.index === lineIndex;
                  const resolved = resolveDescription(rule.description, groups);
                  const hasSubstitution = resolved !== rule.description;
                  return (
                  <li
                    key={lineIndex}
                    className={styles.matchItem}
                    style={{
                      borderLeftColor: colors.badgeText,
                      backgroundColor: isActive ? FOCUS_BG : undefined,
                    }}
                    onClick={() => setFocusedLine({ index: lineIndex, bg: FOCUS_BG })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        setFocusedLine({ index: lineIndex, bg: FOCUS_BG });
                    }}
                    aria-label={`Go to line ${lineIndex + 1}`}
                  >
                    <span className={styles.lineNum}>{lineIndex + 1}</span>
                    <span className={styles.lineText}>
                      {hasSubstitution ? resolved : text}
                    </span>
                  </li>
                  );
                })}
                {truncated && (
                  <li className={styles.truncatedNote}>
                    Showing first {MAX_MATCHES_PER_RULE} matches
                  </li>
                )}
              </ul>
            )}
          </div>
        );
      })}
    </>
  );
}
