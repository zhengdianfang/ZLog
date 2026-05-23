"use client";

import type { KeywordType } from "@/app/types/keyword";
import { KEYWORD_TYPE_COLORS } from "@/app/constants/keywordColors";
import styles from "./KeywordTypeSelector.module.css";

const KEYWORD_TYPES: KeywordType[] = ["info", "core", "warn", "error", "fatal"];

interface KeywordTypeSelectorProps {
  value: KeywordType | null;
  onChange: (type: KeywordType) => void;
}

export function KeywordTypeSelector({ value, onChange }: KeywordTypeSelectorProps) {
  return (
    <div className={styles.group} role="radiogroup" aria-label="Keyword type">
      {KEYWORD_TYPES.map((type) => {
        const colors = KEYWORD_TYPE_COLORS[type];
        const isSelected = value === type;
        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`${styles.pill}${isSelected ? ` ${styles.pillSelected}` : ""}`}
            onClick={() => onChange(type)}
            style={
              isSelected
                ? { borderColor: colors.badgeText, background: colors.badgeBg }
                : undefined
            }
          >
            <span
              className={styles.colorChip}
              style={{ background: colors.badgeText }}
              aria-hidden="true"
            />
            <span className={styles.label} style={isSelected ? { color: colors.badgeText } : undefined}>
              {type}
            </span>
          </button>
        );
      })}
    </div>
  );
}
