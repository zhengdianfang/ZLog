"use client";

import { useState, useCallback } from "react";
import { KeywordConfigModal } from "@/app/_components/KeywordConfigModal/KeywordConfigModal";
import { KeywordRuleList } from "@/app/_components/KeywordRuleList/KeywordRuleList";
import { useKeywordStore } from "@/app/stores/keywordStore";
import type { KeywordRule } from "@/app/types/keyword";
import styles from "./KeywordRulesSection.module.css";

export function KeywordRulesSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const addRule = useKeywordStore((state) => state.addRule);

  const handleSave = useCallback(
    (rule: KeywordRule) => {
      addRule(rule);
    },
    [addRule],
  );

  return (
    <>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Keyword Rules</h3>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => setModalOpen(true)}
          aria-label="Add keyword rule"
        >
          + Add Rule
        </button>
      </div>
      <KeywordRuleList />
      <KeywordConfigModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
