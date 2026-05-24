"use client";

import { useState, useCallback } from "react";
import { KeywordConfigModal } from "@/app/_components/KeywordConfigModal/KeywordConfigModal";
import { KeywordRuleList } from "@/app/_components/KeywordRuleList/KeywordRuleList";
import { useKeywordStore } from "@/app/stores/keywordStore";
import type { KeywordRule } from "@/app/types/keyword";
import styles from "./KeywordRulesSection.module.css";

export function KeywordRulesSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<KeywordRule | null>(null);
  const addRule = useKeywordStore((state) => state.addRule);
  const updateRule = useKeywordStore((state) => state.updateRule);

  const handleOpenAdd = useCallback(() => {
    setEditingRule(null);
    setModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((rule: KeywordRule) => {
    setEditingRule(rule);
    setModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setEditingRule(null);
  }, []);

  const handleSave = useCallback(
    (rule: KeywordRule) => {
      if (editingRule) {
        updateRule(rule);
      } else {
        addRule(rule);
      }
      handleClose();
    },
    [editingRule, addRule, updateRule, handleClose],
  );

  return (
    <>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Keyword Rules</h3>
        <button
          type="button"
          className={styles.addButton}
          onClick={handleOpenAdd}
          aria-label="Add keyword rule"
        >
          + Add Rule
        </button>
      </div>
      <KeywordRuleList onEdit={handleOpenEdit} />
      <KeywordConfigModal
        open={modalOpen}
        onClose={handleClose}
        onSave={handleSave}
        initialRule={editingRule ?? undefined}
      />
    </>
  );
}
