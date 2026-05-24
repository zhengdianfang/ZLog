"use client";

import { useKeywordStore } from "@/app/stores/keywordStore";
import { KEYWORD_TYPE_COLORS } from "@/app/constants/keywordColors";
import type { KeywordRule } from "@/app/types/keyword";
import styles from "./KeywordRuleList.module.css";

interface KeywordRuleListProps {
  onEdit: (rule: KeywordRule) => void;
}

export function KeywordRuleList({ onEdit }: KeywordRuleListProps) {
  const { rules, removeRule } = useKeywordStore();

  if (rules.length === 0) {
    return (
      <p className={styles.empty}>
        No keyword rules yet. Add one to start highlighting log lines.
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {rules.map((rule) => {
        const colors = KEYWORD_TYPE_COLORS[rule.type];
        return (
          <li key={rule.id} className={styles.item}>
            <span
              className={styles.badge}
              style={{ background: colors.badgeBg, color: colors.badgeText }}
            >
              {rule.type}
            </span>
            <span className={styles.description}>{rule.description}</span>
            <span className={styles.pattern} title={rule.pattern}>
              {rule.pattern}
            </span>
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => onEdit(rule)}
              aria-label={`Edit rule: ${rule.description}`}
            >
              ✎
            </button>
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => removeRule(rule.id)}
              aria-label={`Delete rule: ${rule.description}`}
            >
              ×
            </button>
          </li>
        );
      })}
    </ul>
  );
}
