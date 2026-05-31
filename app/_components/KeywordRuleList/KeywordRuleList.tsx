"use client";

import type React from "react";
import { useState } from "react";
import { Select, Popconfirm, message } from "antd";
import { useKeywordStore } from "@/app/stores/keywordStore";
import { deleteKeywordRule } from "@/app/actions/keywordRules";
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
  const { savedRules, rules, setActiveRuleIds, removeRule } = useKeywordStore();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteKeywordRule(id);
      removeRule(id);
      void message.success("Keyword rule deleted");
    } catch {
      void message.error("Failed to delete keyword rule. Please try again.");
    } finally {
      setIsDeleting(false);
      setPendingDeleteId(null);
    }
  };

  const handleDeleteCancel = () => {
    setPendingDeleteId(null);
  };

  const tagRender = (props: TagRenderProps) => {
    const { value, onClose } = props;
    const rule = savedRules.find((r) => r.id === value);
    if (!rule) return <></>;

    const colors = KEYWORD_TYPE_COLORS[rule.type];
    const isPopconfirmOpen = pendingDeleteId === rule.id;

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
        <Popconfirm
          title="Delete this keyword rule?"
          description={rule.description}
          open={isPopconfirmOpen}
          onConfirm={() => handleDeleteConfirm(rule.id)}
          onCancel={handleDeleteCancel}
          okText="Delete"
          okType="danger"
          cancelText="Cancel"
          okButtonProps={{ loading: isDeleting, disabled: isDeleting }}
          cancelButtonProps={{ disabled: isDeleting }}
        >
          <button
            type="button"
            className={`${styles.deleteButton}${isPopconfirmOpen ? ` ${styles.deleteButtonActive}` : ""}`}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setPendingDeleteId(rule.id);
            }}
            aria-label={`Delete rule: ${rule.description}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </Popconfirm>
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
