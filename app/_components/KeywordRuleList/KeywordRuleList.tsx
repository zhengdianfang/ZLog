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
  const { rules, removeRule } = useKeywordStore();

  const tagRender = (props: TagRenderProps) => {
    const { value, onClose } = props;
    const rule = rules.find((r) => r.id === value);
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
          onClick={(e) => {
            e.preventDefault();
            onEdit(rule);
          }}
        >
          {rule.description}
        </span>
        <span
          className={styles.tagClose}
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

  const handleChange = (selectedIds: string[]) => {
    const currentIds = rules.map((r) => r.id);
    const removedId = currentIds.find((id) => !selectedIds.includes(id));
    if (removedId) {
      removeRule(removedId);
    }
  };

  return (
    <Select
      className={styles.select}
      mode="multiple"
      open={false}
      suffixIcon={null}
      value={rules.map((r) => r.id)}
      options={rules.map((r) => ({ value: r.id, label: r.description }))}
      tagRender={tagRender}
      onChange={handleChange}
      placeholder="No keyword rules yet. Add one to start highlighting."
    />
  );
}
