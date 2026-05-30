"use client";

import type React from "react";
import { Select } from "antd";
import { useKeywordStore } from "@/app/stores/keywordStore";
import { KEYWORD_TYPE_COLORS } from "@/app/constants/keywordColors";
import type { KeywordRule } from "@/app/types/keyword";
import styles from "./KeywordRuleList.module.css";

interface KeywordRuleListProps {
  onEdit: (rule: KeywordRule) => void;
}

interface TagRenderProps {
  label: React.ReactNode;
  value: string;
  disabled: boolean;
  onClose: (event?: React.MouseEvent<HTMLElement>) => void;
  closable: boolean;
}

export function KeywordRuleList({ onEdit }: KeywordRuleListProps) {
  const { savedRules, rules, setActiveRuleIds } = useKeywordStore();

  const tagRender = (props: TagRenderProps) => {
    const { value, onClose } = props;
    const rule = savedRules.find((r) => r.id === value);
    if (!rule) return <></>;

    const colors = KEYWORD_TYPE_COLORS[rule.type];

    return (
      <span
        className={styles.tag}
        style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}
      >
        <span
          className={styles.tagDot}
          style={{ backgroundColor: colors.badgeText }}
        />
        <span
          className={styles.tagLabel}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => onEdit(rule)}
        >
          {rule.description}
        </span>
        <span
          className={styles.tagClose}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onClose(e);
          }}
          aria-label={`Remove rule: ${rule.description}`}
          role="button"
        >
          ×
        </span>
      </span>
    );
  };

  const options = savedRules.map((r) => {
    const colors = KEYWORD_TYPE_COLORS[r.type];
    return {
      value: r.id,
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: colors.badgeBg,
              flexShrink: 0,
            }}
          />
          {r.description}
        </span>
      ),
    };
  });

  return (
    <Select
      className={styles.select}
      mode="multiple"
      value={rules.map((r) => r.id)}
      options={options}
      tagRender={tagRender}
      onChange={setActiveRuleIds}
      placeholder="Select saved keyword rules to apply..."
    />
  );
}
